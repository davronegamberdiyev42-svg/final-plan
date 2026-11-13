#!/usr/bin/env python3
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
import threading, json
ROOT=Path(__file__).resolve().parents[1]
BASE='/final-stage-/'
paths=[
 '', 'index.html','standalone.html','manifest.webmanifest','sw.js','favicon.svg',
 'assets/css/stage40-50.css','assets/css/stage51.css','assets/js/stage40-50.js',
 'data/stage47-skill-resources.json','data/stage47-listening-companions.json',
 'data/stage47-task1-datasets.json','data/stage48-vocabulary-coverage.json',
 'icons/icon-192.png','icons/icon-512-maskable.png','audio/listening-day-84.mp3'
]
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT),**kwargs)
    def translate_path(self,path):
        p=path.split('?',1)[0]
        if p.startswith(BASE): p='/'+p[len(BASE):]
        return super().translate_path(p)
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
port=server.server_address[1]
results=[]
try:
    for p in paths:
        url=f'http://127.0.0.1:{port}{BASE}{p}'
        try:
            req=Request(url,method='HEAD')
            with urlopen(req,timeout=30) as res:
                results.append({'path':BASE+p,'status':res.status,'content_type':res.headers.get('Content-Type'),'content_length':res.headers.get('Content-Length')})
        except Exception as e:
            results.append({'path':BASE+p,'status':'ERROR','error':str(e)})
finally:
    server.shutdown();server.server_close()
passed=sum(x.get('status')==200 for x in results)
report={'release':'52.0.0-final-stage','base_path':BASE,'passed':passed,'total':len(results),'failures':[x for x in results if x.get('status')!=200],'checks':results,'note':'Local subpath static-host simulation, not a public GitHub Pages deployment test.'}
(ROOT/'docs'/'HTTP_SMOKE_52_0.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
raise SystemExit(0 if passed==len(results) else 1)
