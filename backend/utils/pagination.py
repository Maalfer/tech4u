from sqlalchemy.orm import Query
from typing import TypedDict, List, Any, TypeVar, Generic

T = TypeVar("T")

class PaginatedResponse(TypedDict, Generic[T]):
    items: List[T]
    total_count: int
    limit: int
    offset: int

def paginate_query(query: Query, limit: int = 50, offset: int = 0) -> PaginatedResponse:
    """
    Applies limit and offset to a SQLAlchemy query and returns paginated data with metadata.
    """
    total_count = query.count()
    items = query.limit(limit).offset(offset).all()
    
    return {
        "items": items,
        "total_count": total_count,
        "limit": limit,
        "offset": offset
    }
