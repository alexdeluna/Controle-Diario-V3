/***********************
 * CONTROLE DIÁRIO V3
 ***********************/

let turnoAtivo = null;

/* ========= UTIL ========= */

function hojeISO() {
  return new Date().toISOString().split('T')[0];
}

function formatarHora(valor) {
  if (!valor) return '';
  let v = valor.replace(/\D/g, '');
  if (v.length >= 3) {
    v = v.slice(0, 2) + ':' + v.slice(2, 4);
  }
  return v.slice(0, 5);
}

function capturarHoraInput(id) {
  const agora = new Date();
  const h = agora.getHours().toString().padStart(2, '0');
  const m = agora.getMinutes().toString().padStart(2, '0');
  document.getElementById(id).value = `${h}:${m}`;
}

/* ========= INÍCIO DE TURNO ========= */

function iniciarTurno() {
  const km = Number(document.getElementById('kmInicial').value);
  const hora = document.getElementById('horaInicio').value;

  if (!km || !hora) {
    alert('Preencha KM inicial e Hora inicial');
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
  irPara('custos');
}

/* ========= CUSTOS ========= */

function addAbastecimento() {
  const input = document.getElementById('abastecimento');
  const total = document.getElementById('totalAbastecido');
  const v = Number(input.value);

  if (!v || v <= 0) return;

  turnoAtivo.custos.abastecimento += v;
  total.value = turnoAtivo.custos.abastecimento.toFixed(2);
  input.value = '';
  salvarRascunho();
}

function addOutroCusto() {
  const input = document.getElementById('outroCusto');
  const total = document.getElementById('totalCustos');
  const v = Number(input.value);

  if (!v || v <= 0) return;

  turnoAtivo.custos.outros += v;
  total.value = turnoAtivo.custos.outros.toFixed(2);
  input.value = '';
  salvarRascunho();
}

/* ========= FIM DE TURNO ========= */

function finalizarTurno() {
  const km = Number(document.getElementById('kmFinal').value);
  const hora = document.getElementById('horaFim').value;
  const apurado = Number(document.getElementById('apurado').value);

  if (!km || !hora || !apurado) {
    alert('Preencha KM final, Hora final e Apurado');
    return;
  }

  turnoAtivo.fim = { km, hora };
  turnoAtivo.apurado = apurado;

  calcularResumoTurno();
  irPara('resumoTurno');
}

/* ========= CÁLCULOS ========= */

function calcularResumoTurno() {
  const kmPercorrido = turnoAtivo.fim.km - turnoAtivo.inicio.km;

  const data = turnoAtivo.data;
  const ini = new Date(`${data}T${turnoAtivo.inicio.hora}`);
  let fim = new Date(`${data}T${turnoAtivo.fim.hora}`);
  if (fim < ini) fim.setDate(fim.getDate() + 1);

  const minutos = Math.round((fim - ini) / 60000);
  const horasDec = minutos / 60;

  const horasTexto =
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
    horasTrabalhadasTexto: horasTexto,
    valorHora,
    lucro
  });

  document.querySelector('#resumoTurno input:nth-of-type(1)').value = kmPercorrido;
  document.querySelector('#resumoTurno input:nth-of-type(2)').value = horasTexto;
  document.querySelector('#resumoTurno input:nth-of-type(3)').value = valorHora.toFixed(2);
  document.querySelector('#resumoTurno input:nth-of-type(4)').value = lucro.toFixed(2);
}

/* ========= SALVAR TURNO ========= */

function salvarTurno() {
  const dados = JSON.parse(localStorage.getItem('controleDiario')) || {};

  if (!dados[turnoAtivo.data]) dados[turnoAtivo.data] = [];
  dados[turnoAtivo.data].push(turnoAtivo);

  localStorage.setItem('controleDiario', JSON.stringify(dados));
  localStorage.removeItem('turnoRascunho');

  turnoAtivo = null;
  carregarHistorico();
  irPara('menu');
}

/* ========= HISTÓRICO ========= */

function carregarHistorico() {
  const lista = document.getElementById('listaHistorico');
  lista.innerHTML = '';

  const dados = JSON.parse(localStorage.getItem('controleDiario')) || {};

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

  ['horaInicio', 'horaFim'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', e => {
        e.target.value = formatarHora(e.target.value);
      });
    }
  });
};
