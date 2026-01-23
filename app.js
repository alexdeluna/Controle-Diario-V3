/******************************
 * ESTADO GLOBAL E PERSISTÊNCIA
 ******************************/
let estado = JSON.parse(localStorage.getItem('controleDiarioV3')) || {
  turnoAtual: null,
  turnos: []
};

function salvar() {
  localStorage.setItem('controleDiarioV3', JSON.stringify(estado));
}

/******************************
 * TRATAMENTO DE HORA (Ajuste solicitado)
 ******************************/
function tratarEntradaHora(valor) {
  // Remove tudo que não é número
  let num = valor.replace(/\D/g, '');
  
  // Se digitou 3 números (ex: 620), vira 0620
  if (num.length === 3) num = '0' + num;
  
  // Se tem 4 números, formata HH:MM
  if (num.length === 4) {
    const hh = num.substring(0, 2);
    const mm = num.substring(2, 4);
    if (parseInt(hh) < 24 && parseInt(mm) < 60) {
      return `${hh}:${mm}`;
    }
  }
  return valor; // Retorna original se não conseguir formatar
}

function validarHora(hora) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(hora);
}

function diffHoras(h1, h2) {
  const [aH, aM] = h1.split(':').map(Number);
  const [bH, bM] = h2.split(':').map(Number);
  let inicio = aH * 60 + aM;
  let fim = bH * 60 + bM;
  if (fim < inicio) fim += 24 * 60; // Virada de dia
  // Retorna o total de minutos
  return fim - inicio; 
}

