import os
import re

files = [
    r"c:\BloodBridge\backend\src\blood_requests\models.py",
    r"c:\BloodBridge\backend\src\donors\models.py",
    r"c:\BloodBridge\backend\src\hospitals\models.py",
    r"c:\BloodBridge\backend\src\organizations\models.py"
]

for file_path in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "def latitude(self):" not in content:
        prop_code = """
    @property
    def latitude(self) -> float | None:
        if self.location is None:
            return None
        # WKBElement from geoalchemy2 can be processed by shapely or we can use string representation
        # Actually, if we use geoalchemy2, it returns WKBElement. 
        # A safer way without importing shapely is using db.scalar(ST_Y(self.location)) but that needs DB access.
        # However, geoalchemy2 WKBElement has no direct lat/lon property.
        pass
"""
# Wait, let's look at how they are serialized in the DTOs first.
