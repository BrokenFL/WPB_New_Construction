import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

/** Verify real computed heading contrast and preserve both consent states. */
export async function inspectCommercialPresentation(page, guide, { output, pageName, width, javaScriptEnabled }) {
  const suffix = javaScriptEnabled ? 'js' : 'nojs';
  if (javaScriptEnabled) {
    await page.screenshot({ path: `${output}/${pageName}-${width}-first-visit.png` });
    // Use the actual refusal control; never remove or conceal the consent UI.
    await page.getByRole('button', { name: 'No thanks', exact: true }).click();
    assert.equal(await page.locator('script[data-wpb-ga4]').count(), 0);
    // Trigger normal lazy loading by scrolling, rather than changing image markup.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 700) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(300);
  }
  const details = guide.locator('.cg-stage-details');
  if (await details.count()) await details.locator('summary').click();
  const headingContrasts = await guide.locator('h3').evaluateAll(contrastRatios);
  let nativeLinkContrasts = [];
  if (!javaScriptEnabled) {
    const nativeLinks = page.locator(`.static-prerender[data-static-prerender="${pageName}"] article h3 a`);
    nativeLinkContrasts = await nativeLinks.evaluateAll(contrastRatios);
    assert.ok(nativeLinkContrasts.length > 3, 'Expected native building/research links');
    assert.ok(nativeLinkContrasts.every((ratio) => ratio >= 4.5), 'Native commercial links must remain readable without JavaScript');
  }
  function contrastRatios(headings) {
    const rgba = (value) => {
      const values = value.match(/[\d.]+/g)?.map(Number) ?? [];
      if (values.length < 3) throw new Error('Expected an sRGB computed color');
      return [values[0], values[1], values[2], values[3] ?? 1];
    };
    const over = (fg, bg) => fg.slice(0, 3).map((value, i) => value * fg[3] + bg[i] * (1 - fg[3]));
    const luminance = (color) => color.map((v) => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
    return headings.map((heading) => {
      const chain = [];
      for (let el = heading; el; el = el.parentElement) chain.unshift(el);
      let bg = [255, 255, 255];
      for (const el of chain) bg = over(rgba(getComputedStyle(el).backgroundColor), bg);
      const fg = over(rgba(getComputedStyle(heading).color), bg);
      const a = luminance(fg), b = luminance(bg);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
  }
  assert.equal(headingContrasts.length, 3);
  assert.ok(headingContrasts.every((ratio) => ratio >= 4.5), 'Commercial card heading contrast must be at least 4.5:1');
  if (await details.count()) {
    await page.screenshot({ path: `${output}/${pageName}-guide-expanded-${width}-${suffix}.png`, fullPage: true });
    await details.locator('summary').click();
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await fs.writeFile(`${output}/${pageName}-presentation-${width}-${suffix}.json`, JSON.stringify({ pageName, width, javaScriptEnabled, headingContrasts, nativeLinkContrasts, consentRefusedForCleanCapture: javaScriptEnabled, firstVisitCapturePreserved: javaScriptEnabled }, null, 2));
}
