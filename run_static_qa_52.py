#!/usr/bin/env python3
"""Static/data/media QA for IELTS Boost Final Stage 52. Does not replace device E2E."""
from pathlib import Path
from bs4 import BeautifulSoup
import json, hashlib, re, subprocess, sys, collections, os
ROOT=Path(__file__).resolve().parents[1]
checks=[]
def add(name, ok, detail=''):
    checks.append({'name':name,'pass':bool(ok),'detail':str(detail)[:500]})
def load_json(p):
    return json.loads(p.read_text(encoding='utf-8'))
def node_check(src,name):
    tmp=Path('/tmp')/f'pa_{name.replace("/","_")}.js'
    tmp.write_text(src,encoding='utf-8')
    r=subprocess.run(['node','--check',str(tmp)],capture_output=True,text=True)
    return r.returncode==0,(r.stderr.strip() or 'node --check PASS')

index=ROOT/'index.html'; standalone=ROOT/'standalone.html'
soup=BeautifulSoup(index.read_text(encoding='utf-8',errors='replace'),'html.parser')
app_tag=soup.find('script',id='appData')
try:
    app=json.loads(app_tag.string or app_tag.text)
    app_ok=True
except Exception as e:
    app={}; app_ok=False; app_err=str(e)
add('main_app_data_json',app_ok,'embedded appData parsed' if app_ok else app_err)
plan=app.get('plan',{}).get('days',[]); core=app.get('core',{}).get('days',[])
add('plan_84_days',len(plan)==84,len(plan))
add('core_84_days',len(core)==84,len(core))
add('4_skill_modules_each_day',len(core)==84 and all(set(['reading','listening','writing','speaking']).issubset(x.keys()) for x in core), '84 days × 4 core skills')
reading_q=sum(len(x.get('reading',{}).get('questions',[])) for x in core)
listening_q=sum(len(x.get('listening',{}).get('questions',[])) for x in core)
add('reading_question_count',reading_q==840,reading_q)
add('listening_question_count',listening_q==420,listening_q)
sp_days=app.get('speakingExpert',{}).get('days',[])
part1=sum(len(x.get('part1',[])) for x in sp_days); part2=sum(1 for x in sp_days if x.get('part2')); part3=sum(len(x.get('part3',[])) for x in sp_days)
add('speaking_prompts',len(sp_days)==84 and part1==252 and part2==84 and part3==252, f'P1={part1}; P2={part2}; P3={part3}')
add('writing_prompts',all(x.get('writing',{}).get('task1_prompt') and x.get('writing',{}).get('task2_prompt') for x in core), 'Task 1 + Task 2 prompts all days')
add('articles_61',len(app.get('library',{}).get('articles',[]))==61,len(app.get('library',{}).get('articles',[])))
add('sentence_patterns_864',len(app.get('patterns',[]))==864,len(app.get('patterns',[])))
add('reading_packs_12',len(app.get('readingSourcePacks',[]))==12,len(app.get('readingSourcePacks',[])))
words=app.get('words',[])
terms=[re.sub(r'\s+',' ',str(x.get('word','')).strip().casefold()) for x in words]
add('vocabulary_19k',len(words)==19000,len(words))
add('vocabulary_unique_terms',len(set(terms))==19000,len(set(terms)))
daily=app.get('vocabularyExpert',{}).get('daily_sets',[])
ids=[i for row in daily for i in row.get('word_ids',[])]
lookup={x.get('id'):x for x in words}
add('daily_sets_84x8',len(daily)==84 and all(len(x.get('word_ids',[]))==8 for x in daily), f'{len(daily)} sets / {len(ids)} ids')
add('daily_core_672_unique',len(ids)==672 and len(set(ids))==672 and all(i in lookup for i in ids),f'{len(ids)} ids, {len(set(ids))} unique, unresolved={sum(i not in lookup for i in ids)}')
add('daily_core_dual_ipa',all(lookup[i].get('ipa_us') and lookup[i].get('ipa_uk') for i in ids), 'US + UK IPA present for every daily core entry')
add('daily_core_full_gloss',all(lookup[i].get('meaning_en') and lookup[i].get('uzbek') and lookup[i].get('example') and lookup[i].get('part_of_speech') for i in ids), 'definition, Uzbek gloss, example and POS on 672 core')

