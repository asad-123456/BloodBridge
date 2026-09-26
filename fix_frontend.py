import os
import re

file_path = r"c:\BloodBridge\frontend\src\pages\citizen\BloodFeed.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix Modal z-index
content = content.replace('z-50 bg-slate-900/50', 'z-[2000] bg-slate-900/50')

# Fix AppHeader z-index
header_path = r"c:\BloodBridge\frontend\src\components\layout\AppHeader.tsx"
if os.path.exists(header_path):
    with open(header_path, "r", encoding="utf-8") as hf:
        hcontent = hf.read()
    hcontent = hcontent.replace('z-50', 'z-[2000]')
    with open(header_path, "w", encoding="utf-8") as hf:
        hf.write(hcontent)

# Refactor SearchLocationMarker to use refs to avoid stale closures and unnecessary panning
marker_code_new = """
import { useRef } from 'react';

function SearchLocationMarker({ position, setPosition, onLocationUpdate }: {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
  onLocationUpdate: (lat: number, lon: number) => void;
}) {
  const onLocationUpdateRef = useRef(onLocationUpdate);
  onLocationUpdateRef.current = onLocationUpdate;

  const lastClickedPos = useRef<[number, number] | null>(null);

  const map = useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      lastClickedPos.current = [lat, lng];
      setPosition([lat, lng]);
      onLocationUpdateRef.current(lat, lng);
    },
  });

  useEffect(() => {
    if (position) {
      // Only pan if the position was not set by our own click
      if (lastClickedPos.current && lastClickedPos.current[0] === position[0] && lastClickedPos.current[1] === position[1]) {
        return;
      }
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);

  return position === null ? null : <Marker position={position}></Marker>;
}
"""

content = re.sub(r'function SearchLocationMarker.*?\n  return position === null \? null : <Marker position={position}></Marker>;\n}', marker_code_new.strip(), content, flags=re.DOTALL)

# Fix BloodFeed Race Conditions and Error Feedback
bloodfeed_fetch_replace = """
      const abortController = new AbortController();
      const signal = abortController.signal;
      try {
        const res = await fetch(`${apiBaseUrl}/blood-requests/nearby/for-me?latitude=${lat}&longitude=${lon}&radius_km=50`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setRequests(data);
        } else {
          toast.error("Failed to fetch nearby requests.");
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error(e);
          toast.error("Error fetching requests.");
        }
      } finally {
        setLoading(false);
      }
"""

# Wait, `BloodFeed` has multiple fetches. I will use a custom hook or rewrite the logic via regex.
