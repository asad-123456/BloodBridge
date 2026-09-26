import os
import re

file_path = r"c:\BloodBridge\frontend\src\pages\citizen\BloodFeed.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the SearchLocationMarker usage
old_marker = r'<SearchLocationMarker.*?/>'
new_marker = """<SearchLocationMarker 
                    position={userPos} 
                    setPosition={setUserPos}
                    onLocationUpdate={(lat, lon) => {
                      fetchRequests(lat, lon);
                    }}
                  />"""
content = re.sub(old_marker, new_marker, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
