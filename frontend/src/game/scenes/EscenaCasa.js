import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

// ─── Paleta de colores medievales ────────────────────────────────────────────
const P = {
    // Suelo
    floorA:    0x2a1f0e,
    floorB:    0x352618,
    floorLine: 0x180e03,
    // Paredes
    wallBase:  0x1a1a2e,
    wallBrick: 0x252542,
    wallLine:  0x111124,
    wallLight: 0x2e2e52,
    // Madera
    wood:      0x5c3317,
    woodLight: 0x7a4520,
    woodDark:  0x3a1f08,
    // Cama
    bedFrame:  0x6b3a1f,
    bedMat:    0x7a5a3a,
    bedSheet:  0xd4c4a8,
    bedPillow: 0xece0c8,
    // Ordenador
    deskMat:   0x1e1e38,
    screenOff: 0x080820,
    screenOn:  0x00cc77,
    neon:      0xc6ff33,
    // Libros
    book1:     0x8b1a1a,
    book2:     0x1a5c1a,
    book3:     0x1a1a8b,
    book4:     0x8b6b1a,
    bookPage:  0xf0e8d0,
    // Armadura
    armorMetal: 0x8a8a9a,
    armorShine: 0xb4b4c8,
    armorDark:  0x4a4a5a,
    swordMetal: 0xd0d0e0,
    swordHilt:  0xd4aa00,
    // Alfombra
    rugBase:   0x5c1a2e,
    rugBorder: 0xd4aa00,
    rugPat:    0x7a2240,
    // Antorcha
    torchBase: 0x4a2d0e,
    torchFire: 0xff8800,
    torchGlow: 0xffcc44,
    // Decoración
    decorGold: 0xd4aa00,
    decorSilv: 0xc0c0d0,
};

// ─── Descripción de objetos interactivos ─────────────────────────────────────
const OBJECTS = [
    {
        id: 'computer',
        label: 'Terminal',
        x: 310, y: 80,
        w: 64, h: 48,
        hint: '[E] Acceder al sistema',
        route: '/tests',
        dialog: '> SISTEMA ONLINE...\n> Bienvenido, alumno.\n> Acceso a Test Center activado.',
    },
    {
        id: 'bookshelf',
        label: 'Estantería',
        x: 530, y: 76,
        w: 72, h: 56,
        hint: '[E] Consultar recursos',
        route: '/recursos',
        dialog: 'Una estantería repleta de manuales técnicos y guías de certificación.',
    },
    {
        id: 'book',
        label: 'Grimorio',
        x: 110, y: 210,
        w: 48, h: 36,
        hint: '[E] Leer teoría',
        route: '/teoria',
        dialog: 'Un antiguo tomo con diagramas de redes y fórmulas de subnetting...',
    },
    {
        id: 'bed',
        label: 'Cama',
        x: 500, y: 310,
        w: 88, h: 56,
        hint: '[E] Descansar',
        route: null,
        dialog: 'Una cama de aventurero. Descansando recuperas fuerza para los exámenes.\n\nZzz... +50 EXP de sueño.',
    },
    {
        id: 'armor',
        label: 'Armería',
        x: 84, y: 76,
        w: 56, h: 56,
        hint: '[E] Ver personaje',
        route: '/personaje',
        dialog: 'Tu armadura de conocimiento. Cada certificación añade una pieza nueva.',
    },
];

// ─── Room config ─────────────────────────────────────────────────────────────
const ROOM_W = 620;
const ROOM_H = 465;
const WALL_T  = 32; // grosor pared top/sides
const WALL_B  = 32; // grosor pared bottom
const DOOR_W  = 80; // ancho puerta
const DOOR_X  = (ROOM_W - DOOR_W) / 2; // x puerta (centrada)
const FLOOR_Y1 = WALL_T;
const FLOOR_Y2 = ROOM_H - WALL_B;

// ─── Escena ───────────────────────────────────────────────────────────────────
export class EscenaCasa extends Scene {
    constructor() {
        super('EscenaCasa');
        this.dialogOpen  = false;
        this.currentHint = null;
    }

