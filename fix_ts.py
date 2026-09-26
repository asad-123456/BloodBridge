import os
import re

file_path = r"c:\BloodBridge\frontend\src\pages\citizen\BloodFeed.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix useRef import
if "import { useRef }" not in content and "import { useRef," not in content:
    content = content.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect, useRef } from "react";')

# The regex I used earlier to add useRef before SearchLocationMarker might have duplicated or placed it weirdly.
content = content.replace("import { useRef };\n", "")
content = content.replace("import { useRef } from 'react';\n", "")

if "useRef" not in content[:200]:
    content = content.replace('import { useState, useEffect }', 'import { useState, useEffect, useRef }')

# Find where `error` is declared but never read.
content = content.replace('      (error) => {\n        setLoading(false);\n      }', '      () => {\n        setLoading(false);\n      }')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
