import sys
import datetime
sys.path.append(r"c:\BloodBridge\backend")

import src.donors.models
import src.hospitals.models
import src.organizations.models
import src.blood_requests.models
import src.request_matches.models
import src.chat.models
import src.admin.models

from sqlalchemy import text
from src.utils.database import SessionLocal
from src.blood_requests.models import BloodRequest
from src.donors.models import Donor
from src.utils.enums import BloodType, RequestStatus, UrgencyLevel
from src.blood_requests.controller import list_nearby_for_donor
from src.utils.geo import make_point

db = SessionLocal()
db.execute(text("TRUNCATE TABLE blood_requests CASCADE"))
db.execute(text("TRUNCATE TABLE donors CASCADE"))
db.commit()

d1 = Donor(full_name="D1", email="d1@t.com", phone="1", password_hash="x", blood_type=BloodType.O_POS, location=make_point(24.8607, 67.0011))
d2 = Donor(full_name="D2", email="d2@t.com", phone="2", password_hash="x", blood_type=BloodType.O_POS, location=make_point(24.8607, 67.0011))
db.add_all([d1, d2])
db.commit()

br = BloodRequest(
    donor_id=d1.id,
    patient_name="P1",
    blood_type_needed=BloodType.O_POS,
    units_needed=1,
    urgency_level=UrgencyLevel.CRITICAL,
    required_by=datetime.datetime.now() + datetime.timedelta(days=1),
    status=RequestStatus.ACTIVE,
    current_radius_km=25,
    contact_phone="123",
    location=make_point(24.8607, 67.0011)
)
db.add(br)
db.commit()

results = list_nearby_for_donor(d2, 24.8607, 67.0011, 50, db)
print("Results for D2:", len(results))
for r in results:
    print("Found:", r)

db.close()
