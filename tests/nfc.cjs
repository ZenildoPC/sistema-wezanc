// Run with Playwright installed separately; the production app has no dependencies.
const {webkit} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const base = process.env.WEZANC_TEST_URL || 'http://127.0.0.1:8080';
(async () => {
  const browser = await webkit.launch();
  const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true});
  const page = await context.newPage();
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  const submit = id => page.locator(`#${id} [type="submit"]`).click();
  const stock = () => page.evaluate(()=>nfcStock());
  const openSale = () => page.locator('.page-head [data-action="nfc-sale"]').click();
  const movement = async (type,quantity,reason) => {
    await page.locator('.nfc-actions [data-action="nfc-stock"]').click();
    await page.locator('[name="tipo"]').selectOption(type);
    await page.locator('[name="quantidade"]').fill(String(quantity));
    await page.locator('[name="motivo"]').fill(reason);
    if(type==='Entrada de estoque')await page.locator('[name="custoLote"]').fill('250');
    await submit('nfc-stock-form');
  };
  try {
    await page.goto(base);
    await page.locator('#mobile-nav [data-action="menu"]').click();
    await page.locator('.menu-grid [data-page="nfc"]').click();
    assert.equal(await page.locator('h1').textContent(),'Plaquinhas NFC');
    assert.equal(await stock(),0);
    // NFC customer records must not create unrelated website projects.
    await page.locator('.nfc-actions [data-action="nfc-customer"]').click();
    await page.locator('[name="nome"]').fill('Ana Teste');
    await page.locator('[name="empresa"]').fill('Comércio Um');
    await submit('nfc-customer-form');
    assert.equal(await page.evaluate(()=>db.nfc.clientes.length),1);
    assert.equal(await page.evaluate(()=>db.clientes.length),0);
    await movement('Entrada de estoque',50,'Lote inicial');
    assert.equal(await stock(),50);
    await openSale();
    assert.equal(await page.locator('#nfc-new-customer-fields').isVisible(),false);
    await page.locator('[name="quantidade"]').fill('3');
    await page.locator('[name="valorVenda"]').fill('75');
    assert.match(await page.locator('#nfc-sale-preview').textContent(),/47/);
    await submit('nfc-sale-form');
    assert.equal(await stock(),47);
    assert.equal(await page.evaluate(()=>nfcSold()),3);
    const saleId=await page.evaluate(()=>db.nfc.movimentos.find(m=>m.tipo==='venda').id);
    await page.reload();await page.evaluate(()=>go('nfc'));
    assert.equal(await stock(),47,'Sale and stock must survive reload');
    // Inline customer creation and sale are saved in the same record.
    await openSale();
    await page.locator('#nfc-sale-customer').selectOption('new');
    assert.equal(await page.locator('#nfc-new-customer-fields').isVisible(),true);
    await page.locator('[name="nome"]').fill('Beto Teste');
    await page.locator('[name="empresa"]').fill('Comércio Dois <img src=x>');
    await page.locator('[name="notas"]').fill('Cadastro com a primeira compra');
    await page.locator('[name="quantidade"]').fill('5');
    await page.locator('[name="valorVenda"]').fill('150');
    await submit('nfc-sale-form');
    assert.equal(await stock(),42);
    assert.equal(await page.evaluate(()=>db.nfc.clientes.length),2);
    assert.equal(await page.locator('.nfc-customers img').count(),0,'Names must be escaped');
    assert.equal(await page.evaluate(()=>db.nfc.clientes[1].notas),'Cadastro com a primeira compra');
    // Browser validation and application validation both reject insufficient stock.
    await openSale();await page.locator('[name="quantidade"]').fill('43');
    assert.equal(await page.locator('[name="quantidade"]').evaluate(el=>el.checkValidity()),false);
    await page.locator('#nfc-sale-form').evaluate(el=>el.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
    assert.equal(await stock(),42);assert.equal(await page.evaluate(()=>db.nfc.movimentos.length),3);
    for(const quantity of ['0','-1','1.5']){
      await page.locator('[name="quantidade"]').fill(quantity);
      await page.locator('#nfc-sale-form').evaluate(el=>el.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
      assert.equal(await stock(),42);
    }
    await page.locator('[data-action="close"]').first().click();
    await movement('Saída / ajuste',2,'Peças danificadas');assert.equal(await stock(),40);
    await page.locator('.nfc-actions [data-action="nfc-stock"]').click();
    await page.locator('[name="tipo"]').selectOption('Saída / ajuste');
    await page.locator('[name="quantidade"]').fill('99');await page.locator('[name="motivo"]').fill('Saída inválida');
    await submit('nfc-stock-form');assert.equal(await stock(),40);
    await page.locator('[data-action="close"]').first().click();
    await page.locator(`[data-action="nfc-cancel-sale"][data-id="${saleId}"]`).click();
    await page.locator('[data-action="nfc-confirm-cancel-sale"]').click();
    assert.equal(await stock(),43);assert.equal(await page.evaluate(()=>nfcSold()),5);
    assert.deepEqual(await page.evaluate(()=>nfcInventory()),{quantidade:43,custoEstoque:21500,compras:25000,vendas:15000,custoVendido:2500});
    await page.evaluate(id=>{let b=document.createElement('button');b.dataset.action='nfc-confirm-cancel-sale';b.dataset.id=id;document.body.append(b);b.click();b.remove()},saleId);
    assert.equal(await stock(),43,'Cancellation cannot return stock twice');
    // Delete a customer without changing quantities or losing historical attribution.
    const secondId=await page.evaluate(()=>db.nfc.clientes[1].id);
    await page.locator(`[data-action="nfc-delete-customer"][data-id="${secondId}"]`).click();
    await page.locator('[data-action="nfc-confirm-delete-customer"]').click();
    assert.equal(await stock(),43);assert.equal(await page.evaluate(()=>nfcSold()),5);
    assert.equal(await page.evaluate(()=>db.nfc.clientes.length),1);
    assert.match(await page.locator('.nfc-section').last().textContent(),/Comércio Dois/);
    await page.reload();await page.evaluate(()=>go('nfc'));assert.equal(await stock(),43);
    // Export/import preserves the complete inventory and accepts older backups.
    const downloadEvent=page.waitForEvent('download');await page.evaluate(()=>exportBackup());
    const download=await downloadEvent;const backup=await fs.readFile(await download.path());
    assert.equal(JSON.parse(backup).nfc.movimentos.length,5);
    await page.locator('#import-file').setInputFiles({name:'backup-nfc.json',mimeType:'application/json',buffer:backup});
    await page.locator('[data-action="confirm-import"]').click();await page.reload();await page.evaluate(()=>go('nfc'));assert.equal(await stock(),43);
    assert(await page.evaluate(()=>{const old=normalize({clientes:[],prospects:[],transacoes:[]});return old.nfc.clientes.length===0&&old.nfc.movimentos.length===0}));
    assert(await page.evaluate(()=>{let bad=JSON.parse(JSON.stringify(db));bad.nfc.movimentos[0].quantidade=1;try{normalize(bad);return false}catch{return true}}),'Reject impossible negative inventory in backup');
    assert(await page.evaluate(()=>{let bad=JSON.parse(JSON.stringify(db));bad.nfc.movimentos.push({...bad.nfc.movimentos.find(m=>m.tipo==='estorno'),id:uid()});try{normalize(bad);return false}catch{return true}}),'Reject duplicate cancellation');
    assert(await page.evaluate(()=>{let bad=JSON.parse(JSON.stringify(db));bad.nfc.movimentos[0].quantidade=1.5;try{normalize(bad);return false}catch{return true}}),'Reject fractional inventory');
    await page.waitForFunction(async()=>{return (await readVersions()).some(v=>v.data.nfc?.movimentos?.length)});
    assert.equal(errors.length,0,errors.join('\n'));
    // Monetary snapshots cannot be altered into a false margin in imported backups.
    assert(await page.evaluate(()=>{let bad=JSON.parse(JSON.stringify(db));bad.nfc.movimentos.find(m=>m.tipo==='venda').custoCentavos=1;try{normalize(bad);return false}catch{return true}}));
    assert(await page.evaluate(()=>{let bad=JSON.parse(JSON.stringify(db));bad.nfc.movimentos.find(m=>m.tipo==='estorno').valorCentavos=1;try{normalize(bad);return false}catch{return true}}));
    // All NFC views and forms fit phone and both tablet orientations.
    const screenshots=process.env.WEZANC_SCREENSHOT_DIR;
    if(screenshots)await fs.mkdir(screenshots,{recursive:true});
    for(const [width,height] of [[375,667],[390,844],[768,1024],[1024,768],[1440,1000]]){
      await page.setViewportSize({width,height});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`NFC overflow at ${width}`);
      assert.equal(await page.locator('#sidebar').isVisible(),width>=700,'iPad must show its modules without opening a menu');
      assert.equal(await page.locator('#module-trigger').isVisible(),true);
      for(const module of ['home','leads','inbound','outbound','tasks','clients','finance','settings']){
        await page.evaluate(module=>go(module),module);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Module overflow ${module} at ${width}`);
      }
      await page.evaluate(()=>go('nfc'));
      for(const action of ['nfc-sale','nfc-stock','nfc-customer']){
        await page.locator(`[data-action="${action}"]`).first().click();
        assert(await page.evaluate(()=>{const r=document.querySelector('#modal').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1}),`Form overflow at ${width}`);
        await page.locator('[data-action="close"]').first().click();
      }
      if(screenshots&&[390,768,1440].includes(width)){
        await page.locator('#toast').evaluate(el=>el.classList.remove('show'));
        await page.screenshot({path:path.join(screenshots,`nfc-${width}.png`)});
      }
    }
    // Weighted average costs and cent rounding are checked independently of the UI.
    assert(await page.evaluate(()=>{
      const nfc={clientes:[],movimentos:[{id:'a',tipo:'entrada',quantidade:10,custoCentavos:10000,data:today()},{id:'b',tipo:'entrada',quantidade:10,custoCentavos:30000,data:today()},{id:'c',tipo:'venda',quantidade:5,clienteId:'x',clienteNome:'Teste',custoCentavos:10000,valorCentavos:20000,data:today()}]};
      const normalized=normalizeNfc(nfc);const current=db;db={...blank(),nfc:normalized};const result=nfcInventory();db=current;
      return result.quantidade===15&&result.custoEstoque===30000&&result.vendas-result.custoVendido===10000&&nfcCostOf(1,3,1000)===333&&nfcCostOf(1,2,667)===334&&nfcCostOf(1,1,333)===333;
    }));
    console.log('PASS: NFC mobile navigation, customers, automatic inventory, inline client/sale, reload persistence, quantity/stock validation, adjustments, cancellation idempotency, deletion history, backup round-trip, legacy migration, recovery history and responsive forms at five sizes.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
