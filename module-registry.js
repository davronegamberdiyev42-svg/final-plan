/* IELTS Boost Stage 57 · final release dependency registry */
(function (global) {
  'use strict';
  const records = new Map();
  const allowed = new Set(['registered', 'loading', 'ready', 'failed', 'skipped']);
  function registerModule(spec) {
    if (!spec || typeof spec.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(spec.id)) {
      throw new TypeError('Module id must be kebab-case.');
    }
    if (records.has(spec.id)) throw new Error('Duplicate module: ' + spec.id);
    const deps = Array.isArray(spec.dependencies) ? spec.dependencies.slice() : [];
    records.set(spec.id, {
      id: spec.id,
      version: String(spec.version || '1.0.0'),
      description: String(spec.description || ''),
      dependencies: deps,
      status: 'registered',
      startedAt: null,
      finishedAt: null,
      error: null
    });
    return records.get(spec.id);
  }
  function setModuleStatus(id, status, error) {
    const row = records.get(id);
    if (!row) throw new Error('Unknown module: ' + id);
    if (!allowed.has(status)) throw new TypeError('Invalid module status: ' + status);
    row.status = status;
    if (status === 'loading') row.startedAt = new Date().toISOString();
    if (['ready', 'failed', 'skipped'].includes(status)) row.finishedAt = new Date().toISOString();
    row.error = error ? String(error.message || error).slice(0, 500) : null;
    return row;
  }
  function getModule(id) {
    const row = records.get(id);
    return row ? Object.freeze({ ...row, dependencies: row.dependencies.slice() }) : null;
  }
  function report() {
    return Object.freeze(Array.from(records.values(), row => Object.freeze({ ...row, dependencies: row.dependencies.slice() })));
  }
  function assertDependencies(id) {
    const row = records.get(id);
    if (!row) throw new Error('Unknown module: ' + id);
    const missing = row.dependencies.filter(dep => !records.has(dep) || records.get(dep).status !== 'ready');
    if (missing.length) throw new Error('Dependencies not ready for ' + id + ': ' + missing.join(', '));
    return true;
  }
  global.IELTSBoostArchitecture = Object.freeze({
    release: '57.0.0',
    contractVersion: '1.0.0',
    registerModule,
    setModuleStatus,
    getModule,
    report,
    assertDependencies
  });
})(window);
