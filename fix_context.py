import re

with open(r'c:\BloodBridge\frontend\src\context\AppStateContext.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useMemo, useCallback, toast
content = content.replace(
    'import { useEffect, useState, type ReactNode } from "react";',
    'import { useEffect, useState, useMemo, useCallback, type ReactNode } from "react";\nimport toast from "react-hot-toast";'
)

# addAudit
content = re.sub(
    r'const addAudit = \((.*?)\) =>\s+setAuditEvents\((.*?)\);',
    r'const addAudit = useCallback((\1) => setAuditEvents(\2), []);',
    content,
    flags=re.DOTALL
)

# I'll just rewrite the file entirely to be safe and clean.
