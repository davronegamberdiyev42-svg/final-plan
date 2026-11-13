#!/usr/bin/env python3
"""Stage 55 architecture/data/storage-recovery QA. Not a substitute for device E2E."""
from pathlib import Path
from bs4 import BeautifulSoup
import hashlib, json, re, subprocess, sys, collections
ROOT=Path(__file__).resolve().parents[1]
checks=[]
def add(name, ok, detail=''):
    checks.append({'name':name,'pass':bool(ok),'detail':str(detail)[:600]})
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def node_check(path):
    r=subprocess.run(['node','--check',str(path)],capture_output=True,text=True,timeout=30)
    return r.returncode==0,(r.stderr or 'node --check PASS').strip()[:500]

# Current entry shell: small, no embedded application payload or application runtime.
index=ROOT/'index.html'; html=index.read_text(encoding='utf-8')
soup=BeautifulSoup(html,'html.parser')
add('entry_shell_under_10kb',index.stat().st_size<10_000,index.stat().st_size)
add('no_inline_app_data',soup.find('script',id='appData') is None,'app-data is externalized')
add('no_inline_runtime',not any((x.string or x.text or '').strip() for x in soup.find_all('script') if not x.get('src')),'all executable scripts are external')
add('no_inline_css',len(soup.find_all('style'))==0,'all styles externalized')
required_scripts=['./assets/js/core/contract.js','./assets/js/core/module-registry.js','./assets/js/core/boot.js']
script_src=[x.get('src') for x in soup.find_all('script')]
add('boot_script_order',all(x in script_src for x in required_scripts) and script_src.index(required_scripts[0])<script_src.index(required_scripts[1])<script_src.index(required_scripts[2]),script_src)
css_order=[x.get('href') for x in soup.find_all('link',rel='stylesheet')]
add('css_cascade_order',css_order==['./assets/css/app-core.css','./assets/css/stage40-50.css','./assets/css/stage51.css'],css_order)
add('title_stage55','Stage 55' in (soup.title.text if soup.title else ''),soup.title.text if soup.title else 'missing')

# External app data hash/schema and content coverage.
data_path=ROOT/'data/app-data.json'; raw=data_path.read_bytes(); app=json.loads(raw)
contract=json.loads((ROOT/'docs/ARCHITECTURE_CONTRACT_54.json').read_text(encoding='utf-8'))
actual_sha=hashlib.sha256(raw).hexdigest()
add('app_data_sha256_matches_contract',actual_sha==contract['data']['sha256'],actual_sha)
add('app_data_byte_count',len(raw)==contract['data']['bytes'],len(raw))
plan=app.get('plan',{}).get('days',[]); core=app.get('core',{}).get('days',[]); words=app.get('words',[])
add('plan_84_days',len(plan)==84,len(plan)); add('core_84_days',len(core)==84,len(core))
add('four_skills_each_day',len(core)==84 and all({'reading','listening','writing','speaking'}<=set(x) for x in core),'84 × four skills')
reading=sum(len(x.get('reading',{}).get('questions',[])) for x in core)
listening=sum(len(x.get('listening',{}).get('questions',[])) for x in core)
add('reading_840',reading==840,reading); add('listening_420',listening==420,listening)
add('vocabulary_19000',len(words)==19000,len(words))
add('patterns_864',len(app.get('patterns',[]))==864,len(app.get('patterns',[])))
add('articles_61',len(app.get('library',{}).get('articles',[]))==61,len(app.get('library',{}).get('articles',[])))

# Linked data and media are unchanged coverage requirements.
skills=json.loads((ROOT/'data/stage47-skill-resources.json').read_text(encoding='utf-8'))
companions=json.loads((ROOT/'data/stage47-listening-companions.json').read_text(encoding='utf-8'))
task1=json.loads((ROOT/'data/stage47-task1-datasets.json').read_text(encoding='utf-8'))
add('skill_resources_336',len(skills)==336,len(skills)); add('listening_companions_84',len(companions)==84,len(companions)); add('task1_datasets_84',len(task1)==84,len(task1))
audio=sorted((ROOT/'audio').glob('listening-day-*.mp3'))
add('audio_84_files',len(audio)==84,len(audio))
missing=[i for i in range(1,85) if not (ROOT/'audio'/f'listening-day-{i:02d}.mp3').exists()]
add('audio_days_01_84_no_gaps',not missing,missing)

# Code/module contracts and dependency order.
paths=['assets/js/core/contract.js','assets/js/core/module-registry.js','assets/js/core/boot.js','assets/js/compat/legacy-core.js','assets/js/modules/backup-manager.js','assets/js/modules/advanced-studio.js','assets/js/stage40-50.js','sw.js']
for rel in paths:
    p=ROOT/rel
    add('exists_'+rel,p.is_file(),p.stat().st_size if p.exists() else 'missing')
    if p.exists():
        ok,detail=node_check(p); add('syntax_'+rel,ok,detail)
