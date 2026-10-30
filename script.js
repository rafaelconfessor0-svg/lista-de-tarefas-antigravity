/**
 * ============================================================================
 * SCRIPT PRINCIPAL: script.js
 * Responsabilidade: Lógica de negócio, controle de estado, persistência em
 * LocalStorage, manipulação de eventos e atualização do DOM (HTML dinâmico).
 * ============================================================================
 */

// Chave utilizada para identificar e salvar nossos dados no LocalStorage do navegador
const CHAVE_LOCAL_STORAGE = 'minhas_tarefas_app_v1';

/* ----------------------------------------------------------------------------
   1. ESTADO DA APLICAÇÃO (Single Source of Truth)
   O "estado" representa os dados em tempo real da aplicação na memória.
   ---------------------------------------------------------------------------- */
let tarefas = [];           // Array que armazena os objetos de tarefas
let filtroAtual = 'todas';   // Opções: 'todas' | 'pendentes' | 'concluidas'

/* ----------------------------------------------------------------------------
   2. SELEÇÃO DOS ELEMENTOS DO DOM
   Capturamos referências aos elementos do HTML para poder manipulá-los via JS.
   ---------------------------------------------------------------------------- */
const formTarefa = document.getElementById('form-tarefa');
const inputTarefa = document.getElementById('input-tarefa');
const listaTarefas = document.getElementById('lista-tarefas');
const estadoVazio = document.getElementById('estado-vazio');
const descricaoVazio = document.getElementById('descricao-vazio');

const contadorTotal = document.getElementById('contador-total');
const contadorPendentes = document.getElementById('contador-pendentes');
const contadorConcluidas = document.getElementById('contador-concluidas');

const botoesFiltro = document.querySelectorAll('.btn-filtro');
const btnLimparConcluidas = document.getElementById('btn-limpar-concluidas');
const elementoDataAtual = document.getElementById('data-atual');

/* ----------------------------------------------------------------------------
   3. PERSISTÊNCIA: LOCALSTORAGE
   Permite salvar e carregar os dados mesmo que o usuário recarregue a página.
   ---------------------------------------------------------------------------- */

/**
 * Lê e converte as tarefas salvas no LocalStorage de JSON (texto) para Array (objeto).
 * Usa try/catch para garantir segurança caso o dado esteja ausente ou corrompido.
 */
function carregarTarefasDoLocalStorage() {
  try {
    const dadosSalvos = localStorage.getItem(CHAVE_LOCAL_STORAGE);
    if (dadosSalvos) {
      tarefas = JSON.parse(dadosSalvos);
    } else {
      tarefas = [];
    }
  } catch (erro) {
    console.error('Erro ao ler tarefas do LocalStorage:', erro);
    tarefas = [];
  }
}

/**
 * Converte o array de tarefas em texto JSON e salva no LocalStorage do navegador.
 */
function salvarTarefasNoLocalStorage() {
  try {
    localStorage.setItem(CHAVE_LOCAL_STORAGE, JSON.stringify(tarefas));
  } catch (erro) {
    console.error('Erro ao salvar tarefas no LocalStorage:', erro);
  }
}

/* ----------------------------------------------------------------------------
   4. REGRAS DE NEGÓCIO E GERENCIAMENTO DE TAREFAS
   ---------------------------------------------------------------------------- */

/**
 * Cria uma nova tarefa com id único e a adiciona ao início da lista.
 * @param {string} texto - O texto digitado pelo usuário.
 */
function adicionarTarefa(texto) {
  const textoLimpo = texto.trim();

  // Validação: não permitir adicionar tarefas em branco ou só com espaços
  if (!textoLimpo) {
    inputTarefa.focus();
    return;
  }

  // Criação do objeto da tarefa
  const novaTarefa = {
    id: Date.now(), // Gera um identificador único baseado no timestamp atual
    texto: textoLimpo,
    concluida: false,
    criadoEm: new Date().toISOString()
  };

  // Adiciona a nova tarefa no início do array (unshift) para aparecer no topo
  tarefas.unshift(novaTarefa);

  // Persiste os dados e atualiza a interface
  salvarTarefasNoLocalStorage();
  renderizarAplicacao();

  // Limpa o campo de entrada e devolve o cursor para facilitar novas adições
  inputTarefa.value = '';
  inputTarefa.focus();
}

/**
 * Alterna o status de concluída/pendente de uma tarefa pelo ID.
 * @param {number} id - Identificador da tarefa.
 */
