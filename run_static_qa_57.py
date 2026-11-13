#!/usr/bin/env python3
"""Stage 57 static acceptance: demand-loaded vocabulary, accessibility and preservation."""
from pathlib import Path
from bs4 import BeautifulSoup
import hashlib,json,subprocess,sys,collections,re
ROOT=Path(__file__).resolve().parents[1]
checks=[]
def add(name,ok,detail=''):
    checks.append({'name':name,'pass':bool(ok),'detail':str(detail)[:800]})
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def node_check(path):
    r=subprocess.run(['node','--check',str(path)],capture_output=True,text=True,timeout=40)
    return r.returncode==0,(r.stderr or 'node --check PASS').strip()[:600]
# HTML shell and accessible entry.
index=ROOT/'index.html'; html=index.read_text(encoding='utf-8'); soup=BeautifulSoup(html,'html.parser')
add('small_entry_shell',index.stat().st_size<10000,index.stat().st_size)
add('stage57_title',bool(soup.title and 'Stage 57' in soup.title.text),soup.title.text if soup.title else 'missing')
add('skip_link_present',bool(soup.select_one('a.s56-skip-link[href="#app"]')),'skip-to-main link')
add('main_landmark_focusable',bool(soup.select_one('main#app[tabindex="-1"]')),'main has keyboard focus target')
add('no_inline_styles',len(soup.find_all('style'))==0,len(soup.find_all('style')))
add('no_inline_runtime',not any((x.string or x.text or '').strip() for x in soup.find_all('script') if not x.get('src')),'external scripts only')
css_order=[x.get('href') for x in soup.find_all('link',rel='stylesheet')]
add('css_cascade_order',css_order==['./assets/css/app-core.css','./assets/css/stage40-50.css','./assets/css/stage51.css','./assets/css/stage56.css'],css_order)
script_src=[x.get('src') for x in soup.find_all('script')]
required=['./assets/js/core/contract.js','./assets/js/core/module-registry.js','./assets/js/core/boot.js']
add('boot_script_order',all(x in script_src for x in required) and [script_src.index(x) for x in required]==sorted(script_src.index(x) for x in required),script_src)
# Data contracts: only daily core words are in the first payload; full 19K index is a separate optional asset.
contract_js=(ROOT/'assets/js/core/contract.js').read_text(encoding='utf-8')
contract_match=re.search(r"dataSha256:\s*'([0-9a-f]{64})'.*?vocabularySha256:\s*'([0-9a-f]{64})'",contract_js,re.S)
app_path=ROOT/'data/app-data.json'; app_raw=app_path.read_bytes(); app=json.loads(app_raw)
vocab_path=ROOT/'data/vocabulary-index.json'; vocab_raw=vocab_path.read_bytes(); vocab=json.loads(vocab_raw)
add('contract_contains_both_hashes',bool(contract_match),contract_match.groups() if contract_match else '')
if contract_match:
    add('app_data_sha256',sha(app_path)==contract_match.group(1),sha(app_path))
    add('vocabulary_sha256',sha(vocab_path)==contract_match.group(2),sha(vocab_path))
else:
    add('app_data_sha256',False,'missing app-data hash');add('vocabulary_sha256',False,'missing vocab hash')
