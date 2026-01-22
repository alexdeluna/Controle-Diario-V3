/***********************
 * CONTROLE DIÁRIO V3
 ***********************/

let turnoAtivo = null;

/* ========= UTIL ========= */

function hojeISO() {
  return new Date().toISOString().split('T')[0];
}

function formatarHora(valor) {
  valor = valor.replace(/\D/g, '');

  if (valor.length === 1) valor = '0' + valor;
  if (valor.length === 2) return valor + ':00';
  if (valor.length === 3) return '0' + valor[0] + ':' + valor.slice(1);
  if (valor.length >= 4)
    return valor.slice(0, 2) + ':' + valor.slice(2, 4);

  return '';
}

function ativarMascaraHora(id) {
  const input = document.getElementById(id);
  input.addEventListener('blur', () => {
    input.value = formatarHora(input.value);
  });
}

function capturarHora(id) {
  const agora = new Date();
  const h = agora.getHours().toString().padStart(2, '0');
  const m = agora.getMinutes().toString().padStart(2, '0');
  document.getElementById(id).value = `${h}:${m}`;
}

/* ========= NAVEGAÇÃO ========= */

function irPara(id) {
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
  document.getElementById(id).classList.add('ativa');
}

/* ========= INÍCIO TURNO ========= */

function inserirInicioTurno() {
  const km = Number(document.getElementById('kmInicial').value);
  const hora = document.getElementById('horaInicial').value;

  if (!km || !hora) {
    alert('Preencha KM e Hora inicial');
    return;
  }

  turnoAtivo = {
    data: hojeISO(),
    inicio: { km, hora },
    custos: { abastecimento: 0, outros: 0 },
    apurado: 0,
    fim: {}
  };

  salvarRascunho();
  irPara('custos');
}

/* ========= CUSTOS ========= */

function addAbastecimento() {
  const v = Number(document.getElementById('valorAbastecimento').value);
  if (!v) return;

  turnoAtivo.custos.abastecimento += v;
  document.getElementById('totalAbastecido').value =
    turnoAtivo.custos.abastecimento.toFixed(2);

  document.getElementById('valorAbastecimento').value = '';
  salvarRascunho();
}

function addOutroCusto() {
  const v = Number(document.getElementById('valorOutro').value);
  if (!v) return;

  turnoAtivo.custos.outros += v;
  document.getElementById('totalCustos').value =
    turnoAtivo.custos.outros.toFixed(2);

  document.getElementById('valorOutro').value = '';
  salvarRascunho();
}

function inserirApurado() {
  const v = Number(document.getElementById('apurado').value);
  if (!v) return;

  turnoAtivo.apurado = v;
  salvarRascunho();
  alert('Apurado registrado');
}

/* ========= FIM TURNO ========= */

function inserirFimTurno() {
  const km = Number(document.getElementById('kmFinal').value);
  const hora = document.getElementById('horaFinal').value;

  if (!km || !hora) {
    alert('Preencha KM e Hora final');
    return;
  }

  turnoAtivo.fim = { km, hora };
  salvarRascunho();
  calcularResumoTurno();
  irPara('resumoTurno');
}

/* ========= CÁLCULOS ========= */

function calcularResumoTurno() {
  const kmPercorrido =
    turnoAtivo.fim.km - turnoAtivo.inicio.km;

  const ini = new Date(`${turnoAtivo.data}T${turnoAtivo.inicio.hora}`);
  let fim = new Date(`${turnoAtivo.data}T${turnoAtivo.fim.hora}`);
  if (fim < ini) fim.setDate(fim.getDate() + 1);

  const minutos = Math.round((fim - ini) / 60000);
  const horasDec = minutos / 60;

  const horasTexto =
    minutos < 60
      ? `${minutos} min`
      : `${Math.floor(minutos / 60)}h ${minutos % 60}min`;

  const custosTotais =
    turnoAtivo.custos.abastecimento + turnoAtivo.custos.outros;

  const valorHora = turnoAtivo.apurado / horasDec;
  const lucro = turnoAtivo.apurado - custosTotais;

  document.getElementById('resKm').value = kmPercorrido;
  document.getElementById('resHoras').value = horasTexto;
  document.getElementById('resValorHora').value = valorHora.toFixed(2);
  document.getElementById('resLucro').value = lucro.toFixed(2);

  Object.assign(turnoAtivo, {
    kmPercorrido,
    horasTexto,
    valorHora,
    lucro
  });
}

/* ========= SALVAR TURNO ========= */

function salvarTurno() {
  const dados =
    JSON.parse(localStorage.getItem('controleDiario')) || {};

  if (!dados[turnoAtivo.data]) dados[turnoAtivo.data] = [];
  dados[turnoAtivo.data].push(turnoAtivo);

  localStorage.setItem('controleDiario', JSON.stringify(dados));
  localStorage.removeItem('turnoRascunho');

  turnoAtivo = null;
  alert('Turno salvo com sucesso');
  irPara('menu');
}

/* ========= RASCUNHO ========= */

function salvarRascunho() {
  localStorage.setItem('turnoRascunho', JSON.stringify(turnoAtivo));
}

window.onload = () => {
  ativarMascaraHora('horaInicial');
  ativarMascaraHora('horaFinal');

  const r = JSON.parse(localStorage.getItem('turnoRascunho'));
  if (r) turnoAtivo = r;
};
