import math
from fastapi import Query


def pagination_params(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """Dependency: returns (skip, limit, page, page_size)."""
    skip = (page - 1) * page_size
    return {"skip": skip, "limit": page_size, "page": page, "page_size": page_size}


def paginate_response(items: list, total: int, page: int, page_size: int) -> dict:
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, math.ceil(total / page_size)),
    }