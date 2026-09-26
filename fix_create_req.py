import os
import re

file_path = r"c:\BloodBridge\frontend\src\pages\citizen\CreateRequest.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace console.error with console.error and toast.error
content = content.replace('console.error(err);\n      }', 'console.error(err);\n        toast.error(err instanceof Error ? err.message : "An error occurred");\n      }')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
