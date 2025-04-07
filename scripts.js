document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll(".container > div"); // Seleciona todas as seções
  const navLinks = document.querySelectorAll(".nav-link"); // Seleciona os links do menu

  function showSection(sectionId) {
    sections.forEach(section => {
      section.style.display = section.id === sectionId ? "block" : "none";
    });
  }

  // Oculta todas as seções e exibe apenas a Home ao carregar a página
  showSection("home");

  // Adiciona evento de clique aos itens do menu para alternar seções
  navLinks.forEach(link => {
    link.addEventListener("click", function (event) {
      event.preventDefault(); // Evita a navegação padrão do link
      const targetId = this.getAttribute("href").replace("#", ""); // Obtém o ID da seção correspondente

      // Atualiza a exibição das seções
      showSection(targetId);

      // Atualiza a classe 'active' nos botões da navbar
      navLinks.forEach(nav => nav.classList.remove("active"));
      this.classList.add("active");
    });
  });
});

/* Função responsável por apresentar mensagens de sucesso, informação, atenção e erro */
function mostrarMensagem(mensagem, tipo = "success", tempo = 3000) {
  const alerta = document.createElement("div");
  alerta.className = `alert ${tipo}`;
  alerta.innerText = mensagem;

  document.body.appendChild(alerta);

  // Remover depois do tempo especificado
  setTimeout(() => {
    alerta.style.opacity = '0';
    setTimeout(() => {
      alerta.remove();
    }, 1000); // tempo para o fade-out
  }, tempo);
}

/* Associa os botões de navegação às suas respectivas funções */
const linkActions = {
  linkLivros: getListaLivros,
  linkAutores: getListasAutoresCadastro,
  linkEditoras: getListasEditorasCadastro,
  linkLivrosHome: getListaLivros,
  linkAutoresHome: getListasAutoresCadastro,
  linkEditorasHome: getListasEditorasCadastro,
};

Object.entries(linkActions).forEach(([id, func]) => {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener("click", func);
  }
});

/* Lista com o nome de todas as seções */
const secoes = [
  "home",
  "visualizarLivros", "cadastrarLivro", "visualizarLivro",
  "visualizarEditoras", "cadastrarEditora",
  "visualizarAutores", "cadastrarAutor"
];


/* Função responsável por mostrar a seção ativa e esconder as outras */
function mostrarSecao(id) {
  secoes.forEach(secaoId => {
    const el = document.getElementById(secaoId);
    if (el) el.style.display = (secaoId === id) ? "block" : "none";
  });
}

function mostrarCadastroLivro() {
  getListaEditoras();
  getListaAutores();
  mostrarSecao("cadastrarLivro");
  limparCamposCadastroLivro();
}

function mostrarListaLivros() {
  getListaLivros();
  mostrarSecao("visualizarLivros");
}

function mostrarLivro() {
  mostrarSecao("visualizarLivro");
}

function mostrarCadastroEditora() {
  getListasEditorasCadastro();
  mostrarSecao("cadastrarEditora");
  document.getElementById("novoNomeEditora").value = '';
}

function mostrarListaEditoras() {
  getListasEditorasCadastro();
  mostrarSecao("visualizarEditoras");
}

function mostrarCadastroAutor() {
  getListasAutoresCadastro();
  mostrarSecao("cadastrarAutor");
  document.getElementById("novoNomeAutor").value = '';
}

function mostrarListaAutores() {
  getListasAutoresCadastro();
  mostrarSecao("visualizarAutores");
}

function voltarHome() {
  mostrarSecao("home");
}

function limparCamposCadastroLivro() {
  document.getElementById("novoTituloLivro").value = '';
  document.querySelector("input[type='date']").value = null;
  document.getElementById("selectAutor").value = null;
  document.getElementById("selectEditora").value =  null;
}

