"""Package tracked source and verified local builds; never include a runtime database."""
from pathlib import Path
import hashlib
import json
import subprocess
import zipfile
root = Path(__file__).resolve().parents[1]
files = subprocess.check_output(['git','ls-files','-z'],cwd=root).decode().split('\0')
version=json.loads((root/'package.json').read_text())['version']
output=root/'release'
output.mkdir(exist_ok=True)
archive=output/'okoko30-pro.zip'
manifest=[]
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as target:
    for name in filter(None,files):
        path=Path(name)
        assert not set(path.parts)&{'node_modules','.git','data','test-results','release'}, f'Private/generated folder: {name}'
        assert not any(part.startswith('.env') or part in {'config.json','config.local.json'} for part in path.parts), f'Private config: {name}'
        assert not any(suffix in {'.db','.sqlite','.sqlite3'} for suffix in path.suffixes), f'Private database: {name}'
        content=(root/path).read_bytes()
        manifest.append(hashlib.sha256(content).hexdigest()+'  '+name)
        target.writestr('okoko-v3/'+name,content)
    for name in ['okoko30-linux-arm64','mariadb-import-linux-arm64','okoko30-linux-amd64']:
        content=(root/'build'/name).read_bytes()
        manifest.append(hashlib.sha256(content).hexdigest()+'  build/'+name)
        info=zipfile.ZipInfo('okoko-v3/build/'+name)
        info.external_attr=0o100755<<16
        info.compress_type=zipfile.ZIP_DEFLATED
        target.writestr(info,content)
    target.writestr('okoko-v3/MANIFEST.sha256','\n'.join(manifest)+'\n')
(output/'SHA256SUMS.txt').write_text(hashlib.sha256(archive.read_bytes()).hexdigest()+'  '+archive.name+'\n')
(output/'INSTALLER-OKOKO.cmd').write_bytes((root/'INSTALLER-OKOKO.cmd').read_bytes())
print(f'{archive.name}: {archive.stat().st_size:,} bytes; source + Linux ARM64/amd64 binaries, no private database')