function alternarStatusTarefa(id) {
  tarefas = tarefas.map((tarefa) => {
    if (tarefa.id === id) {
      return { ...tarefa, concluida: !tarefa.concluida };
    }
    return tarefa;
  });

  salvarTarefasNoLocalStorage();
  renderizarAplicacao();
}

/**
 * Remove uma tarefa da lista pelo ID.
 * @param {number} id - Identificador da tarefa a ser removida.
 */
function removerTarefa(id) {
  // O método filter cria um novo array contendo apenas as tarefas cujo id é diferente do selecionado
  tarefas = tarefas.filter((tarefa) => tarefa.id !== id);

  salvarTarefasNoLocalStorage();
  renderizarAplicacao();
}

/**
 * Remove todas as tarefas que já foram marcadas como concluídas.
 */
function limparTarefasConcluidas() {
  const quantidadeConcluidas = tarefas.filter(t => t.concluida).length;
  
  if (quantidadeConcluidas === 0) {
    return; // Nada para limpar
  }

  tarefas = tarefas.filter((tarefa) => !tarefa.concluida);

  salvarTarefasNoLocalStorage();
  renderizarAplicacao();
}

/**
 * Altera o filtro ativo (todas, pendentes ou concluídas) e atualiza os botões visuais.
 * @param {string} novoFiltro - 'todas' | 'pendentes' | 'concluidas'
 */
