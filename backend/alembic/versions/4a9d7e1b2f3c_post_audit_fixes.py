"""post_audit_fixes

Revision ID: 4a9d7e1b2f3c
Revises: ff01a1b2c3d4
Create Date: 2026-09-23 21:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '4a9d7e1b2f3c'
down_revision: Union[str, None] = '3f3f2c0e836f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Drop device_token from donors (if it exists)
    try:
        op.drop_column('donors', 'device_token')
    except Exception:
        pass
        
    # 2. Add HANDOVER and CONFIRMED to match_status ENUM
    # PostgreSQL requires a specific syntax to alter enum types. 
    # Since Alembic doesn't natively handle ENUM additions cleanly without some boilerplate:
    with op.get_context().autocommit_block():
        try:
            op.execute("ALTER TYPE match_status ADD VALUE IF NOT EXISTS 'HANDOVER'")
            op.execute("ALTER TYPE match_status ADD VALUE IF NOT EXISTS 'CONFIRMED'")
        except Exception as e:
            print("Enum alter warning:", str(e))

def downgrade() -> None:
    op.add_column('donors', sa.Column('device_token', sa.VARCHAR(), autoincrement=False, nullable=True))
    # ENUM removal is not supported in PostgreSQL natively (requires recreating type)
