// ===============================
// ESTADO GLOBAL
// ===============================
let turnoAtual = {};
let totalAbastecido = 0;
let totalOutros = 0;

// ===============================
// UTIL
// ===============================
function $(id) {
  return document.getElementById(id);
}

function irPara(tela) {
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
  $(tela).classList.add('ativa');
}

// ===============================
// INICIAR TURNO
// ===============================
function inserirInicioTurno() {
  const km = Number($('kmInicial').value);
  const hora = $('horaInicial').value;

  if (!km || !hora) {
    alert('Preencha KM e Hora inicial');
    return;
  }

  turnoAtual = {
    inicio: { km, hora },
    custos: {
      abastecimentos: [],
      outros: [],
      totalAbastecido: 0,
      totalOutros: 0,
      apurado: 0
    },
    fim: {},
    calculos: {}
  };

  irPara('custos');
}

// ===============================
// CUSTOS
// ===============================
function addAbastecimento() {
  const v = Number($('abastecimento').value);
  if (!v) return;

  totalAbastecido += v;
  $('totalAbastecido').value = totalAbastecido.toFixed(2);
  $('abastecimento').value = '';

  turnoAtual.custos.totalAbastecido = totalAbastecido;
}

function addOutroCusto() {
  const v = Number($('outroCusto').value);
  if (!v) return;

  totalOutros += v;
  $('totalCustos').value = totalOutros.toFixed(2);
  $('outroCusto').value = '';

  turnoAtual.custos.totalOutros = totalOutros;
}

function inserirApurado() {
  const v = Number($('apurado').value);
  if (!v) return alert('Informe o apurado');

  turnoAtual.custos.apurado = v;
  alert('Apurado inserido');
}

// ===============================
// FIM DE TURNO
// ===============================
function inserirFimTurno() {
  const kmFinal = Number($('kmFinal').value);
  const horaFinal = $('horaFinal').value;

  if (!kmFinal || !horaFinal) {
    alert('Preencha KM e Hora final');
    return;
  }

  turnoAtual.fim = { kmFinal, horaFinal };
  calcularResumo();
  irPara('resumoTurno');
}

// ===============================
// CÁLCULOS
// ===============================
function calcularResumo() {
  const { inicio, fim, custos } = turnoAtual;

  const kmPercorrido = fim.kmFinal - inicio.km;

  const hoje = new Date().toISOString().split('T')[0];
  let ini = new Date(`${hoje}T${inicio.hora}`);
  let fimT = new Date(`${hoje}T${fim.horaFinal}`);
  if (fimT < ini) fimT.setDate(fimT.getDate() + 1);

  const minutos = Math.floor((fimT - ini) / 60000);

  let tempoExibicao =
    minutos < 60 ? `${minutos} min` : `${(minutos / 60).toFixed(2)} h`;

  const lucro =
    custos.apurado - custos.totalAbastecido - custos.totalOutros;

  turnoAtual.calculos = {
    kmPercorrido,
    minutos,
    tempoExibicao,
    lucro
  };

  $('resKm').innerText = kmPercorrido;
  $('resHoras').innerText = tempoExibicao;
  $('resLucro').innerText = lucro.toFixed(2);
}

// ===============================
// SALVAR TURNO
// ===============================
function salvarTurno() {
  const data = new Date().toISOString().split('T')[0];
  const dados = JSON.parse(localStorage.getItem('controleDiario')) || {};

  if (!dados[data]) dados[data] = [];
  dados[data].push(turnoAtual);

  localStorage.setItem('controleDiario', JSON.stringify(dados));

  alert('Turno salvo com sucesso!');
  location.reload();
}
