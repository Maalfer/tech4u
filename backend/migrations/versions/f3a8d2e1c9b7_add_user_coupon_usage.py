"""add user_coupon_usage table

Revision ID: f3a8d2e1c9b7
Revises: ab1993636773
Create Date: 2026-03-17

Descripción: Añade tabla user_coupon_usage para rastrear qué usuario ha usado
qué cupón, evitando que un mismo usuario reutilice cupones de forma fraudulenta.
"""
from alembic import op
import sqlalchemy as sa

revision = 'f3a8d2e1c9b7'
down_revision = 'ab1993636773'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'user_coupon_usage',
        sa.Column('id',        sa.Integer(),  nullable=False),
        sa.Column('user_id',   sa.Integer(),  nullable=False),
        sa.Column('coupon_id', sa.Integer(),  nullable=False),
        sa.Column('used_at',   sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['coupon_id'], ['coupons.id']),
        sa.ForeignKeyConstraint(['user_id'],   ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'coupon_id', name='uq_user_coupon'),
    )
    op.create_index('ix_user_coupon_usage_user_id',   'user_coupon_usage', ['user_id'],   unique=False)
    op.create_index('ix_user_coupon_usage_coupon_id', 'user_coupon_usage', ['coupon_id'], unique=False)
    op.create_index('ix_user_coupon_usage_id',        'user_coupon_usage', ['id'],        unique=False)


def downgrade() -> None:
    op.drop_index('ix_user_coupon_usage_id',        table_name='user_coupon_usage')
    op.drop_index('ix_user_coupon_usage_coupon_id', table_name='user_coupon_usage')
    op.drop_index('ix_user_coupon_usage_user_id',   table_name='user_coupon_usage')
    op.drop_table('user_coupon_usage')