// Converte horas decimais (ex: 8.67) para HH:MM (ex: 8:40)
function formatarMinutosParaHHMM(horasDecimais) {
  const horas = Math.floor(horasDecimais);
  const minutosDecimais = (horasDecimais - horas) * 60;
  // Arredonda os minutos para o inteiro mais próximo
  const minutos = Math.round(minutosDecimais); 
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}h`;
}


/******************************
 * FUNÇÕES DE AÇÃO
 ******************************/

function confirmarInicioTurno() {
  const inputHora = document.getElementById('horaInicio');
  inputHora.value = tratarEntradaHora(inputHora.value);
  
  const hora = inputHora.value;
  const km = Number(document.getElementById('kmInicial').value);

  if (!validarHora(hora) || isNaN(km) || km <= 0) {
    alert('Verifique a Hora (ex: 0620) e o KM!');
    return;
  }

  estado.turnoAtual = {
    data: new Date().toISOString().split('T')[0],
    horaInicio: hora,
    kmInicial: km,
    horaFim: '',
    kmFinal: 0,
    custos: { abastecimento: 0, outros: 0 },
    apurado: 0
  };

  salvar();
  alert('Turno iniciado com sucesso!');
  irPara('menu');
}

function adicionarAbastecimento() {
  const input = document.getElementById('valorAbastecimento');
  const valor = Number(input.value);
  if (valor > 0) {
    estado.turnoAtual.custos.abastecimento += valor;
    document.getElementById('totalAbastecido').value = estado.turnoAtual.custos.abastecimento.toFixed(2);
    input.value = '';
    atualizarTotalCustos();
    salvar();
  }
}

function adicionarOutrosCustos() {
  const input = document.getElementById('valorOutrosCustos');
  const valor = Number(input.value);
  if (valor > 0) {
    estado.turnoAtual.custos.outros += valor;
    document.getElementById('totalOutrosCustos').value = estado.turnoAtual.custos.outros.toFixed(2);
    input.value = '';
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
  if (estado.turnoAtual) {
    estado.turnoAtual.apurado = valor;
    salvar();
    alert('Dados salvos!');
    irPara('menu'); // Esta linha foi adicionada
  }
}

function confirmarFimTurno() {
  const inputHora = document.getElementById('horaFim');
  inputHora.value = tratarEntradaHora(inputHora.value);
  
  const hora = inputHora.value;
  const km = Number(document.getElementById('kmFinal').value);

  if (!validarHora(hora) || km <= estado.turnoAtual.kmInicial) {
    alert('Verifique a Hora e o KM Final (deve ser maior que o inicial)!');
    return;
  }

  estado.turnoAtual.horaFim = hora;
  estado.turnoAtual.kmFinal = km;
  salvar();
  irPara('resumoTurno');
}

function carregarResumoTurno() {
  const t = estado.turnoAtual;
  if (!t || !t.horaFim) return;

  const totalMinutos = diffHoras(t.horaInicio, t.horaFim); // Agora retorna minutos
  const horasFormatadas = formatarMinutosParaHHMM(totalMinutos / 60); // Converte para HH:MMh
  const km = t.kmFinal - t.kmInicial;
  const custos = t.custos.abastecimento + t.custos.outros;
  const lucro = t.apurado - custos;
  const vHora = (totalMinutos / 60) > 0 ? lucro / (totalMinutos / 60) : 0;

  document.getElementById('resumoHoras').innerText = horasFormatadas;
  // ... restante do código (KM, Custos, Lucro, etc.)
  document.getElementById('resumoValorHora').innerText = "R$ " + vHora.toFixed(2) + "/h";
}


function salvarTurnoNoHistorico() {
  if (estado.turnoAtual && estado.turnoAtual.horaFim) {
    estado.turnos.push({...estado.turnoAtual});
    estado.turnoAtual = null;
    salvar();
    alert('Turno arquivado!');
    window.location.reload(); 
  }
}

function carregarHistoricoGeral() {
  const lista = document.getElementById('listaHistorico');
  lista.innerHTML = '';

  // Inverte a ordem para mostrar o mais recente no topo
  const turnosOrdenados = [...estado.turnos].reverse();

  turnosOrdenados.forEach((t, i) => {
    // Calcula as métricas detalhadas
    const horas = diffHoras(t.horaInicio, t.horaFim);
    const custosTotais = t.custos.abastecimento + t.custos.outros;
    const lucro = t.apurado - custosTotais;
    const valorHora = horas > 0 ? lucro / horas : 0;
    const kmRodados = t.kmFinal - t.kmInicial;

    // Formata a data para exibição (assumindo que 't.data' é ISO string)
    const dataFormatada = new Date(t.data[0]).toLocaleDateString('pt-BR');

    const divTurno = document.createElement('li');
    divTurno.className = 'detalhe-turno';
    divTurno.innerHTML = `
      <div style="padding: 15px; border: 1px solid #ccc; margin-bottom: 10px; border-radius: 5px; background: #fafafa;">
        <strong>Data: ${dataFormatada} | Turno ${turnosOrdenados.length - i}</strong><br>
        ${t.horaInicio} às ${t.horaFim} (${horas.toFixed(2)}h)<br>
        KM Rodados: ${kmRodados} km<br>
        Total Abastecimento: R$ ${t.custos.abastecimento.toFixed(2)}<br>
        Outros Custos: R$ ${t.custos.outros.toFixed(2)}<br>
        Valor Apurado: R$ ${t.apurado.toFixed(2)}<br>
        Lucro: <strong style="color:green;">R$ ${lucro.toFixed(2)}</strong><br>
        Valor da Hora: R$ ${valorHora.toFixed(2)}
      </div>
    `;
    lista.appendChild(divTurno);
  });
}

function carregarResumoDia() {
  const hoje = new Date().toISOString().split('T')[0];
  const turnosDia = estado.turnos.filter(t => t.data[0] === hoje); // Acessa o índice 0 da data ISO

  let lucroTotal = 0;
  let kmTotal = 0;
  let minutosTotal = 0;
  let abastecimentoTotal = 0;
  let outrosTotal = 0;
  let apuradoTotal = 0;

  turnosDia.forEach(t => {
    minutosTotal += diffHoras(t.horaInicio, t.horaFim);
    kmTotal += (t.kmFinal - t.kmInicial);
    abastecimentoTotal += t.custos.abastecimento;
    outrosTotal += t.custos.outros;
    apuradoTotal += t.apurado;
    lucroTotal += (t.apurado - (t.custos.abastecimento + t.custos.outros));
  });

  const horasFormatadas = formatarMinutosParaHHMM(minutosTotal / 60);
  const valorHoraMedia = (minutosTotal / 60) > 0 ? lucroTotal / (minutosTotal / 60) : 0;

  // Atualiza os elementos na tela Resumo do Dia
  document.getElementById('diaHorasTrabalhadas').innerText = horasFormatadas;
  document.getElementById('diaKM').innerText = `${kmTotal} km`;
  document.getElementById('diaAbastecido').innerText = `R$ ${abastecimentoTotal.toFixed(2)}`;
  document.getElementById('diaOutrosCustos').innerText = `R$ ${outrosTotal.toFixed(2)}`;
  document.getElementById('diaApurado').innerText = `R$ ${apuradoTotal.toFixed(2)}`;
  document.getElementById('diaLucro').innerText = `R$ ${lucroTotal.toFixed(2)}`;
  document.getElementById('diaValorHora').innerText = `R$ ${valorHoraMedia.toFixed(2)}`;
}

function limparTodoHistorico() {
  if(confirm("Deseja apagar TUDO?")) {
    estado.turnos = [];
    salvar();
    carregarHistoricoGeral();
  }
}

function irPara(id) {
  // 1. Esconde todas as telas e mostra a selecionada
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
  const telaDestino = document.getElementById(id);
  
  if (telaDestino) {
    telaDestino.classList.add('ativa');
  } else {
    console.error(`Tela com id "${id}" não encontrada.`);
    return;
  }

  // 2. Gatilhos de carregamento de dados conforme a tela
  if (id === 'resumoTurno') {
    carregarResumoTurno();
  } 
  else if (id === 'resumoDia') {
    carregarResumoDia();
  } 
  else if (id === 'historicoGeral') {
    carregarHistoricoGeral();
  }
}

// Registro do SW para 2026
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(e => console.log(e));
}