core_js=(ROOT/'assets/js/compat/legacy-core.js').read_text(encoding='utf-8')
add('core_readonly_api_export','window.__IELTS_BOOST_CORE__' in core_js and "contractVersion: '1.0.0'" in core_js,'stable public methods + metadata snapshot')
add('core_has_main_storage_key',"const STORAGE='ielts-boost-rebuilt-1.0'" in core_js,'main namespace unchanged')
add('core_has_legacy_migration_key',"const LEGACY_STORAGE='ielts-boost-state-v1'" in core_js,'legacy namespace unchanged')
boot_js=(ROOT/'assets/js/core/boot.js').read_text(encoding='utf-8')
add('boot_sha256_and_schema_guard','crypto.subtle.digest' in boot_js and 'APP_DATA_SHA256' in boot_js and 'app.words.length === CONTRACT.requiredCurriculum.vocabularyIndex' in boot_js,'integrity and schema guards')
add('boot_load_sequence',boot_js.index('loadAppData()')<boot_js.index("loadScript('./assets/js/compat/legacy-core.js')")<boot_js.index("loadScript('./assets/js/modules/backup-manager.js')")<boot_js.index("loadScript('./assets/js/modules/advanced-studio.js')"),'data → core → backup manager → advanced studio')

# Stage 52 core assets: data resources/audio and standalone preserved byte-for-byte.
base=Path('/mnt/data/stage54_work/base')
add('standalone_byte_identical_to_stage52',sha(ROOT/'standalone.html')==sha(base/'standalone.html'),sha(ROOT/'standalone.html'))
add('84_mp3_byte_identical_to_stage52',all(sha(ROOT/'audio'/p.name)==sha(base/'audio'/p.name) for p in audio),'all 84 MP3 hashes match Stage 52')
for rel in ['data/stage47-skill-resources.json','data/stage47-listening-companions.json','data/stage47-task1-datasets.json','data/stage48-vocabulary-coverage.json','assets/css/stage40-50.css','assets/css/stage51.css']:
    add('unchanged_'+rel,sha(ROOT/rel)==sha(base/rel),sha(ROOT/rel))
add('advanced_studio_exposes_readonly_backup_snapshot','__IELTS_BOOST_ADVANCED_STUDIO__' in (ROOT/'assets/js/modules/advanced-studio.js').read_text(encoding='utf-8'),'read-only snapshot API for volatile in-memory state')
backup_js=(ROOT/'assets/js/modules/backup-manager.js').read_text(encoding='utf-8')
add('backup_manager_declares_full_device_format',"IELTSBoost.FullDeviceBackup" in backup_js and 'schemaVersion:VERSION' in backup_js,'versioned unified envelope')
add('backup_manager_captures_both_audio_databases','IELTSBoostMedia' in backup_js and 'IELTSBoostPlanA_Audio_v1' in backup_js and 'base64ToBlob' in backup_js,'dual IndexedDB media capture and restore')
add('backup_manager_validates_before_write',backup_js.index('decodeAndValidate(obj)')<backup_js.index('writeDb(DBS.main, prepared.decoded.main)'),'preflight validation before storage mutation')
add('backup_controls_present_in_both_ui','data-ib55-export' in core_js and 'data-ib55-import' in core_js and 'data-ib55-export' in (ROOT/'assets/js/modules/advanced-studio.js').read_text(encoding='utf-8'),'main Settings + Advanced Studio')
add('backup_manager_has_all_namespaces','ielts-boost-rebuilt-1.0' in backup_js and 'ielts-boost-state-v1' in backup_js and 'IELTSBoost_PlanA_Stage4050_v1' in backup_js,'3 local state namespaces')

# CSS extracted from exact original Stage 52 inline blocks in the same order.
orig=BeautifulSoup((base/'index.html').read_text(encoding='utf-8'),'html.parser')
orig_css='\n\n/* --- Stage 54 preserved inline style block boundary --- */\n\n'.join((x.string or x.text or '') for x in orig.find_all('style'))
new_css=(ROOT/'assets/css/app-core.css').read_text(encoding='utf-8')
add('six_inline_css_blocks_preserved',new_css.startswith(orig_css),f'original={len(orig_css)} chars; new={len(new_css)} chars')

# SW cache scope and data/module precache; keep existing audio cache for previously stored MP3.
sw=(ROOT/'sw.js').read_text(encoding='utf-8')
required_cache=['./assets/css/app-core.css','./assets/js/core/contract.js','./assets/js/core/module-registry.js','./assets/js/core/boot.js','./assets/js/compat/legacy-core.js','./assets/js/modules/backup-manager.js','./assets/js/modules/advanced-studio.js','./data/app-data.json']
add('sw_precaches_new_architecture',all(x in sw for x in required_cache),required_cache)
add('sw_shell_cache_bumped','ielts-boost-final-stage-55-shell-v1' in sw,'Stage 55 cache namespace')
add('sw_audio_cache_preserved',"const AUDIO_CACHE = 'ielts-boost-final-stage-audio'" in sw,'preserve pre-existing Listening MP3 cache')
add('sw_audio_not_bulk_precached','./audio/listening-day-01.mp3' not in sw,'84 MP3 remain user-cached on demand')
manifest=json.loads((ROOT/'manifest.webmanifest').read_text(encoding='utf-8'))
add('manifest_relative_scope',manifest.get('scope')=='./' and str(manifest.get('start_url','')).startswith('./'),{k:manifest.get(k) for k in ['start_url','scope']})

# Report result.
passed=sum(x['pass'] for x in checks); failed=len(checks)-passed
out={'release':'55.0.0-data-recovery','passed':passed,'failed':failed,'total':len(checks),'checks':checks,'limitations':['Browser/device and public deployment acceptance are separate tests.','Legacy core remains an explicit compatibility kernel; its internal feature functions are not yet fully split by domain.']}
(ROOT/'docs/STATIC_QA_55_0.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
sys.exit(1 if failed else 0)
