import os

path = r"c:\BloodBridge\frontend\src\pages\citizen\MyRequests.tsx"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'actionText="Create a Request" onAction={() => window.location.href = "/citizen/create-request"}',
    'actionText="New Request" onAction={() => window.location.href = "/citizen/new-request"}'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed MyRequests routing")
