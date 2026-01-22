/******************************
 * ESTADO GLOBAL DO APLICATIVO
 ******************************/
const estado = {
  turnoAtual: {
    data: null,
    horaInicio: null,
    kmInicial: null,
    horaFim: null,
    kmFinal: null,
    custos: {
      abastecimento: 0,
      outros: 0
    },
    apurado: 0
  },
  turnos: []
};

/******************************
 * UTILITÁRIOS
 ******************************/
function hojeISO() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function horaAtual() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function validarHora(hora) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(hora);
}

function diffHoras(h1, h2) {
  const [aH, aM] = h1.split(':').map(Number);
  const [bH, bM] = h2.split(':').map(Number);

  let inicio = aH * 60 + aM;
  let fim = bH * 60 + bM;

  if (fim < inicio) fim += 24 * 60; // virou o dia

  return (fim - inicio) / 60;
}

/******************************
 * INÍCIO DE TURNO
 ******************************/
function confirmarInicioTurno() {
  const hora = document.getElementById('horaInicio').value.trim();
  const km = Number(document.getElementById('kmInicial').value);

  if (!validarHora(hora)) {
    alert('Hora inválida. Use HH:MM');
    return;
  }

  if (isNaN(km) || km <= 0) {
    alert('KM inicial inválido');
    return;
  }

  estado.turnoAtual = {
    data: hojeISO(),
    horaInicio: hora,
    kmInicial: km,
    horaFim: null,
    kmFinal: null,
    custos: {
      abastecimento: 0,
      outros: 0
    },
    apurado: 0
  };

  alert('Início de turno registrado');
}

/******************************
 * CUSTOS
 ******************************/
function adicionarAbastecimento() {
  const input = document.getElementById('valorAbastecimento');
  const valor = Number(input.value);

  if (isNaN(valor) || valor <= 0) return;

  estado.turnoAtual.custos.abastecimento += valor;
  document.getElementById('totalAbastecido').value =
    estado.turnoAtual.custos.abastecimento.toFixed(2);

  atualizarTotalCustos();
  input.value = '';
}

function adicionarOutrosCustos() {
  const input = document.getElementById('valorOutrosCustos');
  const valor = Number(input.value);

  if (isNaN(valor) || valor <= 0) return;

  estado.turnoAtual.custos.outros += valor;
  document.getElementById('totalOutrosCustos').value =
    estado.turnoAtual.custos.outros.toFixed(2);

  atualizarTotalCustos();
  input.value = '';
}

function atualizarTotalCustos() {
  const total =
    estado.turnoAtual.custos.abastecimento +
    estado.turnoAtual.custos.outros;

  document.getElementById('totalCustos').value = total.toFixed(2);
}

function inserirApurado() {
  const valor = Number(document.getElementById('apurado').value);
  if (isNaN(valor) || valor < 0) {
    alert('Valor apurado inválido');
    return;
  }

  estado.turnoAtual.apurado = valor;
  alert('Valor apurado registrado');
}

/******************************
 * FIM DE TURNO
 ******************************/
function confirmarFimTurno() {
  const hora = document.getElementById('horaFim').value.trim();
  const km = Number(document.getElementById('kmFinal').value);

  if (!validarHora(hora)) {
    alert('Hora inválida. Use HH:MM');
    return;
  }

  if (isNaN(km) || km <= estado.turnoAtual.kmInicial) {
    alert('KM final inválido');
    return;
  }

  estado.turnoAtual.horaFim = hora;
  estado.turnoAtual.kmFinal = km;

  alert('Fim de turno registrado');
}

/******************************
 * RESUMO DO TURNO
 ******************************/
function carregarResumoTurno() {
  const t = estado.turnoAtual;

  if (!t.horaFim) {
    alert('Turno ainda não finalizado');
    return;
  }

  const horas = diffHoras(t.horaInicio, t.horaFim);
  const km = t.kmFinal - t.kmInicial;
  const custos =
    t.custos.abastecimento + t.custos.outros;
  const lucro = t.apurado - custos;
  const valorHora = horas > 0 ? lucro / horas : 0;

  document.getElementById('resumoHoras').innerText = horas.toFixed(2);
  document.getElementById('resumoKM').innerText = km;
  document.getElementById('resumoCustos').innerText = custos.toFixed(2);
  document.getElementById('resumoLucro').innerText = lucro.toFixed(2);
  document.getElementById('resumoValorHora').innerText = valorHora.toFixed(2);
}

function salvarTurno() {
  estado.turnos.push({ ...estado.turnoAtual });
  alert('Turno salvo com sucesso');
}

/******************************
 * RESUMO DO DIA
 ******************************/
function carregarResumoDia() {
  const hoje = hojeISO();
  const turnosDia = estado.turnos.filter(t => t.data === hoje);

  let totalLucro = 0;
  let totalKM = 0;

  turnosDia.forEach(t => {
    totalLucro += t.apurado -
      (t.custos.abastecimento + t.custos.outros);
    totalKM += t.kmFinal - t.kmInicial;
  });

  document.getElementById('diaLucro').innerText = totalLucro.toFixed(2);
  document.getElementById('diaKM').innerText = totalKM;
}

/******************************
 * HISTÓRICO GERAL
 ******************************/
function carregarHistoricoGeral() {
  const lista = document.getElementById('listaHistorico');
  lista.innerHTML = '';

  estado.turnos.forEach((t, i) => {
    const li = document.createElement('li');
    li.innerText = `Turno ${i + 1} | ${t.data} | KM: ${t.kmFinal - t.kmInicial}`;
    lista.appendChild(li);
  });
}
