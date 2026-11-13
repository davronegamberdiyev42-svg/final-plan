#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const checks = [];
function test(id, fn) {
  try { fn(); checks.push({id, pass:true}); }
  catch (error) { checks.push({id, pass:false, error:String(error.message || error)}); }
}
const window = {};
const context = vm.createContext({window, Object, Map, Set, Date, TypeError, Error, String, Array});
vm.runInContext(fs.readFileSync(path.join(ROOT,'assets/js/core/contract.js'),'utf8'), context, {filename:'contract.js'});
vm.runInContext(fs.readFileSync(path.join(ROOT,'assets/js/core/module-registry.js'),'utf8'), context, {filename:'module-registry.js'});
const contract = window.IELTSBoostContract;
const architecture = window.IELTSBoostArchitecture;
test('contract-release-and-version',()=>{
  assert.equal(contract.release,'54.0.0-modular');
  assert.equal(contract.version,'1.0.0');
  assert.equal(architecture.contractVersion,'1.0.0');
});
test('storage-namespace-non-destructive',()=>{
  assert.equal(contract.storage.main,'ielts-boost-rebuilt-1.0');
  assert.equal(contract.storage.mainLegacy,'ielts-boost-state-v1');
  assert.equal(contract.storage.advancedStudio,'IELTSBoost_PlanA_Stage4050_v1');
  assert.equal(contract.storage.mainAudio,'IELTSBoostMedia');
  assert.equal(contract.storage.studioAudio,'IELTSBoostPlanA_Audio_v1');
});
test('content-coverage-contract',()=>{
  assert.equal(contract.requiredCurriculum.days,84);
  assert.equal(contract.requiredCurriculum.readingQuestions,840);
  assert.equal(contract.requiredCurriculum.listeningQuestions,420);
  assert.equal(contract.requiredCurriculum.vocabularyIndex,19000);
  assert.equal(contract.requiredCurriculum.patterns,864);
  assert.equal(contract.requiredCurriculum.articles,61);
});
test('module-register-and-ready-dependencies',()=>{
  architecture.registerModule({id:'app-data',version:'54.0.0'});
  architecture.registerModule({id:'legacy-core',version:'52-compat',dependencies:['app-data']});
  assert.throws(()=>architecture.assertDependencies('legacy-core'),/not ready/i);
  architecture.setModuleStatus('app-data','loading');
  architecture.setModuleStatus('app-data','ready');
  assert.equal(architecture.assertDependencies('legacy-core'),true);
  architecture.setModuleStatus('legacy-core','ready');
  assert.equal(architecture.getModule('legacy-core').status,'ready');
});
test('duplicate-module-rejected',()=>{
  assert.throws(()=>architecture.registerModule({id:'app-data'}),/duplicate/i);
});
test('invalid-module-identifiers-and-status-rejected',()=>{
  assert.throws(()=>architecture.registerModule({id:'Not Valid'}),/kebab-case/i);
  assert.throws(()=>architecture.setModuleStatus('legacy-core','unknown'),/invalid module status/i);
});
test('registry-snapshot-is-immutable',()=>{
  const row = architecture.getModule('legacy-core');
  assert.equal(Object.isFrozen(row),true);
  assert.equal(Object.isFrozen(architecture.report()),true);
  row.dependencies.push('mutated');
  assert.deepEqual(Array.from(architecture.getModule('legacy-core').dependencies),['app-data']);
});
test('module-failure-is-reported',()=>{
  architecture.setModuleStatus('legacy-core','failed',new Error('fixture failure'));
  const row=architecture.getModule('legacy-core');
  assert.equal(row.status,'failed');
  assert.match(row.error,/fixture failure/);
});
const passed=checks.filter(x=>x.pass).length;
const out={release:'54.0.0-modular',passed,failed:checks.length-passed,total:checks.length,checks};
const outPath=path.join(ROOT,'docs/ARCHITECTURE_CONTRACT_TESTS_54_0.json');
fs.writeFileSync(outPath,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
if(passed!==checks.length)process.exit(1);