    create() {
        this.cameras.main.fadeIn(600);
        this.physics.world.setBounds(0, 0, ROOM_W, ROOM_H);
        this.cameras.main.setBounds(0, 0, ROOM_W, ROOM_H);
        this.cameras.main.setZoom(2);

        // ── Dibujar el mundo ──────────────────────────────────────────────────
        this._drawRoom();

        // ── Física ───────────────────────────────────────────────────────────
        this._setupWalls();

        // ── Jugador ───────────────────────────────────────────────────────────
        this.jugador = this.physics.add.sprite(ROOM_W / 2, ROOM_H - 70, 'hero', 0);
        this.jugador.setCollideWorldBounds(true);
        this.jugador.setScale(2);
        this.jugador.body.setSize(12, 10);
        this.jugador.body.setOffset(2, 14);
        this.physics.add.collider(this.jugador, this.walls);
        this.cameras.main.startFollow(this.jugador, true, 0.08, 0.08);
        this.lastDir = 'down';

        // ── HUD: indicador de interacción ─────────────────────────────────────
        this._setupHintText();

        // ── Zonas de objetos ──────────────────────────────────────────────────
        this._setupObjectZones();

        // ── Controles ─────────────────────────────────────────────────────────
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up:    Phaser.Input.Keyboard.KeyCodes.W,
            down:  Phaser.Input.Keyboard.KeyCodes.S,
            left:  Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });
        this.keyE     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // ── Animación antorchas ───────────────────────────────────────────────
        this._animateTorches();

        // ── EventBus: cerrar diálogo ──────────────────────────────────────────
        EventBus.on('CLOSE_MODAL', () => { this.dialogOpen = false; });
    }

    // ─── Dibuja la habitación ─────────────────────────────────────────────────
    _drawRoom() {
        const g = this.add.graphics();

        // Suelo con tablones de madera
        this._drawFloor(g);

        // Paredes
        this._drawWalls(g);

        // Alfombra central
        this._drawRug(g);

        // Objetos
        this._drawArmorStand(g, 84, 76);
        this._drawComputer(g, 310, 80);
        this._drawBookshelf(g, 530, 76);
        this._drawTable(g, 110, 210);
        this._drawBed(g, 500, 310);

        // Antorchas (guardamos referencias para animar)
        this.torches = [
            this._drawTorch(g, 70, 20),
            this._drawTorch(g, 175, 20),
            this._drawTorch(g, 445, 20),
            this._drawTorch(g, 550, 20),
        ];
    }

    _drawFloor(g) {
        // Base
        g.fillStyle(P.floorA);
        g.fillRect(WALL_T, FLOOR_Y1, ROOM_W - WALL_T * 2, FLOOR_Y2 - FLOOR_Y1);

        // Tablones horizontales (cada 8 px)
        for (let y = FLOOR_Y1; y < FLOOR_Y2; y += 8) {
            const row = Math.floor((y - FLOOR_Y1) / 8);
            for (let x = WALL_T; x < ROOM_W - WALL_T; x += 48) {
                const shade = (row + Math.floor(x / 48)) % 2 === 0 ? P.floorA : P.floorB;
                g.fillStyle(shade);
                g.fillRect(x, y, 47, 7);
            }
            // Línea separadora de fila
            g.fillStyle(P.floorLine);
            g.fillRect(WALL_T, y + 7, ROOM_W - WALL_T * 2, 1);
        }
        // Líneas verticales de tablas (juntas de tablón)
        g.lineStyle(1, P.floorLine, 0.5);
        for (let x = WALL_T; x < ROOM_W - WALL_T; x += 48) {
            g.lineBetween(x, FLOOR_Y1, x, FLOOR_Y2);
        }
    }

    _drawWalls(g) {
        // Paredes laterales y superior con patrón ladrillo
        const drawBrickWall = (x, y, w, h) => {
            g.fillStyle(P.wallBase);
            g.fillRect(x, y, w, h);
            let rowOdd = false;
            for (let wy = y; wy < y + h; wy += 10) {
                const offset = rowOdd ? 0 : 18;
                for (let wx = x; wx < x + w; wx += 36) {
                    const bx = wx + (offset % 36);
                    const bw = Math.min(35, x + w - bx);
                    if (bw > 2) {
                        g.fillStyle(P.wallBrick);
                        g.fillRect(bx, wy, bw, 9);
                        g.fillStyle(P.wallLight);
                        g.fillRect(bx, wy, bw, 1);
                        g.fillRect(bx, wy, 1, 9);
                    }
                    // Junta entre ladrillos
                    g.fillStyle(P.wallLine);
                    g.fillRect(bx - 1, wy, 1, 10);
                }
                g.fillStyle(P.wallLine);
                g.fillRect(x, wy + 9, w, 1);
                rowOdd = !rowOdd;
            }
        };

        // Pared superior
        drawBrickWall(0, 0, ROOM_W, WALL_T);
        // Pared izquierda
        drawBrickWall(0, 0, WALL_T, ROOM_H);
        // Pared derecha
        drawBrickWall(ROOM_W - WALL_T, 0, WALL_T, ROOM_H);
        // Pared inferior (con hueco para puerta)
        drawBrickWall(0, FLOOR_Y2, DOOR_X, WALL_B);
        drawBrickWall(DOOR_X + DOOR_W, FLOOR_Y2, ROOM_W - DOOR_X - DOOR_W, WALL_B);

        // Marco de puerta
        g.lineStyle(3, P.decorGold, 0.8);
        g.strokeRect(DOOR_X - 2, FLOOR_Y2 - 2, DOOR_W + 4, WALL_B + 4);
        g.fillStyle(0x000000);
        g.fillRect(DOOR_X, FLOOR_Y2, DOOR_W, WALL_B);

        // Texto en el arco de la puerta
        g.fillStyle(P.wallLine);
        g.fillRect(DOOR_X, FLOOR_Y2 - 4, DOOR_W, 4);

        // Esquinas decorativas
        const corner = (cx, cy) => {
            g.fillStyle(P.decorGold);
            g.fillRect(cx - 4, cy - 4, 8, 8);
            g.fillStyle(P.wallBase);
            g.fillRect(cx - 2, cy - 2, 4, 4);
        };
        corner(WALL_T, WALL_T);
        corner(ROOM_W - WALL_T, WALL_T);
        corner(WALL_T, FLOOR_Y2);
        corner(ROOM_W - WALL_T, FLOOR_Y2);
    }

    _drawRug(g) {
        const rx = ROOM_W / 2 - 100, ry = 160, rw = 200, rh = 120;
        g.fillStyle(P.rugBase);
        g.fillRect(rx, ry, rw, rh);
        // Borde dorado
        g.lineStyle(3, P.rugBorder);
        g.strokeRect(rx + 1, ry + 1, rw - 2, rh - 2);
        g.lineStyle(1, P.rugBorder, 0.5);
        g.strokeRect(rx + 6, ry + 6, rw - 12, rh - 12);
        // Patrón interior
        g.fillStyle(P.rugPat);
        g.fillRect(rx + 10, ry + 10, rw - 20, rh - 20);
        g.fillStyle(P.rugBase);
        g.fillRect(rx + 14, ry + 14, rw - 28, rh - 28);
        // Cruz central
        g.fillStyle(P.rugBorder);
        g.fillRect(rx + rw / 2 - 1, ry + 10, 2, rh - 20);
        g.fillRect(rx + 10, ry + rh / 2 - 1, rw - 20, 2);
        // Rombos en esquinas
        const diamond = (dx, dy) => {
            g.fillStyle(P.rugBorder);
            g.fillRect(dx - 3, dy - 1, 6, 2);
            g.fillRect(dx - 1, dy - 3, 2, 6);
        };
        diamond(rx + 20, ry + 20);
        diamond(rx + rw - 20, ry + 20);
        diamond(rx + 20, ry + rh - 20);
        diamond(rx + rw - 20, ry + rh - 20);
    }

    _drawArmorStand(g, x, y) {
        // Base del soporte (en T)
        g.fillStyle(P.woodDark);
        g.fillRect(x - 4, y + 44, 8, 8);   // base
        g.fillRect(x - 12, y + 48, 24, 4); // patas

        // Palo vertical
        g.fillStyle(P.wood);
        g.fillRect(x - 2, y + 8, 4, 40);

        // Hombros (barra horizontal)
        g.fillStyle(P.wood);
        g.fillRect(x - 20, y + 8, 40, 5);

        // Coraza (pecho de armadura)
        g.fillStyle(P.armorMetal);
        g.fillRect(x - 14, y + 13, 28, 22);
        g.fillStyle(P.armorShine);
        g.fillRect(x - 14, y + 13, 28, 2);
        g.fillRect(x - 14, y + 13, 2, 22);
        g.fillStyle(P.armorDark);
        g.fillRect(x - 14, y + 33, 28, 2);
        // Cruz en el pecho
        g.fillStyle(P.decorGold);
        g.fillRect(x - 1, y + 16, 2, 12);
        g.fillRect(x - 5, y + 20, 10, 2);

        // Hombros redondos
        g.fillStyle(P.armorMetal);
        g.fillCircle(x - 14, y + 16, 7);
        g.fillCircle(x + 14, y + 16, 7);
        g.fillStyle(P.armorShine);
        g.fillCircle(x - 16, y + 14, 3);
        g.fillCircle(x + 12, y + 14, 3);

        // Espada al lado derecho
        g.fillStyle(P.swordMetal);
        g.fillRect(x + 22, y - 2, 3, 50);
        g.fillStyle(P.swordHilt);
        g.fillRect(x + 18, y + 14, 11, 4); // guarda
        g.fillRect(x + 22, y - 2, 3, 10);  // empuñadura
        // Brillo espada
        g.fillStyle(0xffffff);
        g.fillRect(x + 22, y + 5, 1, 30);

        // Casco en la cabeza del soporte
        g.fillStyle(P.armorMetal);
        g.fillEllipse(x, y + 6, 20, 16);
        g.fillStyle(P.armorShine);
        g.fillEllipse(x - 3, y + 3, 10, 6);
        g.fillStyle(0x000000);
        g.fillRect(x - 6, y + 4, 12, 4); // visera
        g.fillStyle(P.decorGold);
        g.fillRect(x - 1, y - 4, 2, 8);  // penacho
    }

    _drawComputer(g, x, y) {
        // Mesa/escritorio
        g.fillStyle(P.woodDark);
        g.fillRect(x - 32, y + 32, 64, 6);  // tablero
        g.fillRect(x - 30, y + 38, 4, 14);  // pata izq
        g.fillRect(x + 26, y + 38, 4, 14);  // pata der
        g.fillStyle(P.woodLight);
        g.fillRect(x - 32, y + 32, 64, 2);  // brillo tabla

        // Monitor
        g.fillStyle(P.deskMat);
        g.fillRect(x - 26, y - 4, 52, 34);
        g.lineStyle(2, P.armorDark);
        g.strokeRect(x - 26, y - 4, 52, 34);

        // Pantalla (interior)
        g.fillStyle(P.screenOff);
        g.fillRect(x - 22, y, 44, 26);

        // Líneas de terminal en pantalla
        g.fillStyle(P.screenOn);
        g.fillRect(x - 20, y + 4,  28, 1);
        g.fillRect(x - 20, y + 8,  20, 1);
        g.fillRect(x - 20, y + 12, 32, 1);
        g.fillRect(x - 20, y + 16, 15, 1);
        g.fillRect(x - 20, y + 20, 24, 1);
        // Cursor parpadeante (se anima en update)
        this._screenCursorX = x - 18;
        this._screenCursorY = y + 20;
        this.screenCursor = this.add.rectangle(x - 18, y + 20, 6, 4, P.screenOn);

        // Pie del monitor
        g.fillStyle(P.deskMat);
        g.fillRect(x - 6, y + 30, 12, 6);

        // Teclado
        g.fillStyle(0x1a1a2a);
        g.fillRect(x - 18, y + 36, 36, 8);
        g.lineStyle(1, 0x2a2a4a);
        for (let kx = 0; kx < 6; kx++) {
            for (let ky = 0; ky < 2; ky++) {
                g.fillStyle(0x2a2a3a);
                g.fillRect(x - 16 + kx * 6, y + 37 + ky * 3, 5, 2);
            }
        }

        // Brillo NEON en la pantalla
        g.fillStyle(P.neon);
        g.fillRect(x - 22, y - 4, 52, 1);   // línea neon arriba del monitor
        g.fillRect(x - 22, y - 4, 1, 34);   // lateral izq
        g.fillRect(x + 24, y - 4, 2, 34);   // lateral der
    }

    _drawBookshelf(g, x, y) {
        // Marco de la estantería
        g.fillStyle(P.woodDark);
        g.fillRect(x - 36, y - 4, 72, 56); // fondo
        g.fillStyle(P.wood);
        g.fillRect(x - 36, y - 4, 4, 56);  // lateral izq
        g.fillRect(x + 32, y - 4, 4, 56);  // lateral der
        // Estantes
        for (let shelf = 0; shelf < 3; shelf++) {
            g.fillStyle(P.woodLight);
            g.fillRect(x - 32, y - 4 + shelf * 18, 64, 3);
        }
        // Libros en cada estante
        const bookColors = [P.book1, P.book2, P.book3, P.book4, P.book1, P.book3];
        const bookWidths = [8, 6, 10, 7, 9, 8, 6];
        for (let shelf = 0; shelf < 2; shelf++) {
            let bx = x - 30;
            const by = y - 1 + shelf * 18;
            bookColors.forEach((color, i) => {
                const bw = bookWidths[i % bookWidths.length];
                g.fillStyle(color);
                g.fillRect(bx, by, bw - 1, 14);
                // Brillo lomo
                g.fillStyle(Phaser.Display.Color.ValueToColor(color).lighten(30).color);
                g.fillRect(bx, by, 1, 14);
                bx += bw + 1;
            });
        }
        // Adorno: pequeño trofeo en el estante de arriba
        g.fillStyle(P.decorGold);
        g.fillRect(x + 14, y - 1, 12, 2);   // base trofeo
        g.fillRect(x + 18, y - 7, 4, 7);    // copa
        g.fillTriangle(x + 18, y - 7, x + 22, y - 7, x + 20, y - 13); // remate

        // Marco superior decorativo
        g.fillStyle(P.woodDark);
        g.fillRect(x - 36, y - 8, 72, 4);
        g.fillStyle(P.decorGold);
        g.fillRect(x - 36, y - 9, 72, 1);
    }

    _drawTable(g, x, y) {
        // Mesa pequeña
        g.fillStyle(P.woodDark);
        g.fillRect(x - 24, y + 16, 48, 4);
        g.fillRect(x - 22, y + 20, 4, 16);
        g.fillRect(x + 18, y + 20, 4, 16);
        g.fillStyle(P.woodLight);
        g.fillRect(x - 24, y + 16, 48, 2);

        // Libro abierto sobre la mesa
        // Cubierta derecha (página de texto)
        g.fillStyle(P.bookPage);
        g.fillRect(x + 2, y - 4, 20, 22);
        // Cubierta izquierda
        g.fillStyle(P.bookPage);
        g.fillRect(x - 22, y - 4, 20, 22);
        // Lomo central
        g.fillStyle(P.book1);
        g.fillRect(x - 2, y - 6, 4, 26);
        // Líneas de texto en las páginas
        g.fillStyle(0x8a8a8a);
        for (let line = 0; line < 4; line++) {
            g.fillRect(x + 4,  y + 1 + line * 4, 14, 1);
            g.fillRect(x - 20, y + 1 + line * 4, 14, 1);
        }
        // Viñetas/símbolos
        g.fillStyle(P.book2);
        g.fillRect(x + 4,  y + 2,  3, 3);
        g.fillRect(x + 4,  y + 10, 3, 3);
        g.fillStyle(P.book3);
        g.fillRect(x - 20, y + 6,  3, 3);
        // Borde del libro
        g.lineStyle(1, P.woodDark, 0.5);
        g.strokeRect(x - 22, y - 4, 44, 22);

        // Vela al lado
        g.fillStyle(0xf0f0f0);
        g.fillRect(x + 26, y - 2, 5, 16);
        g.fillStyle(P.torchFire);
        g.fillRect(x + 27, y - 6, 3, 5);
        g.fillStyle(P.torchGlow);
        g.fillRect(x + 28, y - 8, 1, 3);
        // Base de la vela
        g.fillStyle(0xc8c8b0);
        g.fillRect(x + 24, y + 14, 8, 4);
    }

    _drawBed(g, x, y) {
        // Cabecero
        g.fillStyle(P.bedFrame);
        g.fillRect(x - 44, y - 8, 88, 20);
        g.fillStyle(P.woodLight);
        g.fillRect(x - 44, y - 8, 88, 2);
        // Tablones del cabecero
        for (let i = 0; i < 4; i++) {
            g.fillStyle(i % 2 === 0 ? P.bedFrame : P.woodDark);
            g.fillRect(x - 40 + i * 22, y - 6, 20, 16);
        }
        // Marco de la cama
        g.fillStyle(P.bedFrame);
        g.fillRect(x - 44, y + 10, 88, 40);
        g.fillRect(x - 44, y + 46, 88, 6);  // pie de cama

        // Colchón / sábanas
        g.fillStyle(P.bedMat);
        g.fillRect(x - 40, y + 12, 80, 34);
        // Sábana encimera
        g.fillStyle(P.bedSheet);
        g.fillRect(x - 36, y + 16, 72, 26);
        // Pliegues en la sábana
        g.fillStyle(P.bedMat);
        g.fillRect(x - 30, y + 18, 60, 1);
        g.fillRect(x - 28, y + 22, 56, 1);
        // Almohada
        g.fillStyle(P.bedPillow);
        g.fillRect(x - 34, y + 12, 68, 10);
        g.lineStyle(1, P.bedMat, 0.5);
        g.strokeRect(x - 34, y + 12, 68, 10);
        // Cruz decorativa en la manta
        g.fillStyle(P.decorGold);
        g.fillRect(x - 1, y + 20, 2, 18);
        g.fillRect(x - 12, y + 28, 24, 2);

        // Patas de la cama
        g.fillStyle(P.woodDark);
        g.fillRect(x - 44, y + 52, 8, 8);
        g.fillRect(x + 36, y + 52, 8, 8);
    }

    _drawTorch(g, x, y) {
        // Soporte metálico
        g.fillStyle(P.torchBase);
        g.fillRect(x - 3, y, 6, 14);
        // Aro
        g.fillStyle(P.decorGold);
        g.fillRect(x - 4, y + 10, 8, 4);
        // Llama base
        g.fillStyle(P.torchFire);
        g.fillRect(x - 3, y - 8, 6, 10);
        g.fillStyle(P.torchGlow);
        g.fillRect(x - 1, y - 12, 2, 6);
        // Guardamos posición para el efecto de parpadeo
        return { x, y, gfx: null };
    }

    // ─── Efectos de antorcha animados ─────────────────────────────────────────
    _animateTorches() {
        // Crear objetos de luz/parpadeo encima de las antorchas
        this.torchFlames = this.torches.map(t => {
            const fl = this.add.graphics();
            fl.fillStyle(P.torchGlow);
            fl.fillRect(t.x - 2, t.y - 14, 4, 6);
            return fl;
        });

        this.time.addEvent({
            delay: 80,
            loop: true,
            callback: () => {
                this.torchFlames.forEach(fl => {
                    const alpha = 0.6 + Math.random() * 0.4;
                    const scaleX = 0.8 + Math.random() * 0.4;
                    fl.setAlpha(alpha);
                    fl.setScale(scaleX, 1);
                });
            }
        });
    }

    // ─── Parpadeo pantalla del ordenador ──────────────────────────────────────
    _animateScreen() {
        this.time.addEvent({
            delay: 500,
            loop: true,
            callback: () => {
                if (this.screenCursor) {
                    this.screenCursor.setVisible(!this.screenCursor.visible);
                }
            }
        });
    }

    // ─── Paredes de colisión invisibles ──────────────────────────────────────
    _setupWalls() {
        this.walls = this.physics.add.staticGroup();

        const addWall = (x, y, w, h) => {
            const wall = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0);
            this.physics.add.existing(wall, true);
            this.walls.add(wall);
        };

        addWall(0,    0,    WALL_T,              ROOM_H);           // izquierda
        addWall(ROOM_W - WALL_T, 0, WALL_T,    ROOM_H);           // derecha
        addWall(0,    0,    ROOM_W,              WALL_T + 60);      // superior (pared + objetos)
        addWall(0,    FLOOR_Y2, DOOR_X,          WALL_B);           // inferior-izq
        addWall(DOOR_X + DOOR_W, FLOOR_Y2, ROOM_W - DOOR_X - DOOR_W, WALL_B); // inf-der

        // Colisión con objetos
        addWall(48,   60,  80, 80);   // soporte de armadura
        addWall(270,  44,  80, 50);   // mesa del ordenador
        addWall(490,  40,  80, 64);   // estantería
        addWall(84,   188, 64, 44);   // mesa del libro
        addWall(452,  290, 96, 60);   // cama
    }

    // ─── Zonas de interacción ─────────────────────────────────────────────────
    _setupObjectZones() {
        this.objectZones = OBJECTS.map(obj => {
            const zone = this.add.zone(obj.x, obj.y, obj.w + 20, obj.h + 20);
            this.physics.world.enable(zone);
            zone.body.setAllowGravity(false);
            zone.body.moves = false;
            zone.objData = obj;
            return zone;
        });

        // Zona de salida (puerta)
        const exitZone = this.add.zone(ROOM_W / 2, ROOM_H - 10, DOOR_W - 10, 20);
        this.physics.world.enable(exitZone);
        exitZone.body.setAllowGravity(false);
        exitZone.body.moves = false;
        exitZone.objData = { id: 'exit', label: 'Salida', hint: '[E] Volver al campus', route: '/dashboard', dialog: null };
        this.objectZones.push(exitZone);
    }

    // ─── HUD: texto de pista ──────────────────────────────────────────────────
    _setupHintText() {
        this.hintText = this.add.text(ROOM_W / 2, ROOM_H - WALL_B - 10, '', {
            fontFamily: 'monospace',
            fontSize:   '7px',
            color:      '#c6ff33',
            backgroundColor: '#000000aa',
            padding:    { x: 4, y: 2 },
        })
        .setOrigin(0.5, 1)
        .setDepth(100)
        .setVisible(false);

        // Etiquetas de los objetos
        OBJECTS.forEach(obj => {
            this.add.text(obj.x, obj.y - obj.h / 2 - 6, obj.label, {
                fontFamily: 'monospace',
                fontSize:   '5px',
                color:      '#ffffff88',
            }).setOrigin(0.5, 1);
        });
    }

    // ─── Inicio de la animación de pantalla ───────────────────────────────────
    _startScreenAnim() {
        this._animateScreen();
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────
    update() {
        if (this.dialogOpen) {
            this.jugador.setVelocity(0, 0);
            this.jugador.anims.stop();
            return;
        }

        const speed = 120;
        let vx = 0, vy = 0;

        if (this.cursors.left.isDown  || this.wasd.left.isDown)  { vx = -speed; this.lastDir = 'left'; }
        if (this.cursors.right.isDown || this.wasd.right.isDown) { vx =  speed; this.lastDir = 'right'; }
        if (this.cursors.up.isDown    || this.wasd.up.isDown)    { vy = -speed; this.lastDir = 'up'; }
        if (this.cursors.down.isDown  || this.wasd.down.isDown)  { vy =  speed; this.lastDir = 'down'; }

        // Normalizar diagonal
        if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
        this.jugador.setVelocity(vx, vy);

        // Animaciones direccionales
        if (vx !== 0 || vy !== 0) {
            this.jugador.anims.play(`walk-${this.lastDir}`, true);
        } else {
            this.jugador.anims.play(`idle-${this.lastDir}`, true);
        }

        // Detectar zona cercana
        this.currentZone = null;
        this.objectZones.forEach(zone => {
            if (this.physics.overlap(this.jugador, zone)) {
                this.currentZone = zone;
            }
        });

        // Mostrar/ocultar pista
        if (this.currentZone) {
            this.hintText
                .setText(this.currentZone.objData.hint)
                .setPosition(this.jugador.x, this.jugador.y - 20)
                .setVisible(true);
        } else {
            this.hintText.setVisible(false);
        }

        // Interacción (E, Espacio o Enter)
        const interact = Phaser.Input.Keyboard.JustDown(this.keyE)
                      || Phaser.Input.Keyboard.JustDown(this.keySpace)
                      || Phaser.Input.Keyboard.JustDown(this.keyEnter);

        if (interact && this.currentZone) {
            const data = this.currentZone.objData;
            this.dialogOpen = true;
            this.jugador.setVelocity(0, 0);
            this.jugador.anims.stop();

            if (data.route) {
                EventBus.emit('NAVIGATE', data.route, data.dialog);
            } else {
                // Solo diálogo (cama)
                EventBus.emit('SHOW_DIALOG', { title: data.label, text: data.dialog });
            }
        }
    }
}
