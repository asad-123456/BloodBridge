import os

path = r"c:\BloodBridge\frontend\src\components\common\LocationAutocomplete.tsx"
with open(path, "r", encoding="utf-8") as f: content = f.read()

# Replace z-50 with z-[1000]
content = content.replace('className="absolute z-50 mt-1', 'className="absolute z-[1000] mt-1')

with open(path, "w", encoding="utf-8") as f: f.write(content)
print("Fixed z-index in LocationAutocomplete")
