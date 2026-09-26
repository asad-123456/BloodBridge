import os
import re

file_path = r"c:\BloodBridge\backend\src\donors\controller.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'location=make_point(data.latitude, data.longitude),',
    'location=make_point(data.latitude, data.longitude) if data.latitude is not None and data.longitude is not None else None,'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
