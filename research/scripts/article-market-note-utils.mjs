export function readTsArray(source, exportName) {
  const marker = `export const ${exportName} = [`;
  const start = source.indexOf(marker);
  if (start === -1) return [];
  const arrayStart = source.indexOf("[", start);
  const arrayEnd = findMatchingBracket(source, arrayStart);
  if (arrayEnd === -1) return [];
  const declarations = collectTopLevelConstants(source.slice(0, start));
  const raw = source.slice(arrayStart, arrayEnd + 1).replace(/\s+as const\b/g, "");
  try {
    return Function(`"use strict"; ${declarations} return (${raw});`)();
  } catch {
    return [];
  }
}

const buyerAnswerMarker = "const buyerIntentAnswerPages: BuyerIntentAnswerPage[] = [";

export function readBuyerIntentAnswerPages(source) {
  const start = source.indexOf(buyerAnswerMarker);
  if (start === -1) return [];
  const arrayStart = start + buyerAnswerMarker.length - 1;
  const arrayEnd = findMatchingBracket(source, arrayStart);
  if (arrayEnd === -1) throw new Error("Could not parse existing Answers records.");
  return Function(`"use strict"; return (${source.slice(arrayStart, arrayEnd + 1)});`)();
}

export function removeBuyerIntentAnswerPage(source, slug) {
  const matches = readBuyerIntentAnswerPages(source).filter(answer => answer.slug === slug);
  if (matches.length !== 1) throw new Error(`Expected one existing Answers record for ${slug}.`);
  const arrayStart = source.indexOf(buyerAnswerMarker) + buyerAnswerMarker.length - 1;
  const arrayEnd = findMatchingBracket(source, arrayStart);
  const arrayText = source.slice(arrayStart + 1, arrayEnd);
  const block = findObjectBlock(arrayText, slug);
  if (!block) throw new Error(`Could not locate existing Answers record for ${slug}.`);
  return source.slice(0, arrayStart + 1) + arrayText.replace(block, "") + source.slice(arrayEnd);
}

export function upsertTsArrayObject(source, exportName, nextObject, editKey) {
  const marker = `export const ${exportName} = [`;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Could not find ${exportName} export.`);
  const arrayStart = source.indexOf("[", start);
  const arrayEnd = findMatchingBracket(source, arrayStart);
  if (arrayEnd === -1) throw new Error(`Could not parse ${exportName} array.`);
  const arrayText = source.slice(arrayStart + 1, arrayEnd);
  const rendered = `${JSON.stringify(nextObject, null, 2)},`.replace(/\n/g, "\n  ");
  const existingBlock = findObjectBlock(arrayText, editKey);
  const nextArrayText = existingBlock
    ? arrayText.replace(existingBlock, `\n  ${rendered}\n`)
    : `\n  ${rendered}\n${arrayText}`;
  return `${source.slice(0, arrayStart + 1)}${nextArrayText}${source.slice(arrayEnd)}`;
}

export function findMatchingBracket(source, start) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function findObjectBlock(arrayText, editKey) {
  if (!editKey) return "";
  const key = escapeRegExp(editKey);
  // Key names are JSON-quoted ("slug": ...) in the generated TS output.
  const idPattern = new RegExp(`["']?(?:id|slug)["']?\\s*:\\s*["']${key}["']`);
  // Walk top-level {...} blocks with a brace-depth scanner (string-aware for
  // " and ' only; the entries are JSON-style) and return the block whose
  // id/slug matches. A regex alone can't reliably span nested objects.
  let depth = 0;
  let quote = "";
  let escaped = false;
  let blockStart = -1;
  for (let i = 0; i < arrayText.length; i++) {
    const ch = arrayText[i];
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === "{") {
      if (depth === 0) blockStart = i;
      depth += 1;
      continue;
    }
    if (ch === "}") {
      depth -= 1;
      if (depth === 0 && blockStart !== -1) {
        let blockEnd = i + 1;
        // Include the entry's trailing comma when present so the upsert
        // replacement (which already ends with a comma) stays 1-for-1.
        if (arrayText[blockEnd] === ",") blockEnd += 1;
        const block = arrayText.slice(blockStart, blockEnd);
        if (idPattern.test(block)) return block;
        blockStart = -1;
      }
    }
  }
  return "";
}

function collectTopLevelConstants(source) {
  return [...source.matchAll(/(?:^|\n)\s*const\s+([A-Za-z_$][\w$]*)\s*=\s*("(?:\\.|[^"\\])*");/g)]
    .map((match) => `const ${match[1]} = ${match[2]};`)
    .join("\n");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
