import sys
sys.path.append(r"c:\BloodBridge\backend")
from sqlalchemy import text
from src.utils.database import SessionLocal
db = SessionLocal()
res = db.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='donors'")).fetchall()
for r in res:
    print(r[0], r[1])
db.close()
