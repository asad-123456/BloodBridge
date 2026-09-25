with open(r'c:\BloodBridge\frontend\src\components\common\AppHeader.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
lines = [l for i, l in enumerate(lines) if i != 43] # remove duplicate const location = useLocation()
with open(r'c:\BloodBridge\frontend\src\components\common\AppHeader.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

with open(r'c:\BloodBridge\frontend\src\pages\citizen\BloodFeed.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
with open(r'c:\BloodBridge\frontend\src\pages\citizen\BloodFeed.tsx', 'w', encoding='utf-8') as f:
    # remove lines 61-68 (index 60-67)
    for i, line in enumerate(lines):
        if 60 <= i <= 67:
            continue
        f.write(line)
