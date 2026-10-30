# 📝 Gerenciador de Tarefas (To-Do List)

Aplicação web moderna, intuitiva e responsiva para gerenciamento de tarefas do dia a dia, desenvolvida com tecnologias puras da Web: **HTML5**, **CSS3** e **JavaScript (ES6+)**, sem frameworks externos.

Este projeto foi construído com foco pedagógico para a formação em **Engenharia de Software com Inteligência Artificial**.

---

## 🚀 Funcionalidades

- **Adicionar Tarefas:** Campo de entrada com suporte a clique e tecla `Enter`, impedindo tarefas vazias.
- **Concluir / Desmarcar Tarefas:** Alternância com checkbox interativo e diferenciação visual imediata (texto tachado, mudança de cor e estado concluído).
- **Remover Tarefas:** Exclusão individual de tarefas com botão dedicado.
- **Limpeza em Lote:** Botão para limpar todas as tarefas concluídas de uma só vez.
- **Filtros Dinâmicos:** Visualização por abas: *Todas*, *Pendentes* e *Concluídas*.
- **Contadores em Tempo Real:** Painel com total de tarefas, pendências e concluídas.
- **Estado Vazio Amigável:** Ilustração e mensagem orientando o usuário quando a lista estiver sem itens.
- **Persistência com LocalStorage:** As tarefas continuam salvas mesmo após fechar ou atualizar o navegador (`F5`).
- **Design Responsivo:** Adaptado perfeitamente para telas de computadores, tablets e smartphones.
- **Segurança contra XSS:** Sanitização contra inserção de tags maliciosas.

---

## 📁 Estrutura de Arquivos

```text
todo-app/
├── index.html       # Estrutura semântica da aplicação (esqueleto)
├── style.css        # Estilos, variáveis de cores e responsividade (design)
├── script.js        # Lógica de negócio, LocalStorage e eventos (cérebro)
├── README.md        # Documentação do projeto
└── tests/
    └── test_runner.html  # Bateria de testes automatizados (35 asserções)
```

---

## 💻 Como Executar

### Opção 1: Abrir diretamente no Navegador
Basta dar um duplo clique no arquivo `index.html` ou abri-lo com qualquer navegador moderno (Chrome, Edge, Firefox, Safari).

### Opção 2: Servidor Local Simples (Python)
No terminal, dentro da pasta do projeto, execute:
```bash
python3 -m http.server 8000
```
E acesse no navegador: `http://localhost:8000`

---

## 🧪 Como Executar os Testes Automatizados

Abra o arquivo `tests/test_runner.html` no navegador ou execute via linha de comando com o Chrome em modo headless:
```bash
google-chrome --headless --disable-gpu --dump-dom tests/test_runner.html
```
São validadas **35 regras essenciais**, incluindo adição, conclusão, deleção, filtros, persistência no LocalStorage e proteção contra XSS.
