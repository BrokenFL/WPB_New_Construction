import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const sourcePath = path.join(root, "src/main.ts");
const outputPath = path.join(root, "public/maps/wpb-atlas-map-editorial.svg");

const source = fs.readFileSync(sourcePath, "utf8");
const start = source.indexOf("const featuredProjects: FeaturedProject[] = [");
const end = source.indexOf("];", start);

if (start === -1 || end === -1) {
  throw new Error("Unable to locate featuredProjects in src/main.ts");
}

const block = source.slice(start, end);
const projectBlocks = [...block.matchAll(/\{\n([\s\S]*?)\n  \},/g)].map((match) => match[1]);

const projects = projectBlocks
  .map((projectBlock) => {
    const readString = (key) => projectBlock.match(new RegExp(`${key}: "([^"]+)"`))?.[1];
    const readNumber = (key) => {
      const raw = projectBlock.match(new RegExp(`${key}: (-?\\d+(?:\\.\\d+)?)`))?.[1];
      return raw ? Number(raw) : undefined;
    };

    return {
      id: readString("id"),
      name: readString("name"),
      corridor: readString("corridor"),
      rank: readNumber("rank"),
      latitude: readNumber("latitude"),
      longitude: readNumber("longitude"),
    };
  })
  .filter((project) => project.id && project.name && Number.isFinite(project.latitude) && Number.isFinite(project.longitude))
  .sort((a, b) => a.rank - b.rank);

if (!projects.length) {
  throw new Error("No coordinate-backed projects found");
}

const width = 430;
const height = 620;
const bounds = {
  west: -80.068,
  east: -80.042,
  south: 26.666,
  north: 26.762,
};

function projectPoint(project) {
  const x = ((project.longitude - bounds.west) / (bounds.east - bounds.west)) * width;
  const y = ((bounds.north - project.latitude) / (bounds.north - bounds.south)) * height;
  return {
    x: Math.max(20, Math.min(width - 20, x)),
    y: Math.max(20, Math.min(height - 20, y)),
  };
}

const points = projects.map((project) => ({ ...project, ...projectPoint(project) }));
const topProjects = new Set(projects.slice(0, 7).map((project) => project.id));
// Preserve geographic anchoring, but separate near-identical project markers enough
// to be readable in the compact homepage panel.
for (let pass = 0; pass < 18; pass += 1) {
  for (let index = 0; index < points.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < points.length; otherIndex += 1) {
      const a = points[index];
      const b = points[otherIndex];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || 0.001;
      const minimum = topProjects.has(a.id) || topProjects.has(b.id) ? 30 : 18;

      if (distance >= minimum) continue;

      const push = (minimum - distance) / 2;
      const ux = dx / distance;
      const uy = dy / distance;
      a.x = Math.max(20, Math.min(width - 20, a.x - ux * push));
      a.y = Math.max(20, Math.min(height - 20, a.y - uy * push));
      b.x = Math.max(20, Math.min(width - 20, b.x + ux * push));
      b.y = Math.max(20, Math.min(height - 20, b.y + uy * push));
    }
  }
}

