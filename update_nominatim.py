import os

path = r"c:\BloodBridge\frontend\src\components\common\LocationAutocomplete.tsx"
with open(path, "r", encoding="utf-8") as f: content = f.read()

# Add countrycodes=pk to constrain search to Pakistan
content = content.replace(
    'fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);',
    'fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=pk&addressdetails=1`);'
)

with open(path, "w", encoding="utf-8") as f: f.write(content)
print("Updated LocationAutocomplete API url")
