"""add partner inventory table

Revision ID: d9d3a5b08e1f
Revises: b91c47e5f3a2
Create Date: 2026-09-13 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d9d3a5b08e1f"
down_revision: Union[str, Sequence[str], None] = "b91c47e5f3a2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "blood_inventories",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("organization_id", sa.UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("blood_group", sa.String(length=5), nullable=False),
        sa.Column("component_type", sa.String(length=50), nullable=False, server_default="Whole Blood"),
        sa.Column("units_available", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_updated", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index(
        "ix_blood_inventories_organization_id",
        "blood_inventories",
        ["organization_id"],
        unique=False,
    )
    op.create_index(
        "ix_blood_inventories_blood_group_component_type",
        "blood_inventories",
        ["organization_id", "blood_group", "component_type"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_blood_inventories_blood_group_component_type", table_name="blood_inventories")
    op.drop_index("ix_blood_inventories_organization_id", table_name="blood_inventories")
    op.drop_table("blood_inventories")
