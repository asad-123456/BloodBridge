with open(r'c:\BloodBridge\frontend\src\components\common\AppHeader.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('return (\n    <header', 'return (\n    <>\n    <header')
content = content.replace('  );\n}\n', '  </>\n  );\n}\n')

with open(r'c:\BloodBridge\frontend\src\components\common\AppHeader.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
