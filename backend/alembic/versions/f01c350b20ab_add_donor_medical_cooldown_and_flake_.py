"""add_donor_medical_cooldown_and_flake_penalties

Revision ID: f01c350b20ab
Revises: c2f4a8b9d1e0
Create Date: 2026-09-19 12:16:03.033571

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f01c350b20ab'
down_revision: Union[str, Sequence[str], None] = 'c2f4a8b9d1e0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("donors", sa.Column("eligible_after", sa.DateTime(timezone=True), nullable=True))
    op.add_column("donors", sa.Column("reliability_score", sa.Integer(), nullable=False, server_default="100"))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("donors", "reliability_score")
    op.drop_column("donors", "eligible_after")
