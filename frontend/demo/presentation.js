// Metadata belongs to the public demonstration, never to the private local app.
import { copyFileSync, writeFileSync } from 'node:fs';

const site = 'https://sfley.github.io/okoko-v3/';
const title = 'OKOKO v3 · Supervision ÖkoFEN — démo interactive';
const description = 'Découvrez OKOKO : tableau de bord personnalisable, chauffage, historiques et suivi des pellets pour ÖkoFEN. Logiciel libre, données locales. Démo avec données fictives.';

export function publicDemoPresentation() {
  return {
    name: 'public-demo-presentation',
    transformIndexHtml(html) {
      const metadata = [
        ['og:type', 'website'], ['og:locale', 'fr_FR'], ['og:site_name', 'OKOKO v3'],
        ['og:url', site], ['og:title', title], ['og:description', description],
        ['og:image', site + 'preview.png'],
        ['og:image:alt', 'Capture du tableau de bord OKOKO avec le bandeau Données fictives'],
      ].map(([property, content]) => ({ tag: 'meta', attrs: { property, content } }));
      return {
        html: html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
          .replace(/(<meta name="description" content=")[^"]*("\s*\/?>)/, `$1${description}$2`),
        tags: [
          ...metadata,
          { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
          { tag: 'meta', attrs: { name: 'robots', content: 'index,follow' } },
          { tag: 'link', attrs: { rel: 'canonical', href: site } },
          { tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify({
            '@context': 'https://schema.org', '@type': 'SoftwareApplication',
            name: 'OKOKO v3', description, url: site, image: site + 'preview.png',
            applicationCategory: 'UtilitiesApplication', operatingSystem: 'Linux, OpenWrt ARM64',
            isAccessibleForFree: true, license: 'https://github.com/sfley/okoko-v3/blob/main/LICENSE',
          }) },
        ],
      };
    },
    closeBundle() {
      const output = new URL('../../demo-dist/', import.meta.url);
      copyFileSync(new URL('../../docs/screenshots/desktop-cockpit.png', import.meta.url), new URL('preview.png', output));
      writeFileSync(new URL('robots.txt', output), `User-agent: *\nAllow: /\nSitemap: ${site}sitemap.xml\n`);
      writeFileSync(new URL('sitemap.xml', output), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${site}</loc></url></urlset>\n`);
    },
  };
}
