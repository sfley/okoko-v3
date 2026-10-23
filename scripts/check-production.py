"""Fail if fictional public-demo data leaks into the embedded production app."""
from pathlib import Path
root = Path(__file__).resolve().parents[1]
dist = root / 'backend/internal/web/dist'
assert (dist / 'index.html').is_file(), 'Build the production frontend first'
for path in dist.rglob('*.js'):
    content = path.read_text()
    for marker in ['demo.invalid', 'Fournisseur de démonstration', 'okoko.demo.refills.v1', 'Recharge fictive']:
        assert marker not in content, f'Demo data found in {path.name}'
print('Production frontend: no public demo data or demo request adapter')
