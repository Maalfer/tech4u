from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, Dict, List
import random
import string
import asyncio
import json

from database import get_db, User, Question
from auth import get_current_user, decode_token
from websocket_manager import manager

router = APIRouter(prefix="/battle", tags=["Battle"])

# In-memory storage for active battle rooms
active_rooms: Dict[str, dict] = {}

# ─────────────────────────────────────────────────────────────────────────────
# UTILITY FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def generate_room_code(length: int = 6) -> str:
    """Generate a random 6-character alphanumeric room code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def ensure_unique_room_code() -> str:
    """Generate a unique room code that doesn't exist yet."""
    while True:
        code = generate_room_code()
        if code not in active_rooms:
            return code

def get_random_subjects(db: Session) -> List[str]:
    """Get list of available subjects from database."""
    questions = db.query(Question.subject).distinct().filter(
        Question.approved == True
    ).all()
    subjects = [q[0] for q in questions if q[0]]
    return subjects if subjects else ["General"]

def fetch_questions(db: Session, subject: str, limit: int = 10) -> List[dict]:
    """Fetch questions from database for a given subject."""
    questions = db.query(Question).filter(
        Question.subject == subject,
        Question.approved == True
    ).order_by(Question.id).limit(limit).all()

    return [
        {
            "id": q.id,
            "text": q.text,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation,
        }
        for q in questions
    ]

