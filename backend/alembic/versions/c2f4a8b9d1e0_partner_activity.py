"""partner activity and admin moderation collections

Revision ID: c2f4a8b9d1e0
Revises: f4e8c1a2b7d9
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "c2f4a8b9d1e0"
down_revision: Union[str, Sequence[str], None] = "f4e8c1a2b7d9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "safety_flags",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("reporter_id", sa.UUID(as_uuid=True), nullable=False),
        sa.Column("reported_user_id", sa.UUID(as_uuid=True), nullable=False),
        sa.Column("request_id", sa.UUID(as_uuid=True), sa.ForeignKey("blood_requests.id"), nullable=True),
        sa.Column("category", sa.String(30), nullable=False),
        sa.Column("excerpt", sa.Text(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="open"),
        sa.Column("resolution_note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_table(
        "audit_events",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("actor_id", sa.String(100), nullable=False),
        sa.Column("actor_name", sa.String(200), nullable=False),
        sa.Column("action", sa.String(200), nullable=False),
        sa.Column("target_type", sa.String(50), nullable=False),
        sa.Column("target_id", sa.String(100), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
    )
    op.add_column("request_matches", sa.Column("handover_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("request_matches", sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("request_matches", "confirmed_at")
    op.drop_column("request_matches", "handover_at")
    op.drop_table("audit_events")
    op.drop_table("safety_flags")