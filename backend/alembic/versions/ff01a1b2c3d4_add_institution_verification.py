"""add institution verification fields

Revision ID: ff01a1b2c3d4
Revises: f01c350b20ab
Create Date: 2026-09-21 16:59:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'ff01a1b2c3d4'
down_revision: str | Sequence[str] | None = 'f01c350b20ab'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Hospitals
    op.add_column('hospitals', sa.Column('license_number', sa.String(), nullable=True))
    op.add_column('hospitals', sa.Column('facility_type', sa.String(), nullable=True))
    op.add_column('hospitals', sa.Column('contact_person_name', sa.String(), nullable=True))
    op.add_column('hospitals', sa.Column('contact_person_designation', sa.String(), nullable=True))
    op.add_column('hospitals', sa.Column('website_url', sa.String(), nullable=True))
    
    # Organizations
    op.add_column('organizations', sa.Column('license_number', sa.String(), nullable=True))
    op.add_column('organizations', sa.Column('facility_type', sa.String(), nullable=True))
    op.add_column('organizations', sa.Column('contact_person_name', sa.String(), nullable=True))
    op.add_column('organizations', sa.Column('contact_person_designation', sa.String(), nullable=True))
    op.add_column('organizations', sa.Column('website_url', sa.String(), nullable=True))


def downgrade() -> None:
    # Organizations
    op.drop_column('organizations', 'website_url')
    op.drop_column('organizations', 'contact_person_designation')
    op.drop_column('organizations', 'contact_person_name')
    op.drop_column('organizations', 'facility_type')
    op.drop_column('organizations', 'license_number')
    
    # Hospitals
    op.drop_column('hospitals', 'website_url')
    op.drop_column('hospitals', 'contact_person_designation')
    op.drop_column('hospitals', 'contact_person_name')
    op.drop_column('hospitals', 'facility_type')
    op.drop_column('hospitals', 'license_number')