# Stage 47/48 linked data packs
skills=load_json(ROOT/'data/stage47-skill-resources.json')
listening=load_json(ROOT/'data/stage47-listening-companions.json')
task1=load_json(ROOT/'data/stage47-task1-datasets.json')
coverage=load_json(ROOT/'data/stage48-vocabulary-coverage.json')
add('stage47_skill_resources_336',len(skills)==336,len(skills))
byday=collections.defaultdict(list)
for row in skills: byday[int(row['day'])].append(str(row['skill']).casefold())
add('stage47_4_skills_each_day',len(byday)==84 and all(len(v)==4 and len(set(v))==4 for v in byday.values()),'84 × 4 unique skill names')
add('stage47_listening_companions_84',len(listening)==84,len(listening))
add('stage47_task1_datasets_84',len(task1)==84,len(task1))
fams=collections.Counter(x.get('visual_type') for x in task1)
add('task1_six_families_14_each',len(fams)==6 and all(v==14 for v in fams.values()),dict(fams))
# Ensure every day has a dataset, and data has an explicit fictional provenance.
add('task1_day_coverage',set(int(x['day']) for x in task1)==set(range(1,85)),'days 1..84 exactly')
add('task1_provenance_disclosed',all('fictional' in str(x.get('provenance','')).casefold() or 'illustrative' in str(x.get('provenance','')).casefold() for x in task1),'fictional practice datasets labelled')
add('daily_core_coverage_record',coverage.get('total_indexed')==19000 and coverage.get('daily_core',{}).get('items')==672,coverage.get('daily_core'))
# Data-structure readability sanity checks.
parsed=0; malformed=[]
for row in task1:
    typ=row['visual_type']; raw=row.get('data_structure','')
    if typ=='process': ok='→' in raw
    elif typ=='map': ok='→' in raw and ';' in raw
    else: ok=bool(re.search(r'-?\d+(?:\.\d+)?',raw)) and ':' in raw
    parsed+=bool(ok)
    if not ok: malformed.append(row['day'])
add('task1_data_structures_parse',parsed==84,f'{parsed}/84; malformed={malformed[:10]}')

# MP3 presence and actual decode.
audio=sorted((ROOT/'audio').glob('listening-day-*.mp3'))
add('audio_84_assets',len(audio)==84,sum(p.stat().st_size for p in audio))
missing=[f'{i:02d}' for i in range(1,85) if not (ROOT/'audio'/f'listening-day-{i:02d}.mp3').exists()]
add('audio_day_sequence',not missing,'missing days '+','.join(missing))
decode_ok=0; decode_fail=[]
for p in audio:
    r=subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],capture_output=True,text=True)
    if r.returncode==0 and not r.stderr.strip(): decode_ok+=1
    else: decode_fail.append((p.name,r.stderr.strip()[:160]))
add('ffmpeg_audio_decode_84',decode_ok==84,f'{decode_ok}/84; failures={decode_fail[:3]}')

# HTML, JS, CSS and PWA paths.
css=ROOT/'assets/css/stage40-50.css'; js=ROOT/'assets/js/stage40-50.js'; sw=ROOT/'sw.js'
add('module_css_js_present',css.exists() and js.exists(),f'css={css.stat().st_size if css.exists() else 0}; js={js.stat().st_size if js.exists() else 0}')
for name,p in [('stage4050_js',js),('service_worker',sw)]:
    ok,detail=node_check(p.read_text(encoding='utf-8'),name)
    add(name+'_syntax',ok,detail)
# Check executable inline JS (exclude appData and embedded module JSON).
inline=[]
for i,tag in enumerate(soup.find_all('script')):
    if tag.get('src') or tag.get('type') in ('application/json','application/ld+json'): continue
    txt=tag.string or tag.text or ''
    if txt.strip(): inline.append((i,txt))
