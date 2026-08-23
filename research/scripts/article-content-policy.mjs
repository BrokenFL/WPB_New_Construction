export const minimumFinalImages = 2;
export const minimumBodyImages = 1;

export function validateArticleImages({ heroImage, bodyImages = [], bodySections = [] }) {
  const findings = [];
  const images = [heroImage, ...bodyImages].filter(Boolean);
  const uniquePaths = new Set(images.map((image) => image.path).filter(Boolean));

  if (images.length < minimumFinalImages) {
    findings.push(`Automated articles require at least ${minimumFinalImages} final images: provide a hero and at least one inline image.`);
  }
  if (bodyImages.length < minimumBodyImages) {
    findings.push("Automated articles require at least one body image in addition to the hero image.");
  }
  if (uniquePaths.size < Math.min(minimumFinalImages, images.length)) {
    findings.push("Article images must be distinct assets; the hero and body image cannot reuse the same path.");
  }

  bodyImages.forEach((image, index) => validateImageMetadata(image, `Body image ${index + 1}`, findings));

  const placedPaths = new Set(bodySections.map((section) => section.image).filter(Boolean));
  for (const image of bodyImages) {
    if (image.path && !placedPaths.has(image.path)) {
      findings.push(`Body image ${image.key || image.path} must be placed in an article section.`);
    }
  }
  if (bodyImages.length && !bodyImages.some((image) => image.path && placedPaths.has(image.path))) {
    findings.push("At least one body image must be attached to a rendered article section.");
  }

  return findings;
}

function validateImageMetadata(image, label, findings) {
  if (!image) return;
  if (!image.path) findings.push(`${label} could not be resolved.`);
  if (!image.alt) findings.push(`${label} alt text is required.`);
  if (!image.caption) findings.push(`${label} caption is required.`);
  if (!image.credit) findings.push(`${label} credit is required.`);
  if (!image.sizeBytes) findings.push(`${label} could not be found or optimized.`);
}