add('bootstrap_payload_60pct_smaller',len(app_raw)<6100000,len(app_raw))
add('core_daily_words_672',len(app.get('words',[]))==672,len(app.get('words',[])))
add('full_vocab_schema_19k',vocab.get('schemaVersion')==1 and vocab.get('wordCount')==19000 and isinstance(vocab.get('words'),list) and len(vocab.get('words'))==19000,{k:vocab.get(k) for k in ['schemaVersion','wordCount']})
words=vocab.get('words',[]); ids=[w.get('id') for w in words]
add('full_vocab_ids_unique_and_complete',len(set(ids))==19000 and set(ids)==set(range(1,19001)),f'unique={len(set(ids))}; min={min(ids) if ids else None}; max={max(ids) if ids else None}')
core_ids={w.get('id') for w in app.get('words',[])}
daily_ids={wid for row in app.get('vocabularyExpert',{}).get('daily_sets',[]) for wid in row.get('word_ids',[])}
add('daily_core_has_84_sets',len(app.get('vocabularyExpert',{}).get('daily_sets',[]))==84,len(app.get('vocabularyExpert',{}).get('daily_sets',[])))
add('daily_word_ids_672',len(daily_ids)==672,len(daily_ids))
add('core_words_match_daily_sets',core_ids==daily_ids,f'core={len(core_ids)}; daily={len(daily_ids)}')
add('all_core_ids_in_full_index',core_ids<=set(ids),len(core_ids-set(ids)))
plan=app.get('plan',{}).get('days',[]); core=app.get('core',{}).get('days',[])
add('plan_days_84',len(plan)==84,len(plan));add('core_days_84',len(core)==84,len(core))
add('four_skills_each_day',all({'reading','listening','writing','speaking'}<=set(x) for x in core),'84 × 4')
reading=sum(len(x.get('reading',{}).get('questions',[])) for x in core)
listening=sum(len(x.get('listening',{}).get('questions',[])) for x in core)
add('reading_questions_840',reading==840,reading);add('listening_questions_420',listening==420,listening)
add('patterns_864',len(app.get('patterns',[]))==864,len(app.get('patterns',[])))
add('articles_61',len(app.get('library',{}).get('articles',[]))==61,len(app.get('library',{}).get('articles',[])))
resources=json.loads((ROOT/'data/stage47-skill-resources.json').read_text(encoding='utf-8'))
companions=json.loads((ROOT/'data/stage47-listening-companions.json').read_text(encoding='utf-8'))
task1=json.loads((ROOT/'data/stage47-task1-datasets.json').read_text(encoding='utf-8'))
add('skill_resources_336',len(resources)==336,len(resources));add('listening_companions_84',len(companions)==84,len(companions));add('task1_datasets_84',len(task1)==84,len(task1))
audio=sorted((ROOT/'audio').glob('listening-day-*.mp3'))
add('audio_84_files',len(audio)==84,len(audio))
add('audio_days_contiguous',all((ROOT/'audio'/f'listening-day-{i:02d}.mp3').is_file() for i in range(1,85)),'01–84')
# Runtime module boundaries, lazy load policy and version alignment.
boot=(ROOT/'assets/js/core/boot.js').read_text(encoding='utf-8')
registry=(ROOT/'assets/js/core/module-registry.js').read_text(encoding='utf-8')
core_js=(ROOT/'assets/js/compat/legacy-core.js').read_text(encoding='utf-8')
add('boot_checks_672_core_words','dailyCoreWords' in boot and 'app.words.length === CONTRACT.requiredCurriculum.dailyCoreWords' in boot,'boot schema accepts core subset only')
add('boot_registers_lazy_vocabulary_module',"id:'vocabulary-index'" in boot and "dependencies:['legacy-core']" in boot,'optional module registered but not eager-loaded')
add('legacy_runtime_has_lazy_loader','s56EnsureFullVocabulary' in core_js and 'vocabulary-index.json' in core_js and 'S56_FULL_VOCABULARY_LOADED' in core_js,'full index fetched on Vocabulary Lab entry')
add('lazy_loader_checks_hash_and_schema','crypto.subtle.digest' in core_js and 'schemaVersion!==1' in core_js and 'wordCount!==S56_VOCABULARY_WORD_COUNT' in core_js,'integrity, schema, count, uniqueness, core-ID checks')
add('lazy_loader_does_not_drop_core_words','VX_SETS' in core_js and 'DATA.words' in core_js and 'S56_FULL_VOCABULARY_LOADED=true' in core_js,'core daily arrays initialized first, upgraded after external load')
add('vocabulary_games_gated','data-start-game' in core_js and 'vocab-recall' in core_js and "dataset.p33Module==='vocabulary'" in core_js,'vocabulary-only game waits for full index')
add('search_debounced','110' in core_js and '__s56VocabSearchTimer' in core_js and '__s56P36VocabSearchTimer' in core_js,'both large-index fields debounced')
add('search_normalization_cached','S56_VX_NORMAL_CACHE' in core_js and 'S56_P36_NORMAL_CACHE' in core_js,'bounded normalisation caches')
add('accessibility_enhancement','s56EnhanceAccessibility' in core_js and "setAttribute('aria-label'" in core_js and "aria-current','page'" in core_js,'dynamic control names and current navigation')
add('boot_ready_is_stage57',"release:'57.0.0'" in boot and 'vocabularyIndex' in boot,'build identity')
add('module_registry_is_stage57',"release: '57.0.0'" in registry,'module registry identity')
# Syntax checks over all runtime files.
for rel in ['assets/js/core/contract.js','assets/js/core/module-registry.js','assets/js/core/boot.js','assets/js/compat/legacy-core.js','assets/js/modules/backup-manager.js','assets/js/modules/advanced-studio.js','assets/js/stage40-50.js','sw.js']:
    ok,detail=node_check(ROOT/rel);add('syntax_'+rel,ok,detail)
