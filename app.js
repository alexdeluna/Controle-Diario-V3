/******************************
 * ESTADO GLOBAL COM PERSISTÊNCIA
 ******************************/
// Carrega do LocalStorage ou inicia um estado vazio
let estado = JSON.parse(localStorage.getItem('controleDiarioV3')) || {
  turnoAtual: null,
  turnos: []
};

// Salva no LocalStorage sempre que houver mudanças
function salvar() {
  localStorage.setItem('controleDiarioV3', JSON.stringify(estado));
}

/******************************
 * UTILITÁRIOS
 ******************************/
function hojeISO() {
  return new Date().toISOString().split('T')[0];
}

function validarHora(hora) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(hora);
}

function diffHoras(h1, h2) {
  const [aH, aM] = h1.split(':').map(Number);
  const [bH, bM] = h2.split(':').map(Number);
  let inicio = aH * 60 + aM;
  let fim = bH * 60 + bM;
  if (fim < inicio) fim += 24 * 60; // Trata virada de dia (ex: 22h às 04h)
  return (fim - inicio) / 60;
}

/******************************
 * LÓGICA DE TURNOS
 ******************************/

function confirmarInicioTurno() {
  const hora = document.getElementById('horaInicio').value.trim();
  const km = Number(document.getElementById('kmInicial').value);

  if (!validarHora(hora) || isNaN(km) || km <= 0) {
    alert('Verifique Hora (HH:MM) e KM Inicial!');
    return;
  }

  // Inicia novo objeto mantendo a data de início para o resumo
  estado.turnoAtual = {
    data: hojeISO(),
    horaInicio: hora,
    kmInicial: km,
    horaFim: '',
    kmFinal: 0,
    custos: { abastecimento: 0, outros: 0 },
    apurado: 0
  };

  salvar();
  alert('Turno Iniciado!');
  irPara('menu');
}

function adicionarAbastecimento() {
  const valor = Number(document.getElementById('valorAbastecimento').value);
  if (valor > 0) {
    estado.turnoAtual.custos.abastecimento += valor;
    document.getElementById('totalAbastecido').value = estado.turnoAtual.custos.abastecimento.toFixed(2);
    document.getElementById('valorAbastecimento').value = '';
    atualizarTotalCustos();
    salvar();
  }
}

function adicionarOutrosCustos() {
  const valor = Number(document.getElementById('valorOutrosCustos').value);
  if (valor > 0) {
    estado.turnoAtual.custos.outros += valor;
    document.getElementById('totalOutrosCustos').value = estado.turnoAtual.custos.outros.toFixed(2);
    document.getElementById('valorOutrosCustos').value = '';
    atualizarTotalCustos();
    salvar();
  }
}

function atualizarTotalCustos() {
  const total = estado.turnoAtual.custos.abastecimento + estado.turnoAtual.custos.outros;
  document.getElementById('totalCustos').value = total.toFixed(2);
}

function inserirApurado() {
  const valor = Number(document.getElementById('apurado').value);
  estado.turnoAtual.apurado = valor;
  salvar();
  alert('Ganhos salvos!');
}

function confirmarFimTurno() {
  const hora = document.getElementById('horaFim').value.trim();
  const km = Number(document.getElementById('kmFinal').value);

  if (!validarHora(hora) || km <= estado.turnoAtual.kmInicial) {
    alert('Hora inválida ou KM final menor que inicial!');
    return;
  }

  estado.turnoAtual.horaFim = hora;
  estado.turnoAtual.kmFinal = km;
  salvar();
  alert('Turno finalizado! Veja o resumo.');
  irPara('resumoTurno');
  carregarResumoTurno();
}

function salvarTurnoNoHistorico() {
  if (!estado.turnoAtual.horaFim) {
    alert("Finalize o turno antes de salvar no histórico!");
    return;
  }
  
  // Adiciona ao histórico e limpa o atual
  estado.turnos.push({ ...estado.turnoAtual });
  estado.turnoAtual = null; // LIMPEZA para novo turno
  
  salvar();
  alert('Turno arquivado com sucesso!');
  window.location.reload(); // Recarrega para zerar a interface
}

/******************************
 * RESUMOS E HISTÓRICO
 ******************************/

function carregarResumoTurno() {
  const t = estado.turnoAtual;
  if (!t) return;

  const horas = diffHoras(t.horaInicio, t.horaFim);
  const km = t.kmFinal - t.kmInicial;
  const custos = t.custos.abastecimento + t.custos.outros;
  const lucro = t.apurado - custos;
  const vHora = horas > 0 ? lucro / horas : 0;

  document.getElementById('resumoHoras').innerText = horas.toFixed(2) + "h";
  document.getElementById('resumoKM').innerText = km + " km";
  document.getElementById('resumoCustos').innerText = "R$ " + custos.toFixed(2);
  document.getElementById('resumoLucro').innerText = "R$ " + lucro.toFixed(2);
  document.getElementById('resumoValorHora').innerText = "R$ " + vHora.toFixed(2) + "/h";
}

// Registro do Service Worker para PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(err => console.log(err));
}
