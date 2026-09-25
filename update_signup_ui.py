import os

path = r"c:\BloodBridge\frontend\src\pages\auth\UserSignup.tsx"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# I need to replace the entire form block
old_form = """        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block text-sm font-bold text-slate-700">
            Full Name
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
            />
          </label>

          <label className="block text-sm font-bold text-slate-700">
            Email Address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
            />
          </label>

          <label className="block text-sm font-bold text-slate-700">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Complete Registration"}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>"""

new_form = """        <form onSubmit={submit} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">
              Full Name
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>

            <label className="block text-sm font-bold text-slate-700">
              Email Address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>
            
            <label className="block text-sm font-bold text-slate-700">
              Phone Number
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+923000000000"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>

            <label className="block text-sm font-bold text-slate-700">
              Blood Type
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary bg-white"
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-bold text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>
          </div>
          
          <div className="space-y-4 flex flex-col">
            <div>
              <label htmlFor="address" className="block text-sm font-bold text-slate-700 mb-1">Base Address *</label>
              <input
                id="address"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-3 outline-none focus:border-primary"
                placeholder="e.g. 123 Main St"
              />
            </div>
            <div className="flex-1 flex flex-col min-h-[300px] border border-slate-200 rounded-lg overflow-hidden relative z-0">
              <div className="p-2 bg-white flex gap-2 border-b border-slate-200">
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
                <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">
                  Acquiring precise location...
                </div>
              ) : (
                <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} />
                </MapContainer>
              )}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {isSubmitting ? "Creating account..." : "Complete Registration"}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </div>
        </form>"""

content = content.replace(old_form, new_form)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Injected map UI")
