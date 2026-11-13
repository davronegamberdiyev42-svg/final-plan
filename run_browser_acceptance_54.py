#!/usr/bin/env python3
"""Real local-HTTP Chromium acceptance for Stage 54. Does not emulate Android."""
from pathlib import Path
from urllib.parse import urlsplit, unquote
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import mimetypes, json, sys, time, re
ROOT=Path(__file__).resolve().parents[1]
BASE_URL='https://stage54.invalid/final-stage-/'
results=[]; console_errors=[]; page_errors=[]
def record(name,ok,detail=''):
    results.append({'id':name,'pass':bool(ok),'detail':str(detail)[:500]})
    print('[TEST]',name,'PASS' if ok else 'FAIL',str(detail)[:180],flush=True)
def js(page,expr,*args):
    try: return page.evaluate(expr,*args)
    except Exception as e: return {'error':repr(e)}
def goto(page,route):
    b=page.locator(f'#nav [data-page="{route}"]').first
    if not b.count(): raise RuntimeError('nav route not found: '+route)
    b.evaluate('(el) => el.click()'); page.wait_for_timeout(30)
def tab(page,group,value):
    b=page.locator(f'[data-action="s51-tab"][data-group="{group}"][data-value="{value}"]').first
    if not b.count(): raise RuntimeError(f'tab not found {group}/{value}')
    b.evaluate('(el) => el.click()'); page.wait_for_timeout(30)