inline_results=[]
for i,txt in inline:
    ok,detail=node_check(txt,f'inline_{i}')
    inline_results.append((i,ok,detail))
add('main_inline_js_syntax',all(x[1] for x in inline_results),inline_results)
manifest=load_json(ROOT/'manifest.webmanifest')
add('pwa_manifest_relative_scope',manifest.get('scope')=='./' and manifest.get('start_url','').startswith('./') and manifest.get('id')=='./',manifest.get('scope'))
add('pwa_manifest_install_members',bool(manifest.get('name') and manifest.get('short_name') and manifest.get('display') in ['standalone','minimal-ui','fullscreen'] and manifest.get('prefer_related_applications') is False), {k:manifest.get(k) for k in ['name','short_name','display','prefer_related_applications']})
add('pwa_manifest_icons',len(manifest.get('icons',[]))>=4,[x.get('src') for x in manifest.get('icons',[])])
try:
    from PIL import Image
    icon_dims={x.get('src'):Image.open(ROOT/x.get('src','').replace('./','')).size for x in manifest.get('icons',[]) if x.get('src')}
    add('pwa_icon_dimensions',all(tuple(icon_dims.get(f'./icons/icon-{n}{suffix}.png',()))==(n,n) for n in [192,512] for suffix in ['', '-maskable']),icon_dims)
except Exception as e:
    add('pwa_icon_dimensions',False,str(e))
required=['./manifest.webmanifest','./favicon.svg','./assets/css/stage40-50.css','./assets/js/stage40-50.js','./data/stage47-skill-resources.json','./data/stage47-listening-companions.json','./data/stage47-task1-datasets.json','./data/stage48-vocabulary-coverage.json','./icons/icon-192.png','./icons/icon-512.png','./sw.js']
missing=[]
for ref in required:
    if not (ROOT/ref[2:]).exists(): missing.append(ref)
add('all_runtime_assets_exist',not missing,missing or f'{len(required)} required assets exist')
add('no_old_repo_absolute_paths','/Ielts-gooo/' not in index.read_text(encoding='utf-8',errors='ignore'), 'No hard-coded old repo base path')
# Stage 51 compact navigation, hub mapping, design and PWA install experience.
main_src=index.read_text(encoding='utf-8',errors='ignore')
nav_block=re.search(r"const items=\[([\s\S]*?)\];\s*const active=s51GroupFor\(state.page\);",main_src)
nav_labels=re.findall(r"\['(?:dashboard|plan|practice|games|language|errors|mock|mastery|library|settings)'\s*,",nav_block.group(1) if nav_block else '')
add('stage51_exactly_10_main_centres',len(nav_labels)==10,f'{len(nav_labels)} top-level navigation centres')
# Legacy page IDs are migrated into the ten new centres without dropping the selected inner tab.
try:
    a=main_src.index('function s51NormalizeLegacyPage(){')
    b=main_src.index('render=function(){',a)
    norm_src=main_src[a:b]
    route_test="let state={page:'reading'}; "+norm_src+" const a=s51NormalizeLegacyPage()+':'+state.practiceSkill; state={page:'patterns'}; const b=s51NormalizeLegacyPage()+':'+state.languageTab; state={page:'articles'}; const c=s51NormalizeLegacyPage()+':'+state.libraryTab; state={page:'progress'}; const d=s51NormalizeLegacyPage(); process.stdout.write([a,b,c,d].join('|'));"
    temp=Path('/tmp/stage51_legacy_routes.js'); temp.write_text(route_test,encoding='utf-8')
    rr=subprocess.run(['node',str(temp)],capture_output=True,text=True,timeout=15)
    route_ok=rr.returncode==0 and rr.stdout.strip()=='practice:reading|language:patterns|library:articles|mastery' and "else if(requested==='mastery') underlying='progress'" in main_src
    route_detail=rr.stderr.strip() or rr.stdout.strip()
except Exception as e:
    route_ok=False; route_detail=str(e)
