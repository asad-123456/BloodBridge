with open(r'c:\BloodBridge\frontend\src\context\AppStateContext.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''  useEffect(() => {
    if (!accessToken || !["Admin", "Hospital", "Partner"].includes(user?.role ?? "")) {
      return;
    }'''

new = '''  useEffect(() => {
    if (!accessToken || !["Admin", "Hospital", "Partner"].includes(user?.role ?? "")) {
      setUsers([]);
      setRequests([]);
      setInstitutions([]);
      setSafetyFlags([]);
      setAuditEvents([]);
      setFulfillments([]);
      setInventory([]);
      return;
    }'''

if old in content:
    content = content.replace(old, new)
    with open(r'c:\BloodBridge\frontend\src\context\AppStateContext.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success")
else:
    print("Old not found")
