// Exercise the actual production assignment, not a replacement mock gtag.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source = await fs.readFile('src/lib/analytics.ts', 'utf8');
const ast = ts.createSourceFile('analytics.ts', source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS);
const assignments = [];
function visit(node) {
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && node.left.getText(ast) === 'window.gtag') assignments.push(node.getText(ast));
  ts.forEachChild(node, visit);
}
visit(ast);
assert.equal(assignments.length, 1, 'One production Google command-queue assignment is required');
const compiled = ts.transpileModule(assignments[0] + ';', {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
}).outputText;
const existing = { event: 'existing-data-layer-entry' };
const window = { dataLayer: [existing] };
vm.runInNewContext(compiled, { window });
const parameters = { send_to: 'G-QUEUE0001', page_location: 'https://example.test/' };
const commands = [
  ['consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }],
  ['js', new Date(0)], ['config', 'G-QUEUE0001', { send_page_view: false }],
  ['event', 'page_view', parameters], ['event', 'floor_plan_click', parameters],
];
for (const command of commands) window.gtag(...command);
assert.equal(window.dataLayer[0], existing, 'Never replace the existing data layer');
for (const [index, expected] of commands.entries()) {
  const queued = window.dataLayer[index + 1];
  assert.equal(Object.prototype.toString.call(queued), '[object Arguments]', 'gtag.js requires native Arguments command objects');
  assert.equal(Array.isArray(queued), false, 'A rest-parameter Array is not a gtag.js command');
  assert.deepEqual(Array.from(queued), expected);
  assert.equal(queued.length, expected.length);
}
assert.equal(window.dataLayer[4][2], parameters, 'Preserve the sanitized payload object');
const installed = window.gtag;
vm.runInNewContext(compiled, { window });
assert.equal(window.gtag, installed, 'Initialization must retain an existing Google command wrapper');
const sentinel = () => {};
vm.runInNewContext(compiled, { window: { dataLayer: [], gtag: sentinel } });
const oldQueue = [];
((...args) => oldQueue.push(args))('event', 'page_view', parameters);
assert.notEqual(Object.prototype.toString.call(oldQueue[0]), '[object Arguments]', 'The former implementation must fail the command contract');
console.log('Google command queue QA passed: five native Arguments commands, preserved queue/function/payload, and former Array representation rejected.');
