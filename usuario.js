function pegarUsuarios() {
    return JSON.parse(localStorage.getItem("usuarios")) || [];
}

function pegarUsuarioLogado() {
    const email = localStorage.getItem("logado");
    return pegarUsuarios().find(u => u.email === email);
}

const logado = pegarUsuarioLogado();
const nomeUsuario = document.getElementById("nomeUsuario");
const botaoBanner = document.getElementById("botaoBanner");
const numCatalogo = document.getElementById("numCatalogo");
const gradePosters = document.getElementById("gradePosters");

if (logado && nomeUsuario) {
    nomeUsuario.textContent = logado.nick;
}

if (!logado && botaoBanner) {
    botaoBanner.textContent = "Criar uma conta";
    botaoBanner.href = "perfil.html?cadastro";
    botaoBanner.className = "btn-rosa";
}

if (numCatalogo) {
    numCatalogo.textContent = bancoFilmes.length;
}

if (gradePosters) {
    const restantes = bancoFilmes.slice();
    let html = "";

    for (let i = 0; i < 6 && restantes.length > 0; i++) {
        const filme = restantes.splice(Math.floor(Math.random() * restantes.length), 1)[0];
        html += `<a href="filmes.html" class="poster" title="${filme.titulo}">
            <img src="${filme.imagem}" alt="Cartaz de ${filme.titulo}">
        </a>`;
    }

    gradePosters.innerHTML = html;
}



function pegarAvaliacoes() {
    return JSON.parse(localStorage.getItem("avaliacoes")) || {};
}


function paginaDoFilme(filme) {
    const nome = filme.imagem.split("/").pop().replace(/\.[^.]+$/, "");
    return "htmls%20de%20filmes/" + nome + ".html";
}

function escapar(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatarNotaTomates(valor) {
    return String(valor).replace(".", ",");
}

const maxAtividades = 6;

function pegarAtividades(email) {
    const prefixo = email + "|";
    const avaliacoes = pegarAvaliacoes();
    const atividades = [];

    for (const chave in avaliacoes) {
        if (!chave.startsWith(prefixo)) continue;

        const filme = bancoFilmes.find(f => f.id == chave.slice(prefixo.length));
        const aval = avaliacoes[chave];
        if (!filme || (!aval.estrelas && !aval.resenha)) continue;

        atividades.push({
            filme: filme,
            estrelas: Number(aval.estrelas) || 0,
            resenha: aval.resenha || "",
            data: aval.data || 0 
        });
    }

    atividades.sort((a, b) => b.data - a.data);
    return atividades.slice(0, maxAtividades);
}

const listaAtividade = document.getElementById("listaAtividade");
const numLista = document.getElementById("numLista");
const numFavoritos = document.getElementById("numFavoritos");

if (numLista) {
    const lista = (logado && logado.lista) || [];
    numLista.textContent = lista.filter(id => bancoFilmes.some(f => f.id == id)).length;
}

if (numFavoritos) {
    const favoritos = (logado && logado.favoritos) || [];
    numFavoritos.textContent = favoritos.filter(id => bancoFilmes.some(f => f.id == id)).length;
}

if (listaAtividade) {
    const email = localStorage.getItem("logado");
    const atividades = email ? pegarAtividades(email) : [];

    if (!email) {
        listaAtividade.innerHTML = '<p class="texto-cinza m-0">Faça login para ver os filmes que você avaliou.</p>';
    } else if (atividades.length > 0) {
        let html = "";

        atividades.forEach(function (a) {
            const nota = a.estrelas > 0 ? "🍅 " + formatarNotaTomates(a.estrelas) : "Sem nota";
            const texto = a.resenha
                ? '<p class="popup-texto">' + escapar(a.resenha) + "</p>"
                : '<p class="popup-vazio">Você avaliou sem escrever resenha.</p>';

            html += `<div class="atividade-item" tabindex="0">
                <a href="${paginaDoFilme(a.filme)}" class="poster" title="${escapar(a.filme.titulo)}">
                    <img src="${a.filme.imagem}" alt="Cartaz de ${escapar(a.filme.titulo)}">
                </a>
                <div class="atividade-nota">${nota}</div>
                <div class="popup-resenha" role="tooltip">
                    <span class="popup-titulo">${escapar(a.filme.titulo)}</span>
                    <div class="popup-nota">${a.estrelas > 0 ? nota + " de 5" : "Sem nota"}</div>
                    ${texto}
                </div>
            </div>`;
        });

        listaAtividade.innerHTML = '<div class="grade-posters" style="margin-bottom: 0;">' + html + "</div>";

        listaAtividade.querySelectorAll(".atividade-item").forEach(function (item) {
            const popup = item.querySelector(".popup-resenha");

            function ajustarPosicao() {
                popup.classList.remove("alinhar-direita");
                if (popup.getBoundingClientRect().right > window.innerWidth - 8) {
                    popup.classList.add("alinhar-direita");
                }
            }

            item.addEventListener("mouseenter", ajustarPosicao);
            item.addEventListener("focusin", ajustarPosicao);
        });
    }
}
