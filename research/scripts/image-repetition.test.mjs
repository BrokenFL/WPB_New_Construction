import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import {
  classifyHomepageDeskProvenance,
  collectImageUsages,
  isBlockingImageRepeat,
} from "./image-repetition-utils.mjs";

const repeatedPath = "/assets/editorial/repeated-context.jpg";

function sourceWithRepeatedMappings(count) {
  return `
${Array.from({ length: count }, (_, index) => `const mapping${index + 1} = { id: "slot-${index + 1}", image: "${repeatedPath}" };\n${"\n".repeat(12)}`).join("\n")}
function homepageDeskDisplayVariants() {
  return [{ sourcePath: "${repeatedPath}", thumbnailSrc: "/assets/editorial/repeated-context-thumb-288x216.webp" }] as const;
}
`;
}

function usageFixture(sourceText) {
  return collectImageUsages([{ relativePath: "src/main.ts", text: sourceText }]);
}

test("three real mappings plus Desk sourcePath provenance stays below the repetition threshold", () => {
  const result = usageFixture(sourceWithRepeatedMappings(3));
  assert.equal(result.provenance.length, 1);
  assert.equal(result.usages.get(repeatedPath)?.length, 3);
  assert.equal(isBlockingImageRepeat(repeatedPath, result.usages.get(repeatedPath)), false);
});

test("four real mappings plus Desk sourcePath provenance still blocks", () => {
  const result = usageFixture(sourceWithRepeatedMappings(4));
  assert.equal(result.provenance.length, 1);
  assert.equal(result.usages.get(repeatedPath)?.length, 4);
  assert.equal(isBlockingImageRepeat(repeatedPath, result.usages.get(repeatedPath)), true);
});

test("reviewed Desk derivative remains an ordinary counted image assignment", () => {
  const derivative = "/assets/editorial/repeated-context-thumb-288x216.webp";
  const result = usageFixture(sourceWithRepeatedMappings(0));
  assert.equal(result.provenance.length, 1);
  assert.equal(result.usages.get(repeatedPath), undefined);
  assert.equal(result.usages.get(derivative)?.length, 1);
});

test("sourcePath outside the precise returned metadata objects remains counted", () => {
  const outside = "/assets/editorial/outside-source-path.jpg";
  const nested = "/assets/editorial/nested-source-path.jpg";
  const inScope = "/assets/editorial/in-scope-source-path.jpg";
  const result = usageFixture(`
const unrelated = { sourcePath: "${outside}" };
function homepageDeskDisplayVariants() {
  const local = { sourcePath: "${outside}" };
  return [{ sourcePath: "${inScope}", nested: { sourcePath: "${nested}" } }] as const;
}
`);
  assert.deepEqual(result.provenance.map((entry) => entry.imagePath), [inScope]);
  assert.equal(result.usages.get(outside)?.length, 2);
  assert.equal(result.usages.get(nested)?.length, 1);
  assert.equal(result.usages.get(inScope), undefined);
});

test("homepage Desk visual helper drops a reviewed derivative when item.imagePath changes", async () => {
  const sourceText = await fs.readFile("src/main.ts", "utf8");
  const helperSource = [
    extractFunctionSource(sourceText, "homepageDeskDisplayVariants"),
    extractFunctionSource(sourceText, "homepageDeskVisual"),
  ].join("\n");
  const output = ts.transpileModule(helperSource, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  const context = {};
  vm.runInNewContext(output, context);

  const reviewedSource = "/assets/editorial/wpb-corridors-aerial-hero-v01.jpg";
  const reviewed = context.homepageDeskVisual({ imagePath: reviewedSource }, "thumbnail");
  assert.equal(reviewed.desktopSrc, "/assets/editorial/development-desk/la-fontana-context-thumb-288x216.webp");

  const changed = context.homepageDeskVisual({ imagePath: "/assets/editorial/replacement-context.jpg" }, "thumbnail");
  assert.equal(changed.desktopSrc, "/assets/editorial/replacement-context.jpg");
  assert.notEqual(changed.desktopSrc, reviewed.desktopSrc);
});

function extractFunctionSource(sourceText, functionName) {
  const sourceFile = ts.createSourceFile("main.ts", sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  let match;
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === functionName) {
      match = node;
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  assert.ok(match, `Expected ${functionName} in src/main.ts`);
  return match.getText(sourceFile);
}
