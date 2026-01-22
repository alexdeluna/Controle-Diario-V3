let turnoAtual = {
  data: '',
  horaInicio: '',
  horaFim: '',
  kmInicial: 0,
  kmFinal: 0,
  abastecimento: 0,
  outrosCustos: 0,
  apurado: 0
};

function irPara(id) {
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
  document.getElementById(id).classList.add('ativa');

  if (id === 'resumoTurno') renderResumoTurno();
  if (id === 'resumoDia') renderResumoDia();
  if (id === 'historico') renderHistorico();
}

function capturarHora(campo) {
  const agora = new Date();
  const h = String(agora.getHours()).padStart(2, '0');
  const m = String(agora.getMinutes()).padStart(2, '0');
  document.getElementById(campo).value = `${h}:${m}`;
}

function inserirInicioTurno() {
  turnoAtual.data = document.getElementById('dataTurno').value;
  turnoAtual.horaInicio = document.getElementById('horaInicio').value;
  turnoAtual.kmInicial = Number(document.getElementById('kmInicial').value);
}

function addAbastecimento() {
  const v = Number(document.getElementById('abastecimentoValor').value);
  turnoAtual.abastecimento += v;
  document.getElementById('totalAbastecido').value = turnoAtual.abastecimento;
  document.getElementById('abastecimentoValor').value = '';
  atualizarTotalCustos();
}

function addOutrosCustos() {
  const v = Number(document.getElementById('outrosCustosValor').value);
  turnoAtual.outrosCustos += v;
  document.getElementById('outrosCustosValor').value = '';
  atualizarTotalCustos();
}

function inserirApurado() {
  turnoAtual.apurado = Number(document.getElementById('apuradoValor').value);
}

function atualizarTotalCustos() {
  document.getElementById('totalCustos').value =
    turnoAtual.abastecimento + turnoAtual.outrosCustos;
}

function inserirFimTurno() {
  turnoAtual.horaFim = document.getElementById('horaFim').value;
  turnoAtual.kmFinal = Number(document.getElementById('kmFinal').value);
}

function calcularHoras() {
  const [hi, mi] = turnoAtual.horaInicio.split(':').map(Number);
  const [hf, mf] = turnoAtual.horaFim.split(':').map(Number);

  let minutos = (hf * 60 + mf) - (hi * 60 + mi);
  if (minutos < 60) return `${minutos} min`;

  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function renderResumoTurno() {
  const km = turnoAtual.kmFinal - turnoAtual.kmInicial;
  document.getElementById('resumoTurnoConteudo').innerHTML = `
    <p>Data: ${turnoAtual.data}</p>
    <p>Horas Trabalhadas: ${calcularHoras()}</p>
    <p>KM Percorridos: ${km}</p>
    <p>Total Custos: R$ ${turnoAtual.abastecimento + turnoAtual.outrosCustos}</p>
    <p>Apurado: R$ ${turnoAtual.apurado}</p>
  `;
}

function salvarTurno() {
  const lista = JSON.parse(localStorage.getItem('turnos')) || [];
  lista.push({ ...turnoAtual });
  localStorage.setItem('turnos', JSON.stringify(lista));
  alert('Turno salvo com sucesso');
  turnoAtual = {
    data: '',
    horaInicio: '',
    horaFim: '',
    kmInicial: 0,
    kmFinal: 0,
    abastecimento: 0,
    outrosCustos: 0,
    apurado: 0
  };
  irPara('menu');
}

function renderResumoDia() {
  const turnos = JSON.parse(localStorage.getItem('turnos')) || [];
  let total = 0;
  let custos = 0;

  turnos.forEach(t => {
    total += t.apurado;
    custos += t.abastecimento + t.outrosCustos;
  });

  document.getElementById('resumoDiaConteudo').innerHTML = `
    <p>Total Apurado: R$ ${total}</p>
    <p>Total Custos: R$ ${custos}</p>
  `;
}

function renderHistorico() {
  const turnos = JSON.parse(localStorage.getItem('turnos')) || [];
  document.getElementById('historicoConteudo').innerHTML =
    turnos.map((t, i) => `
      <p>
        ${i + 1} - ${t.data} | KM: ${t.kmFinal - t.kmInicial} | R$ ${t.apurado}
      </p>
    `).join('');
}
