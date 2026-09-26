import sys
sys.path.append(r"c:\BloodBridge\backend")
from sqlalchemy import text
from src.utils.database import SessionLocal
db = SessionLocal()
try:
    res = db.execute(text("INSERT INTO donors (id, full_name, email, password_hash, blood_type, location, phone) VALUES (gen_random_uuid(), 'Test', 't@t.com', 'x', 'O_POS', ST_SetSRID(ST_MakePoint(67.0011, 24.8607), 4326), '123') RETURNING id"))
    print("Success:", res.fetchone())
except Exception as e:
    print("Error:", e)
finally:
    db.rollback()
    db.close()
