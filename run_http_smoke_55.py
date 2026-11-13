#!/usr/bin/env python3
"""Stage 55 local subpath HTTP smoke test."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from urllib.request import urlopen, Request
from urllib.error import HTTPError
from functools import partial
from urllib.parse import urlsplit
import json, time, sys
ROOT=Path(__file__).resolve().parents[1]
PREFIX='/final-stage-/'
class Handler(SimpleHTTPRequestHandler):
    def translate_path(self,path):
        p=urlsplit(path).path
        if not p.startswith(PREFIX): return str(ROOT/'__404__')
        rel=p[len(PREFIX):]
        return str((ROOT/rel).resolve())
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}{PREFIX}'
checks=[]
def check(path,expected=200,method='GET'):
    try:
        req=Request(base+path,method=method)
        with urlopen(req,timeout=60) as r:
            body=r.read() if method=='GET' else b''
            ok=r.status==expected
            checks.append({'path':path,'status':r.status,'content_type':r.headers.get_content_type(),'content_length':r.headers.get('Content-Length'),'bytes_read':len(body),'pass':ok})
    except HTTPError as e:
        checks.append({'path':path,'status':e.code,'pass':e.code==expected,'error':str(e)})
    except Exception as e:
        checks.append({'path':path,'status':None,'pass':False,'error':repr(e)})

for p in ['', 'index.html','standalone.html','manifest.webmanifest','sw.js','favicon.svg','assets/css/app-core.css','assets/css/stage40-50.css','assets/css/stage51.css','assets/js/core/contract.js','assets/js/core/module-registry.js','assets/js/core/boot.js','assets/js/compat/legacy-core.js','assets/js/modules/backup-manager.js','assets/js/modules/advanced-studio.js','assets/js/stage40-50.js','data/app-data.json','data/stage47-skill-resources.json','data/stage47-listening-companions.json','data/stage47-task1-datasets.json','data/stage48-vocabulary-coverage.json','icons/icon-192.png','icons/icon-512-maskable.png']:
    check(p)
for i in range(1,85): check(f'audio/listening-day-{i:02d}.mp3',method='HEAD')
server.shutdown()
passed=sum(x['pass'] for x in checks);failed=len(checks)-passed
out={'release':'55.0.0-data-recovery','base_path':PREFIX,'passed':passed,'failed':failed,'total':len(checks),'checks':checks,'note':'Local static HTTP subpath simulation; not public GitHub Pages acceptance.'}
(ROOT/'docs/HTTP_SMOKE_55_0.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
sys.exit(1 if failed else 0)
