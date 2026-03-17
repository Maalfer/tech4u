"""add password reset fields to users

Revision ID: a1b2c3d4e5f6
Revises: 2e1bbc3dabee
Create Date: 2026-03-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '2e1bbc3dabee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add password reset token fields to users table
    op.add_column('users', sa.Column('reset_token', sa.String(), nullable=True))
    op.add_column('users', sa.Column('reset_token_expiry', sa.DateTime(), nullable=True))

    # Create index for fast token lookups
    op.create_index(op.f('ix_users_reset_token'), 'users', ['reset_token'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_users_reset_token'), table_name='users')
    op.drop_column('users', 'reset_token_expiry')
    op.drop_column('users', 'reset_token')
