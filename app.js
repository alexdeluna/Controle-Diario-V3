/***********************
 * CONTROLE DIÁRIO V3
 ***********************/

let turnoAtivo = null;

/* ========= UTIL ========= */

function hojeISO() {
  return new Date().toISOString().split('T')[0];
}

function capturarHoraInput(id) {
  const agora = new Date();
  const h = agora.getHours().toString().padStart(2, '0');
  const m = agora.getMinutes().toString().padStart(2, '0');
  document.getElementById(id).value = `${h}:${m}`;
}

/* ========= NAVEGAÇÃO ========= */

function mostrarTela(id) {
  document.querySelectorAll('.tela').forEach(t => t.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

/* ========= INICIAR TURNO ========= */

function iniciarTurno() {
  const km = Number(document.getElementById('kmInicio').value);
  const hora = document.getElementById('horaInicio').value;

  if (!km || !hora) {
    alert('Preencha KM e Hora de início');
    return;
  }

  turnoAtivo = {
    data: hojeISO(),
    inicio: { km, hora },
    fim: {},
    custos: { abastecimento: 0, outros: 0 },
    apurado: 0
  };

  salvarRascunho();
  mostrarTela('telaCustos');
}

/* ========= CUSTOS ========= */

function addAbastecimento() {
  const v = Number(document.getElementById('abastecimento').value);
  if (!v || v <= 0) return;
  turnoAtivo.custos.abastecimento += v;
  document.getElementById('totalAbastecido').value =
    turnoAtivo.custos.abastecimento.toFixed(2);
  document.getElementById('abastecimento').value = '';
  salvarRascunho();
}

function addOutroCusto() {
  const v = Number(document.getElementById('outroCusto').value);
  if (!v || v <= 0) return;
  turnoAtivo.custos.outros += v;
  document.getElementById('totalCustos').value =
    turnoAtivo.custos.outros.toFixed(2);
  document.getElementById('outroCusto').value = '';
  salvarRascunho();
}

/* ========= FIM DE TURNO ========= */

function finalizarTurno() {
  const km = Number(document.getElementById('kmFim').value);
  const hora = document.getElementById('horaFim').value;
  const apurado = Number(document.getElementById('apurado').value);

  if (!km || !hora || !apurado) {
    alert('Preencha KM final, Hora final e Apurado');
    return;
  }

  turnoAtivo.fim = { km, hora };
  turnoAtivo.apurado = apurado;

  calcularResumoTurno();
  mostrarTela('telaResumoTurno');
}

/* ========= CÁLCULOS ========= */

function calcularResumoTurno() {
  const kmPercorrido =
    turnoAtivo.fim.km - turnoAtivo.inicio.km;

  const data = turnoAtivo.data;
  const ini = new Date(`${data}T${turnoAtivo.inicio.hora}`);
  let fim = new Date(`${data}T${turnoAtivo.fim.hora}`);
  if (fim < ini) fim.setDate(fim.getDate() + 1);

  const minutos = Math.round((fim - ini) / 60000);
  const horasDec = minutos / 60;

  let horasTexto =
    minutos < 60
      ? `${minutos} min`
      : `${Math.floor(minutos / 60)}h ${minutos % 60}min`;

  const custosTotais =
    turnoAtivo.custos.abastecimento +
    turnoAtivo.custos.outros;

  const valorHora = turnoAtivo.apurado / horasDec;
  const lucro = turnoAtivo.apurado - custosTotais;

  Object.assign(turnoAtivo, {
    kmPercorrido,
    minutosTrabalhados: minutos,
    horasDecimais: horasDec,
    horasTrabalhadasTexto: horasTexto,
    valorHora,
    lucro
  });

  document.getElementById('resumoTurno').innerHTML = `
    KM Percorrido: ${kmPercorrido}<br>
    Horas: ${horasTexto}<br>
    Valor Hora: R$ ${valorHora.toFixed(2)}<br>
    Lucro: R$ ${lucro.toFixed(2)}
  `;
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
  carregarHistorico();
  mostrarTela('telaMenu');
}

/* ========= HISTÓRICO ========= */

function carregarHistorico() {
  const lista = document.getElementById('listaHistorico');
  lista.innerHTML = '';

  const dados =
    JSON.parse(localStorage.getItem('controleDiario')) || {};

  Object.keys(dados).sort().reverse().forEach(data => {
    dados[data].slice().reverse().forEach((t, i) => {
      lista.innerHTML += `
        <div class="dia">
          <strong>${data} – Turno ${i + 1}</strong><br>
          KM: ${t.kmPercorrido}<br>
          Horas: ${t.horasTrabalhadasTexto}<br>
          Apurado: R$ ${t.apurado.toFixed(2)}<br>
          Lucro: R$ ${t.lucro.toFixed(2)}
        </div>
      `;
    });
  });
}

/* ========= RASCUNHO ========= */

function salvarRascunho() {
  localStorage.setItem('turnoRascunho', JSON.stringify(turnoAtivo));
}

window.onload = () => {
  const r = JSON.parse(localStorage.getItem('turnoRascunho'));
  if (r) turnoAtivo = r;
  carregarHistorico();
};
