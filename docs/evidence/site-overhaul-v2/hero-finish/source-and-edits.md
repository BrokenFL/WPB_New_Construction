# PR115 Shorecrest hero finish — source and edits

- Review date: 2026-09-19
- Website checkout: `/Users/brookesnader/.codex/worktrees/wpb-v2-overhaul/WPB_NewConstruction`
- Starting website branch / HEAD: `codex/site-overhaul-v2` / `ed370452c0cc3728d9723fba75010fc1b069acde`
- Asset warehouse branch / HEAD: `main` / `bf799913a8f424bdbb7a25cb773be9ab89666c2b`

This is bounded PR review evidence for the Shorecrest hero finish. The approved source originals remain unchanged. The two native PNG treatments remain in ignored `.runtime/`; the tracked JPEGs in this directory are small comparison proofs made with Sharp at quality 85. No full PNG was copied into tracked public assets, the asset warehouse, or a production registry.

## Source supplied to ImageGen

Both treatment calls used one reference only:

`/Volumes/ExternalSSD/WPB_NewConstruction_Assets/public-front-page-assets/approved-for-website/images/shorecrest-project-card-main-v01.png`

The file is 1672 × 941 pixels, 2,343,238 bytes, and SHA-256 `42511762a17c7a2d80a1a7806125da1f286251ca3bc5eed6cfc792c2a782a335`. It is the full-tower Shorecrest panorama with the tower at right and waterfront/sky at left. The same bytes are also catalogued in the Shorecrest approved folder as `shorecrest-hero-aerial-v01.png`.

The warehouse `asset-manifest.json` record at asset-repo HEAD `bf799913a8f424bdbb7a25cb773be9ab89666c2b` records the selected front-page source as:

- `projectSlug`: `front-page-assets`
- `sourcePath`: `/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB New Construction Asset Library/11_FRONT_PAGE_ASSETS/approved-for-website /shorecrest-project-card-main-v01.png` (the source folder name contains a trailing space)
- `assetRepoPath`: the selected warehouse path above
- `action`: `copied`
- `reason`: `new approved asset`
- `intakeTimestamp`: `2026-06-02T01:32:26.529Z`

This approved-folder placement and manifest copy record are the approval-stage trail used for this review. No separate owner or license document for this generated image was found in the bounded inventory. The source's embedded C2PA/XMP reports claim UUID `da9edf47-7389-408e-8227-a6fdf0866c9f`, created `2026-05-31T00:00:00Z`, software agent `gpt-image` version `c2.0`, and `digitalSourceType: trainedAlgorithmicMedia` (`watermarked.unbound`). Those fields describe embedded provenance; they do not establish a photographic-origin claim.

The 1672 × 941 panorama was selected because it matches the full tower geometry, camera, and wide hero relationship used by the page. The 6000 × 4000 and 2252 × 1266 candidates below were inspected but were not supplied to either ImageGen call. No architectural composite or multi-reference stack was used.

### Higher-resolution approved files found but unused

| File | Facts | Why it was not the supplied reference |
| --- | --- | --- |
| `/Volumes/ExternalSSD/WPB_NewConstruction_Assets/public-projects/shorecrest/approved-for-website/images/shorecrest-amenities-valet-v01.jpg` | 6000 × 4000; 15,233,321 bytes; SHA-256 `4e9cb3cb48f2a8e379d7dd876dcd01fdff9c3830e793f5dbdd1bad8f9538eae1` | Same visible Shorecrest façade/entrance, but a close valet/entrance composition rather than the full-tower hero. Embedded metadata identifies Adobe Firefly / Photoshop and `compositeWithTrainedAlgorithmicMedia`; its pixel count does not prove native capture. |
| `/Volumes/ExternalSSD/WPB_NewConstruction_Assets/public-projects/shorecrest/approved-for-website/images/shorecrest-hero-aerial-side-v02.png` | 2252 × 1266; 4,584,442 bytes; SHA-256 `5bb33b7dc947fe3631dbc45978e45e72f81b0c072fb9aba50404b8a07c05f2b9` | Strong wide waterfront composition, but the visible angle does not provide the selected panorama's full-tower geometry. No creator/upscale/AI tag was detectable; native origin remains unproven. |

These two files remain inventory findings only. They were not ImageGen inputs and do not appear in the actual edit prompt as references.

## Generated treatments

The calls used the built-in ImageGen tool. The tool did not expose a model ID for these outputs. Embedded output provenance reports software agent `ChatGPT`, version `gpt-image`, and `digitalSourceType: trainedAlgorithmicMedia`; no `gpt-image v2` claim is made for the generated outputs.

| Treatment | Runtime PNG | Native output facts | Embedded output provenance |
| --- | --- | --- | --- |
| A — clear neutral | `.runtime/hero-finish/treatments/a-clear-neutral.png` | 1672 × 941; 2,319,962 bytes; SHA-256 `086d86f260dea886613fb1581dfa9046066f04a912a3a5c2120672ce5a2a55a1` | C2PA claim UUID `d1e3e78b-3d8e-4ea6-890d-61c3b67a5f6a`; created `2026-09-19T17:44:37.536508028Z`; `ChatGPT` / `gpt-image`; `trainedAlgorithmicMedia`; C2PA toolkit `c2pa_rs 0.79.2`, spec `2.2.0` |
| B — warm mineral | `.runtime/hero-finish/treatments/b-warm-mineral.png` | 1672 × 941; 2,278,983 bytes; SHA-256 `ee339fa8a9587e7e394cce1518be6c2b12dd25e82c5a964d957af46c0bf520bf` | C2PA claim UUID `b264ef36-4f13-4e9d-9341-5d477ba47215`; created `2026-09-19T17:45:10.251917549Z`; `ChatGPT` / `gpt-image`; `trainedAlgorithmicMedia`; C2PA toolkit `c2pa_rs 0.79.2`, spec `2.2.0` |

