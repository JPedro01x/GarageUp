const api = {
  status: () => fetch('/api/status').then(r => r.json()),
  entrada: (dados) => fetch('/api/entrada', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(dados)}).then(r => r.json()),
  saida: (placa) => fetch('/api/saida', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({placa})}).then(r => r.json()),
  config: (capacidade) => fetch('/api/config', {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({capacidade})}).then(r => r.json()),
};

const el = (sel) => document.querySelector(sel);

function toast(msg, type='info') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
  alert.style.zIndex = 1080;
  alert.textContent = msg;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 2600);
}

async function carregarStatus() {
  try {
    const s = await api.status();
    el('#capacidade').textContent = s.capacidade;
    el('#ocupadas').textContent = s.ocupadas;
    el('#disponiveis').textContent = s.disponiveis;

    // Vagas disponíveis
    const lista = el('#listaVagas');
    lista.innerHTML = '';
    if (s.vagasDisponiveis.length === 0) {
      lista.innerHTML = '<span class="text-warning">Sem vagas disponíveis</span>';
    } else {
      s.vagasDisponiveis.forEach(v => {
        const b = document.createElement('span');
        b.className = 'badge text-bg-success me-2 mb-2';
        b.textContent = `Vaga ${v}`;
        lista.appendChild(b);
      });
    }

    // Ocupações
    const tbody = el('#tabelaOcupacoes');
    tbody.innerHTML = '';
    s.ocupacoes.forEach(o => {
      const tr = document.createElement('tr');
      const dtEntrada = new Date(o.entrada);
      tr.innerHTML = `
        <td><span class="badge text-bg-light">${o.numeroVaga}</span></td>
        <td>${o.veiculo.nomeCliente}</td>
        <td>${o.veiculo.modelo}</td>
        <td>${o.veiculo.cor}</td>
        <td><span class="badge text-bg-secondary">${o.veiculo.placa}</span></td>
        <td>${dtEntrada.toLocaleString()}</td>
        <td>
          <button class="btn btn-sm btn-outline-warning" data-placa="${o.veiculo.placa}">Dar baixa</button>
        </td>
      `;
      tr.querySelector('button').addEventListener('click', async (ev) => {
        const placa = ev.currentTarget.getAttribute('data-placa');
        const resp = await api.saida(placa);
        if (resp.erro) toast(resp.erro, 'danger'); else toast('Saída registrada', 'success');
        carregarStatus();
      });
      tbody.appendChild(tr);
    });
  } catch (e) {
    toast('Falha ao carregar status', 'danger');
  }
}

el('#btnAtualizar').addEventListener('click', carregarStatus);

el('#formEntrada').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const dados = Object.fromEntries(new FormData(form).entries());
  if (!dados.placa) return;
  const resp = await api.entrada(dados);
  if (resp.erro) toast(resp.erro, 'danger'); else toast(`Entrada na vaga ${resp.numeroVaga}`, 'success');
  form.reset();
  carregarStatus();
});

el('#formSaida').addEventListener('submit', async (e) => {
  e.preventDefault();
  const placa = new FormData(e.currentTarget).get('placa');
  const resp = await api.saida(placa);
  if (resp.erro) toast(resp.erro, 'danger'); else toast('Saída registrada', 'success');
  e.currentTarget.reset();
  carregarStatus();
});

el('#btnAtualizarCapacidade').addEventListener('click', async () => {
  const cap = parseInt(el('#capacidadeInput').value, 10);
  if (!cap || cap < 1) { toast('Informe uma capacidade válida', 'warning'); return; }
  const resp = await api.config(cap);
  if (resp.erro) toast(resp.erro, 'danger'); else toast('Capacidade atualizada', 'success');
  carregarStatus();
});

// Atualização inicial e polling leve
carregarStatus();
setInterval(carregarStatus, 10000);
