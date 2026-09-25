import os

path = r"c:\BloodBridge\frontend\src\pages\citizen\CreateRequest.tsx"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """            <div className="flex-1 min-h-[300px] border border-slate-200 rounded-lg overflow-hidden relative z-0">
              {position && ("""

new_block = """            <div className="flex-1 min-h-[300px] flex flex-col border border-slate-200 rounded-lg overflow-hidden relative z-0">
              <div className="p-2 bg-white flex gap-2 border-b border-slate-200 z-10 relative">
                <input type="text" placeholder="Search city..." value={mapSearch} onChange={e => setMapSearch(e.target.value)} className="flex-1 border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-primary" />
                <button type="button" onClick={async () => {
                  if(!mapSearch) return;
                  try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearch)}`);
                    const data = await res.json();
                    if(data && data.length > 0) {
                      setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                      setAddress(data[0].display_name);
                    }
                  } catch(err) {}
                }} className="bg-primary text-white px-3 py-1 rounded-lg text-sm font-bold">Search</button>
              </div>
              {position === null ? (
                <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400 flex-1">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-3"></div> Loading map...
                </div>
              ) : ("""

content = content.replace(old_block, new_block)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added Search Bar to CreateRequest")
