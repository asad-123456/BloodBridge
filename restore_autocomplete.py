import os
import re

path = r"c:\BloodBridge\frontend\src\pages\citizen\BloodFeed.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Add LocationAutocomplete import
if "LocationAutocomplete" not in content:
    content = content.replace('import { UrgencyBadge } from "../../components/common/UrgencyBadge";', 'import { UrgencyBadge } from "../../components/common/UrgencyBadge";\nimport { LocationAutocomplete } from "../../components/common/LocationAutocomplete";')

old_block = """<input type="text" placeholder="Or type a city..." className="border border-slate-200 px-3 py-2 rounded-lg text-sm outline-none focus:border-primary w-48" />
            <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
              Search
            </button>"""

new_block = """<div className="w-64">
              <LocationAutocomplete 
                placeholder="Or type a city..." 
                onSelect={(lat, lon, name) => {
                  setUserPos([lat, lon]);
                  setLoading(true);
                  fetch(`${apiBaseUrl}/blood-requests/nearby/for-me?latitude=${lat}&longitude=${lon}&radius_km=50`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                  }).then(res => { if (!res.ok) throw new Error("Failed"); return res.json(); }).then(data => { if(Array.isArray(data)) setRequests(data); setLoading(false); }).catch(e => { console.error(e); setLoading(false); });
                }} 
              />
            </div>"""

# Find the search inputs since they might have changed after my regexes
# Let's just find the flex container for the inputs
content = re.sub(r'<input type="text" placeholder="Or type a city\.\.\.".*?<button.*?Search\n\s*</button>', new_block, content, flags=re.DOTALL)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Restored LocationAutocomplete in BloodFeed")