# PWA: don't preload the large vocabulary index; fetch it only after user demand.
sw=(ROOT/'sw.js').read_text(encoding='utf-8')
add('sw_cache_bumped_to_57','ielts-boost-final-plan-57-shell-v1' in sw and '57.0.0-final-release' in sw,'new release cache identity')
add('sw_optional_vocabulary_cache','VOCAB_CACHE' in sw and "url.pathname.endsWith('/data/vocabulary-index.json')" in sw and 'cache.put(request, response.clone())' in sw,'optional index cached on demand')
add('sw_vocabulary_not_precached',"'./data/vocabulary-index.json'" not in sw.split('self.addEventListener(\'install\'')[0], 'large index excluded from install precache')
add('sw_preserves_audio_cache','ielts-boost-final-stage-audio' in sw and 'audioResponse' in sw,'existing MP3 cache path preserved')
add('sw_preserves_existing_audio_cache_on_activate','[SHELL_CACHE, AUDIO_CACHE, VOCAB_CACHE].includes(key)' in sw,'audio/vocabulary caches are not deleted on activation')
# Styles and responsive/accessibility policy.
css=(ROOT/'assets/css/stage56.css').read_text(encoding='utf-8')
for name,needle in [('skip link','s56-skip-link'),('focus visible',':focus-visible'),('reduced motion','prefers-reduced-motion:reduce'),('forced colors','forced-colors:active'),('mobile breakpoint','max-width:760px'),('small phone breakpoint','max-width:390px')]:
    add('css_'+name,needle in css,needle)
add('manifest_stage57','Stage 57' in json.loads((ROOT/'manifest.webmanifest').read_text(encoding='utf-8')).get('name',''),json.loads((ROOT/'manifest.webmanifest').read_text(encoding='utf-8')).get('name'))
# Final-stage repository + deploy diagnostics acceptance.
readme=(ROOT/'README_UZ.md').read_text(encoding='utf-8')
install=(ROOT/'INSTALL_FINAL_STAGE_UZ.md').read_text(encoding='utf-8')
manifest=json.loads((ROOT/'manifest.webmanifest').read_text(encoding='utf-8'))
add('target_repository_final_plan', 'final-plan' in readme and 'final-plan' in install and '/final-plan/' in readme, 'explicit repository/path contract')
add('manifest_relative_pages_scope', manifest.get('id')=='./' and manifest.get('start_url')=='./' and manifest.get('scope')=='./', {k:manifest.get(k) for k in ['id','start_url','scope']})
add('index_resource_paths_project_relative', not bool(re.search(r'(?:src|href)=[\"\']/|(?:fetch|register)\([\"\']/ ',html)), 'entry document uses project-relative paths')
add('release_check_page_present',(ROOT/'release-check.html').is_file() and (ROOT/'assets/js/release-check.js').is_file() and (ROOT/'assets/css/release-check.css').is_file(),'production preflight page + script + stylesheet')
add('release_check_page_targets_final_plan', '/final-plan/' in (ROOT/'release-check.html').read_text(encoding='utf-8') and 'FINAL-PLAN REPOSITORY' in (ROOT/'release-check.html').read_text(encoding='utf-8'), 'visible preflight page uses final-plan path')
add('release_check_in_sw_shell', all(x in sw for x in ['./release-check.html','./assets/js/release-check.js','./assets/css/release-check.css']), 'offline-available diagnostic helper')
add('release_check_logic_syntax',node_check(ROOT/'assets/js/release-check.js')[0],node_check(ROOT/'assets/js/release-check.js')[1])
add('sw_preserves_stage56_vocabulary_cache',"ielts-boost-final-stage-56-vocabulary-v1" in sw and 'VOCAB_CACHE' in sw, 'keep existing verified 19K vocabulary cache across Stage 57 upgrade')
add('diagnostics_validates_final_plan_target', "repoBase.endsWith('/final-plan/')" in (ROOT/'assets/js/release-check.js').read_text(encoding='utf-8'), 'preflight checks /final-plan/ URL')
# Preservation: standalone fallback is byte-identical to Stage 52; Backup Manager and Stage 54 modules retained.
expected_standalone_sha=json.loads((ROOT/'docs/BUILD_PROVENANCE_57_0.json').read_text(encoding='utf-8')).get('asset_sha256',{}).get('standalone_html_legacy_fallback')
add('standalone_legacy_fallback_sha256',bool(expected_standalone_sha) and sha(ROOT/'standalone.html')==expected_standalone_sha,sha(ROOT/'standalone.html'))
add('stage55_backup_manager_preserved',(ROOT/'assets/js/modules/backup-manager.js').is_file() and 'IELTSBoost.FullDeviceBackup' in (ROOT/'assets/js/modules/backup-manager.js').read_text(encoding='utf-8'),'Stage 55 full-device backup still present')
add('stage54_compatibility_api_preserved','window.__IELTS_BOOST_CORE__' in core_js and "contractVersion: '1.0.0'" in core_js,'stable legacy facade')
# Emit result.
passed=sum(x['pass'] for x in checks);failed=len(checks)-passed
report={'release':'57.0.0-final-release','passed':passed,'failed':failed,'total':len(checks),'checks':checks,'notes':['Static QA only; browser and public hosting checks are separate.','Android physical-device acceptance is not inferred from Chromium.','standalone.html is intentionally retained as a Stage 52 fallback.']}
(ROOT/'docs/STATIC_QA_57_0.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
sys.exit(1 if failed else 0)