/*
  --------------------------------------------------------------------------------------
  Função para obter a lista de livros existente do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
let livroTitulo;
function setLivroTitulo(titulo) {
  livroTitulo = titulo;
}

async function getListaLivros() {
  let url = "http://127.0.0.1:5000/livros";

  fetch(url, { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      // Se `data` for um objeto, acessa `data.livros`
      let livros = data.livros;

      if (!Array.isArray(livros)) {
        console.error("Erro: Resposta da API não contém uma lista de livros.");
        return;
      }

      let tableBody = document.getElementById("livrosTableBody");
      tableBody.innerHTML = ""; // Limpa a tabela

      livros.forEach((livro) => {
        let autores = livro.autores.join(", ");

        let row = `
                  <tr>
                      <td>${livro.titulo}</td>
                      <td>${livro.ano_publicacao}</td>
                      <td>${livro.editora}</td>
                      <td>${autores}</td>
                      <td>
                          <button class="btn btn-success btn-sm" onclick="visualizarLivro('${livro.titulo}')">Ver</button>
                          <button class="btn btn-danger btn-sm" type="button" data-bs-toggle="modal" data-bs-target="#myModal" onclick="setLivroTitulo('${livro.titulo}')">Excluir</button>
                      </td>
                  </tr>
              `;
        tableBody.innerHTML += row;
      });
    })
    .catch((error) => {
      console.error("Erro ao buscar livros:", error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Função para deletar um item da lista do servidor via requisição DELETE
  --------------------------------------------------------------------------------------
*/
const deleteLivro = () => {
  if (livroTitulo != null && livroTitulo !== '') {
    const url = 'http://127.0.0.1:5000/livro?titulo=' + encodeURIComponent(livroTitulo);

    fetch(url, {
      method: 'DELETE'
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erro ao excluir o livro: ${response.status} - ${response.statusText}`);
        }
      })
      .then(() => {
        getListaLivros(); // Atualiza a lista após deletar
        mostrarMensagem("Livro excluído com sucesso!", "success");
      })
      .catch((error) => {
        mostrarMensagem("Erro ao tentar excluir o livro!", "error");
      });
  } else {
    mostrarMensagem("Informe o título do livro para deletar.", "warning");
  }
};


function excluirLivroConfirmado() {
  excluirLivro(livroId); // Chama a função com o ID do livro armazenado
}

/*
  --------------------------------------------------------------------------------------
  Função para obter um livro existente do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
const visualizarLivro = async (livroTitulo) => {
  mostrarLivro();

  const formData = new FormData();
  formData.append('titulo', livroTitulo);

  let url = `http://127.0.0.1:5000/livro?titulo=${encodeURIComponent(livroTitulo)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const livro = await response.json();

    let autores = livro.autores.join(", ");

    // Atualizar o HTML com os dados recebidos
    document.getElementById("livroDetalhe").innerHTML = `
      <h3 class="mb-4">${livro.titulo}</h3>
      <p><strong>Autor(es):</strong> ${autores}</p>
      <p><strong>Ano de Publicação:</strong> ${livro.ano_publicacao}</p>
      <p><strong>Editora:</strong> ${livro.editora}</p>
    `;

  } catch (error) {
    console.error('Erro:', error);
    document.getElementById("livroDetalhe").innerHTML = `
      <p class="text-danger">Erro ao carregar os dados do livro.</p>
    `;
  }
};

/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo autor - campo: nome 
  --------------------------------------------------------------------------------------
*/
const novoAutor = () => {
  let inputNomeAutor = document.getElementById("novoNomeAutor").value;

  if (inputNomeAutor === '') {
    mostrarMensagem("Escreva o nome do autor!", "warning");
  } else {
    cadastrarAutor(inputNomeAutor);
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para adicionar um autor na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const cadastrarAutor = async (inputNomeAutor) => {
  const formData = new FormData();
  formData.append('nome', inputNomeAutor);

  const url = 'http://127.0.0.1:5000/autor';

  fetch(url, {
    method: 'POST',
    body: formData
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
      }
    })
    .then(() => {
      mostrarMensagem("Autor cadastrado com sucesso!", "success");
      document.getElementById("novoNomeAutor").value = '';
    })
    .catch(() => {
      mostrarMensagem("Erro ao cadastrar autor!", "error");
    });
};


/*
  --------------------------------------------------------------------------------------
  Função para obter a lista editoras do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
const getListaEditoras = async () => {
  let url = 'http://127.0.0.1:5000/editoras';

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    let select = document.getElementById("selectEditora");
    select.innerHTML = '<option value="">Selecione uma editora</option>'; // Limpa e adiciona a opção padrão

    data.editoras.forEach(editora => {
      let option = document.createElement("option");
      option.value = editora.id;
      option.textContent = editora.nome;
      select.appendChild(option);
    });

  } catch (error) {
    mostrarMensagem("Erro ao carregar editoras. Tente novamente mais tarde.", "error");
  }
};

/*
  --------------------------------------------------------------------------------------
  Função para obter uma lista de editoras cadastradas do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
async function getListasEditorasCadastro() {
  let url = "http://127.0.0.1:5000/editoras";

  try {
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    let editoras = data.editoras;

    if (!Array.isArray(editoras)) {
      console.error("Erro: Resposta da API não contém uma lista de editoras.");
      return;
    }

    let tableBody = document.getElementById("editorasTableBody");
    tableBody.innerHTML = ""; // Limpa a tabela

    editoras.forEach((editora) => {
      let row = `
        <tr>
          <td>${editora.nome}</td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });

  } catch (error) {
    mostrarMensagem("Erro ao carregar editoras. Tente novamente mais tarde.", "error");
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para obter a lista autores do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
const getListaAutores = async () => {
  let url = 'http://127.0.0.1:5000/autores';

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    let select = document.getElementById("selectAutor");
    select.innerHTML = '<option value="" disabled selected>Selecione um autor</option>'; // Limpa e adiciona a opção padrão

    if (!Array.isArray(data.autores)) {
      throw new Error("Formato de dados inesperado: autores não é uma lista.");
    }

    data.autores.forEach(autor => {
      let option = document.createElement("option");
      option.value = autor.id;
      option.textContent = autor.nome;
      select.appendChild(option);
    });

  } catch (error) {
    mostrarMensagem("Erro ao carregar autores. Tente novamente mais tarde.", "error");
  }
};


async function getListasAutoresCadastro() {
  let url = "http://127.0.0.1:5000/autores";

  try {
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    const autores = data.autores;

    if (!Array.isArray(autores)) {
      throw new Error("A resposta da API não contém uma lista válida de autores.");
    }

    const tableBody = document.getElementById("autoresTableBody");
    tableBody.innerHTML = ""; // Limpa a tabela

    autores.forEach((autor) => {
      const row = `
        <tr>
          <td>${autor.nome}</td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });

  } catch (error) {
    mostrarMensagem("Erro ao buscar os autores.", "error");
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo autor - campos: nome 
  --------------------------------------------------------------------------------------
*/
const novoLivro = (event) => {
  event.preventDefault(); // Evita o recarregamento da página ao clicar no botão

  let novoTituloLivro = document.getElementById("novoTituloLivro").value;
  let novoAnoPubliLivro = document.querySelector("input[type='date']").value;

  let selectAutores = document.getElementById("selectAutor");
  let novoAutoresLivro = Array.from(selectAutores.selectedOptions).map(option => parseInt(option.value, 10)); // Convertendo para inteiro

  console.log(novoAutoresLivro)

  let novoEditoraLivro = document.getElementById("selectEditora").value;

  // Validação
  if (novoTituloLivro === '') {
    mostrarMensagem("Escreva o título do livro!", "warning");
  } else if (novoAnoPubliLivro === '') {
    mostrarMensagem("Escreva o ano de publicação!", "warning");
  } else if (novoAutoresLivro.length === 0 || Number.isNaN(novoAutoresLivro[0])) {
    mostrarMensagem("Selecione pelo menos um autor!", "warning");
  } else if (novoEditoraLivro === '') {
    mostrarMensagem("Selecione uma editora!", "warning");
  } else {
    cadastrarLivro(novoTituloLivro, novoAnoPubliLivro, novoAutoresLivro, novoEditoraLivro);
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para colocar uma livro na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const cadastrarLivro = async (novoTituloLivro, novoAnoPubliLivro, novoAutoresLivro, novoEditoraLivro) => {
  const formData = new FormData();

  let dataFormatada;
  try {
    dataFormatada = new Date(novoAnoPubliLivro).toISOString();
  } catch (dateError) {
    mostrarMensagem("Data inválida.", "error");
    return;
  }

  formData.append('titulo', novoTituloLivro);
  formData.append('ano_publicacao', dataFormatada);
  formData.append('id_editora', novoEditoraLivro);

  novoAutoresLivro.forEach(autor => {
    formData.append('ids_autores', autor);
  });

  const url = 'http://127.0.0.1:5000/livro';

  fetch(url, {
    method: 'POST',
    body: formData
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
      }
    })
    .then((data) => {
      mostrarMensagem("Livro cadastrado com sucesso!", "success");
      limparCamposCadastroLivro();
    })
    .catch((error) => {
      mostrarMensagem("Erro ao cadastrar livro!", "error");
    });
};

/*
  --------------------------------------------------------------------------------------
  Função para adicionar uma nova editora - campos: nome 
  --------------------------------------------------------------------------------------
*/
const novaEditora = (event) => {
  event.preventDefault();

  let inputNomeEditora = document.getElementById("novoNomeEditora").value;

  if (inputNomeEditora === '') {
    mostrarMensagem("Escreva o nome da editora!", "warning");
  } else {
    cadastrarEditora(inputNomeEditora);
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para colocar uma editora na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const cadastrarEditora = async (inputNomeEditora) => {
  const formData = new FormData();
  formData.append('nome', inputNomeEditora);

  const url = 'http://127.0.0.1:5000/editora';

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
    }

    mostrarMensagem("Editora cadastrada com sucesso!", "success");
    document.getElementById("novoNomeEditora").value = '';

  } catch (error) {
    mostrarMensagem("Erro ao cadastrar editora!", "error");
  }
};