add('stage51_legacy_route_migration',route_ok,route_detail+'; Mastery renders previous Progress analytics')
add('stage51_hub_tabs_preserve_content',all(x in main_src for x in ["s51Tabs('practice'","s51Tabs('language'","s51Tabs('library'",'data-ib4050-open']), '4-skill, language, resources and advanced Studio hubs')
add('stage51_new_visual_system', 'assets/css/stage51.css' in main_src and (ROOT/'assets/css/stage51.css').exists() and 'color-scheme:light' in (ROOT/'assets/css/stage51.css').read_text(encoding='utf-8'), 'new responsive light visual system')
add('stage51_game_progression', 's51OriginalGameHub' in main_src and 's51-game-progression' in (ROOT/'assets/css/stage51.css').read_text(encoding='utf-8'), 'existing 10 missions and XP rules retained; level meter added')
# Exercise the new XP meter with a stubbed current player state.
try:
    a=main_src.index('const s51OriginalGameHub=p36GameHub;')
    b=main_src.index('async function s52CheckAppHealth()',a)
    game_patch=main_src[a:b]
    game_test='''function p36GameHub(){return '<div class="p36-achievements">';} function p36Ensure(){return {games:{xp:730,attempts:[{day:5},{day:5}]}};} function day(){return 5;} '''+game_patch+''' process.stdout.write(p36GameHub());'''
    temp=Path('/tmp/stage51_game_runtime.js'); temp.write_text(game_test,encoding='utf-8')
    rr=subprocess.run(['node',str(temp)],capture_output=True,text=True,timeout=15)
    runtime_ok=rr.returncode==0 and 'LEVEL 2' in rr.stdout and '230/500 XP' in rr.stdout and 'Bugungi urinishlar: 2' in rr.stdout
    runtime_detail=rr.stderr.strip() or rr.stdout[:300]
except Exception as e:
    runtime_ok=False; runtime_detail=str(e)
add('stage51_game_xp_runtime_smoke',runtime_ok,runtime_detail)
# Browser install CTA is hidden until install is actually available.
try:
    a=main_src.index('function s51InstallAvailable(){')
    b=main_src.index('function s51Header(){',a)
    helper_src=main_src[a:b]
    test_src="globalThis.Navigator=function Navigator(){}; globalThis.navigator=Object.create(Navigator.prototype); navigator.standalone=false; globalThis.window={navigator:globalThis.navigator}; globalThis.matchMedia=()=>({matches:false}); let p36InstallPrompt=null; "+helper_src+" const noPrompt=s51InstallAvailable(); Navigator.prototype.install=()=>{}; const nativeInstall=s51InstallAvailable(); delete Navigator.prototype.install; p36InstallPrompt={prompt(){}}; const eventPrompt=s51InstallAvailable(); window.navigator.standalone=true; const alreadyInstalled=s51InstallAvailable(); process.stdout.write([noPrompt,nativeInstall,eventPrompt,alreadyInstalled].join('|'));"
    temp=Path('/tmp/stage51_install_gate.js'); temp.write_text(test_src,encoding='utf-8')
    rr=subprocess.run(['node',str(temp)],capture_output=True,text=True,timeout=15)
    install_gate_ok=rr.returncode==0 and rr.stdout.strip()=='false|true|true|false'
    install_gate_detail=rr.stderr.strip() or rr.stdout.strip()
except Exception as e:
    install_gate_ok=False; install_gate_detail=str(e)
