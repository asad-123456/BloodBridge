import os
import re

file_path = r"c:\BloodBridge\frontend\src\pages\citizen\BloodFeed.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_map_block = """
                  <SearchLocationMarker 
                    position={userPos} 
                    setPosition={setUserPos}
                    onLocationUpdate={(lat, lon) => {
                      setLoading(true);
                      fetch(`${apiBaseUrl}/blood-requests/nearby/for-me?latitude=${lat}&longitude=${lon}&radius_km=50`, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                      }).then(res => { if (!res.ok) throw new Error("Failed"); return res.json(); }).then(data => { if(Array.isArray(data)) setRequests(data); setLoading(false); }).catch(e => { console.error(e); setLoading(false); });
                    }}
                  />
"""

content = re.sub(r'(<TileLayer[^>]+/>)', r'\1' + new_map_block, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