Here “native” means that each generated file has the same 1672 × 941 pixel dimensions as the supplied reference. It does not mean native photographic capture. The prompts explicitly prohibited invented detail through upscaling, and no resolution-recovery claim is made.

The exact prompts used are recorded in [`prompts.json`](./prompts.json). The runtime copy is `.runtime/hero-finish/treatments/prompts.json` and is retained for local provenance. The source PNG and generated PNGs remain at their native paths; no original was overwritten.

The selected B master is also preserved byte-for-byte as [`selected-b-master.png`](./selected-b-master.png) in this evidence directory for PR reproducibility. It is documentary evidence only and is not a public-served asset. [`reproduce-derivatives.mjs`](./reproduce-derivatives.mjs) defaults to this tracked master relative to the script file, infers the website repository root from that location, and writes derived outputs to the repository's `public/assets/editorial` path.

## Visual review and current treatment choice

The source and both generated PNGs were inspected at their actual resolution. Both treatments retained the crown, curved left edge, balcony/mullion rhythm, right corner, podium, adjacent buildings, shoreline/dock, clouds, and low-sun direction with no visible geometric drift in this review. A is clearer and more blue-separated. B is quieter, warmer, and closer to the source's mineral whites.

**B — warm mineral** is the implemented selection. The [final graphic review](final-graphic-review.md) accepted it after two focused correction rounds and actual renders at 1440/1024/768/390/320. This is visual acceptance for the draft PR, not surveyed architectural identity or production asset approval.

## Comparison proofs

These are review-only derivatives of the runtime PNGs, generated with the bundled Sharp `0.34.5` package using JPEG quality 85 and a 1200-pixel width:

| Proof | Source | Dimensions | Bytes | SHA-256 |
| --- | --- | --- | ---: | --- |
| [`a-clear-neutral.jpg`](./a-clear-neutral.jpg) | `.runtime/hero-finish/treatments/a-clear-neutral.png` | 1200 × 675 | 183,357 | `02cbeeb65a109cb8003be8ccfad1de57541e63ae76f4a6f84cbd4bcc36ab12cd` |
| [`b-warm-mineral.jpg`](./b-warm-mineral.jpg) | `.runtime/hero-finish/treatments/b-warm-mineral.png` | 1200 × 675 | 175,784 | `22723fc0a7e242572bf79861adc2bad51aa07c9bc9aa07f32b52ae3ffcacf95c` |

The JPEGs are comparison evidence only. They are not approved production derivatives and do not replace the native runtime PNGs.

## Derived WebP outputs

The copied [`derived-manifest.json`](./derived-manifest.json) records the actual five WebPs currently present under `public/assets/editorial`. The manifest's selected source is the runtime B PNG (`1672 × 941`, SHA-256 `ee339fa8…`), with the mobile crop `{ left: 1120, top: 0, width: 455, height: 941 }` and WebP quality `84`:

| Kind | Repository output | Dimensions | Bytes | SHA-256 |
| --- | --- | ---: | ---: | --- |
| Desktop | `/assets/editorial/shorecrest-hero-b-warm-mineral-v01-960w.webp` | 960 × 540 | 95,058 | `f44adf0a92df51e077f576648af1d739f2ec54c6c56119e1691536d5e8928c64` |
| Desktop | `/assets/editorial/shorecrest-hero-b-warm-mineral-v01-1280w.webp` | 1280 × 720 | 151,974 | `20c19fd0f1b2cac4cb7152d0d3930243050bdd8be81458db30a5bf22fae7c959` |
| Desktop | `/assets/editorial/shorecrest-hero-b-warm-mineral-v01-1672w.webp` | 1672 × 941 | 226,696 | `644c00d9e86834a11db4c6a92b967231f300269123f3c812c858e820cda971a1` |
| Mobile | `/assets/editorial/shorecrest-hero-b-warm-mineral-v01-mobile-390w.webp` | 390 × 807 | 66,256 | `789464b212559a11187678fb76f71cc3ed54be9dbe5f4acf0fe775772a7a5364` |
| Mobile | `/assets/editorial/shorecrest-hero-b-warm-mineral-v01-mobile-455w.webp` | 455 × 941 | 80,628 | `e5d3eb3813b1e7ccfd2dd2fe223112cddd07d76e8934d9812f9db9b3d3a5519e` |

The derivative script uses Sharp's `withoutEnlargement: true`: desktop outputs are resized down from the 1672-pixel source, the 1672-pixel desktop output remains source-sized, and mobile outputs are cropped from the 455-pixel source window before the 390-pixel reduction. No asset-upscale claim is made. The script was copied for reproducibility and was not rerun as part of this evidence update.

## Review and release boundaries

- The five B WebP derivatives are bound only in the draft implementation; exact hashes are captured in `derived-manifest.json`.
- Final graphic acceptance covers the corrected screenshots and explicit AI-assisted rendering caption. Source resolution, portrait crop and tall mobile hero tradeoffs remain documented.
- Draft derived assets remain for PR review. No approval-warehouse promotion, production release, merge or deployment occurred.
- The original reference and generated output files remain preserved. The selected B master is additionally tracked with this evidence; full PNGs are not served from public assets.