add('stage51_install_cta_browser_gated',install_gate_ok,install_gate_detail+' (no prompt=false; navigator.install=true; event=true; installed=false)')
add('stage51_install_button_fallback', 'id=\"s51InstallButton\"' in main_src and 'function s51InstallAvailable()' in main_src and 'install.hidden=!s51InstallAvailable()' in main_src and "navigate('settings');toast('Chrome hozir install prompt bermadi" in main_src and "beforeinstallprompt',()=>{const b=$('#s51InstallButton');if(b && s51InstallAvailable())" in main_src, 'install CTA only when browser prompt/API is available; Settings retains manual Chrome instructions')
add('stage51_offline_audio_bulk_cache', 's51CacheAllAudio' in main_src and 'data-action=\"s51-cache-audio\"' in main_src, 'user-triggered sequential cache of 84 MP3s')
try:
    a=main_src.index('async function s51CacheAllAudio(){')
    b=main_src.index('// A single delegated action handler',a)
    cache_fn=main_src[a:b]
    cache_test="""let calls=0; const stored=new Set(); const status={textContent:''}; const button={disabled:false}; Object.defineProperty(globalThis,'navigator',{value:{serviceWorker:{ready:Promise.resolve(),controller:{}}},configurable:true}); globalThis.document={baseURI:'https://example.test/final-stage-/',querySelector:()=>button}; globalThis.$=()=>status; globalThis.toast=()=>{}; globalThis.caches={open:async()=>({match:async key=>stored.has(String(key))})}; globalThis.window={caches:globalThis.caches}; globalThis.fetch=async path=>{calls++;stored.add(new URL(path,document.baseURI).href);return {ok:true,status:200,arrayBuffer:async()=>new ArrayBuffer(1)}}; """+cache_fn+""" s51CacheAllAudio().then(()=>{if(calls!==84||!status.textContent.includes('84/84')||stored.size!==84)process.exit(2);process.stdout.write('84 requests fetched and cache-verified');}).catch(e=>{process.stderr.write(String(e));process.exit(3)});"""
    temp=Path('/tmp/stage51_audio_cache_runtime.js'); temp.write_text(cache_test,encoding='utf-8')
    rr=subprocess.run(['node',str(temp)],capture_output=True,text=True,timeout=20)
    cache_ok=rr.returncode==0 and '84 requests fetched and cache-verified' in rr.stdout
    cache_detail=rr.stderr.strip() or rr.stdout[:300]
except Exception as e:
    cache_ok=False; cache_detail=str(e)
add('stage52_offline_audio_cache_verified_runtime_smoke',cache_ok,cache_detail)
add('stage51_project_scope_paths', all(x in main_src for x in ['./manifest.webmanifest','./sw.js']) and 'final-stage-' in (ROOT/'docs'/'BUILD_PROVENANCE.json').read_text(encoding='utf-8'), 'project-relative PWA paths for /final-stage-/')

# Required Stage 40-50 feature hooks in extension.
feature_src=js.read_text(encoding='utf-8')
features=['openAudioDB','MediaRecorder','audioClipsMarkup','calculateScore','adaptiveRecommendations','resourcesView','task1View','vocabularyView','privacyView','releaseView','backupExport','clearAudioDB','release-recheck']
missing_features=[x for x in features if x not in feature_src]
add('stage4050_feature_hooks',not missing_features,missing_features or f'{len(features)} named feature hooks')
add('resource_skill_filter_case_insensitive',"norm(r.skill)===norm(skill)" in feature_src,'case-normalized skill filter')
add('dialog_focus_management','lastFocusedElement' in feature_src and "e.key==='Tab'" in feature_src,'focus restoration and Tab trap')
add('reduced_motion_and_focus_css','prefers-reduced-motion:reduce' in css.read_text() and ':focus-visible' in css.read_text(),'reduced motion and keyboard focus states')

# Standalone companion embeds data, CSS and module JS.
stand=BeautifulSoup(standalone.read_text(encoding='utf-8',errors='replace'),'html.parser')
stand_data=stand.find('script',id='ib4050-embedded-data')
stand_js=stand.find('script',id='stage40-50-inline-js')
stand_css=stand.find('style',id='stage40-50-inline-css')
try:
    pack=json.loads(stand_data.string or stand_data.text)
    data_embedded=(len(pack.get('skills',[]))==336 and len(pack.get('listening',[]))==84 and len(pack.get('task1',[]))==84)
except Exception as e:
    data_embedded=False; pack_err=str(e)
