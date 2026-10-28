'use strict';

const icons = {
  nfc: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9v6m4-7a5 5 0 0 1 0 8m4-10a8 8 0 0 1 0 12"/>',
  home: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  leads: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  inbound: '<path d="M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5"/>',
  outbound: '<path d="m5 17 14-14M10 3h9v9M19 14v6H4V5h6"/>',
  lost: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-13 5 5m0-5-5 5"/>',
  tasks: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8 12 3 3 5-6"/>',
  maintenance: '<path d="M20 7a9 9 0 0 0-15-1L2 9m0-6v6h6m-4 8a9 9 0 0 0 15 1l3-3m0 6v-6h-6"/>',
  clients: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-16a3 3 0 0 1 0 6m1 4a4 4 0 0 1 3 4v2"/>',
  finance: '<path d="M4 3v17h17M9 16V9m5 7V5m5 11v-5"/>',
  ai: '<rect x="4" y="7" width="16" height="13" rx="4"/><path d="M12 3v4M8 12v3m8-3v3M1 12v4m22-4v4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor"/><circle cx="15" cy="17" r="3" fill="currentColor"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  phone: '<path d="M6 3H3v5c0 7 6 13 13 13h5v-5l-5-2-2 3-7-7 3-2-2-5Z"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18"/>',
  edit: '<path d="m4 16-1 5 5-1L20 8l-4-4ZM14 6l4 4"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  shield: '<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Z"/><path d="m8 12 3 3 5-6"/>'
};
const icon = n => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[n] || icons.home}</svg>`;
const $ = s => document.querySelector(s),
  esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
const money = n => Number(n || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }),
  today = () => {
    let d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },
  date = s => s ? new Date(s.slice(0, 10) + 'T12:00:00').toLocaleDateString('pt-BR') : '—',
  uid = () => crypto.randomUUID();
const IN = 'Inbound (Instagram / Leads)',
  OUT = 'Outbound Ativo',
  KEY = 'wezanc_workspace_v1';
const stages = {
  inbound: [['01_briefing', 'Briefing'], ['02_branding', 'Branding'], ['03_desenvolvimento', 'Desenvolvimento'], ['04_validacao', 'Validação'], ['05_fechamento', 'Fechamento'], ['06_em_garantia', 'Garantia'], ['08_concluido', 'Concluído']],
  outbound: [['01_raio_x', 'Raio-X'], ['02_prototipagem', 'Prototipagem'], ['03_abordagem', 'Abordagem'], ['04_fechamento', 'Fechamento'], ['05_em_garantia', 'Garantia'], ['07_concluido', 'Concluído']]
};
const taskNames = ['Briefing e coleta de materiais', 'Domínio e configuração de DNS', 'Hospedagem e servidor', 'Estrutura e layout do site', 'WhatsApp e links oficiais', 'Responsividade no celular e iPad', 'Validação com o cliente', 'Publicação e início da garantia'];
const newTasks = () => taskNames.map(titulo => ({
  id: uid(),
  titulo,
  concluida: false
}));
const blank = () => ({
  clientes: [],
  prospects: [],
  transacoes: [],
  activity: [],
  nfc: { clientes: [], movimentos: [] },
  version: 2
});
let db = blank(),
  loadError = false,
  demo = false,
  realDb = null,
  page = 'home',
  query = '',
  filter = 'all',
  stageFilter = 'all',
  period = 'all',
  toastTimer;
let localRevision = 0,
  storageFailed = false,
  confirmedRaw = '',
  backupDbPromise;
try {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    db = normalize(JSON.parse(raw));
    localRevision = Number(JSON.parse(raw)._revision) || 0;
    confirmedRaw = raw;
  }
} catch {
  try {
    const previous = localStorage.getItem(KEY + '_last_good');
    if (previous) {
      db = normalize(JSON.parse(previous));
      confirmedRaw = previous;
      localRevision = Number(JSON.parse(previous)._revision) || 0;
      loadError = true;
    } else loadError = true;
  } catch {
    loadError = true;
  }
}
function normalize(raw) {
  if (!raw || !Array.isArray(raw.clientes) || !Array.isArray(raw.prospects) || !Array.isArray(raw.transacoes)) throw Error('Estrutura de backup inválida.');
  if (raw.clientes.length + raw.prospects.length + raw.transacoes.length > 50000) throw Error('Backup muito grande.');
  let out = blank();
  for (let key of ['clientes', 'prospects', 'transacoes']) {
    const ids = new Set();
    out[key] = raw[key].map(r => {
      if (!r || typeof r !== 'object' || Array.isArray(r)) throw Error('Registro inválido.');
      let id = String(r.id ?? uid());
      if (ids.has(id)) throw Error('Há identificadores duplicados no backup.');
      ids.add(id);
      if (key === 'clientes') {
        if (typeof r.nome !== 'string') throw Error('Cliente sem nome válido.');
        return {
          ...r,
          id,
          nome: r.nome,
          empresa: String(r.empresa || ''),
          whatsapp: String(r.whatsapp || ''),
          origem: r.origem || IN,
          statusInbound: r.statusInbound || '01_briefing',
          statusOutbound: r.statusOutbound || '01_raio_x',
          valorPago: finite(r.valorPago),
          valorPlanoManutencao: finite(r.valorPlanoManutencao ?? 150),
          diaVencimentoManutencao: Math.max(1, Math.min(28, Number(r.diaVencimentoManutencao) || 10)),
          tarefasTecnicas: Array.isArray(r.tarefasTecnicas) ? r.tarefasTecnicas.map(t => ({
            id: String(t.id ?? uid()),
            titulo: String(t.titulo || ''),
            concluida: !!t.concluida
          })) : newTasks()
        };
      }
      if (key === 'prospects') return {
        ...r,
        id,
        nome: String(r.nome || ''),
        empresa: String(r.empresa || ''),
        whatsapp: String(r.whatsapp || ''),
        notas: String(r.notas || '')
      };
      return {
        ...r,
        id,
        clienteId: r.clienteId ? String(r.clienteId) : undefined,
        descricao: String(r.descricao || ''),
        tipo: ['Receita', 'Despesa', 'Manutenção MRR'].includes(r.tipo) ? r.tipo : 'Receita',
        valor: finite(r.valor),
        data: /^\d{4}-\d{2}-\d{2}/.test(r.data) ? r.data.slice(0, 10) : today()
      };
    });
  }
  out.activity = Array.isArray(raw.activity) ? raw.activity.slice(0, 50).map(a => ({
    text: String(a.text || ''),
    at: String(a.at || today()),
    type: String(a.type || 'check')
  })) : [];
  out.nfc = normalizeNfc(raw.nfc);
  return out;
}
function finite(v) {
  let n = Number(v || 0);
  if (!Number.isFinite(n) || n < 0) throw Error('Valor financeiro inválido.');
  return n;
}
function storageBadge(text, failed = false) {
  const el = $('.local-badge');
  if (el) {
    el.innerHTML = '<i></i>' + esc(text);
    el.classList.toggle('failed', failed);
  }
  const sidebarStatus = $('.sidebar-local');
  if (sidebarStatus) {sidebarStatus.innerHTML = icon('shield') + esc(text); sidebarStatus.classList.toggle('failed', failed);}
}
function openBackupDb() {
  if (!backupDbPromise) backupDbPromise = new Promise((resolve, reject) => {
    const r = indexedDB.open('wezanc_recovery', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('versions', {
      keyPath: 'revision'
    });
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  return backupDbPromise;
}
async function backupVersion(raw) {
  if (!raw) return;
  try {
    const data = JSON.parse(raw),
      revision = Number(data._revision) || 0;
    const database = await openBackupDb();
    await new Promise((resolve, reject) => {
      const tx = database.transaction('versions', 'readwrite'),
        store = tx.objectStore('versions');
      store.put({
        revision,
        at: data._savedAt || new Date().toISOString(),
        data
      });
      const req = store.getAllKeys();
      req.onsuccess = () => {
        req.result.sort((a, b) => a - b).slice(0, -50).forEach(key => store.delete(key));
      };
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    storageBadge('Salvo · histórico indisponível', true);
  }
}
function save(message) {
  if (demo) {
    toast('Alteração na demonstração.');
    return true;
  }
  try {
    const latest = localStorage.getItem(KEY);
    if ((latest || '') !== confirmedRaw) {
      storageFailed = true;
      modal('Base alterada em outra aba', `<p class="card-text">Esta edição não sobrescreveu a versão mais recente. Exporte sua edição antes de carregar a base atual.</p><div class="actions">${btn('Exportar minha edição', 'export', 'download')}${btn('Carregar base atual', 'reload-local', 'maintenance', 'secondary')}</div>`);
      return false;
    }
    const next = JSON.stringify({
      ...db,
      _revision: localRevision + 1,
      _savedAt: new Date().toISOString()
    });
    if (confirmedRaw) {
      try {
        normalize(JSON.parse(confirmedRaw));
        localStorage.setItem(KEY + '_last_good', confirmedRaw);
      } catch {}
    }
    localStorage.setItem(KEY, next);
    void backupVersion(confirmedRaw);
    confirmedRaw = next;
    localRevision++;
    storageFailed = false;
    loadError = false;
    storageBadge('Salvo neste navegador');
    if (message) toast(message);
    return true;
  } catch {
    storageFailed = true;
    storageBadge('Não foi possível salvar', true);
    toast('Armazenamento indisponível ou cheio. Exporte sua base antes de sair.');
    return false;
  }
}
function log(text, type = 'check') {
  db.activity.unshift({
    text,
    type,
    at: new Date().toISOString()
  });
  db.activity = db.activity.slice(0, 50);
}
function toast(text) {
  $('#toast').textContent = text;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 4200);
}
const lost = c => c.statusInbound === '07_nao_fechou' || c.statusOutbound === '06_nao_fechou';
const flow = c => c.origem === IN ? 'inbound' : 'outbound',
  status = c => c[flow(c) === 'inbound' ? 'statusInbound' : 'statusOutbound'];
const statusName = c => lost(c) ? 'Não fechado' : (stages[flow(c)].find(s => s[0] === status(c)) || ['', 'Em andamento'])[1];
const complete = c => status(c) === '08_concluido' || flow(c) === 'outbound' && status(c) === '07_concluido';
const active = () => db.clientes.filter(c => !lost(c) && !complete(c));
const matches = c => [c.nome, c.empresa, c.whatsapp, c.documento, c.notas, c.notasAnotacoes].join(' ').toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'));
const btn = (label, action, ic = 'plus', kind = '', id = '') => `<button class="btn ${kind}" data-action="${action}" ${id ? `data-id="${esc(id)}"` : ''}>${icon(ic)}${label}</button>`;
const empty = (title, text, action = '', label = 'Adicionar') => `<div class="empty full"><div class="empty-icon">${icon('spark')}</div><h3>${title}</h3><p>${text}</p>${action ? btn(label, action) : ''}</div>`;
// Physical inventory is calculated from its movements, never from an editable total.
function nfcQuantity(value) {
  const quantity = Number(value);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 1000000) throw Error('Informe uma quantidade inteira entre 1 e 1.000.000.');
  return quantity;
}
function normalizeNfc(raw) {
  if (raw === undefined) return {clientes: [], movimentos: []};
  if (!raw || !Array.isArray(raw.clientes) || !Array.isArray(raw.movimentos) || raw.clientes.length + raw.movimentos.length > 50000) throw Error('Dados NFC inválidos no backup.');
  const ids = new Set();
  const clientes = raw.clientes.map(c => {
    if (!c || typeof c.id !== 'string' || !c.id || typeof c.nome !== 'string' || !c.nome.trim() || ids.has(c.id)) throw Error('Cliente NFC inválido ou duplicado.');
    ids.add(c.id);
    return {id: c.id, nome: c.nome, empresa: String(c.empresa || ''), whatsapp: String(c.whatsapp || ''), notas: String(c.notas || '')};
  });
  ids.clear();
  const sales = new Map(), cancelled = new Set();
  let balance = 0, costBalance = 0;
  const movimentos = raw.movimentos.map(m => {
    if (!m || typeof m.id !== 'string' || !m.id || ids.has(m.id) || !['entrada', 'venda', 'saida', 'estorno'].includes(m.tipo) || !/^\d{4}-\d{2}-\d{2}$/.test(m.data)) throw Error('Movimentação NFC inválida ou duplicada.');
    ids.add(m.id);
    const quantity = nfcQuantity(m.quantidade);
    if (m.tipo === 'venda') {
      if (!m.clienteId || !m.clienteNome) throw Error('Venda NFC sem cliente.');
      sales.set(m.id, {quantidade: quantity, custoCentavos: m.custoCentavos ?? nfcCostOf(quantity, balance, costBalance), valorCentavos: m.valorCentavos ?? 0});
    }
    if (m.tipo === 'estorno') {
      if (!sales.has(m.vendaId) || cancelled.has(m.vendaId) || sales.get(m.vendaId).quantidade !== quantity) throw Error('Estorno NFC inválido ou repetido.');
      cancelled.add(m.vendaId);
    }
    const original = m.tipo === 'estorno' ? sales.get(m.vendaId) : null;
    const expectedCost = ['venda', 'saida'].includes(m.tipo) ? nfcCostOf(quantity, balance, costBalance) : original?.custoCentavos;
    const cost = nfcCents(m.custoCentavos ?? expectedCost ?? 0);
    const value = nfcCents(m.valorCentavos ?? original?.valorCentavos ?? 0);
    if ((expectedCost !== undefined && cost !== expectedCost) || (original && value !== original.valorCentavos)) throw Error('Custos ou valores NFC inconsistentes no backup.');
    costBalance += ['entrada', 'estorno'].includes(m.tipo) ? cost : -cost;
    if (!Number.isSafeInteger(costBalance) || costBalance < 0) throw Error('Custo do estoque NFC inválido.');
    balance += ['entrada', 'estorno'].includes(m.tipo) ? quantity : -quantity;
    if (!Number.isSafeInteger(balance) || balance < 0) throw Error('O histórico NFC resultaria em estoque negativo.');
    return {id: m.id, tipo: m.tipo, quantidade: quantity, custoCentavos: cost, valorCentavos: value, data: m.data, criadoEm: String(m.criadoEm || m.data), motivo: String(m.motivo || ''), ...(m.clienteId ? {clienteId: String(m.clienteId), clienteNome: String(m.clienteNome || ''), clienteEmpresa: String(m.clienteEmpresa || '')} : {}), ...(m.tipo === 'estorno' ? {vendaId: String(m.vendaId)} : {})};
  });
  return {clientes, movimentos};
}
function nfcCents(value) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 1000000000000) throw Error('Valor NFC inválido.');
  return value;
}
function nfcMoney(value) {
  if (value === undefined || String(value).trim() === '') throw Error('Informe o valor em reais. Use zero apenas quando não houver custo ou cobrança.');
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) throw Error('Informe um valor em reais maior ou igual a zero.');
  return nfcCents(Math.round((amount + Number.EPSILON) * 100));
}
function nfcCostOf(quantity, stock, value) {
  if (quantity > stock) throw Error('A quantidade ultrapassa o estoque disponível.');
  return quantity === stock ? value : Math.round(value * (quantity / stock));
}
function nfcInventory() {
  return db.nfc.movimentos.reduce((out, m) => {
    const incoming = ['entrada', 'estorno'].includes(m.tipo);
    out.quantidade += incoming ? m.quantidade : -m.quantidade;
    out.custoEstoque += incoming ? (m.custoCentavos || 0) : -(m.custoCentavos || 0);
    if (m.tipo === 'entrada') out.compras += m.custoCentavos || 0;
    if (m.tipo === 'venda' || m.tipo === 'estorno') {
      const sign = m.tipo === 'venda' ? 1 : -1;
      out.vendas += sign * (m.valorCentavos || 0);
      out.custoVendido += sign * (m.custoCentavos || 0);
    }
    return out;
  }, {quantidade:0, custoEstoque:0, compras:0, vendas:0, custoVendido:0});
}
function nfcStock() { return nfcInventory().quantidade; }
function nfcCustomerRevenue(id) {
  return db.nfc.movimentos.filter(m => m.clienteId === id && m.tipo === 'venda' && !nfcCancelled(m.id)).reduce((sum,m) => sum + (m.valorCentavos || 0),0);
}
function nfcCancelled(id) {
  return db.nfc.movimentos.some(m => m.tipo === 'estorno' && m.vendaId === id);
}
function nfcSold(customerId) {
  return db.nfc.movimentos.filter(m => m.tipo === 'venda' && (!customerId || m.clienteId === customerId) && !nfcCancelled(m.id)).reduce((total, m) => total + m.quantidade, 0);
}
function nfcPage() {
  const stock = nfcStock(), totals = nfcInventory();
  const customers = db.nfc.clientes.filter(matches);
  const movements = [...db.nfc.movimentos].reverse().filter(m => [m.clienteNome, m.clienteEmpresa, m.motivo, ({entrada:'entrada', venda:'venda', saida:'saída ajuste', estorno:'cancelamento devolução'})[m.tipo]].join(' ').toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
  return head('Plaquinhas NFC', 'Estoque físico, clientes e vendas para os comércios.', btn('Registrar venda', 'nfc-sale', 'outbound')) +
    `<section class="stats nfc-stats">${stat('Plaquinhas disponíveis', stock, nfcSold() + ' unidades vendidas (líquidas)', 'nfc')}${stat('Valor vendido', money(totals.vendas / 100), 'Vendas menos cancelamentos', 'outbound')}${stat('Lucro bruto', money((totals.vendas - totals.custoVendido) / 100), 'Vendas menos custo das unidades', 'finance')}${stat('Custo dos lotes comprados', money(totals.compras / 100), 'Total pago nas entradas de estoque', 'inbound')}${stat('Custo do estoque atual', money(totals.custoEstoque / 100), 'Valor das unidades ainda disponíveis', 'nfc')}${stat('Custo das unidades vendidas', money(totals.custoVendido / 100), 'Calculado pelo custo médio', 'finance')}</section>` +
    `<div class="nfc-actions actions">${btn('Entrada / ajuste de estoque', 'nfc-stock', 'plus', 'secondary')}${btn('Novo cliente NFC', 'nfc-customer', 'clients', 'secondary')}<span class="sub">Cada venda baixa o estoque automaticamente.</span></div>` +
    searchBar() + `<section class="panel nfc-section"><div class="panel-head"><div><h2>Clientes dos comércios</h2><p>Quantidade de plaquinhas por cliente</p></div><span class="sub">${customers.length} clientes</span></div>${customers.length ? `<div class="table-wrap nfc-customers nfc-customers-table"><table class="responsive-table"><thead><tr><th>COMÉRCIO</th><th>RESPONSÁVEL / CONTATO</th><th>PLAQUINHAS</th><th>VALOR VENDIDO</th><th>AÇÕES</th></tr></thead><tbody>${customers.map(c=>`<tr><td><strong>${esc(c.empresa || c.nome)}</strong>${c.notas?`<small>${esc(c.notas)}</small>`:''}</td><td>${esc(c.nome)}${c.whatsapp?`<small>${esc(c.whatsapp)}</small>`:''}</td><td><span class="tag">${nfcSold(c.id)} un.</span></td><td>${money(nfcCustomerRevenue(c.id) / 100)}</td><td><div class="nfc-row-actions">${btn('Nova venda','nfc-sale','plus','secondary',c.id)}<button class="icon-button" data-action="nfc-edit-customer" data-id="${esc(c.id)}" aria-label="Editar ${esc(c.nome)}">${icon('edit')}</button><button class="icon-button" data-action="nfc-delete-customer" data-id="${esc(c.id)}" aria-label="Remover ${esc(c.nome)}">${icon('trash')}</button></div></td></tr>`).join('')}</tbody></table></div>` : empty(query ? 'Nenhum cliente encontrado' : 'Cadastre seu primeiro comércio', query ? 'Tente outro nome ou remova a busca.' : 'Adicione o cliente e informe a quantidade vendida para dar baixa nas plaquinhas.', query ? '' : 'nfc-customer', 'Novo cliente NFC')}</section>` +
    `<section class="panel nfc-section"><div class="panel-head"><div><h2>Histórico de estoque</h2><p>Entradas, vendas, ajustes e devoluções</p></div><span class="sub">${movements.length} movimentos</span></div>${movements.length ? `<div class="table-wrap"><table class="responsive-table"><thead><tr><th>MOVIMENTAÇÃO</th><th>QUANTIDADE</th><th>VALOR / CUSTO</th><th>DATA</th><th>AÇÃO</th></tr></thead><tbody>${movements.map(m => {
      const cancelled = m.tipo === 'venda' && nfcCancelled(m.id);
      const label = ({entrada:'Entrada de estoque', venda:cancelled?'Venda cancelada':'Venda de plaquinhas', saida:'Saída / ajuste', estorno:'Devolução ao estoque'})[m.tipo];
      return `<tr><td><strong>${label}</strong><small>${esc(m.clienteEmpresa || m.clienteNome || m.motivo)}${m.clienteNome && m.motivo ? ' · ' + esc(m.motivo) : ''}</small></td><td class="${['entrada','estorno'].includes(m.tipo) ? 'positive' : 'negative'}">${['entrada','estorno'].includes(m.tipo) ? '+' : '−'} ${m.quantidade} un.</td><td>${money((m.tipo === 'venda' || m.tipo === 'estorno' ? m.valorCentavos : m.custoCentavos) / 100)}<small>${m.tipo === 'venda' ? 'Custo: ' + money(m.custoCentavos / 100) : m.tipo === 'estorno' ? 'Valor de venda estornado' : 'Custo das unidades'}</small></td><td>${date(m.data)}</td><td>${m.tipo === 'venda' ? cancelled ? '<span class="tag gray">Cancelada</span>' : btn('Cancelar venda', 'nfc-cancel-sale', 'maintenance', 'ghost', m.id) : '<span class="sub">Registrado</span>'}</td></tr>`;
    }).join('')}</tbody></table></div>` : empty('Nenhuma movimentação', 'Comece registrando a quantidade de plaquinhas que você tem em mãos.', 'nfc-stock', 'Adicionar estoque')}</section>`;
}
function nfcCustomerFields(c = {}) {
  return `${field('Responsável *', 'nome', c.nome, 'text', 'required maxlength="120" autocomplete="name"')}${field('Comércio *', 'empresa', c.empresa, 'text', 'required maxlength="160" autocomplete="organization"')}${field('WhatsApp com DDD', 'whatsapp', c.whatsapp, 'tel', 'maxlength="22" autocomplete="tel"')}<label class="field full">Observações<textarea name="notas" maxlength="3000">${esc(c.notas)}</textarea></label>`;
}
function nfcCustomerForm(id) {
  const customer = db.nfc.clientes.find(c => c.id === id);
  if (id && !customer) return;
  modal(id ? 'Editar cliente NFC' : 'Novo cliente NFC', `<form id="nfc-customer-form" data-id="${esc(id || '')}"><div class="form-grid">${nfcCustomerFields(customer)}</div>${footer('Salvar cliente NFC')}</form>`);
}
function nfcSaleForm(customerId) {
  if (nfcStock() === 0) {
    modal('Estoque sem plaquinhas', `<p class="card-text">Registre as unidades que você tem em mãos antes de lançar uma venda.</p>${btn('Adicionar estoque', 'nfc-stock', 'plus')}`);
    return;
  }
  const hasCustomers = db.nfc.clientes.length > 0;
  modal('Registrar venda NFC', `<form id="nfc-sale-form"><div class="notice">${icon('nfc')}<span><strong>${nfcStock()} plaquinhas disponíveis.</strong> A quantidade será descontada ao salvar a venda.</span></div><div class="form-grid"><label class="field full">Cliente / comércio *<select id="nfc-sale-customer" name="clienteId">${db.nfc.clientes.map(c => `<option value="${esc(c.id)}" ${c.id === customerId ? 'selected' : ''}>${esc(c.empresa || c.nome)} · ${esc(c.nome)}</option>`).join('')}<option value="new" ${!hasCustomers ? 'selected' : ''}>+ Cadastrar novo cliente</option></select></label><div class="form-grid full" id="nfc-new-customer-fields" ${hasCustomers ? 'hidden' : ''}>${nfcCustomerFields()}</div>${field('Quantidade de plaquinhas *', 'quantidade', 1, 'number', `required min="1" max="${nfcStock()}" step="1" inputmode="numeric"`)}${field('Valor total da venda (R$) *', 'valorVenda', '', 'number', 'required min="0" step="0.01" inputmode="decimal"')}${field('Data da venda *', 'data', today(), 'date', 'required')}<label class="field full">Observação da venda<input name="motivo" maxlength="500" placeholder="Ex.: plaquinha de avaliações do Google"></label></div><p class="sub nfc-sale-preview" id="nfc-sale-preview" aria-live="polite">Após esta venda: ${nfcStock() - 1} plaquinhas em estoque.</p>${footer('Registrar venda')}</form>`);
  $('#nfc-new-customer-fields').querySelectorAll('input,textarea').forEach(input => input.disabled = hasCustomers);
}
function updateNfcSalePreview(input) {
  const quantity = Number(input.value);
  const preview = $('#nfc-sale-preview');
  if (preview) preview.textContent = Number.isSafeInteger(quantity) && quantity > 0 && quantity <= nfcStock() ? `Após esta venda: ${nfcStock() - quantity} plaquinhas em estoque.` : 'Informe uma quantidade válida, dentro do estoque disponível.';
}
function nfcStockForm() {
  modal('Entrada / ajuste de estoque', `<form id="nfc-stock-form"><div class="notice">${icon('nfc')}<span>Saldo atual: <strong>${nfcStock()} plaquinhas.</strong></span></div><div class="form-grid">${select('Tipo de movimentação', 'tipo', ['Entrada de estoque', 'Saída / ajuste'], 'Entrada de estoque')}${field('Quantidade *', 'quantidade', '', 'number', 'required min="1" max="1000000" step="1" inputmode="numeric"')}<label class="field" id="nfc-purchase-cost">Custo total pago neste lote (R$) *<input name="custoLote" type="number" required min="0" step="0.01" inputmode="decimal"><small>Informe o valor de todo o lote; o custo por unidade será calculado.</small></label>${field('Data *', 'data', today(), 'date', 'required')}<label class="field full">Motivo *<input name="motivo" required maxlength="500" placeholder="Ex.: lote comprado, estoque inicial ou peça danificada"></label></div>${footer('Salvar movimentação')}</form>`);
}
function readNfcCustomer(data, id = uid()) {
  if (!data.nome?.trim() || !data.empresa?.trim()) throw Error('Informe o responsável e o nome do comércio.');
  if (data.whatsapp && data.whatsapp.replace(/\D/g, '').length < 10) throw Error('Informe um WhatsApp com DDD ou deixe o contato em branco.');
  return {id, nome: data.nome.trim(), empresa: data.empresa.trim(), whatsapp: data.whatsapp || '', notas: data.notas || ''};
}
function handleNfcSubmit(form) {
  if ((storageFailed || loadError) && !demo) {toast('Resolva o armazenamento antes de editar.'); return;}
  const data = Object.fromEntries(new FormData(form));
  try {
    if (form.id === 'nfc-customer-form') {
      const customer = readNfcCustomer(data, form.dataset.id || uid());
      if (form.dataset.id && !db.nfc.clientes.some(c => c.id === form.dataset.id)) throw Error('Cliente não encontrado. Reabra o cadastro.');
      db.nfc.clientes = form.dataset.id ? db.nfc.clientes.map(c => c.id === customer.id ? customer : c) : [...db.nfc.clientes, customer];
      log(`Cliente NFC: ${customer.empresa}`, 'nfc');
    } else {
      const quantity = nfcQuantity(data.quantidade);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.data)) throw Error('Informe uma data válida.');
      if (form.id === 'nfc-stock-form') {
        const type = data.tipo === 'Entrada de estoque' ? 'entrada' : 'saida';
        const totals = nfcInventory();
        const cost = type === 'entrada' ? nfcMoney(data.custoLote) : nfcCostOf(quantity, totals.quantidade, totals.custoEstoque);
        if (!data.motivo?.trim()) throw Error('Informe o motivo da movimentação.');
        if (type === 'saida' && quantity > nfcStock()) throw Error('A saída ultrapassa o estoque disponível.');
        db.nfc.movimentos.push({id: uid(), tipo: type, quantidade: quantity, custoCentavos: cost, valorCentavos: 0, data: data.data, motivo: data.motivo.trim(), criadoEm: new Date().toISOString()});
        log(`NFC: ${type === 'entrada' ? '+' : '−'}${quantity} plaquinhas no estoque`, 'nfc');
      } else {
        if (quantity > nfcStock()) throw Error('Não há plaquinhas suficientes para essa venda.');
        const totals = nfcInventory(), value = nfcMoney(data.valorVenda), cost = nfcCostOf(quantity, totals.quantidade, totals.custoEstoque);
        const customer = data.clienteId === 'new' ? readNfcCustomer(data) : db.nfc.clientes.find(c => c.id === data.clienteId);
        if (!customer) throw Error('Selecione um cliente para a venda.');
        // Customer, sale and inventory change are persisted together by the same save().
        if (data.clienteId === 'new') db.nfc.clientes.push(customer);
        db.nfc.movimentos.push({id: uid(), tipo: 'venda', quantidade: quantity, valorCentavos: value, custoCentavos: cost, clienteId: customer.id, clienteNome: customer.nome, clienteEmpresa: customer.empresa, data: data.data, motivo: data.motivo || '', criadoEm: new Date().toISOString()});
        log(`Venda NFC: ${quantity} plaquinhas para ${customer.empresa}`, 'nfc');
      }
    }
    if (save(form.id === 'nfc-sale-form' ? 'Venda registrada. Estoque atualizado automaticamente.' : 'Dados NFC salvos neste navegador.')) close();
    render();
  } catch (err) {toast(err.message);}
}

const titles = {
  home: 'Visão geral',
  leads: 'Banco de leads',
  inbound: 'Pipeline inbound',
  outbound: 'Pipeline outbound',
  lost: 'Não fechados',
  tasks: 'Projetos e tarefas',
  maintenance: 'Manutenção recorrente',
  clients: 'Clientes',
  finance: 'Financeiro',
  nfc: 'Plaquinhas NFC',
  ai: 'Agentes de IA',
  settings: 'Configurações'
};
const moduleDescriptions = {home:'Resumo e acessos rápidos',nfc:'Estoque, custos e vendas',leads:'Prospecção e contatos',inbound:'Clientes que chegam até você',outbound:'Vendas e oportunidades',lost:'Retomar negociações',tasks:'Checklists e entregas',clients:'Contatos e histórico',maintenance:'Planos e recorrência',finance:'Recebimentos e despesas',ai:'Especialistas e ferramentas',settings:'Backups e preferências'};
function nav() {
  const groups = [['INÍCIO', ['home']], ['PRODUTOS', ['nfc']], ['COMERCIAL', ['leads', 'inbound', 'outbound', 'lost']], ['GESTÃO', ['tasks', 'clients', 'maintenance', 'finance']], ['FERRAMENTAS', ['ai', 'settings']]];
  $('#sidebar').innerHTML = `<button class="brand" data-page="home" aria-label="Wezanc — início"><img src="icon.svg" alt=""><div><strong>WEZANC</strong><small>GESTÃO EMPRESARIAL</small></div></button><nav class="sidebar-navigation" aria-label="Módulos do sistema">${groups.map(([name,pages])=>`<div class="nav-label">${name}</div>${pages.map(p=>`<button class="nav-item ${page===p?'active':''}" data-page="${p}" ${page===p?'aria-current="page"':''}>${icon(p)}<span>${({home:'Painel inicial',inbound:'Inbound',outbound:'Outbound',maintenance:'Manutenção',settings:'Backup e ajustes'})[p]||titles[p]}</span>${p==='nfc'?`<span class="nav-count">${nfcStock()}</span>`:p==='leads'?`<span class="nav-count">${db.prospects.length}</span>`:''}</button>`).join('')}`).join('')}</nav><div class="sidebar-local">${icon('shield')} Salvo neste navegador</div>`;
  $('#mobile-nav').innerHTML = [['home','Início'],['leads','Leads'],['nfc','NFC'],['finance','Finanças'],['more','Módulos']].map(([p,t])=>`<button ${p==='more'?'data-action="menu"':`data-page="${p}"`} class="${page===p||(p==='more'&&!['home','leads','nfc','finance'].includes(page))?'active':''}" ${page===p?'aria-current="page"':''}>${icon(p)}${t}</button>`).join('');
  $('#breadcrumb').textContent = titles[page];
  $('#settings-button').innerHTML = icon('settings');
  const moduleTrigger = $('#module-trigger');
  if (moduleTrigger) moduleTrigger.innerHTML = icon('home')+'<span>Módulos</span>';
}
function quickAccess() {
  return `<section class="quick-access" aria-label="Acessos rápidos"><div class="quick-title"><h2>Acessos rápidos</h2><button class="text-link" data-action="menu">Todos os módulos ${icon('arrow')}</button></div><div class="quick-grid">${['nfc','leads','tasks','clients','finance','inbound','outbound','maintenance'].map(p=>`<button class="quick-tile ${p==='nfc'?'featured':''}" data-page="${p}"><span class="quick-icon">${icon(p)}</span><span><strong>${titles[p]}</strong><small>${moduleDescriptions[p]}</small></span>${icon('arrow')}</button>`).join('')}</div></section>`;
}
function moduleMenu() {
  modal('Todos os módulos', `<p class="sub module-intro">Escolha a área que deseja abrir.</p><div class="menu-grid">${Object.entries(titles).map(([p,t])=>`<button data-page="${p}" class="${page===p?'current':''}">${icon(p)}<span><strong>${t}</strong><small>${moduleDescriptions[p]}</small></span></button>`).join('')}</div>`);
}
function head(title, sub, actions = '') {
  return `<div class="page-head"><div><div class="eyebrow">WEZANC WORKSPACE</div><h1>${title}</h1><p class="sub">${sub}</p></div><div class="actions">${actions}</div></div>`;
}
function stat(label, value, note, ic) {
  return `<div class="stat"><div class="stat-top">${label}${icon(ic)}</div><strong>${value}</strong><small><span class="dot">●</span> ${note}</small></div>`;
}
function render() {
  nav();
  let content = {
    home: home,
    leads: leads,
    inbound: pipeline,
    outbound: pipeline,
    lost: clientList,
    clients: clientList,
    tasks: tasks,
    maintenance: maintenance,
    finance: finance,
    nfc: nfcPage,
    ai: agents,
    settings: settings
  }[page]();
  $('#main').innerHTML = (demo ? '<div class="demo-banner"><span>Modo demonstração · dados fictícios, separados da sua base.</span><button data-action="exit-demo">Sair da demo</button></div>' : '') + (loadError ? '<div class="notice">A base principal não pôde ser lida. Se havia uma cópia anterior, ela foi carregada. Exporte seus dados e use a importação ou o histórico de versões para recuperar a base.</div>' : '') + (storageFailed ? '<div class="notice">Alterações ainda não salvas. <button data-action="retry-save">Tentar salvar</button> <button data-action="export">Exportar cópia</button> <button data-action="reload-local">Carregar base atual</button></div>' : '') + content;
  document.title = `${titles[page]} · Wezanc`;
  if (!demo) storageBadge(storageFailed ? 'Alterações não salvas' : 'Salvo neste navegador', storageFailed);
}
function go(p) {
  page = p;
  query = '';
  filter = 'all';
  stageFilter = 'all';
  render();
  window.scrollTo({
    top: 0,
    behavior: 'instant'
  });
}
function home() {
  let mrr = db.clientes.filter(c => c.temPlanoManutencao && !lost(c)).reduce((a, c) => a + c.valorPlanoManutencao, 0),
    open = active(),
    pending = open.reduce((a, c) => a + c.tarefasTecnicas.filter(t => !t.concluida).length, 0),
    counts = stages.outbound.slice(0, 5).map(([id]) => db.clientes.filter(c => flow(c) === 'outbound' && !lost(c) && status(c) === id).length),
    max = Math.max(1, ...counts);
  return head('Painel de controle', new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }) + ' · Resumo da operação', btn('Novo cliente', 'new-client', 'clients', 'secondary') + btn('Novo lead', 'new-lead')) + quickAccess() + `<div class="operation-strip"><div><span class="operation-dot"></span><strong>Operação em andamento</strong><span>${open.length} projetos ativos · ${pending} tarefas pendentes</span></div><button class="text-link" data-page="tasks">Abrir central de tarefas ${icon('arrow')}</button></div><section class="stats">${stat('Leads na sua base', db.prospects.length, 'Prontos para prospectar', 'leads')}${stat('Projetos em andamento', open.length, 'Da ideia à entrega', 'tasks')}${stat('Receita recorrente', money(mrr), 'MRR previsto por mês', 'maintenance')}${stat('Tarefas pendentes', pending, 'Nos projetos ativos', 'check')}</section><div class="dashboard-grid"><section class="panel"><div class="panel-head"><div><h2>Seu funil comercial</h2><p>Distribuição dos projetos de outbound</p></div><button class="text-link" data-page="outbound">Ver pipeline ${icon('arrow')}</button></div><div class="funnel">${stages.outbound.slice(0, 5).map((s, i) => `<div class="funnel-row"><span>${s[1]}</span><div class="track"><span style="width:${counts[i] / max * 100}%"></span></div><strong>${counts[i]}</strong></div>`).join('')}</div></section><section class="panel"><div class="panel-head"><div><h2>Últimos movimentos</h2><p>O que aconteceu no workspace</p></div>${icon('more')}</div>${db.activity.length ? `<div class="activity">${db.activity.slice(0, 4).map(a => `<div class="activity-row"><span class="avatar">${icon(a.type)}</span><div><strong>${esc(a.text)}</strong><p>${date(a.at)}</p></div></div>`).join('')}</div>` : empty('Um novo começo', 'Seus cadastros e atualizações aparecerão aqui.', 'new-lead', 'Adicionar primeiro lead')}</section></div><section class="panel"><div class="panel-head"><div><h2>Projetos em foco</h2><p>Os próximos passos para suas entregas</p></div><button class="text-link" data-page="tasks">Todos os projetos ${icon('arrow')}</button></div>${open.length ? `<div class="table-wrap"><table class="responsive-table"><thead><tr><th>CLIENTE / PROJETO</th><th>ETAPA</th><th>PROGRESSO</th><th></th></tr></thead><tbody>${open.slice(0, 4).map(c => `<tr><td><strong>${esc(c.empresa || c.nome)}</strong><small>${esc(c.pacote || 'Projeto digital')}</small></td><td><span class="tag">${esc(statusName(c))}</span></td><td>${c.tarefasTecnicas.filter(t => t.concluida).length} de ${c.tarefasTecnicas.length} tarefas</td><td><button class="icon-button" data-action="detail" data-id="${esc(c.id)}" aria-label="Abrir ${esc(c.nome)}">${icon('arrow')}</button></td></tr>`).join('')}</tbody></table></div>` : empty('Seu próximo projeto começa aqui', 'Cadastre um cliente para organizar o projeto e acompanhar suas tarefas.', 'new-client', 'Cadastrar cliente')}</section>`;
}
function searchBar(extra = '') {
  return `<div class="toolbar"><div class="search">${icon('search')}<input id="search" type="search" aria-label="Buscar registros" placeholder="Buscar por nome, empresa ou contato…" value="${esc(query)}"></div>${extra}</div>`;
}
function leadCard(c) {
  return `<article class="card"><div class="card-head"><span class="avatar">${esc((c.empresa || c.nome).slice(0, 2).toUpperCase())}</span><button class="icon-button" data-action="edit-lead" data-id="${esc(c.id)}" aria-label="Editar lead">${icon('edit')}</button></div><h3>${esc(c.empresa || c.nome)}</h3><p class="sub">${esc(c.nome)}</p><div class="card-meta"><span>${icon('phone')} ${esc(c.whatsapp)}</span></div><span class="tag blue">Pré-prospecção</span>${c.notas ? `<p class="card-text">${esc(c.notas)}</p>` : ''}<div class="card-bottom">${btn('Enviar ao outbound', 'promote', 'arrow', '', c.id)}<button class="icon-button" data-action="delete-lead" data-id="${esc(c.id)}" aria-label="Excluir lead">${icon('trash')}</button></div></article>`;
}
function leads() {
  let rows = db.prospects.filter(matches);
  return head('Banco de leads', 'Organize seus contatos e transforme oportunidades em projetos.', btn('Novo lead', 'new-lead')) + searchBar(`<span class="count">${rows.length} leads</span>`) + `<section class="cards" id="results">${rows.length ? rows.map(leadCard).join('') : empty('Nenhum lead por aqui', query ? 'Tente outro nome ou remova sua busca.' : 'Adicione um contato para começar sua próxima conversa.', query ? '' : 'new-lead', 'Adicionar lead')}</section>`;
}
function clientCard(c, withStage = false) {
  return `<article class="card"><div class="card-head"><span class="avatar">${esc((c.empresa || c.nome).slice(0, 2).toUpperCase())}</span><span class="tag ${lost(c) ? 'red' : flow(c) === 'inbound' ? 'blue' : ''}">${lost(c) ? 'Não fechado' : flow(c) === 'inbound' ? 'Inbound' : 'Outbound'}</span></div><h3>${esc(c.empresa || c.nome)}</h3><p class="sub">${esc(c.nome)} · ${esc(c.pacote || 'Projeto')}</p><div class="card-meta"><span>${icon('finance')} ${money(c.valorPago)} recebido</span></div>${lost(c) ? `<p class="card-text">${esc(c.motivoNaoFechou || 'Motivo não informado')}</p>` : withStage ? `<label class="field">Etapa atual<select data-stage="${esc(c.id)}" aria-label="Etapa de ${esc(c.nome)}">${stages[flow(c)].map(([v, t]) => `<option value="${v}" ${status(c) === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>` : `<span class="tag gray">${esc(statusName(c))}</span>`}<div class="card-bottom">${btn('Ver detalhes', 'detail', 'arrow', 'secondary', c.id)}${lost(c) ? btn('Retomar', 'restore', 'maintenance', 'ghost', c.id) : `<button class="icon-button" data-action="edit-client" data-id="${esc(c.id)}" aria-label="Editar cliente">${icon('edit')}</button>`}</div></article>`;
}
function pipeline() {
  let rows = db.clientes.filter(c => flow(c) === page && !lost(c) && matches(c) && (stageFilter === 'all' || status(c) === stageFilter));
  return head(page === 'inbound' ? 'Pipeline inbound' : 'Pipeline outbound', page === 'inbound' ? 'Acompanhe cada etapa dos clientes que chegam até você.' : 'Seu processo comercial, com o próximo passo sempre visível.', btn('Novo cliente', 'new-client')) + searchBar() + `<div class="stage-tabs" aria-label="Filtrar por etapa"><button data-filter-stage="all" class="${stageFilter === 'all' ? 'active' : ''}">Todas as etapas</button>${stages[page].map(([v, t]) => `<button data-filter-stage="${v}" class="${stageFilter === v ? 'active' : ''}">${t} <span style="opacity:.55">${db.clientes.filter(c => flow(c) === page && !lost(c) && status(c) === v).length}</span></button>`).join('')}</div><div class="cards">${rows.length ? rows.map(c => clientCard(c, true)).join('') : empty('Nenhum projeto nesta etapa', 'Cadastre um cliente ou selecione outra etapa do pipeline.', 'new-client', 'Novo cliente')}</div>`;
}
function clientList() {
  let rows = db.clientes.filter(c => matches(c) && (page !== 'lost' || lost(c)) && (filter === 'all' || flow(c) === filter));
  return head(page === 'lost' ? 'Oportunidades não fechadas' : 'Base de clientes', page === 'lost' ? 'Revise os motivos e retome oportunidades no momento certo.' : 'Contatos, projetos, histórico e detalhes em um só lugar.', btn('Novo cliente', 'new-client')) + searchBar(`<select id="filter" aria-label="Filtrar origem"><option value="all">Todas as origens</option><option value="inbound" ${filter === 'inbound' ? 'selected' : ''}>Inbound</option><option value="outbound" ${filter === 'outbound' ? 'selected' : ''}>Outbound</option></select><span class="count">${rows.length} clientes</span>`) + `<div class="cards">${rows.length ? rows.map(c => clientCard(c)).join('') : empty('Nenhum cliente encontrado', 'Cadastre um cliente ou ajuste os filtros.', 'new-client', 'Novo cliente')}</div>`;
}
function tasks() {
  let rows = active().filter(matches);
  return head('Projetos e tarefas', 'Checklists claros para manter seus projetos em movimento.', btn('Novo cliente', 'new-client')) + searchBar() + `<div class="cards">${rows.length ? rows.map(c => {
    let done = c.tarefasTecnicas.filter(t => t.concluida).length,
      total = c.tarefasTecnicas.length;
    return `<article class="card"><div class="card-head"><div><h3>${esc(c.empresa || c.nome)}</h3><p class="sub">${esc(c.pacote || 'Projeto')}</p></div><button class="icon-button" data-action="detail" data-id="${esc(c.id)}" aria-label="Abrir projeto">${icon('arrow')}</button></div><span class="tag">${done} de ${total} concluídas</span><div class="progress"><span style="width:${total ? done / total * 100 : 0}%"></span></div>${c.tarefasTecnicas.map(t => `<label class="check-task ${t.concluida ? 'done' : ''}"><input type="checkbox" data-task="${esc(t.id)}" data-client="${esc(c.id)}" ${t.concluida ? 'checked' : ''}><span>${esc(t.titulo)}</span></label>`).join('')}<div class="card-bottom">${btn('Adicionar tarefa', 'new-task', 'plus', 'ghost', c.id)}<span class="tag gray">${esc(statusName(c))}</span></div></article>`;
  }).join('') : empty('Tudo pronto para começar', 'Os checklists dos seus projetos ativos aparecerão aqui.', 'new-client', 'Criar projeto')}</div>`;
}
function maintenance() {
  let rows = db.clientes.filter(c => c.temPlanoManutencao && !lost(c) && matches(c)),
    mrr = rows.reduce((a, c) => a + c.valorPlanoManutencao, 0);
  return head('Manutenção recorrente', 'Acompanhe planos, vencimentos e recebimentos recorrentes.', btn('Novo cliente', 'new-client')) + `<section class="stats financial-stats">${stat('MRR previsto', money(mrr), 'Valor mensal dos planos ativos', 'maintenance')}${stat('Planos ativos', rows.length, 'Clientes em manutenção', 'clients')}${stat('Recebido neste mês', money(db.transacoes.filter(t => t.tipo === 'Manutenção MRR' && t.data.slice(0, 7) === today().slice(0, 7)).reduce((a, t) => a + t.valor, 0)), 'Somente pagamentos registrados', 'finance')}</section>` + searchBar() + `<div class="cards">${rows.length ? rows.map(c => {
    let paid = db.transacoes.some(t => t.tipo === 'Manutenção MRR' && t.clienteId === c.id && t.competencia === today().slice(0, 7));
    return `<article class="card"><div class="card-head"><div><h3>${esc(c.empresa || c.nome)}</h3><p class="sub">${esc(c.nome)}</p></div><span class="tag ${paid ? '' : 'amber'}">${paid ? 'Mês registrado' : 'A receber'}</span></div><h2 style="font-size:27px;margin:15px 0">${money(c.valorPlanoManutencao)} <small class="sub">/ mês</small></h2><div class="card-meta">${icon('calendar')} Vencimento no dia ${c.diaVencimentoManutencao}</div><div class="card-bottom">${paid ? '<span class="positive">' + icon('check') + ' Recebimento registrado</span>' : btn('Registrar recebimento', 'receive', 'check', '', c.id)}<button class="icon-button" data-action="edit-client" data-id="${esc(c.id)}" aria-label="Editar plano">${icon('edit')}</button></div></article>`;
  }).join('') : empty('Nenhum plano de manutenção', 'Ative a manutenção no cadastro de um cliente para acompanhar o MRR.', 'new-client', 'Cadastrar cliente')}</div>`;
}
function ledger() {
  let transactions = [...db.transacoes];
  for (let c of db.clientes) {
    if (c.valorPago > 0 && !transactions.some(t => t.clienteId === c.id && t.tipo === 'Receita')) transactions.push({
      id: 'project-' + c.id,
      clienteId: c.id,
      descricao: `Projeto: ${c.empresa || c.nome}`,
      valor: c.valorPago,
      tipo: 'Receita',
      data: c.dataFechamento || today(),
      derived: true
    });
  }
  return transactions;
}
function finance() {
  let rows = ledger().filter(t => (period === 'all' || t.data.slice(0, 7) === today().slice(0, 7)) && (filter === 'all' || t.tipo === filter) && t.descricao.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.data.localeCompare(a.data)),
    income = rows.filter(t => t.tipo !== 'Despesa').reduce((a, t) => a + t.valor, 0),
    expense = rows.filter(t => t.tipo === 'Despesa').reduce((a, t) => a + t.valor, 0);
  return head('Controle financeiro', 'Recebimentos registrados, despesas e resultado do período.', btn('Relatório', 'print', 'download', 'secondary') + btn('Lançamento', 'new-transaction')) + `<section class="stats financial-stats">${stat('Receita recebida', money(income), 'Recebimentos no filtro selecionado', 'inbound')}${stat('Despesas', money(expense), 'Saídas no filtro selecionado', 'outbound')}${stat('Resultado', money(income - expense), 'Recebido menos despesas', 'finance')}</section>` + searchBar(`<select id="period" aria-label="Período"><option value="all">Todo o período</option><option value="month" ${period === 'month' ? 'selected' : ''}>Este mês</option></select><select id="filter" aria-label="Tipo de lançamento">${[['all', 'Todos os tipos'], ['Receita', 'Receitas'], ['Despesa', 'Despesas'], ['Manutenção MRR', 'Manutenção MRR']].map(([v, t]) => `<option value="${v}" ${filter === v ? 'selected' : ''}>${t}</option>`).join('')}</select>`) + `<section class="panel"><div class="panel-head"><h2>Movimentações</h2><span class="sub">${rows.length} registros</span></div>${rows.length ? `<div class="table-wrap"><table class="responsive-table"><thead><tr><th>DESCRIÇÃO</th><th>VALOR</th><th>DATA / TIPO</th><th>AÇÃO</th></tr></thead><tbody>${rows.map(t => `<tr><td><strong>${esc(t.descricao)}</strong><small>${esc(t.pacoteAssociado || '')}</small></td><td class="${t.tipo === 'Despesa' ? 'negative' : 'positive'}">${t.tipo === 'Despesa' ? '−' : '+'} ${money(t.valor)}</td><td>${date(t.data)}<small>${esc(t.tipo)}</small></td><td>${t.derived || t.tipo === 'Receita' && t.clienteId ? `<button class="icon-button" data-action="edit-client" data-id="${esc(t.clienteId)}" aria-label="Editar valor no cliente">${icon('edit')}</button>` : `<button class="icon-button" data-action="delete-transaction" data-id="${esc(t.id)}" aria-label="Excluir lançamento">${icon('trash')}</button>`}</td></tr>`).join('')}</tbody></table></div>` : empty('Nenhum lançamento neste período', 'Registre um recebimento ou uma despesa para acompanhar o resultado.', 'new-transaction', 'Novo lançamento')}</section>`;
}
const agentData = [['Social media e conteúdo', 'Estratégias para Instagram, Reels e conteúdo orgânico.', 'ZUJBFnOavEot', 'Conteúdo'], ['Análise visual e Raio-X', 'Avaliação de marcas e oportunidades de posicionamento.', 'cXSqXLDC9Uxa', 'Design'], ['Comercial e vendas', 'Abordagens, propostas e apoio à negociação.', 'uzrvFrp6sN8j', 'Comercial'], ['Negócios e gestão', 'Organização de contratos, planos e decisões da empresa.', '9JbQ5lzgLBDL', 'Gestão'], ['Marketing e tráfego', 'Planejamento de campanhas e captação de clientes.', 'wkoXVFp3qTvu', 'Marketing']];
function agents() {
  return head('Central de agentes', 'Seus agentes de IA, organizados por especialidade.') + `<div class="notice">${icon('ai')}<span>Os agentes abrem no Gemini, em uma nova aba, e podem solicitar login. Nenhum dado do cliente é enviado automaticamente.</span></div><div class="cards">${agentData.map(([name, desc, url, tag]) => `<article class="card"><div class="card-head"><span class="avatar">${icon('spark')}</span><span class="tag">${tag}</span></div><h3>${name}</h3><p class="card-text">${desc}</p><a class="btn secondary" href="https://share.gemini.google/${url}" target="_blank" rel="noopener noreferrer">Abrir agente ${icon('outbound')}</a></article>`).join('')}</div>`;
}
function settings() {
  return head('Seu workspace, do seu jeito.', 'Dados organizados, backups acessíveis e uma experiência mais leve.') + `<div class="notice">${icon('shield')}<span>Os dados ficam neste navegador e neste endereço. Fechar o app ou reiniciar o dispositivo não apaga a base. Limpar os dados do navegador, usar navegação privada ou mudar de endereço pode impedir a recuperação. iPad e celular têm bases separadas: transfira os dados por backup JSON.</span></div><div class="cards"><section class="card"><h2>Backup dos seus dados</h2><p class="card-text">Baixe uma cópia fora do navegador. O histórico local ajuda a desfazer alterações, mas também pode ser apagado ao limpar os dados do navegador.</p>${btn('Exportar backup', 'export', 'download')} ${btn('Histórico automático', 'backups', 'maintenance', 'secondary')}</section><section class="card"><h2>Migrar do sistema anterior</h2><p class="card-text">No Wezanc OS, toque em “Exp”. Importe aqui o arquivo JSON para trazer clientes, leads, tarefas e transações.</p>${btn('Importar backup', 'import', 'upload', 'secondary')}</section><section class="card"><h2>Demonstração para portfólio</h2><p class="card-text">Veja exemplos fictícios de projetos e receitas. Sua base real fica separada durante a demonstração.</p>${btn(demo ? 'Sair da demonstração' : 'Abrir demonstração', demo ? 'exit-demo' : 'demo', 'spark', 'secondary')}</section><section class="card full"><h2>Acesso no iPad e no celular</h2><p class="card-text">Use a barra inferior para acessar os módulos. No Safari, você pode usar Compartilhar → Adicionar à Tela de Início para criar um atalho. Abra sempre o mesmo endereço da Vercel para acessar esta base. Após o primeiro carregamento, o app pode funcionar offline neste dispositivo.</p><span class="tag">Toque confortável</span> <span class="tag">Layout adaptativo</span> <span class="tag">Armazenamento local</span></section><section class="card full"><h2>Proteção do armazenamento</h2><p class="card-text">Peça ao navegador para priorizar a preservação dos dados. A disponibilidade depende do navegador e não substitui o backup em arquivo.</p><div class="actions">${btn('Verificar armazenamento', 'storage-info', 'shield', 'secondary')}${btn('Solicitar persistência', 'persist-storage', 'shield', 'secondary')}</div></section></div>`;
}
function modal(title, body) {
  $('#modal').innerHTML = `<div class="modal-head"><h2>${title}</h2><button class="icon-button" data-action="close" aria-label="Fechar">${icon('close')}</button></div><div class="modal-body">${body}</div>`;
  if (!$('#modal').open) $('#modal').showModal();
  document.body.style.overflow = 'hidden';
}
function close() {
  $('#modal').close();
  document.body.style.overflow = '';
}
$('#modal').addEventListener('close', () => document.body.style.overflow = '');
const field = (label, name, value = '', type = 'text', opts = '') => `<label class="field">${label}<input name="${name}" value="${esc(value)}" type="${type}" ${opts}></label>`;
const select = (label, name, values, value) => `<label class="field">${label}<select name="${name}">${values.map(v => `<option ${v === value ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>`;
const footer = (label = 'Salvar') => `<div class="modal-footer">${btn('Cancelar', 'close', 'close', 'secondary')}<button class="btn" type="submit">${icon('check')}${label}</button></div>`;
function leadForm(id) {
  let c = db.prospects.find(c => c.id === id) || {};
  modal(id ? 'Editar lead' : 'Novo lead', `<form id="lead-form" data-id="${esc(id || '')}"><div class="form-grid">${field('Nome do responsável *', 'nome', c.nome, 'text', 'required maxlength="120" autocomplete="name"')}${field('Empresa / nicho', 'empresa', c.empresa, 'text', 'maxlength="160" autocomplete="organization"')}${field('WhatsApp com DDD *', 'whatsapp', c.whatsapp, 'tel', 'required minlength="10" maxlength="22" autocomplete="tel"')}<label class="field full">Observações<textarea name="notas" maxlength="5000" placeholder="Instagram, contexto da conversa, próximos passos…">${esc(c.notas)}</textarea></label></div>${footer('Salvar lead')}</form>`);
}
function clientForm(id) {
  let c = db.clientes.find(c => c.id === id) || {
    origem: page === 'outbound' ? OUT : IN,
    pacote: 'Site Institucional',
    valorPago: 0,
    valorPlanoManutencao: 150,
    diaVencimentoManutencao: 10
  };
  modal(id ? 'Editar cliente' : 'Novo cliente', `<form id="client-form" data-id="${esc(id || '')}"><div class="form-grid">${field('Nome do responsável *', 'nome', c.nome, 'text', 'required maxlength="120" autocomplete="name"')}${field('Empresa', 'empresa', c.empresa, 'text', 'maxlength="160" autocomplete="organization"')}${field('WhatsApp com DDD *', 'whatsapp', c.whatsapp, 'tel', 'required minlength="10" maxlength="22" autocomplete="tel"')}${field('CPF / CNPJ', 'documento', c.documento, 'text', 'maxlength="25" inputmode="numeric"')}${select('Origem', 'origem', [IN, OUT], c.origem)}${select('Projeto / pacote', 'pacote', ['Landing Page Express', 'Site Institucional', 'E-commerce'], c.pacote)}${field('Valor já recebido (R$)', 'valorPago', c.valorPago, 'number', 'min="0" step="0.01" inputmode="decimal" required')}${select('Forma de pagamento', 'formaPagamento', ['Pix à vista', 'Pix parcelado', 'Cartão de crédito', 'Boleto', 'Transferência'], c.formaPagamento || 'Pix à vista')}${field('Data do recebimento / cadastro', 'dataFechamento', (c.dataFechamento || today()).slice(0, 10), 'date', 'required')}<label class="check-task full"><input name="temPlanoManutencao" type="checkbox" ${c.temPlanoManutencao ? 'checked' : ''}><span>Ativar plano de manutenção recorrente</span></label>${field('Valor mensal (R$)', 'valorPlanoManutencao', c.valorPlanoManutencao, 'number', 'min="0" step="0.01" inputmode="decimal" required')}${field('Dia do vencimento (1 a 28)', 'diaVencimentoManutencao', c.diaVencimentoManutencao, 'number', 'min="1" max="28" step="1" inputmode="numeric" required')}<label class="field full">Notas do cliente<textarea name="notasAnotacoes" maxlength="10000">${esc(c.notasAnotacoes)}</textarea></label></div>${footer('Salvar cliente')}</form>`);
}
function detail(id) {
  let c = db.clientes.find(c => c.id === id);
  if (!c) return;
  let digits = c.whatsapp.replace(/\D/g, ''),
    phone = digits.startsWith('55') && digits.length > 11 ? digits : '55' + digits;
  modal(esc(c.empresa || c.nome), `<span class="tag">${esc(statusName(c))}</span>${[['Responsável', c.nome], ['WhatsApp', c.whatsapp], ['Projeto', c.pacote], ['Origem', c.origem], ['Valor recebido', money(c.valorPago)], ['Manutenção', c.temPlanoManutencao ? money(c.valorPlanoManutencao) + '/mês' : 'Sem plano'], ['Garantia', c.dataInicioGarantia ? `${Math.max(0, Math.ceil((new Date(c.dataInicioGarantia).getTime() + 30 * 86400000 - Date.now()) / 86400000))} dias restantes` : 'Ainda não iniciada']].map(([k, v]) => `<div class="detail-row"><span>${k}</span><strong>${esc(v || '—')}</strong></div>`).join('')}${c.notasAnotacoes ? `<p class="card-text">${esc(c.notasAnotacoes)}</p>` : ''}<div class="actions" style="margin-top:22px">${btn('Editar', 'edit-client', 'edit', 'secondary', c.id)}${digits.length >= 10 ? `<a class="btn" href="https://wa.me/${phone}" target="_blank" rel="noopener noreferrer">${icon('phone')}WhatsApp</a>` : ''}${lost(c) ? btn('Retomar', 'restore', 'maintenance', 'secondary', c.id) : btn('Não fechou', 'mark-lost', 'lost', 'ghost', c.id)}${btn('Excluir', 'delete-client', 'trash', 'danger', c.id)}</div>`);
}
function transactionForm() {
  modal('Novo lançamento', `<form id="transaction-form"><div class="form-grid">${field('Descrição *', 'descricao', '', 'text', 'required maxlength="200"')}${select('Tipo', 'tipo', ['Receita', 'Despesa', 'Manutenção MRR'], 'Receita')}${field('Valor (R$) *', 'valor', '', 'number', 'required min="0.01" step="0.01" inputmode="decimal"')}${field('Data *', 'data', today(), 'date', 'required')}</div>${footer('Registrar lançamento')}</form>`);
}
function confirmAction(title, text, action, id, label = 'Confirmar') {
  modal(title, `<p class="card-text">${text}</p><div class="modal-footer">${btn('Cancelar', 'close', 'close', 'secondary')}${btn(label, action, 'check', '', id)}</div>`);
}
function exportBackup() {
  let data = {
      ...db,
      exportadoEm: new Date().toISOString(),
      versao: 'Wezanc Workspace 1.1 — NFC'
    },
    blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    }),
    url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = `wezanc-backup-${today()}${demo ? '-demo' : ''}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  toast('Backup preparado para download.');
}
function demoStart() {
  if (demo) return;
  realDb = db;
  demo = true;
  db = blank();
  const names = [['Marina Costa', 'Studio Aurora', 'Site Institucional', IN, '03_desenvolvimento', 1500], ['Rafael Lima', 'Lima Arquitetura', 'Landing Page Express', OUT, '03_abordagem', 0], ['Beatriz Alves', 'Clínica Essência', 'Site Institucional', IN, '04_validacao', 2200], ['Pedro Santos', 'Café Botânico', 'E-commerce', OUT, '02_prototipagem', 0], ['Lucas Ferreira', 'Norte Consultoria', 'Site Institucional', OUT, '05_em_garantia', 1800]];
  db.clientes = names.map(([nome, empresa, pacote, origem, s, valorPago], i) => ({
    id: uid(),
    nome,
    empresa,
    pacote,
    origem,
    whatsapp: '11900000000',
    statusInbound: origem === IN ? s : '01_briefing',
    statusOutbound: origem === OUT ? s : '01_raio_x',
    valorPago,
    dataFechamento: today(),
    temPlanoManutencao: i === 0 || i === 2 || i === 4,
    valorPlanoManutencao: 150 + i * 25,
    diaVencimentoManutencao: 10,
    tarefasTecnicas: newTasks().map((t, j) => ({
      ...t,
      concluida: j < i + 2
    })),
    notasAnotacoes: 'Registro fictício para explorar a interface.'
  }));
  db.prospects = [['Ana Ribeiro', 'Flor de Sal'], ['Gabriel Souza', 'Ateliê Forma'], ['Camila Martins', 'Viva Pilates']].map(([nome, empresa]) => ({
    id: uid(),
    nome,
    empresa,
    whatsapp: '11900000000',
    notas: 'Exemplo fictício. Primeiro contato a realizar.'
  }));
  db.transacoes = [{
    id: uid(),
    descricao: 'Ferramentas e hospedagem · exemplo',
    valor: 280,
    tipo: 'Despesa',
    data: today()
  }];
  const demoCustomer = {id: uid(), nome: 'Ana Ribeiro', empresa: 'Flor de Sal', whatsapp: '11900000000', notas: 'Exemplo fictício de venda NFC.'};
  db.nfc.clientes.push(demoCustomer);
  db.nfc.movimentos.push({id: uid(), tipo: 'entrada', quantidade: 30, custoCentavos: 30000, valorCentavos: 0, data: today(), criadoEm: new Date().toISOString(), motivo: 'Lote inicial · demonstração'}, {id: uid(), tipo: 'venda', quantidade: 4, custoCentavos: 4000, valorCentavos: 14000, clienteId: demoCustomer.id, clienteNome: demoCustomer.nome, clienteEmpresa: demoCustomer.empresa, data: today(), criadoEm: new Date().toISOString(), motivo: ''});
  log('Studio Aurora avançou para desenvolvimento', 'tasks');
  log('Novo lead: Ateliê Forma', 'leads');
  log('Recebimento de projeto registrado', 'finance');
  render();
  toast('Demonstração ativada. Sua base real está preservada.');
}
function exitDemo() {
  if (!demo) return;
  db = realDb;
  realDb = null;
  demo = false;
  render();
  toast('De volta à sua base real.');
}
const mutationActions = ['new-client', 'edit-client', 'new-lead', 'edit-lead', 'promote', 'receive', 'restore', 'new-transaction', 'new-task', 'confirm-delete-lead', 'confirm-delete-client', 'confirm-delete-transaction', 'confirm-receive', 'nfc-sale', 'nfc-stock', 'nfc-customer', 'nfc-edit-customer', 'nfc-delete-customer', 'nfc-confirm-delete-customer', 'nfc-cancel-sale', 'nfc-confirm-cancel-sale'];
document.addEventListener('click', e => {
  let b = e.target.closest('[data-action],[data-page],[data-filter-stage]');
  if (!b) return;
  if (b.dataset.page) {
    close();
    go(b.dataset.page);
    return;
  }
  if (b.dataset.filterStage) {
    stageFilter = b.dataset.filterStage;
    render();
    return;
  }
  let a = b.dataset.action,
    id = b.dataset.id,
    c = db.clientes.find(c => c.id === id);
  if ((loadError || storageFailed) && !demo && mutationActions.includes(a)) {
    toast('Recupere ou exporte sua base antes de continuar editando.');
    return;
  }
  switch (a) {
    case 'nfc-sale':
      nfcSaleForm(id);
      break;
    case 'nfc-stock':
      nfcStockForm();
      break;
    case 'nfc-customer':
      nfcCustomerForm();
      break;
    case 'nfc-edit-customer':
      nfcCustomerForm(id);
      break;
    case 'nfc-delete-customer':
      confirmAction('Remover cliente NFC?', 'O cadastro será removido. As vendas e quantidades já registradas permanecerão no histórico; o estoque não será alterado.', 'nfc-confirm-delete-customer', id, 'Remover cadastro');
      break;
    case 'nfc-confirm-delete-customer':
      if (db.nfc.clientes.some(customer => customer.id === id)) {
        db.nfc.clientes = db.nfc.clientes.filter(customer => customer.id !== id);
        log('Cadastro de cliente NFC removido', 'nfc');
        if (save('Cliente removido. Histórico preservado.')) close();
        render();
      }
      break;
    case 'nfc-cancel-sale': {
      const sale = db.nfc.movimentos.find(m => m.id === id && m.tipo === 'venda');
      if (sale && !nfcCancelled(id)) confirmAction('Cancelar venda NFC?', `As ${sale.quantidade} plaquinhas de ${esc(sale.clienteEmpresa || sale.clienteNome)} voltarão ao estoque. Confirme somente se a saída foi desfeita ou as unidades foram devolvidas.`, 'nfc-confirm-cancel-sale', id, 'Cancelar e devolver ao estoque');
      break;
    }
    case 'nfc-confirm-cancel-sale': {
      const sale = db.nfc.movimentos.find(m => m.id === id && m.tipo === 'venda');
      if (sale && !nfcCancelled(id)) {
        db.nfc.movimentos.push({id: uid(), tipo: 'estorno', quantidade: sale.quantidade, valorCentavos: sale.valorCentavos || 0, custoCentavos: sale.custoCentavos || 0, vendaId: sale.id, clienteId: sale.clienteId, clienteNome: sale.clienteNome, clienteEmpresa: sale.clienteEmpresa, data: today(), criadoEm: new Date().toISOString(), motivo: 'Cancelamento de venda / devolução'});
        log(`Venda NFC cancelada: +${sale.quantidade} no estoque`, 'nfc');
        if (save('Venda cancelada. Quantidade devolvida ao estoque.')) close();
        render();
      }
      break;
    }
    case 'close':
      close();
      break;
    case 'retry-save':
      if (save('Base salva com sucesso.')) render();
      break;
    case 'reload-local':
      confirmAction('Carregar base atual?', 'A edição não salva nesta tela será substituída. Exporte sua cópia antes.', 'confirm-reload');
      break;
    case 'confirm-reload':
      location.reload();
      break;
    case 'storage-info':
      void storageInfo();
      break;
    case 'persist-storage':
      void persistStorage();
      break;
    case 'backups':
      void showBackups();
      break;
    case 'restore-backup':
      void previewBackup(id);
      break;
    case 'confirm-restore-backup':
      if (window.pendingRestore) {
        confirmedRaw = localStorage.getItem(KEY) || '';
        db = window.pendingRestore;
        window.pendingRestore = null;
        loadError = false;
        save('Versão restaurada.');
        close();
        render();
      }
      break;
    case 'settings':
      go('settings');
      break;
    case 'menu':
      moduleMenu();
      break;
    case 'new-lead':
      leadForm();
      break;
    case 'edit-lead':
      leadForm(id);
      break;
    case 'new-client':
      clientForm();
      break;
    case 'edit-client':
      clientForm(id);
      break;
    case 'detail':
      detail(id);
      break;
    case 'new-transaction':
      transactionForm();
      break;
    case 'demo':
      demoStart();
      break;
    case 'exit-demo':
      exitDemo();
      break;
    case 'export':
      exportBackup();
      break;
    case 'import':
      if (demo) {
        toast('Saia da demonstração antes de importar sua base.');
        break;
      }
      $('#import-file').click();
      break;
    case 'promote':
      {
        let p = db.prospects.find(c => c.id === id);
        if (!p) break;
        db.clientes.push({
          id: uid(),
          nome: p.nome,
          empresa: p.empresa,
          whatsapp: p.whatsapp,
          origem: OUT,
          pacote: 'Site Institucional',
          valorPago: 0,
          statusInbound: '01_briefing',
          statusOutbound: '01_raio_x',
          dataFechamento: today(),
          notasAnotacoes: p.notas,
          tarefasTecnicas: newTasks(),
          temPlanoManutencao: false,
          valorPlanoManutencao: 150,
          diaVencimentoManutencao: 10
        });
        db.prospects = db.prospects.filter(p => p.id !== id);
        log(`${p.empresa || p.nome} entrou no outbound`, 'outbound');
        save('Lead enviado ao outbound.');
        go('outbound');
        break;
      }
    case 'delete-lead':
      confirmAction('Excluir lead?', 'O contato será removido do banco de leads.', 'confirm-delete-lead', id, 'Excluir');
      break;
    case 'confirm-delete-lead':
      db.prospects = db.prospects.filter(p => p.id !== id);
      save('Lead excluído.');
      close();
      render();
      break;
    case 'delete-client':
      confirmAction('Excluir cliente?', 'O cliente e suas tarefas serão excluídos. Os recebimentos financeiros serão preservados no histórico.', 'confirm-delete-client', id, 'Excluir cliente');
      break;
    case 'confirm-delete-client':
      {
        if (!c) break;
        let derived = ledger().find(t => t.derived && t.clienteId === id);
        if (derived) db.transacoes.push({
          ...derived,
          id: uid(),
          derived: false,
          clienteId: undefined
        });
        db.transacoes = db.transacoes.map(t => t.clienteId === id ? {
          ...t,
          clienteId: undefined
        } : t);
        db.clientes = db.clientes.filter(c => c.id !== id);
        log(`Cliente excluído: ${c.empresa || c.nome}`, 'clients');
        save('Cliente excluído. Histórico financeiro preservado.');
        close();
        render();
        break;
      }
    case 'mark-lost':
      modal('Marcar como não fechado', `<form id="lost-form" data-id="${esc(id)}"><label class="field">Motivo *<textarea name="motivo" required maxlength="2000" placeholder="O que impediu o fechamento?"></textarea></label>${footer('Salvar motivo')}</form>`);
      break;
    case 'restore':
      if (c) {
        c.statusInbound = '01_briefing';
        c.statusOutbound = '01_raio_x';
        delete c.dataInicioGarantia;
        log(`${c.empresa || c.nome}: oportunidade retomada`, 'maintenance');
        save('Oportunidade retomada.');
        close();
        render();
      }
      break;
    case 'new-task':
      modal('Adicionar tarefa', `<form id="task-form" data-id="${esc(id)}">${field('O que precisa ser feito? *', 'titulo', '', 'text', 'required maxlength="250"')}${footer('Adicionar tarefa')}</form>`);
      break;
    case 'receive':
      if (c) confirmAction('Confirmar recebimento', `Registrar ${money(c.valorPlanoManutencao)} de ${esc(c.empresa || c.nome)} referente a ${today().slice(0, 7).split('-').reverse().join('/')}? Registre apenas após receber o pagamento.`, 'confirm-receive', id, 'Pagamento recebido');
      break;
    case 'confirm-receive':
      if (c && !db.transacoes.some(t => t.tipo === 'Manutenção MRR' && t.clienteId === id && t.competencia === today().slice(0, 7))) {
        db.transacoes.push({
          id: uid(),
          clienteId: id,
          tipo: 'Manutenção MRR',
          valor: c.valorPlanoManutencao,
          descricao: `Manutenção: ${c.empresa || c.nome}`,
          data: today(),
          competencia: today().slice(0, 7)
        });
        log(`Manutenção recebida: ${c.empresa || c.nome}`, 'finance');
        save('Recebimento registrado.');
        close();
        render();
      }
      break;
    case 'delete-transaction':
      confirmAction('Excluir lançamento?', 'Esse lançamento será removido do histórico e do resultado financeiro.', 'confirm-delete-transaction', id, 'Excluir');
      break;
    case 'confirm-delete-transaction':
      db.transacoes = db.transacoes.filter(t => t.id !== id);
      save('Lançamento excluído.');
      close();
      render();
      break;
    case 'print':
      window.print();
      break;
    case 'confirm-import':
      {
        let pending = window.pendingImport;
        if (!pending) break;
        try {
          localStorage.setItem('wezanc_workspace_before_import', JSON.stringify(db));
          confirmedRaw = localStorage.getItem(KEY) || '';
          db = pending;
          loadError = false;
          window.pendingImport = null;
          log('Backup importado', 'upload');
          save('Backup importado com sucesso.');
          close();
          go('home');
        } catch {
          toast('Sem espaço para importar. Os dados atuais foram preservados.');
        }
        break;
      }
  }
});
document.addEventListener('submit', e => {
  const f = e.target;
  if (['nfc-sale-form', 'nfc-stock-form', 'nfc-customer-form'].includes(f.id)) {
    e.preventDefault();
    handleNfcSubmit(f);
    return;
  }
  if (!['lead-form', 'client-form', 'transaction-form', 'task-form', 'lost-form'].includes(f.id)) return;
  e.preventDefault();
  if ((storageFailed || loadError) && !demo) {
    toast('Resolva o armazenamento antes de editar.');
    return;
  }
  let data = Object.fromEntries(new FormData(f)),
    id = f.dataset.id;
  try {
    if (data.whatsapp && data.whatsapp.replace(/\D/g, '').length < 10) {
      toast('Informe um WhatsApp válido com DDD.');
      return;
    }
    if (data.nome && !data.nome.trim()) {
      toast('Informe o nome do responsável.');
      return;
    }
    if (f.id === 'lead-form') {
      let old = db.prospects.find(p => p.id === id),
        r = {
          ...old,
          id: id || uid(),
          ...data,
          nome: data.nome.trim()
        };
      db.prospects = old ? db.prospects.map(p => p.id === id ? r : p) : [r, ...db.prospects];
      log(`${old ? 'Lead atualizado' : 'Novo lead'}: ${r.empresa || r.nome}`, 'leads');
    }
    if (f.id === 'client-form') {
      let old = db.clientes.find(c => c.id === id),
        r = {
          statusInbound: '01_briefing',
          statusOutbound: '01_raio_x',
          tarefasTecnicas: newTasks(),
          ...old,
          ...data,
          id: id || uid(),
          nome: data.nome.trim(),
          valorPago: finite(data.valorPago),
          temPlanoManutencao: data.temPlanoManutencao === 'on',
          valorPlanoManutencao: finite(data.valorPlanoManutencao),
          diaVencimentoManutencao: Number(data.diaVencimentoManutencao)
        };
      db.clientes = old ? db.clientes.map(c => c.id === id ? r : c) : [r, ...db.clientes];
      let linked = db.transacoes.filter(t => t.clienteId === r.id && t.tipo === 'Receita');
      if (linked.length) {
        db.transacoes = db.transacoes.filter(t => !(t.clienteId === r.id && t.tipo === 'Receita'));
        if (r.valorPago > 0) db.transacoes.push({
          ...linked[0],
          valor: r.valorPago,
          descricao: `Projeto: ${r.empresa || r.nome}`,
          pacoteAssociado: r.pacote,
          data: r.dataFechamento
        });
      }
      log(`${old ? 'Cliente atualizado' : 'Novo cliente'}: ${r.empresa || r.nome}`, 'clients');
    }
    if (f.id === 'transaction-form') {
      db.transacoes.push({
        ...data,
        id: uid(),
        valor: finite(data.valor)
      });
      log(`Lançamento: ${data.descricao}`, 'finance');
    }
    if (f.id === 'task-form') {
      let c = db.clientes.find(c => c.id === id);
      if (!data.titulo.trim()) throw Error('Informe o título da tarefa.');
      if (c) c.tarefasTecnicas.push({
        id: uid(),
        titulo: data.titulo.trim(),
        concluida: false
      });
    }
    if (f.id === 'lost-form') {
      let c = db.clientes.find(c => c.id === id);
      if (c) {
        c.statusInbound = '07_nao_fechou';
        c.statusOutbound = '06_nao_fechou';
        c.motivoNaoFechou = data.motivo;
        log(`Não fechado: ${c.empresa || c.nome}`, 'lost');
      }
    }
    save(demo ? 'Atualizado na demonstração.' : 'Alterações salvas neste dispositivo.');
    close();
    render();
  } catch (err) {
    toast(err.message);
  }
});
document.addEventListener('change', e => {
  let t = e.target;
  if ((t.dataset.stage || t.dataset.task) && (storageFailed || loadError) && !demo) {
    toast('Resolva o armazenamento antes de editar.');
    render();
    return;
  }
  if (t.matches('#nfc-stock-form [name="tipo"]')) {
    const cost = $('#nfc-purchase-cost');
    cost.hidden = t.value !== 'Entrada de estoque';
    cost.querySelector('input').disabled = cost.hidden;
  }
  if (t.id === 'nfc-sale-customer') {
    const fields = $('#nfc-new-customer-fields');
    fields.hidden = t.value !== 'new';
    fields.querySelectorAll('input,textarea').forEach(input => {input.disabled = t.value !== 'new';});
  }
  if (t.id === 'filter') {
    filter = t.value;
    render();
  }
  if (t.id === 'period') {
    period = t.value;
    render();
  }
  if (t.dataset.stage) {
    let c = db.clientes.find(c => c.id === t.dataset.stage);
    if (c) {
      let key = flow(c) === 'inbound' ? 'statusInbound' : 'statusOutbound';
      if (t.value.includes('garantia') && !c.dataInicioGarantia) c.dataInicioGarantia = new Date().toISOString();
      c[key] = t.value;
      log(`${c.empresa || c.nome}: ${statusName(c)}`, 'tasks');
      save('Etapa atualizada.');
      render();
    }
  }
  if (t.dataset.task) {
    let c = db.clientes.find(c => c.id === t.dataset.client),
      task = c?.tarefasTecnicas.find(a => a.id === t.dataset.task);
    if (task) {
      task.concluida = t.checked;
      save('Tarefa atualizada.');
      render();
      let next = [...document.querySelectorAll('[data-task]')].find(el => el.dataset.task === task.id);
      next?.focus();
    }
  }
});
let searchTimer;
document.addEventListener('input', e => {
  if (e.target.matches('#nfc-sale-form [name="quantidade"]')) updateNfcSalePreview(e.target);
  if (e.target.id === 'search') {
    query = e.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      let start = e.target.selectionStart;
      render();
      $('#search')?.focus();
      try {
        $('#search')?.setSelectionRange(start, start);
      } catch {}
    }, 140);
  }
});
$('#import-file').addEventListener('change', async e => {
  let file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > 20 * 1024 * 1024) throw Error('O backup deve ter no máximo 20 MB.');
    let raw = JSON.parse(await file.text());
    raw.prospects = raw.prospects || [];
    raw.transacoes = raw.transacoes || [];
    let parsed = normalize(raw);
    window.pendingImport = parsed;
    const nfcWarning = raw.nfc === undefined && db.nfc.movimentos.length ? ' Atenção: este backup não contém o módulo NFC e substituirá seus registros NFC por uma base vazia.' : '';
    confirmAction('Importar este backup?', `Encontrados ${parsed.clientes.length} clientes, ${parsed.prospects.length} leads e ${parsed.transacoes.length} transações e ${parsed.nfc.movimentos.length} movimentações NFC. A importação substituirá a base deste dispositivo. A versão atual ficará no histórico local. Exporte também uma cópia independente antes de substituir.${nfcWarning}`, 'confirm-import', '', 'Substituir e importar');
  } catch (err) {
    toast('Importação recusada: ' + err.message);
  }
  e.target.value = '';
});
async function readVersions() {
  const database = await openBackupDb();
  return new Promise((resolve, reject) => {
    const req = database.transaction('versions', 'readonly').objectStore('versions').getAll();
    req.onsuccess = () => resolve(req.result.sort((a, b) => b.revision - a.revision));
    req.onerror = () => reject(req.error);
  });
}
async function showBackups() {
  try {
    const versions = await readVersions();
    modal('Histórico local de versões', `<p class="sub">As últimas 50 versões anteriores ficam neste navegador. Para proteção contra limpeza do navegador, exporte também um arquivo JSON.</p>${versions.length ? versions.map(v => `<div class="detail-row"><span>Versão ${v.revision} · ${new Date(v.at).toLocaleString('pt-BR')}</span>${btn('Revisar', 'restore-backup', 'maintenance', 'secondary', String(v.revision))}</div>`).join('') : empty('Nenhuma versão anterior', 'O histórico será criado a partir da segunda gravação.')}`);
  } catch {
    toast('Histórico indisponível neste navegador. Use um backup JSON.');
  }
}
async function previewBackup(revision) {
  try {
    const versions = await readVersions(),
      b = versions.find(v => v.revision === Number(revision));
    if (!b) throw Error();
    window.pendingRestore = normalize(b.data);
    confirmAction('Restaurar versão ' + revision + '?', `${b.data.prospects.length} leads, ${b.data.clientes.length} clientes e ${b.data.transacoes.length} transações e ${window.pendingRestore.nfc.movimentos.length} movimentações NFC. A base atual será substituída e ficará no histórico.`, 'confirm-restore-backup', '', 'Restaurar versão');
  } catch {
    toast('Não foi possível carregar a versão.');
  }
}
async function storageInfo() {
  try {
    const estimate = await navigator.storage?.estimate(),
      persisted = await navigator.storage?.persisted();
    modal('Armazenamento neste dispositivo', `<div class="detail-row"><span>Revisão salva</span><strong>${localRevision}</strong></div><div class="detail-row"><span>Persistência priorizada</span><strong>${persisted ? 'Sim' : 'Não / indisponível'}</strong></div><div class="detail-row"><span>Uso estimado do aplicativo</span><strong>${estimate ? ((estimate.usage || 0) / 1024).toFixed(0) + ' KB' : 'Não informado'}</strong></div><p class="card-text">Limpar os dados deste endereço apaga também os backups locais. Guarde periodicamente um backup JSON em Arquivos ou iCloud Drive.</p>${btn('Exportar backup agora', 'export', 'download')}`);
  } catch {
    toast('O navegador não informa o uso de armazenamento.');
  }
}
async function persistStorage() {
  try {
    const yes = await navigator.storage?.persist?.();
    toast(yes ? 'O navegador priorizou a preservação dos dados.' : 'Este navegador não concedeu persistência. Continue exportando backups.');
  } catch {
    toast('Recurso indisponível neste navegador.');
  }
}
window.addEventListener('beforeunload', e => {
  if (storageFailed) {
    e.preventDefault();
    e.returnValue = 'Há alterações não salvas.';
  }
});
window.addEventListener('storage', e => {
  if (e.key === KEY && !demo && e.newValue) {
    if ($('#modal').open || storageFailed) {
      toast('A base mudou em outra aba. Sua próxima gravação será verificada.');
      return;
    }
    try {
      db = normalize(JSON.parse(e.newValue));
      confirmedRaw = e.newValue;
      localRevision = Number(JSON.parse(e.newValue)._revision) || 0;
      render();
      toast('Base atualizada pela outra aba.');
    } catch {
      toast('Não foi possível ler a atualização da outra aba.');
    }
  }
});
render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
