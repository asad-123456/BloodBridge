import os

files_to_fix = [
    r"c:\BloodBridge\frontend\src\pages\citizen\CreateRequest.tsx",
    r"c:\BloodBridge\frontend\src\pages\auth\UserSignup.tsx",
    r"c:\BloodBridge\frontend\src\pages\citizen\BloodFeed.tsx"
]

for path in files_to_fix:
    if not os.path.exists(path): continue
    with open(path, "r", encoding="utf-8") as f: content = f.read()
    
    # Replace any z-10 or z-20 relative wrappers around LocationAutocomplete with z-[1000] relative
    content = content.replace('z-10 relative">\n                  <LocationAutocomplete', 'z-[1000] relative">\n                  <LocationAutocomplete')
    content = content.replace('z-20 relative">\n                  <LocationAutocomplete', 'z-[1000] relative">\n                  <LocationAutocomplete')
    content = content.replace('z-10 relative">\n                    <LocationAutocomplete', 'z-[1000] relative">\n                    <LocationAutocomplete')
    content = content.replace('z-20 relative">\n                    <LocationAutocomplete', 'z-[1000] relative">\n                    <LocationAutocomplete')
    content = content.replace('z-10 relative">\n                <LocationAutocomplete', 'z-[1000] relative">\n                <LocationAutocomplete')
    content = content.replace('z-20 relative">\n                <LocationAutocomplete', 'z-[1000] relative">\n                <LocationAutocomplete')
    
    # For good measure, let's just regex it
    import re
    content = re.sub(r'className="([^"]*)z-[0-9]+ relative"([^>]*>\s*<LocationAutocomplete)', r'className="\1z-[1000] relative"\2', content)

    with open(path, "w", encoding="utf-8") as f: f.write(content)

print("Fixed stacking contexts!")
