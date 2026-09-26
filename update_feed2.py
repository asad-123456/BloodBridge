import os

file_path = r"c:\BloodBridge\frontend\src\pages\citizen\BloodFeed.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'attribution="&copy; OpenStreetMap contributors"\n                  />',
    'attribution="&copy; OpenStreetMap contributors"\n                  />\n                  <SearchLocationMarker \n                    position={userPos} \n                    setPosition={setUserPos}\n                    onLocationUpdate={(lat, lon) => {\n                      setLoading(true);\n                      fetch(`${apiBaseUrl}/blood-requests/nearby/for-me?latitude=${lat}&longitude=${lon}&radius_km=50`, {\n                        headers: { Authorization: `Bearer ${accessToken}` },\n                      }).then(res => { if (!res.ok) throw new Error("Failed"); return res.json(); }).then(data => { if(Array.isArray(data)) setRequests(data); setLoading(false); }).catch(e => { console.error(e); setLoading(false); });\n                    }}\n                  />'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
