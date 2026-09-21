# Technical integration review

Astra lead review of the intended source/test diff from `ca7893df1315fd484382a515b99c7ffb0fecd199` to `1d0dc31e15d0ae1916ad187f2575317436f9ea68`. Luna Max owns execution of the final QA matrix. This review is distinct from those run results and the fresh design critique.

## Findings closed before source freeze

- **Canonical precedence:** the client showcase formerly rendered stale copy for Status despite an existing canonical winner. The repair uses the existing field resolver for Status tags and existing Status facts. It does not hardcode Alba, add a new fact strip, change Sales tags, mutate canonical data or promote a schema field.
- **Misleading accessible/interaction content:** the static hero still described five unused carousel slides to screen readers, and the project manual-inquiry form used a floorplan-view action. Those defects are removed while selected-image alt/caption and direct floorplan links remain.
- **Future-content wording:** the isolated one-story screenshot exposed an inaccurate “three latest publications” claim. The existing presenter now uses a count-neutral note, preserving the distinction between website publication and older source reporting. Isolated fixtures cover source-field invalidation, newest-three ordering, sparse content, long headlines, missing media and destination/date semantics.
- **CSS precedence and reflow:** the second CTA rule still shrank phone action text after the shared rule changed. That obsolete rule and the 12px gutter override were removed. Actual 200% screenshots then exposed masthead clipping/overlap that document-width checks alone missed. Wrapping and intrinsic word widths now repair the actual content; bounds/overlap checks supplement width assertions. Normal and enlarged 390/320 images were visually inspected before freeze.
- **Hero QA isolation:** rendered hero cases initially allowed unrelated external traffic. Both regular and reduced-motion contexts now allow local GET/HEAD only and abort mutations/external requests. The intentional image delay also requires a read method. Real keyed Maps uses its separate authorized test.

## Coverage boundaries

The news test helper extracts existing production presenter functions with the TypeScript parser. It is test-only; it does not introduce a runtime publishing system. Helper dependencies are isolated fixture adapters, so these unit tests are complemented by actual rendered route, article-entry and link checks.

Enlarged-text checks snapshot computed sizes before applying an exact 2× scale to the selected visible text/control elements. This avoids compounding parent/child scaling and catches fixed-pixel typography. It is a browser stress emulation, not an assertion of physical iPhone text settings, native browser zoom behavior or assistive-technology certification. Narrow 320px layout checks are also recorded separately.

The earlier Alba baseline JSON establishes client/card/compare disagreement. Its no-JS selector did not match a static node and is not SSR proof. Final static/no-JS evidence must be read from the final QA memo rather than inferred from that empty subsection.

Image-loading checks establish requested source, successful decoding, reserved geometry and bounded bytes. They do not verify depicted architecture, rights, real-world loading speed or conversion uplift. The independent official-source comparison and the two owner decisions remain separate.

## Delivery boundary

Final command results, skips/failures and asset-audit limitations belong to `final-qa.md`. The built plain-config preview must be restored after synthetic consent tests. Documentation/evidence after the source freeze must not silently contain untested code changes. Keep PR #115 draft, preserve main and unrelated work, and perform no merge, deployment or automation activation.
