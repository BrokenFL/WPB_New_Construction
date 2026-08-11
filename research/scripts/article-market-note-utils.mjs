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
  const pattern = new RegExp(`\\{[\\s\\S]*?(?:id|slug):\\s*["']${key}["'][\\s\\S]*?\\},?`, "m");
  return arrayText.match(pattern)?.[0] || "";
}

function collectTopLevelConstants(source) {
  return [...source.matchAll(/(?:^|\n)\s*const\s+([A-Za-z_$][\w$]*)\s*=\s*("(?:\\.|[^"\\])*");/g)]
    .map((match) => `const ${match[1]} = ${match[2]};`)
    .join("\n");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