function alterarFiltro(novoFiltro) {
  filtroAtual = novoFiltro;

  // Atualiza as classes visuais dos botões de filtro
  botoesFiltro.forEach((botao) => {
    const isActive = botao.getAttribute('data-filtro') === novoFiltro;
    botao.classList.toggle('ativo', isActive);
    botao.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  renderizarAplicacao();
}

/**
 * Retorna o array de tarefas filtrado de acordo com o filtro atualmente ativo.
 * @returns {Array} Array com as tarefas filtradas
 */
function obterTarefasFiltradas() {
  if (filtroAtual === 'pendentes') {
    return tarefas.filter((t) => !t.concluida);
  }
  if (filtroAtual === 'concluidas') {
    return tarefas.filter((t) => t.concluida);
  }
  return tarefas; // 'todas'
}

/* ----------------------------------------------------------------------------
   5. FUNÇÕES DE UTILIDADE E SEGURANÇA
   ---------------------------------------------------------------------------- */

/**
 * Escapa caracteres HTML para prevenir falhas de segurança XSS (Cross-Site Scripting).
 * @param {string} str - Texto original inserido pelo usuário.
 * @returns {string} Texto seguro para inserção no HTML.
 */
function escaparHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Exibe a data atual formatada amigavelmente no cabeçalho (ex: Sexta-feira, 30 de Outubro).
 */
function formatarDataAtual() {
  const agora = new Date();
  const opcoes = { weekday: 'long', day: 'numeric', month: 'long' };
  try {
    const dataFormatada = agora.toLocaleDateString('pt-BR', opcoes);
    // Capitaliza a primeira letra para ficar elegante
    const dataCapitalizada = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
    elementoDataAtual.textContent = dataCapitalizada;
  } catch (e) {
    // Fallback caso o navegador não suporte toLocaleDateString
    elementoDataAtual.textContent = 'Organize seu dia com produtividade';
  }
}

/* ----------------------------------------------------------------------------
   6. RENDERIZAÇÃO E ATUALIZAÇÃO DO DOM (Interface)
   ---------------------------------------------------------------------------- */

/**
 * Atualiza os valores dos cartões de métricas (Total, Pendentes, Concluídas).
 */
function atualizarContadores() {
  const total = tarefas.length;
  const concluidas = tarefas.filter((t) => t.concluida).length;
  const pendentes = total - concluidas;

  contadorTotal.textContent = total;
  contadorPendentes.textContent = pendentes;
  contadorConcluidas.textContent = concluidas;

  // Habilita ou desabilita o botão de limpar concluídas de acordo com a quantidade
  btnLimparConcluidas.style.opacity = concluidas > 0 ? '1' : '0.4';
  btnLimparConcluidas.style.pointerEvents = concluidas > 0 ? 'auto' : 'none';
}

/**
 * Atualiza a mensagem e descrição da área de "Estado Vazio" conforme o filtro ativo.
 */
function atualizarMensagemEstadoVazio() {
  if (tarefas.length === 0) {
    descricaoVazio.textContent = 'Adicione uma nova atividade acima para manter o foco nas suas prioridades do dia.';
  } else if (filtroAtual === 'pendentes') {
    descricaoVazio.textContent = 'Parabéns! Nenhuma tarefa pendente no momento.';
  } else if (filtroAtual === 'concluidas') {
    descricaoVazio.textContent = 'Você ainda não concluiu nenhuma tarefa nesta sessão.';
  }
}

/**
 * Função principal de renderização. Sincroniza o array de dados com os elementos HTML.
 */
function renderizarAplicacao() {
  atualizarContadores();

  const tarefasFiltradas = obterTarefasFiltradas();

  // Se não houver tarefas para exibir no filtro selecionado, exibe o "Estado Vazio"
  if (tarefasFiltradas.length === 0) {
    listaTarefas.innerHTML = '';
    atualizarMensagemEstadoVazio();
    estadoVazio.classList.remove('oculto');
    return;
  }

  // Caso contrário, oculta o estado vazio e renderiza a lista
  estadoVazio.classList.add('oculto');

  // Constrói o HTML de cada item de tarefa
  listaTarefas.innerHTML = tarefasFiltradas
    .map((tarefa) => {
      const estaConcluida = tarefa.concluida ? 'concluida' : '';
      const textoSeguro = escaparHTML(tarefa.texto);

      return `
        <li class="item-tarefa ${estaConcluida}" data-id="${tarefa.id}">
          <div class="item-tarefa-conteudo" role="button" tabindex="0" aria-label="Alternar conclusão da tarefa: ${textoSeguro}">
            <div class="custom-checkbox" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span class="texto-tarefa">${textoSeguro}</span>
          </div>
          
          <button 
            type="button" 
            class="btn-remover" 
            aria-label="Excluir tarefa: ${textoSeguro}" 
            title="Excluir tarefa"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </li>
      `;
    })
    .join('');
}

/* ----------------------------------------------------------------------------
   7. EVENT LISTENERS (Escuta e Reação às Ações do Usuário)
   ---------------------------------------------------------------------------- */

// Evento ao submeter o formulário (pressionando Enter ou clicando no botão Adicionar)
formTarefa.addEventListener('submit', (evento) => {
  evento.preventDefault(); // Impede o recarregamento padrão da página ao submeter o form
  adicionarTarefa(inputTarefa.value);
});

/**
 * DELEGAÇÃO DE EVENTOS NA LISTA DE TAREFAS:
 * Ao invés de anexar ouvintes individuais em cada item da lista (o que consome mais memória
 * e exige criar novos ouvintes toda vez que uma tarefa é adicionada), colocamos um único
 * ouvinte no elemento pai (<ul id="lista-tarefas">).
 */
listaTarefas.addEventListener('click', (evento) => {
  // Encontra o item <li> mais próximo do clique
  const itemTarefa = evento.target.closest('.item-tarefa');
  if (!itemTarefa) return;

  const id = Number(itemTarefa.dataset.id);

  // Se o clique foi no botão de remoção ou no ícone dentro dele
  if (evento.target.closest('.btn-remover')) {
    removerTarefa(id);
    return;
  }

  // Se o clique foi no conteúdo (checkbox ou texto), alternamos a conclusão
  if (evento.target.closest('.item-tarefa-conteudo')) {
    alternarStatusTarefa(id);
  }
});

// Suporte para alternar tarefa usando o teclado (Acessibilidade com tecla Espaço ou Enter)
listaTarefas.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter' || evento.key === ' ') {
    const itemConteudo = evento.target.closest('.item-tarefa-conteudo');
    if (itemConteudo) {
      evento.preventDefault();
      const itemTarefa = itemConteudo.closest('.item-tarefa');
      if (itemTarefa) {
        alternarStatusTarefa(Number(itemTarefa.dataset.id));
      }
    }
  }
});

// Ouvintes para os botões de filtro (Todas, Pendentes, Concluídas)
botoesFiltro.forEach((botao) => {
  botao.addEventListener('click', () => {
    const filtroSelecionado = botao.getAttribute('data-filtro');
    alterarFiltro(filtroSelecionado);
  });
});

// Ouvinte para o botão de limpar tarefas concluídas
btnLimparConcluidas.addEventListener('click', () => {
  limparTarefasConcluidas();
});

/* ----------------------------------------------------------------------------
   8. INICIALIZAÇÃO DA APLICAÇÃO
   Executado quando a página termina de carregar.
   ---------------------------------------------------------------------------- */
function inicializar() {
  formatarDataAtual();
  carregarTarefasDoLocalStorage();
  renderizarAplicacao();
}

// Inicializa a aplicação
inicializar();