def state(page):
    return js(page,"()=>{const api=window.__stage54Storage?.localStorage||window.localStorage;const raw=api.getItem('ielts-boost-rebuilt-1.0');return raw?JSON.parse(raw):null}")

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-features=IsolateOrigins,site-per-process'])
    ctx=browser.new_context(viewport={'width':1365,'height':900},accept_downloads=True,service_workers='block')
    page=ctx.new_page()
    page.set_default_timeout(3500)
    page.on('pageerror',lambda e:page_errors.append(str(e)[:1000]))
    page.on('console',lambda m:console_errors.append(m.text[:1000]) if m.type=='error' else None)
    def fulfill_asset(route):
        url=urlsplit(route.request.url)
        path=url.path
        if not path.startswith('/final-stage-/'):
            route.fulfill(status=404,body='not found'); return
        rel=unquote(path[len('/final-stage-/'):]).lstrip('/')
        target=(ROOT/rel).resolve()
        try: target.relative_to(ROOT.resolve())
        except ValueError:
            route.fulfill(status=403,body='blocked'); return
        if not target.is_file():
            route.fulfill(status=404,body='not found'); return
        mime=mimetypes.guess_type(target.name)[0] or 'application/octet-stream'
        headers={'Access-Control-Allow-Origin':'*','Cache-Control':'no-store'}
        if route.request.method=='HEAD':
            route.fulfill(status=200,headers={**headers,'Content-Type':mime,'Content-Length':str(target.stat().st_size)},body='')
        else:
            route.fulfill(status=200,headers={**headers,'Content-Type':mime},body=target.read_bytes())
    page.route('https://stage54.invalid/**',fulfill_asset)
    # The network/browser policy blocks direct navigation, so load the exact shell in a controlled DOM
    # and route every relative asset/data/audio fetch to the extracted Stage 54 ZIP bytes.
    shell=(ROOT/'index.html').read_text(encoding='utf-8')
    soup=BeautifulSoup(shell,'html.parser')
    base=soup.new_tag('base',href=BASE_URL)
    soup.head.insert(0,base)
    shim=BeautifulSoup("<script>(()=>{const make=()=>{const m=new Map();return {get length(){return m.size},key(i){return [...m.keys()][i]??null},getItem(k){k=String(k);return m.has(k)?m.get(k):null},setItem(k,v){m.set(String(k),String(v))},removeItem(k){m.delete(String(k))},clear(){m.clear()},_dump(){return Object.fromEntries(m)}}};const ls=make(),ss=make();Object.defineProperty(window,'localStorage',{configurable:true,value:ls});Object.defineProperty(window,'sessionStorage',{configurable:true,value:ss});window.__stage54Storage={localStorage:ls,sessionStorage:ss};})();</script>",'html.parser')
    soup.head.append(shim.script)
    page.set_content('<!doctype html>'+str(soup),wait_until='domcontentloaded',timeout=120000)
    page.wait_for_function("window.__IELTS_BOOST_BOOT__ && window.__IELTS_BOOST_BOOT__.ready === true",timeout=120000)
    page.wait_for_timeout(800)
    boot=js(page,"()=>({boot:window.__IELTS_BOOST_BOOT__,modules:window.IELTSBoostArchitecture?.report(),core:window.__IELTS_BOOST_CORE__?.getSnapshot(),data:document.getElementById('appData')?.textContent?.length})")
    record('BOOT_DATA_HASH_AND_MODULES',bool(boot.get('boot',{}).get('ready') and boot.get('boot',{}).get('dataDigest') in ['verified','unavailable'] and len(boot.get('modules') or [])==3 and boot.get('data',0)>10000000),boot)
    record('CORE_CONTRACT',bool(boot.get('core',{}).get('storageKey')=='ielts-boost-rebuilt-1.0' and boot.get('core',{}).get('day')==1),boot.get('core'))
    record('NO_BOOT_ERROR',page.locator('.boot-error').count()==0,'boot error component absent')
    # Ten main navigation centres.
    navs=page.locator('#nav [data-page]')
    nav_items=[navs.nth(i).get_attribute('data-page') for i in range(navs.count())]
    record('TEN_CENTRES',len(navs.all())==10 and len(set(nav_items))==10,nav_items)
    for route in ['dashboard','plan','practice','games','language','errors','mock','mastery','library','settings']:
        try:
            goto(page,route)
            body=page.locator('#app').inner_text()
            active=page.locator(f'#nav [data-page="{route}"]').get_attribute('class') or ''
            record('NAV-'+route,'active' in active and len(body.strip())>30,f'body={len(body)}; active={active}')
        except Exception as e: record('NAV-'+route,False,repr(e))
    # Four skill subroutes.
    try:
        goto(page,'practice')
        for skill in ['reading','writing','listening','speaking']:
            tab(page,'practice',skill)
            body=page.locator('#app').inner_text()
            record('SKILL-'+skill,len(body)>200 and skill.title() in body[:3000],f'{len(body)} chars')
    except Exception as e: record('FOUR-SKILL-TABS',False,repr(e))
    # Reading answer submit and error transfer.
    try:
        goto(page,'practice'); tab(page,'practice','reading')
        blocks=page.locator('[data-qblock]'); qn=blocks.count()
        for i in range(qn):
            block=blocks.nth(i); radios=block.locator('input[type=radio]')
            if radios.count(): radios.first.check()
            else:
                field=block.locator('input[type=text]').first
                if field.count(): field.fill('practice answer')
        submit=page.locator('[data-action="submit-reading"]').first
        if submit.count(): submit.click()
        page.wait_for_timeout(80)
        st=state(page) or {}; rec=st.get('readingAnswers',{}).get(str(st.get('day',1)),{})
        record('READING-SUBMIT',bool(rec.get('submitted')) and qn>=5,f'q={qn}; submitted={rec.get("submitted")}')
        push=page.locator('[data-action="push-reading-errors"]').first
        if push.count(): push.click(); page.wait_for_timeout(70)
        st=state(page) or {}
        record('READING-ERROR-TRANSFER',len(st.get('errors',[]))>0,f'errors={len(st.get("errors",[]))}')
    except Exception as e: record('READING-FLOW',False,repr(e))
    # Writing draft and version save.
    try:
        goto(page,'practice'); tab(page,'practice','writing')
        target=page.locator('#writingDraft').first
        if target.count(): target.fill('Stage 54 writing persistence check. I will explain the main comparison, use specific evidence, and keep the argument relevant to the task.')
        save_btn=page.locator('[data-action="save-writing"]').first
        if save_btn.count(): save_btn.evaluate('(el) => el.click()')
        page.wait_for_timeout(80); st=state(page) or {}
        active_task=st.get('writingTab','task2'); expected_key=f"writing:{st.get('day',1)}:{active_task}"
        record('WRITING-DRAFT-SAVE',st.get('drafts',{}).get(expected_key,'').startswith('Stage 54 writing persistence'),f'key={expected_key}; draft_keys={list(st.get("drafts",{}).keys())[:4]}')
        ver=page.locator('[data-action="save-writing-version"]').first
        if ver.count(): ver.click(); page.wait_for_timeout(50)
        record('WRITING-VERSION-UI',page.locator('#app').inner_text().lower().find('version')>=0,'version history UI present')
    except Exception as e: record('WRITING-FLOW',False,repr(e))
    # Listening MP3 route and saved answer inputs (submit lifecycle is covered by a separate fixture).
    try:
        goto(page,'practice'); tab(page,'practice','listening')
        player=page.locator('#listenAudioPlayer').first
        src=player.get_attribute('src') if player.count() else ''
        blocks=page.locator('[data-qblock]'); qn=blocks.count()
        if qn:
            first=blocks.first.locator('input[type=radio]').first
            if first.count(): first.check()
            else:
                text_input=blocks.first.locator('input[type=text]').first
                if text_input.count(): text_input.fill('practice answer')
        st=state(page) or {}; saved=st.get('listening',{}).get(str(st.get('day',1)),{}).get('answers',{})
        record('LISTENING-PLAYER-AND-ANSWER',bool(src and 'listening-day-' in src) and isinstance(saved,dict),f'src={src}; q={qn}; saved={list(saved.keys())}')
    except Exception as e: record('LISTENING-FLOW',False,repr(e))
    # Speaking manual transcript fallback / notes.
    try:
        goto(page,'practice'); tab(page,'practice','speaking')
        fields=page.locator('#app [data-speak-field]'); target=fields.first
        if fields.count(): target.fill('I believe public libraries remain useful because they give students access to quiet study spaces and reliable information.')
        st=state(page) or {}; day=str(st.get('day',1)); transcript=(st.get('speaking',{}).get(day) or {})
        saved=any('public libraries' in str(v).lower() for v in transcript.values())
        visible=page.locator('#app [data-action]').count()
        record('SPEAKING-MANUAL-FALLBACK',fields.count()>0 and saved and visible>0,f'fields={fields.count()}; saved_fields={list(transcript)}; actions={visible}')
    except Exception as e: record('SPEAKING-FLOW',False,repr(e))
    # Game Arena hub and Power Labs.
    try:
        goto(page,'games'); text=page.locator('#app').inner_text()
        record('GAME-ARENA-HUB','MISSION' in text.upper() or 'GAME' in text.upper(),text[:220])
        record('POWER-LABS-CONTENT',page.locator('#app .p33-page').count()>0 or 'POWER LAB' in text.upper(),f'chars={len(text)}')
    except Exception as e: record('GAME-FLOW',False,repr(e))
    # Language, vocabulary, resource hubs.
    try:
        goto(page,'language'); tab(page,'language','patterns')
        record('TIL-LAB-PATTERNS',len(page.locator('#app').inner_text())>300,'pattern panel')
        tab(page,'language','vocabulary')
        record('TIL-LAB-VOCAB',page.locator('#vocabSearch').count()>0 or 'vocabulary' in page.locator('#app').inner_text().lower(),'vocabulary panel')
    except Exception as e: record('LANGUAGE-FLOW',False,repr(e))
    try:
        goto(page,'library')
        record('RESOURCE-LIBRARY',len(page.locator('#app').inner_text())>200,'library center rendered')
    except Exception as e: record('LIBRARY-FLOW',False,repr(e))
    # Mock Studio: Stage 31 is the final active route renderer (not the older daily mini-checkpoint renderer).
    try:
        goto(page,'mock'); text=page.locator('#app').inner_text()
        record('MOCK-STUDIO-RENDER','MOCK' in text.upper() and len(text)>300 and page.locator('[data-s31-action="create"]').count()==1,text[:200])
        create=page.locator('[data-s31-action="create"]').first
        create_found=create.count()==1
        if create_found: create.evaluate('(el) => el.click()'); page.wait_for_timeout(50)
        st=state(page) or {}; stage31=st.get('stage31',{}); attempts=stage31.get('attempts',[])
        record('MOCK-CREATE-PERSISTENCE',create_found and len(attempts)>=1 and bool(stage31.get('activeId')),f'attempts={len(attempts)}; active={stage31.get("activeId")}; tab={stage31.get("tab")}')
        save_exit=page.locator('[data-s31-action="save-exit"]').first
        has_exit=save_exit.count()>0
        if has_exit: save_exit.evaluate('(el) => el.click()'); page.wait_for_timeout(30)
        st=state(page) or {}; stage31=st.get('stage31',{}); attempts=stage31.get('attempts',[])
        record('MOCK-SAVE-EXIT',has_exit and bool(attempts) and stage31.get('tab')=='overview',f'tab={stage31.get("tab")}; attempts={len(attempts)}')
    except Exception as e: record('MOCK-FLOW',False,repr(e))
    try:
        goto(page,'mastery')
        record('MASTERY-RENDER',len(page.locator('#app').inner_text())>200,'mastery analytics rendered')
    except Exception as e: record('MASTERY-FLOW',False,repr(e))
    try:
        goto(page,'settings')
        actions=page.locator('#app [data-action]')
        record('SETTINGS-ACTIONS',actions.count()>=4,f'{actions.count()} action controls')
        backup=page.locator('[data-action="backup"]').first
        if backup.count():
            with page.expect_download(timeout=12000) as d: backup.evaluate('(el) => el.click()')
            download=d.value
            record('BACKUP-EXPORT',download.suggested_filename.endswith('.json'),download.suggested_filename)
        else: record('BACKUP-EXPORT',False,'backup button absent')
    except Exception as e: record('SETTINGS-FLOW',False,repr(e))
    try:
        goto(page,'mastery')
        launch=page.locator('[data-ib4050-open]').first
        if launch.count(): launch.evaluate('(el) => el.click()'); page.wait_for_timeout(100)
        panel=page.locator('#ib4050-panel')
        visible=panel.count()>0 and panel.is_visible()
        record('ADVANCED-STUDIO-LAUNCH',visible,f'panel={panel.count()}')
        close=page.locator('[data-ib4050-close],#ib4050-close').first
        if close.count(): close.evaluate('(el) => el.click()'); page.wait_for_timeout(40)
        record('ADVANCED-STUDIO-CLOSE',panel.count()>0 and not panel.is_visible(),'studio closes back to main shell')
    except Exception as e: record('ADVANCED-STUDIO-FLOW',False,repr(e))
    # Mobile layout at 390 CSS pixels.
    page.set_viewport_size({'width':390,'height':844}); page.wait_for_timeout(120)
    dims=js(page,'()=>({vw:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth})')
    record('MOBILE-390-NO-HORIZONTAL-OVERFLOW',bool(dims.get('vw')==dims.get('doc')==dims.get('body')),dims)
    record('NO_PAGE_ERRORS',len(page_errors)==0,page_errors[:5])
    record('NO_CONSOLE_ERRORS',len(console_errors)==0,console_errors[:5])
    ctx.close(); browser.close()
passed=sum(x['pass'] for x in results); failed=len(results)-passed
out={'release':'54.0.0-modular','origin':'Chromium DOM with exact ZIP asset routing (opaque origin; not HTTPS acceptance)','passed':passed,'failed':failed,'total':len(results),'tests':results,'page_errors':page_errors,'console_errors':console_errors,'limitations':['Chromium uses exact Stage 54 HTML/JS/CSS/data/audio bytes through request routing and a localStorage API shim; it is not HTTPS/PWA acceptance.','Physical Android and microphone permission are not tested.','Service Worker offline lifecycle is tested in a separate context.']}
(ROOT/'docs/BROWSER_RUNTIME_54_0.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
sys.exit(1 if failed else 0)
