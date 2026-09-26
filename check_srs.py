import sys
sys.path.append(r"c:\BloodBridge\backend")
from sqlalchemy import text
from src.utils.database import SessionLocal
db = SessionLocal()
res = db.execute(text("SELECT count(*) FROM spatial_ref_sys")).scalar()
print("Count spatial_ref_sys:", res)
db.close()
