import sys
sys.path.append(r"c:\BloodBridge\backend")
from sqlalchemy import text
from src.utils.database import SessionLocal
db = SessionLocal()
db.execute(text("DROP EXTENSION IF EXISTS postgis CASCADE;"))
db.commit()
db.execute(text("CREATE EXTENSION postgis;"))
db.commit()
print("Recreated postgis extension.")
db.close()
