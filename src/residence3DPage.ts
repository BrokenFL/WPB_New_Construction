import { track } from './lib/analytics.ts';
import './residence3DDiscovery.css';
import { floorplanJson, floorplanSiteUrl } from './lib/floorplanEntities.ts';
import { renderResidence3DDiscoveryPage, residence3DDiscoverySchema, residence3DDiscoveryTitle, residence3DDiscoveryDescription } from './lib/residence3DDiscovery.ts';

export function mountResidence3DDiscoveryPage() {
  const app = document.getElementById('app');
  if (!app) throw new Error('Missing page container');
  const canonical = `${floorplanSiteUrl}/3d-floorplans/`;
  document.title = residence3DDiscoveryTitle;
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
  for (const [selector, content] of [
    ['meta[name="description"]', residence3DDiscoveryDescription],
    ['meta[property="og:title"]', residence3DDiscoveryTitle],
    ['meta[property="og:description"]', residence3DDiscoveryDescription],
    ['meta[property="og:url"]', canonical],
    ['meta[name="twitter:title"]', residence3DDiscoveryTitle],
    ['meta[name="twitter:description"]', residence3DDiscoveryDescription],
  ]) document.querySelector(selector)?.setAttribute('content', content);
  app.innerHTML = renderResidence3DDiscoveryPage();
  for (const schema of document.head.querySelectorAll('script[type="application/ld+json"]')) schema.remove();
  const schema = document.createElement('script');
  schema.type = 'application/ld+json'; schema.id = 'wpb-residence-3d-schema';
  schema.textContent = floorplanJson(residence3DDiscoverySchema()); document.head.append(schema);
  track('page_view', { path: '/3d-floorplans/', route: 'residence-3d-discovery' });
}
