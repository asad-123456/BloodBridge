import os
import re

file_path = r"c:\BloodBridge\frontend\src\pages\citizen\BloodFeed.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('const [loading, setLoading] = useState(true);', 'const [, setLoading] = useState(true);')
content = content.replace('const [loading, setLoading] = useState<boolean>(true);', 'const [, setLoading] = useState<boolean>(true);')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