const pinMarkup = points
  .map((point) => {
    const featured = topProjects.has(point.id);
    const radius = featured ? 13 : 7;
    const number = String(point.rank).padStart(2, "0");
    const label = point.name.replace(/&/g, "&amp;");
    return `
    <g class="pin ${featured ? "pin-featured" : "pin-context"}" transform="translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})">
      <title>${label} · ${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}</title>
      <circle r="${radius}" />
      ${featured ? `<text y="4">${number}</text>` : ""}
    </g>`;
  })
  .join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">Coordinate map of Downtown West Palm Beach tracked projects</title>
  <desc id="desc">A custom static map with project pins projected from latitude and longitude values in the WPB New Construction project catalog.</desc>
  <style>
    .street { stroke: #d7cebf; stroke-width: 1; }
    .major { stroke: #c2b49b; stroke-width: 5; fill: none; stroke-linecap: round; opacity: .72; }
    .bridge { stroke: #d8cbb6; stroke-width: 11; fill: none; stroke-linecap: round; opacity: .9; }
    .bridge-line { stroke: #aa9c87; stroke-width: 1.5; fill: none; stroke-linecap: round; opacity: .56; }
    .label { fill: #4e5a59; font-family: Avenir Next, Helvetica, Arial, sans-serif; font-size: 11px; letter-spacing: 2px; }
    .water-label { fill: #3f5758; font-family: Avenir Next, Helvetica, Arial, sans-serif; font-size: 12px; letter-spacing: 2.5px; }
    .pin circle { fill: #0d3125; stroke: #f8eee0; stroke-width: 1.3; filter: url(#pinShadow); }
    .pin-context circle { fill: #38574f; opacity: .74; stroke-width: .8; }
    .pin text { fill: #f8eee0; font-family: Avenir Next, Helvetica, Arial, sans-serif; font-size: 8px; font-weight: 800; text-anchor: middle; }
  </style>
  <defs>
    <linearGradient id="paper" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#f8f4ec"/>
      <stop offset="1" stop-color="#e4dacb"/>
    </linearGradient>
    <linearGradient id="water" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#dce8e5"/>
      <stop offset="1" stop-color="#b9cbc9"/>
    </linearGradient>
    <pattern id="grid" width="31" height="31" patternUnits="userSpaceOnUse">
      <path d="M0 0H31M0 31H31M0 0V31M31 0V31" fill="none" class="street"/>
    </pattern>
    <filter id="pinShadow" x="-80%" y="-80%" width="260%" height="260%">
      <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#1d2c2d" flood-opacity="0.22"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#paper)"/>
  <rect width="${width}" height="${height}" fill="url(#grid)" opacity=".64"/>

  <path d="M248 0H349C323 80 321 147 346 221C373 300 369 377 340 450C314 517 319 569 356 620H232C202 556 199 499 226 432C255 359 262 293 236 222C209 147 213 77 248 0Z" fill="url(#water)"/>
  <path d="M284 0C258 80 257 149 282 222C309 301 304 377 275 448C248 515 252 571 288 620" fill="none" stroke="#eef4f1" stroke-width="28" opacity=".48"/>
  <path d="M349 0H430V620H356C319 569 314 517 340 450C369 377 373 300 346 221C321 147 323 80 349 0Z" fill="#f4eee4"/>
  <path d="M349 0H430V620H356C319 569 314 517 340 450C369 377 373 300 346 221C321 147 323 80 349 0Z" fill="url(#grid)" opacity=".34"/>

  <path class="major" d="M92 0C88 82 93 165 110 245C128 328 127 407 108 489C97 538 100 582 115 620"/>
  <path class="major" d="M128 0C124 83 130 166 148 246C167 329 168 407 149 488C137 540 141 582 158 620" opacity=".42"/>
  <path class="bridge" d="M0 378C93 365 164 372 232 399C294 424 344 421 430 388"/>
  <path class="bridge-line" d="M0 379C93 365 164 372 232 399C294 424 344 421 430 388"/>
  <path class="bridge" d="M0 500C102 486 174 493 245 524C309 551 358 547 430 520" opacity=".72"/>

  <ellipse cx="78" cy="473" rx="102" ry="68" fill="#c9975b" opacity=".11"/>
  <ellipse cx="180" cy="318" rx="114" ry="78" fill="#c9975b" opacity=".1"/>
  <ellipse cx="331" cy="160" rx="108" ry="94" fill="#0d3125" opacity=".07"/>

  <g transform="translate(18 20)">
    <rect width="36" height="110" fill="#fffaf3" stroke="#d5cab9"/>
    <path d="M10 36H26M18 28V44M10 74H26" stroke="#263434" stroke-width="1.4"/>
    <circle cx="18" cy="94" r="7" fill="none" stroke="#263434" stroke-width="1.4"/>
    <circle cx="18" cy="94" r="2" fill="#263434"/>
  </g>

  <text class="water-label" x="289" y="267" text-anchor="middle">INTRACOASTAL</text>
  <text class="water-label" x="289" y="286" text-anchor="middle">WATERWAY</text>
  <text class="label" x="116" y="332" transform="rotate(-76 116 332)">FLAGLER</text>
  <text class="label" x="132" y="332" transform="rotate(-76 132 332)">DRIVE</text>
  <text class="label" x="70" y="532">DOWNTOWN</text>
  <text class="label" x="315" y="80">PALM BEACH</text>

  ${pinMarkup}
</svg>
`;

fs.writeFileSync(outputPath, svg);

console.log(JSON.stringify({
  outputPath,
  projects: projects.length,
  bounds,
}, null, 2));