# ─────────────────────────────────────────────────────────────────────────────
# POST /battle/create
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/create")
def create_battle(
    subject: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new battle room.

    - If subject is not provided, pick a random one from available subjects.
    - Fetch 10 questions from DB for that subject.
    - Return room_code and subject.
    """
    # Get list of available subjects
    available_subjects = get_random_subjects(db)

    # Use provided subject or pick random
    if not subject or subject not in available_subjects:
        subject = random.choice(available_subjects)

    # Fetch questions
    questions = fetch_questions(db, subject, limit=10)

    if not questions:
        raise HTTPException(
            status_code=400,
            detail=f"No questions available for subject: {subject}"
        )

    # Generate unique room code
    room_code = ensure_unique_room_code()

    # Create room — auto-add creator as first player so WS auth works
    active_rooms[room_code] = {
        "room_code": room_code,
        "subject": subject,
        "questions": questions,
        "players": {
            current_user.id: {
                "nombre": current_user.nombre,
                "level": getattr(current_user, "level", 1),
                "ws": None,
                "answers": {},
                "score": 0,
                "finished": False,
            }
        },
        "status": "waiting",  # waiting, active, finished
        "created_at": datetime.utcnow(),
    }

    return {
        "room_code": room_code,
        "subject": subject,
        "questions_count": len(questions),
    }

# ─────────────────────────────────────────────────────────────────────────────
# POST /battle/join/{room_code}
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/join/{room_code}")
def join_battle(
    room_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Join an existing battle room.

    - Validate room exists.
    - Validate room not full (max 2 players).
    - Validate user not already in it.
    """
    if room_code not in active_rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room = active_rooms[room_code]

    if room["status"] == "finished":
        raise HTTPException(status_code=400, detail="Battle has finished")

    # If already in room (e.g. creator re-joining), just return ok
    if current_user.id in room["players"]:
        return {
            "status": "already_in_room",
            "room_code": room_code,
            "players_count": len(room["players"]),
        }

    if len(room["players"]) >= 2:
        raise HTTPException(status_code=400, detail="Room is full")

    # Add player to room
    room["players"][current_user.id] = {
        "nombre": current_user.nombre,
        "level": current_user.level,
        "ws": None,  # Will be set on WebSocket connection
        "answers": {},  # {question_id: answer}
        "score": 0,
        "finished": False,
    }

    return {
        "status": "joined",
        "room_code": room_code,
        "players_count": len(room["players"]),
    }

# ─────────────────────────────────────────────────────────────────────────────
# GET /battle/room/{room_code}
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/room/{room_code}")
def get_room_status(
    room_code: str,
    _: User = Depends(get_current_user),
):
    """Get the current status of a battle room."""
    if room_code not in active_rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room = active_rooms[room_code]

    return {
        "room_code": room_code,
        "subject": room["subject"],
        "status": room["status"],
        "players": [
            {
                "user_id": uid,
                "nombre": p["nombre"],
                "level": p["level"],
                "score": p["score"],
                "finished": p["finished"],
            }
            for uid, p in room["players"].items()
        ],
        "created_at": room["created_at"].isoformat(),
    }

# ─────────────────────────────────────────────────────────────────────────────
# WebSocket /ws/battle/{room_code}?token=JWT
# ─────────────────────────────────────────────────────────────────────────────

async def battle_websocket_handler(
    websocket: WebSocket,
    room_code: str,
    token: str,
    db: Session,
):
    """
    WebSocket handler for real-time battle gameplay.

    Flow:
    1. Player connects → added to room's ws list.
    2. When 2 players connected → countdown 3 seconds, then send questions.
    3. Players send answers in real-time.
    4. Server broadcasts live scores.
    5. When both players finish → send results and award XP.
    """

    # Validate token
    try:
        payload = decode_token(token)
        user_id = int(payload.get("sub"))
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token")
        return

    # Check room exists
    if room_code not in active_rooms:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Room not found")
        return

    room = active_rooms[room_code]

    # Check user is in room
    if user_id not in room["players"]:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Not in this room")
        return

    await websocket.accept()

    # Store WebSocket connection
    room["players"][user_id]["ws"] = websocket

    try:
        # If 2 players now connected and status is "waiting", start countdown
        connected_players = sum(1 for p in room["players"].values() if p["ws"])
        if connected_players == 2 and room["status"] == "waiting":
            room["status"] = "active"

            # Broadcast countdown
            for pid, player in room["players"].items():
                if player["ws"]:
                    await player["ws"].send_json({
                        "type": "countdown",
                        "seconds": 3,
                    })

            # Wait 3 seconds
            await asyncio.sleep(3)

            # Send questions (WITHOUT correct_answer field)
            questions_without_answers = [
                {
                    "id": q["id"],
                    "text": q["text"],
                    "option_a": q["option_a"],
                    "option_b": q["option_b"],
                    "option_c": q["option_c"],
                    "option_d": q["option_d"],
                }
                for q in room["questions"]
            ]

            for pid, player in room["players"].items():
                if player["ws"]:
                    await player["ws"].send_json({
                        "type": "start",
                        "questions": questions_without_answers,
                    })

        # Listen for messages from this player
        while True:
            data = await websocket.receive_json()

            if data.get("type") == "answer":
                question_id = data.get("question_id")
                answer = data.get("answer")
                time_ms = data.get("time_ms", 0)

                # Record answer
                room["players"][user_id]["answers"][question_id] = answer

                # Calculate score for this user
                score = 0
                for q in room["questions"]:
                    if q["id"] in room["players"][user_id]["answers"]:
                        if room["players"][user_id]["answers"][q["id"]].upper() == q["correct_answer"].upper():
                            score += 1
                room["players"][user_id]["score"] = score

                # Broadcast live score to both players
                for pid, player in room["players"].items():
                    if player["ws"]:
                        try:
                            await player["ws"].send_json({
                                "type": "score",
                                "scores": {
                                    str(uid): p["score"]
                                    for uid, p in room["players"].items()
                                },
                            })
                        except:
                            pass

                # Check if both players finished all questions
                all_answered = all(
                    len(room["players"][uid]["answers"]) == len(room["questions"])
                    for uid in room["players"]
                )

                if all_answered and room["status"] == "active":
                    room["status"] = "finished"

                    # Determine winner
                    scores = {uid: p["score"] for uid, p in room["players"].items()}
                    winner_id = max(scores, key=scores.get)

                    # Build correct answers map
                    correct_answers = {
                        q["id"]: q["correct_answer"]
                        for q in room["questions"]
                    }

                    # Send results to both players
                    for pid, player in room["players"].items():
                        if player["ws"]:
                            try:
                                await player["ws"].send_json({
                                    "type": "result",
                                    "winner_id": winner_id,
                                    "scores": scores,
                                    "correct_answers": correct_answers,
                                })
                            except:
                                pass

                    # Award XP: winner gets 50, loser gets 10
                    for uid, player in room["players"].items():
                        user_db = db.query(User).filter(User.id == uid).first()
                        if user_db:
                            if uid == winner_id:
                                user_db.add_xp(50)
                            else:
                                user_db.add_xp(10)
                    db.commit()

    except WebSocketDisconnect:
        # Remove WebSocket reference
        if user_id in room["players"]:
            room["players"][user_id]["ws"] = None
    except Exception as e:
        print(f"Battle WebSocket error: {e}")
    finally:
        try:
            await websocket.close()
        except:
            pass
