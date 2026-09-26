import os
import re

file_path = r"c:\BloodBridge\frontend\src\pages\citizen\BloodFeed.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add useMapEvents to the react-leaflet import
content = content.replace(
    'import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";',
    'import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";'
)

# Add LocationMarker component BEFORE BloodFeed function
marker_code = """
function SearchLocationMarker({ position, setPosition, onLocationUpdate }: {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
  onLocationUpdate: (lat: number, lon: number) => void;
}) {
  const map = useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setPosition([lat, lng]);
      onLocationUpdate(lat, lng);
    },
  });

  useEffect(() => {
    if (position) map.setView(position, map.getZoom(), { animate: true });
  }, [position, map]);

  return position === null ? null : <Marker position={position}></Marker>;
}

export function BloodFeed() {
"""
content = content.replace("export function BloodFeed() {", marker_code)

# Replace the MapContainer block to include SearchLocationMarker
# Find the MapContainer opening and closing tags
map_block = """                <MapContainer center={userPos} zoom={11} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />"""
new_map_block = """                <MapContainer center={userPos} zoom={11} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <SearchLocationMarker 
                    position={userPos} 
                    setPosition={setUserPos}
                    onLocationUpdate={(lat, lon) => {
                      setLoading(true);
                      fetch(`${apiBaseUrl}/blood-requests/nearby/for-me?latitude=${lat}&longitude=${lon}&radius_km=50`, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                      }).then(res => { if (!res.ok) throw new Error("Failed"); return res.json(); }).then(data => { if(Array.isArray(data)) setRequests(data); setLoading(false); }).catch(e => { console.error(e); setLoading(false); });
                    }}
                  />"""

content = content.replace(map_block, new_map_block)

# Add instructions above map
content = content.replace(
    '<div className="w-full lg:w-1/2 min-h-[400px] border border-slate-200 rounded-xl overflow-hidden relative z-0">',
    '<div className="w-full lg:w-1/2 flex flex-col">\n              <p className="text-xs text-slate-500 mb-2">Tap on the map to drop a pin and search for requests near that location.</p>\n              <div className="w-full min-h-[400px] flex-1 border border-slate-200 rounded-xl overflow-hidden relative z-0">'
)
content = content.replace(
    '</MapContainer>\n            )}\n          </div>',
    '</MapContainer>\n            )}\n            </div>\n          </div>'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated BloodFeed.tsx")