add('standalone_embedded_data',data_embedded,'336 skills + 84 listening + 84 Task1')
add('standalone_inline_css_js',bool(stand_css and stand_js) and len(stand_js.string or stand_js.text)>60000 and len(stand_css.string or stand_css.text)>12000,'embedded Final Studio CSS + JS')
if stand_js:
    ok,detail=node_check(stand_js.string or stand_js.text,'standalone_stage4050')
else: ok,detail=False,'missing inline module'
add('standalone_module_js_syntax',ok,detail)
stand_inline=[]
for i,tag in enumerate(stand.find_all('script')):
    if tag.get('src') or tag.get('type') in ('application/json','application/ld+json'): continue
    txt=tag.string or tag.text or ''
    if txt.strip(): stand_inline.append((i,txt))
stand_inline_checks=[]
for i,txt in stand_inline:
    ok,detail=node_check(txt,f'standalone_inline_{i}')
    stand_inline_checks.append((i,ok,detail))
add('standalone_main_inline_js_syntax',all(x[1] for x in stand_inline_checks),stand_inline_checks)
# Standalone is intended to be used with audio/ folder for MP3 playback, not as a fully self-contained media archive.
add('standalone_title_present',bool(stand.title and 'Final Stage 52' in stand.title.text),stand.title.text if stand.title else 'missing title')

# Stage map/limitations and target instructions must be explicit.
readme=(ROOT/'README_UZ.md').read_text(encoding='utf-8')
add('final_stage_deploy_instructions','final-stage-' in readme and 'main' in readme and 'root' in readme,'final-stage- repository root upload guidance')
add('limitations_disclosed',('Stage 40 original ZIP' in readme or 'Stage 40 original' in readme or 'original Stage 40' in readme) and 'kafolatlamaydi' in readme,'source/score limitations disclosure')

# Final Stage 52.0 hardening checks.
add('stage52_manifest_release_name',manifest.get('name')=='IELTS Boost — Final Stage 52',manifest.get('name'))
sw_text=sw.read_text(encoding='utf-8')
add('stage52_service_worker_cache_version','ielts-boost-final-stage-52-shell-v1' in sw_text and '52.0.0-final-stage' in sw_text and 'ielts-boost-final-stage-audio' in sw_text,'new shell cache; separate audio cache identity retained')
add('stage52_pwa_diagnostics_ui','data-action=\"s52-check-app\"' in main_src and 'function s52CheckAppHealth()' in main_src and 's52HealthStatus' in main_src,'PWA/Chrome health diagnostic is wired into settings')
add('stage52_offline_cache_verifies_storage','await audioCache.match(key)' in main_src and 'CacheStorage’da tasdiqlanmadi' in main_src,'offline claim requires a real CacheStorage match')
add('stage52_chrome_menu_guidance','Install and create shortcut' in main_src,'current Android Chrome Help menu wording')
standalone_text=standalone.read_text(encoding='utf-8',errors='ignore')
add('stage52_standalone_has_diagnostics','s52CheckAppHealth' in standalone_text and 'stage52-diagnostics-css' in standalone_text,'standalone includes PWA diagnostics and its styles')
add('stage52_main_release_title','Final Stage 52' in soup.title.text, soup.title.text if soup.title else 'missing title')

passed=sum(x['pass'] for x in checks); total=len(checks)
report={'release':'52.0.0-final-stage','passed':passed,'total':total,'failures':[x for x in checks if not x['pass']],'checks':checks,'limitations':['Browser UI automation is blocked in this environment (ERR_BLOCKED_BY_ADMINISTRATOR); no UI end-to-end PASS is claimed.','Real Android microphone / ASR / PWA install and production hosted offline behavior require a physical-device test.','Exact original Stage 40 source archive and all historical 41–50 patch commits are not available; final is an enhanced reconstruction from preserved baseline and records.','IELTS practice score is not an official IELTS band; 8–9 is not guaranteed.']}
(ROOT/'docs').mkdir(exist_ok=True)
(ROOT/'docs'/'STATIC_QA_52_0.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
sys.exit(0 if passed==total else 2)
