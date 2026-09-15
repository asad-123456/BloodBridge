"""Add active status to hospital and organization accounts.

Revision ID: f4e8c1a2b7d9
Revises: d9d3a5b08e1f
"""

from alembic import op
import sqlalchemy as sa


revision = "f4e8c1a2b7d9"
down_revision = "d9d3a5b08e1f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("hospitals", sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.add_column("organizations", sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()))


def downgrade() -> None:
    op.drop_column("organizations", "is_active")
    op.drop_column("hospitals", "is_active")