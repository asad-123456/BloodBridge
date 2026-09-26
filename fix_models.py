import os
import re

files = [
    r"c:\BloodBridge\backend\src\blood_requests\models.py",
    r"c:\BloodBridge\backend\src\donors\models.py",
    r"c:\BloodBridge\backend\src\hospitals\models.py",
    r"c:\BloodBridge\backend\src\organizations\models.py"
]

prop_code = """
    @property
    def latitude(self) -> float | None:
        if self.location is None:
            return None
        from geoalchemy2.shape import to_shape
        shape = to_shape(self.location)
        return shape.y

    @property
    def longitude(self) -> float | None:
        if self.location is None:
            return None
        from geoalchemy2.shape import to_shape
        shape = to_shape(self.location)
        return shape.x
"""

for file_path in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "def latitude(self):" not in content:
        # Find the end of the class and append properties
        content += prop_code
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
