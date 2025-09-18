const api = {
  status: () => withLoading(fetch('/api/status').then(r => r.json())),
  entrada: (dados) => withLoading(fetch('/api/entrada', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(dados)}).then(r => r.json())),
  saida: (placa) => withLoading(fetch('/api/saida', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({placa})}).then(r => r.json())),
  config: (capacidade) => withLoading(fetch('/api/config', {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({capacidade})}).then(r => r.json())),
};

const $ = (sel) => document.querySelector(sel);

// Loading bar helpers
const loadingBar = () => document.getElementById('loadingBar');
let loadingCount = 0;
function startLoading() {
  loadingCount++;
  const bar = loadingBar();
  if (!bar) return;
  bar.style.width = '0%';
  // force reflow
  void bar.offsetWidth;
  bar.style.width = '80%';
}
function endLoading() {
  loadingCount = Math.max(0, loadingCount - 1);
  const bar = loadingBar();
  if (!bar) return;
  if (loadingCount === 0) {
    bar.style.width = '100%';
    setTimeout(() => { bar.style.width = '0%'; }, 300);
  }
}
function withLoading(promise) {
  startLoading();
  return promise.finally(endLoading);
}

// Tema claro/escuro
const THEME_KEY = 'garage_theme';

function applyTheme(theme) {
  const root = document.documentElement; // <html>
  const body = document.body;
  if (theme === 'dark') {
    root.classList.add('dark');
    body.classList.add('dark');
  } else {
    root.classList.remove('dark');
    body.classList.remove('dark');
  }
  const icon = $('#themeIcon');
  if (icon) {
    icon.innerHTML = theme === 'dark'
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4">
           <circle cx="12" cy="12" r="4"/>
           <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
         </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4">
           <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
         </svg>`;
  }
}

function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  const btn = $('#themeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      const next = isDark ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }
});

function toast(msg, type='info') {
  const colors = {
    info: 'bg-sky-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    danger: 'bg-rose-600',
  };
  const el = document.createElement('div');
  el.className = `px-4 py-2 text-sm text-white rounded-lg shadow ${colors[type]||colors.info} animate-[fadeIn_.2s_ease-out]`;
  el.textContent = msg;
  const cont = $('#toast-container');
  cont.appendChild(el);
  // subtle pop
  el.style.transform = 'scale(0.98)';
  requestAnimationFrame(() => { el.style.transition = 'transform .18s ease'; el.style.transform = 'scale(1)'; });
  setTimeout(() => {
    el.classList.add('opacity-0','transition','duration-300');
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

async function carregarStatus() {
  try {
    showSkeleton(true);
    const s = await api.status();
    // KPIs com countUp
    countUp($('#capacidade'), s.capacidade);
    countUp($('#ocupadas'), s.ocupadas);
    countUp($('#disponiveis'), s.disponiveis);

    // Vagas: mostrar TODAS de 1..capacidade. Ocupadas em vermelho, livres em verde
    const lista = $('#listaVagas');
    lista.innerHTML = '';
    const ocupacoesArr = s.ocupacoes || [];
    const ocupadasSet = new Set(ocupacoesArr.map(o => o.numeroVaga));
    const ocupacaoPorVaga = new Map(ocupacoesArr.map(o => [o.numeroVaga, o]));
    for (let i = 1; i <= s.capacidade; i++) {
      const livre = !ocupadasSet.has(i);
      const b = document.createElement('span');
      b.className = `inline-flex items-center px-2 py-1 text-xs rounded-full ring-1 me-2 mb-2 cursor-default ${livre ? 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-700/40' : 'bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:ring-rose-700/40 cursor-pointer'}`;
      b.textContent = `Vaga ${i}`;
      if (!livre) {
        const reg = ocupacaoPorVaga.get(i);
        if (reg) {
          b.title = `${reg.veiculo.nomeCliente} • ${reg.veiculo.modelo} • ${reg.veiculo.cor}${reg.veiculo.placa ? ' • ' + reg.veiculo.placa : ''}`;
          b.addEventListener('click', () => openModalVaga(reg));
        }
      }
      lista.appendChild(b);
    }

    // Ocupações
    const tbody = $('#tabelaOcupacoes');
    tbody.innerHTML = '';
    s.ocupacoes.forEach(o => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-100 dark:hover:bg-slate-800/40';
      const dtEntrada = new Date(o.entrada);
      tr.innerHTML = `
        <td class="py-2 pr-4"><span class="inline-flex items-center px-2 py-0.5 text-xs rounded-md bg-slate-200 text-slate-700 dark:bg-slate-600/60 dark:text-slate-200">${o.numeroVaga}</span></td>
        <td class="py-2 pr-4">${o.veiculo.nomeCliente}</td>
        <td class="py-2 pr-4">${o.veiculo.modelo}</td>
        <td class="py-2 pr-4">${o.veiculo.cor}</td>
        <td class="py-2 pr-4"><span class="uppercase inline-flex items-center px-2 py-0.5 text-xs rounded-md bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">${o.veiculo.placa || '-'}</span></td>
        <td class="py-2 pr-4">${o.veiculo.tipo}</td>
        <td class="py-2 pr-4">${dtEntrada.toLocaleString()}</td>
        <td class="py-2 pr-4">
          <button class="px-3 py-1.5 text-xs rounded-md bg-rose-600 hover:bg-rose-500 text-white" data-placa="${o.veiculo.placa}">Dar baixa</button>
        </td>
      `;
      tr.style.opacity = '0';
      tr.style.transform = 'translateY(6px)';
      requestAnimationFrame(() => {
        tr.style.transition = 'opacity .25s ease, transform .25s ease';
        tr.style.opacity = '1';
        tr.style.transform = 'translateY(0)';
      });
      tr.querySelector('button').addEventListener('click', async (ev) => {
        const placa = ev.currentTarget.getAttribute('data-placa');
        let resp;
        if (placa) {
          resp = await api.saida(placa);
        } else {
          // Sem placa (ex.: BIKE): dar baixa pela vaga
          const payload = { numeroVaga: o.numeroVaga };
          resp = await withLoading(fetch('/api/saida', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(r => r.json()));
        }
        if (resp.erro) toast(resp.erro, 'danger'); else toast('Saída registrada', 'success');
        carregarStatus();
      });
      tbody.appendChild(tr);
    });
    showSkeleton(false);
  } catch (e) {
    toast('Falha ao carregar status', 'danger');
    showSkeleton(false);
  }
}

