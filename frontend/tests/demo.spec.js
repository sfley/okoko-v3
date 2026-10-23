import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const pages=[['','cockpit','Tableau de bord'],['chauffage','chauffage','Chauffage'],['analyse','analyse','Analyse'],['pellets','pellets','Pellets'],['meteo','meteo','Météo'],['system','systeme','Système']];
for (const viewport of [{name:'desktop',width:1440,height:1050},{name:'tablet',width:1024,height:900},{name:'mobile',width:390,height:844}]) {
  test(`${viewport.name}: six real static pages, no external API or overflow`,async({page})=>{
    await page.setViewportSize(viewport);
    const errors=[],apis=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(r.url().includes('/api/') || !r.url().startsWith('http://127.0.0.1:4173/')) apis.push(r.url());});
    await mkdir('../docs/screenshots',{recursive:true});
    await page.goto('./');
    for(const [path,name,label] of pages) {
      if(path) {
        if(viewport.width<=720) await page.getByRole('button',{name:'Ouvrir la navigation'}).click();
        await page.locator('aside nav').getByRole('link',{name:label,exact:true}).click();
      }
      await expect(page.locator('main h1')).toBeVisible();
      await expect(page.getByRole('complementary',{name:'Mode démonstration'})).toContainText('Données fictives');
      await expect(page.locator('.error-notice')).toHaveCount(0);
      await page.waitForTimeout(500);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
      if(!path) await expect(page.locator('.circuit-history .recharts-line-curve')).toHaveCount(2);
      if(path==='meteo') await expect(page.locator('.forecast-grid .forecast-temp')).toHaveCount(4);
      await page.screenshot({path:`../docs/screenshots/${viewport.name}-${name}.png`,fullPage:true});
    }
    expect(errors).toEqual([]);expect(apis).toEqual([]);
  });
}
test('cockpit: drag, resize, library and persistence use isolated demo storage',async({page})=>{
  await page.setViewportSize({width:1540,height:1100});
  await page.goto('./');
  await page.evaluate(()=>localStorage.setItem('okoko30.cockpit.v1','production-preserved'));
  await page.getByRole('button',{name:'Personnaliser',exact:true}).click();
  const boiler=page.locator('[data-widget="boiler"]');
  const before=await boiler.boundingBox();
  await page.getByRole('button',{name:'Retirer Météo',exact:true}).click();
  await page.getByRole('button',{name:'Ajouter un module',exact:true}).click();
  await page.getByRole('dialog').getByRole('button',{name:/Modulation/}).click();
  await page.getByRole('button',{name:'C’est parfait'}).click();
  const box=await boiler.locator('.widget-drag').boundingBox();
  await page.mouse.move(box.x+80,box.y+20);await page.mouse.down();
  await page.mouse.move(box.x+80,box.y+400,{steps:25});await page.mouse.up();
  await page.waitForTimeout(400);
  expect((await boiler.boundingBox()).y).not.toBe(before.y);
  const handle=await boiler.locator('.react-resizable-handle').boundingBox();
  const old=await boiler.boundingBox();
  await page.mouse.move(handle.x+12,handle.y+12);await page.mouse.down();
  await page.mouse.move(handle.x+12,handle.y+110,{steps:15});await page.mouse.up();
  await page.waitForTimeout(400);expect((await boiler.boundingBox()).height).toBeGreaterThan(old.height);
  const stored=JSON.parse(await page.evaluate(()=>localStorage.getItem('okoko.demo.cockpit.v1')));
  await page.getByRole('button',{name:'Terminer',exact:true}).click();
  await page.reload();await expect(page.locator('[data-widget="modulation"]')).toHaveCount(1);
  await expect(page.locator('[data-widget="weather"]')).toHaveCount(0);
  await page.waitForTimeout(250);
  const after=JSON.parse(await page.evaluate(()=>localStorage.getItem('okoko.demo.cockpit.v1')));
  const coordinates=rows=>rows.map(({i,x,y,w,h})=>({i,x,y,w,h}));
  expect(coordinates(after.layouts.lg)).toEqual(coordinates(stored.layouts.lg));
  expect(await page.evaluate(()=>localStorage.getItem('okoko30.cockpit.v1'))).toBe('production-preserved');
});
test('hash routes reload, Back/Forward and skip link work under the Pages subdirectory',async({page})=>{
  await page.goto('./#/meteo');await expect(page.locator('main h1')).toContainText('Un œil dehors');
  await page.reload();await expect(page.locator('.forecast-temp')).toHaveCount(4);
  await page.locator('aside nav').getByRole('link',{name:'Chauffage',exact:true}).click();
  await page.goBack();await expect(page.locator('.forecast-temp')).toHaveCount(4);
  await page.goForward();await expect(page.getByRole('heading',{name:'Chambres',exact:true})).toBeVisible();
  await page.locator('.skip-link').evaluate(el=>el.click());
  expect(new URL(page.url()).hash).toBe('#/chauffage');
  await expect(page.locator('main')).toBeFocused();
});
test('refills persist locally, reject duplicates and reset preserves production state',async({page})=>{
  await page.goto('./#/pellets');
  await page.evaluate(()=>localStorage.setItem('okoko30.cockpit.v1','keep'));
  async function add() {
    await page.getByRole('button',{name:'Ajouter une recharge',exact:true}).click();
    await page.getByLabel('Date de livraison').fill('2026-10-22');
    await page.getByLabel('Quantité en kg').fill('330');
    await page.getByLabel('Fournisseur').fill('Essai visiteur');
    await page.getByRole('button',{name:'Enregistrer la recharge'}).click();
  }
  await add();await expect(page.getByRole('status')).toContainText('Recharge enregistrée');
  await page.reload();await expect(page.locator('tbody')).toContainText('Essai visiteur');
  await add();await expect(page.getByRole('dialog')).toContainText('existe déjà');
  await page.getByRole('button',{name:'Annuler',exact:true}).click();
  await page.getByRole('button',{name:'Réinitialiser la démo',exact:true}).click();
  await expect(page.locator('main h1')).toBeVisible();await expect(page.locator('tbody')).not.toContainText('Essai visiteur');
  expect(await page.evaluate(()=>localStorage.getItem('okoko30.cockpit.v1'))).toBe('keep');
});
test('imports paginate, simulation updates journal and CSV export stays in browser',async({page})=>{
  const api=[];page.on('request',r=>{if(r.url().includes('/api/'))api.push(r.url());});
  await page.goto('./#/system');await expect(page.locator('tbody tr')).toHaveCount(10);
  await page.getByRole('button',{name:'Suivants',exact:true}).click();
  await page.getByRole('button',{name:'Suivants',exact:true}).click();
  await expect(page.locator('tbody tr')).toHaveCount(5);
  await page.getByRole('button',{name:'Précédents',exact:true}).click();
  await page.getByRole('button',{name:'Précédents',exact:true}).click();
  await page.getByRole('button',{name:'Simuler un import',exact:true}).click();
  await expect(page.locator('tbody tr').first()).toContainText('Import simulé');
  await expect(page.getByRole('button',{name:'Aucune base réelle dans la démo'})).toBeDisabled();
  await page.locator('aside nav').getByRole('link',{name:'Pellets',exact:true}).click();
  const downloaded=page.waitForEvent('download');
  await page.getByRole('link',{name:'Exporter le bilan'}).click();
  expect((await downloaded).suggestedFilename()).toBe('okoko-demo-bilan.csv');
  expect(api).toEqual([]);
});

test('public sharing metadata and crawl files are available without running an API',async({page,request})=>{
  await page.goto('./');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content',/OKOKO v3.*ÖkoFEN/);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content',/données fictives/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://sfley.github.io/okoko-v3/');
  const robots=await request.get('robots.txt');expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Sitemap: https://sfley.github.io/okoko-v3/sitemap.xml');
  const sitemap=await request.get('sitemap.xml');expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain('<loc>https://sfley.github.io/okoko-v3/</loc>');
  const preview=await request.get('preview.png');expect(preview.status()).toBe(200);
  expect((await preview.body()).subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
});
