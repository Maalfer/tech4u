"""merge migration heads

Revision ID: ab1993636773
Revises: a1b2c3d4e5f6, d86913c0e53b
Create Date: 2026-03-16 20:17:01.367150

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ab1993636773'
down_revision: Union[str, Sequence[str], None] = ('a1b2c3d4e5f6', 'd86913c0e53b')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