$('#btnAtualizar').addEventListener('click', carregarStatus);

$('#formEntrada').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const dados = Object.fromEntries(new FormData(form).entries());
  // Ajuste de placa conforme tipo
  const tipo = String(dados.tipo || '').toUpperCase();
  if (tipo !== 'BIKE') {
    if (!dados.placa) { toast('Placa é obrigatória para carro/moto', 'warning'); return; }
    dados.placa = String(dados.placa).toUpperCase();
  } else {
    // Bike não precisa de placa
    if (!dados.placa) delete dados.placa;
  }
  const resp = await api.entrada(dados);
  if (resp.erro) toast(resp.erro, 'danger'); else toast(`Entrada na vaga ${resp.numeroVaga}`, 'success');
  form.reset();
  carregarStatus();
});

$('#formSaida').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const placaRaw = fd.get('placa');
  const numeroVagaRaw = fd.get('numeroVaga');
  const payload = {};
  if (numeroVagaRaw) payload.numeroVaga = parseInt(numeroVagaRaw, 10);
  if (placaRaw) payload.placa = String(placaRaw).toUpperCase();
  const resp = await fetch('/api/saida', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(r => r.json());
  if (resp.erro) toast(resp.erro, 'danger'); else toast('Saída registrada', 'success');
  e.currentTarget.reset();
  carregarStatus();
});

$('#btnAtualizarCapacidade').addEventListener('click', async () => {
  const cap = parseInt($('#capacidadeInput').value, 10);
  if (!cap || cap < 1) { toast('Informe uma capacidade válida', 'warning'); return; }
  const resp = await api.config(cap);
  if (resp.erro) toast(resp.erro, 'danger'); else toast('Capacidade atualizada', 'success');
  carregarStatus();
});

// Inicialização
carregarStatus();
setInterval(carregarStatus, 10000);

// UI dinâmica: esconder/mostrar placa conforme tipo
document.addEventListener('DOMContentLoaded', () => {
  const tipo = document.getElementById('tipoVeiculo');
  const placaInput = document.getElementById('placaInput');
  const bikeHint = document.getElementById('bikeHint');
  if (tipo && placaInput) {
    const updatePlacaState = () => {
      const isBike = tipo.value === 'BIKE';
      // esconder apenas o campo de placa, não o formulário todo
      placaInput.style.display = isBike ? 'none' : '';
      if (bikeHint) bikeHint.classList.toggle('hidden', !isBike);
      if (isBike) {
        placaInput.removeAttribute('required');
      } else {
        placaInput.setAttribute('required', 'required');
      }
    };
    tipo.addEventListener('change', updatePlacaState);
    updatePlacaState();
  }

  // Ripple effect para botões
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const circle = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    circle.style.width = circle.style.height = size + 'px';
    circle.style.position = 'absolute';
    circle.style.left = (e.clientX - rect.left - size / 2) + 'px';
    circle.style.top = (e.clientY - rect.top - size / 2) + 'px';
    circle.style.background = 'rgba(255,255,255,.25)';
    circle.style.borderRadius = '50%';
    circle.style.pointerEvents = 'none';
    circle.style.transform = 'scale(0)';
    circle.style.transition = 'transform .4s ease, opacity .6s ease';
    circle.className = 'btn-ripple';
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(circle);
    requestAnimationFrame(() => { circle.style.transform = 'scale(1)'; circle.style.opacity = '0'; });
    setTimeout(() => circle.remove(), 650);
  });
});

// Skeletons e countUp helpers
function showSkeleton(on) {
  const ids = ['skt-capacidade','skt-ocupadas','skt-disponiveis','skt-tabela'];
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.classList.toggle('hidden', !on); });
}

function countUp(el, to) {
  if (!el) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let from = parseInt(el.textContent || '0', 10);
  if (Number.isNaN(from)) from = 0;
  const target = Number(to) || 0;
  if (reduce) { el.textContent = String(target); return; }
  const start = performance.now();
  const dur = 500;
  function step(t) {
    const p = Math.min(1, (t - start) / dur);
    const val = Math.round(from + (target - from) * p);
    el.textContent = String(val);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
