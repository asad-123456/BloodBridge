import os
import re

files = [
    r"c:\BloodBridge\backend\src\blood_requests\dtos.py",
    r"c:\BloodBridge\backend\src\donors\dtos.py",
    r"c:\BloodBridge\backend\src\hospitals\dtos.py",
    r"c:\BloodBridge\backend\src\organizations\dtos.py"
]

for file_path in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # We want to add latitude and longitude to Out classes.
    # Look for classes ending with Out(BaseModel) or Out.
    
    # Example: class BloodRequestOut(BaseModel):
    # We add latitude: float | None = None and longitude: float | None = None
    
    # For now, let's just do a simple replacement for the specific classes
    out_classes = ["BloodRequestOut", "DonorOut", "HospitalOut", "OrganizationOut"]
    for out_class in out_classes:
        pattern = f"(class {out_class}\\(.*?\\):.*?)(?=\\nclass|\\Z)"
        match = re.search(pattern, content, flags=re.DOTALL)
        if match:
            class_body = match.group(1)
            if "latitude: float | None" not in class_body:
                # insert after id: uuid.UUID if exists, otherwise at the end of class
                new_class_body = class_body + "    latitude: float | None = None\n    longitude: float | None = None\n"
                content = content.replace(class_body, new_class_body)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

# Make DonorSignup latitude, longitude, and address optional
donors_dtos_path = r"c:\BloodBridge\backend\src\donors\dtos.py"
with open(donors_dtos_path, "r", encoding="utf-8") as f:
    dcontent = f.read()

dcontent = dcontent.replace("latitude: Latitude", "latitude: Latitude | None = None")
dcontent = dcontent.replace("longitude: Longitude", "longitude: Longitude | None = None")
dcontent = dcontent.replace("address: Label", "address: Label | None = None")

with open(donors_dtos_path, "w", encoding="utf-8") as f:
    f.write(dcontent)
