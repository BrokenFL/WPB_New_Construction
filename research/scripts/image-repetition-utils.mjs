import ts from "typescript";

const allowedRepeatedFragments = [
  "/logo.",
  "/logo.svg",
  "brand-mark",
  "wpb-geography-map-hero",
];

const homepageDeskVariantFunctionName = "homepageDeskDisplayVariants";

/**
 * Collect image assignments while separating the Desk's sourcePath identity
 * metadata from actual image assignments. The sourcePath exception is based
 * on its exact AST location, so unrelated sourcePath properties remain in the
 * inventory.
 */
export function collectImageUsages(sources) {
  const usages = new Map();
  const provenance = [];

  for (const source of sources) {
    const sourceProvenance = source.relativePath === "src/main.ts"
      ? classifyHomepageDeskProvenance(source.text).map((entry) => ({ ...entry, file: source.relativePath }))
      : [];
    provenance.push(...sourceProvenance);
    const lines = source.text.split(/\n/);
    let lineStart = 0;
    lines.forEach((line, index) => {
      for (const match of line.matchAll(/["'`]((?:\/assets|\/projects)[^"'`]+?\.(?:jpg|jpeg|png|webp|svg))["'`]/gi)) {
        const imagePath = match[1];
        const imageStart = lineStart + Number(match.index) + 1;
        const imageEnd = imageStart + imagePath.length;
        const isDeskProvenance = sourceProvenance.some((entry) =>
          entry.imagePath === imagePath && entry.imageStart === imageStart && entry.imageEnd === imageEnd,
        );
        if (isDeskProvenance) continue;
        const context = nearbyContext(lines, index);
        if (!usages.has(imagePath)) usages.set(imagePath, []);
        usages.get(imagePath).push({ file: source.relativePath, line: index + 1, context });
      }
      lineStart += line.length + 1;
    });
  }

  return { usages, provenance };
}

/**
 * Find only direct sourcePath property assignments in object literals that
 * are direct elements of homepageDeskDisplayVariants's returned array.
 */
export function classifyHomepageDeskProvenance(sourceText) {
  const sourceFile = ts.createSourceFile(
    "main.ts",
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const entries = [];

  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === homepageDeskVariantFunctionName) {
      const arrayLiteral = returnedArrayLiteral(node);
      if (arrayLiteral) {
        for (const element of arrayLiteral.elements) {
          if (!ts.isObjectLiteralExpression(element)) continue;
          for (const property of element.properties) {
            if (!ts.isPropertyAssignment(property) || propertyName(property.name) !== "sourcePath") continue;
            const literal = stringLiteral(unwrapExpression(property.initializer));
            if (!literal) continue;
            const start = literal.getStart(sourceFile);
            const end = literal.getEnd();
            const location = sourceFile.getLineAndCharacterOfPosition(start);
            entries.push({
              imagePath: literal.text,
              line: location.line + 1,
              column: location.character + 1,
              imageStart: start + 1,
              imageEnd: end - 1,
              context: `${homepageDeskVariantFunctionName} sourcePath provenance`,
            });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return entries;
}

export function isAcceptableRepeat(imagePath, usages) {
  if (allowedRepeatedFragments.some((fragment) => imagePath.includes(fragment))) return true;
  const contexts = new Set(usages.map((usage) => usage.context));
  if (contexts.size === 1) return true;
  if (imagePath.includes("/assets/editorial/") && usages.length <= 3) return true;
  return false;
}

export function isBlockingImageRepeat(imagePath, usages, hasApproval = false) {
  return usages.length > 3 && !isAcceptableRepeat(imagePath, usages) && !hasApproval;
}

function returnedArrayLiteral(functionDeclaration) {
  for (const statement of functionDeclaration.body?.statements ?? []) {
    if (!ts.isReturnStatement(statement) || !statement.expression) continue;
    const expression = unwrapExpression(statement.expression);
    if (ts.isArrayLiteralExpression(expression)) return expression;
  }
  return undefined;
}

function unwrapExpression(expression) {
  let current = expression;
  while (
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isParenthesizedExpression(current) ||
    (typeof ts.isSatisfiesExpression === "function" && ts.isSatisfiesExpression(current))
  ) {
    current = current.expression;
  }
  return current;
}

function propertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return "";
}

function stringLiteral(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ? node : undefined;
}

export function nearbyContext(lines, index) {
  const window = lines.slice(Math.max(0, index - 8), Math.min(lines.length, index + 9)).join(" ");
  const project = window.match(/id:\s*"([^"]+)"/)?.[1] ?? window.match(/projectId:\s*"([^"]+)"/)?.[1];
  const corridor = window.match(/corridorKey:\s*"([^"]+)"/)?.[1];
  const slug = window.match(/slug:\s*"([^"]+)"/)?.[1];
  const route = window.match(/routeUse:\s*\[([^\]]+)/)?.[1];
  return [project, corridor].filter(Boolean).join(" ") || slug || route?.replaceAll('"', "").trim() || "shared source";
}
