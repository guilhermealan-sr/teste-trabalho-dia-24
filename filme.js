const params = new URLSearchParams(location.search);
const paginaFixa = !!document.body.dataset.id; 
const idFilme = Number(document.body.dataset.id) || Number(params.get("id"));
const filme = paginaFixa ? true : bancoFilmes.find(f => f.id === idFilme);

const conteudo = document.getElementById("conteudo-filme");
const erroFilme = document.getElementById("filme-erro");
const caixaEstrelas = document.getElementById("estrelas");
const textoNota = document.getElementById("texto-nota");
const campoResenha = document.getElementById("campo-resenha");
const contador = document.getElementById("contador");
const btnSalvar = document.getElementById("btn-salvar");
const avisoLogin = document.getElementById("aviso-login");

let nota = 0;
let emailMostrado = null; 

function pegarAvaliacoes() {
    return JSON.parse(localStorage.getItem("avaliacoes")) || {};
}

function usuarioAtual() {
    
    const usuario = pegarUsuarioLogado();
    if (usuario) return usuario;

    
    const email = localStorage.getItem("logado");
    return email ? { email: email } : null;
}

function chaveAvaliacao() {
    return usuarioAtual().email + "|" + idFilme;
}

let previa = null; 

function desenharTomate(i, colorido) {
    const corpo = colorido ? "url(#corpo" + i + ")" : "#34414c";
    const contorno = colorido ? "#a3230f" : "#4d5c68";
    const folhas = colorido ? "#43b050" : "#485862";
    const contornoFolhas = colorido ? "#2c8a3a" : "#566673";

    const degrade = colorido
        ? '<defs><radialGradient id="corpo' + i + '" cx="35%" cy="32%" r="78%">' +
          '<stop offset="0%" stop-color="#ff8a7a"/><stop offset="45%" stop-color="#e83a22"/>' +
          '<stop offset="100%" stop-color="#a81d0d"/></radialGradient></defs>'
        : "";
    const brilho = colorido
        ? '<ellipse cx="10.4" cy="14.6" rx="3.3" ry="1.7" transform="rotate(-38 10.4 14.6)" fill="#fff" opacity="0.38"/>'
        : "";

    return '<svg viewBox="0 0 32 32" width="38" height="38" style="display:block" aria-hidden="true">' + degrade +
        '<path d="M16 9.2 C9.4 6.6 2.8 11.4 3.2 18.8 C3.7 25.7 9.6 30 16 30 C22.4 30 28.3 25.7 28.8 18.8 C29.2 11.4 22.6 6.6 16 9.2 Z" fill="' + corpo + '" stroke="' + contorno + '" stroke-width="0.8" stroke-linejoin="round"/>' +
        brilho +
        '<path d="M16 7.4 L17.7 9.5 L20.9 8.5 L19.7 11.1 L22.7 12.4 L19.4 12.9 L18.3 15.5 L16 13.3 L13.7 15.5 L12.6 12.9 L9.3 12.4 L12.3 11.1 L11.1 8.5 L14.3 9.5 Z" fill="' + folhas + '" stroke="' + contornoFolhas + '" stroke-width="0.6" stroke-linejoin="round"/>' +
        '<path d="M16 9 C16 6.6 16.5 4.6 17.8 3" fill="none" stroke="' + contornoFolhas + '" stroke-width="1.7" stroke-linecap="round"/>' +
        "</svg>";
}

function criarTomates() {
    caixaEstrelas.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "estrela";
        botao.dataset.posicao = i;
        botao.setAttribute("aria-label", i + (i > 1 ? " tomates" : " tomate"));
        
        botao.style.cssText = "position:relative;width:38px;height:38px;padding:0;border:none;background:none;cursor:pointer;";
        botao.innerHTML =
            '<span class="base" style="display:block;filter:none;opacity:1;">' + desenharTomate(i, false) + '</span>' +
            '<span class="cheio" style="position:absolute;top:0;left:0;height:100%;width:0;overflow:hidden;display:block;">' + desenharTomate(i, true) + '</span>';
        caixaEstrelas.appendChild(botao);
    }
}

function formatarNota(valor) {
    return String(valor).replace(".", ",");
}

function desenharEstrelas() {
    const valor = previa !== null ? previa : nota;

    caixaEstrelas.querySelectorAll(".estrela").forEach(function (botao) {
        const posicao = Number(botao.dataset.posicao);
        const parte = Math.min(1, Math.max(0, valor - (posicao - 1))); // 0, 0.5 ou 1
        botao.querySelector(".cheio").style.width = (parte * 100) + "%";
    });

    textoNota.textContent = valor === 0 ? "Sem nota" : formatarNota(valor) + " de 5 tomates";
}

function valorPelaPosicao(e, botao) {
    const posicao = Number(botao.dataset.posicao);
    const caixa = botao.getBoundingClientRect();
    return e.clientX - caixa.left < caixa.width / 2 ? posicao - 0.5 : posicao;
}

function carregarAvaliacao() {
    const salva = pegarAvaliacoes()[chaveAvaliacao()];
    if (salva) {
        nota = Number(salva.estrelas) || 0;
        campoResenha.value = salva.resenha;
    }
    contador.textContent = campoResenha.value.length;
    desenharEstrelas();
}

if (!filme) {
    erroFilme.hidden = false;
} else {
  if (!paginaFixa) {
    document.title = filme.titulo + " - Coleção Front-End";

    const poster = document.getElementById("filme-poster");
    poster.src = filme.imagem;
    poster.alt = "Cartaz de " + filme.titulo;

    document.getElementById("filme-titulo").textContent = filme.titulo;
    document.getElementById("filme-genero").textContent = filme.genero;
    document.getElementById("filme-sinopse").textContent = filme.sinopse || "";

    conteudo.hidden = false;
  }
    criarTomates();
    desenharEstrelas();
    atualizarLogin();
}


function atualizarLogin() {
    const usuario = usuarioAtual();

    avisoLogin.hidden = !!usuario;
    campoResenha.disabled = !usuario;
    btnSalvar.disabled = !usuario;

    
    const link = avisoLogin.querySelector("a");
    if (link) {
        const destino = link.href.split("?")[0];
        const pastaDoPerfil = destino.replace(/[^/]*$/, "");
        const paginaAtual = location.href.split("#")[0].split("?")[0];

        if (paginaAtual.startsWith(pastaDoPerfil)) {
            link.href = destino + "?voltar=" + encodeURIComponent(paginaAtual.slice(pastaDoPerfil.length) + location.search);
        } else {
            link.href = destino;
        }
    }

    
    let dica = document.getElementById("dica-file");
    if (!usuario && location.protocol === "file:") {
        if (!dica) {
            dica = document.createElement("small");
            dica.id = "dica-file";
            dica.style.display = "block";
            dica.style.marginTop = "6px";
            dica.textContent = "Se você já fez login e este aviso continua, é porque o site foi aberto direto do arquivo (file://) " +
                "e o navegador não repassa o login para esta página. Abra o site pelo Live Server do VS Code.";
            avisoLogin.appendChild(dica);
        }
    } else if (dica) {
        dica.remove();
    }

    const email = usuario ? usuario.email : null;
    if (email !== emailMostrado) {
        emailMostrado = email;
        nota = 0;
        campoResenha.value = "";
        if (usuario) carregarAvaliacao();
        else { contador.textContent = 0; desenharEstrelas(); }
    }
}


window.addEventListener("pageshow", function () {
    if (conteudo && !conteudo.hidden) atualizarLogin();
});
window.addEventListener("focus", function () {
    if (conteudo && !conteudo.hidden) atualizarLogin();
});
window.addEventListener("storage", function () {
    if (conteudo && !conteudo.hidden) atualizarLogin();
});

caixaEstrelas.addEventListener("click", function (e) {
    const botao = e.target.closest(".estrela");
    if (!botao || !usuarioAtual()) return;

    
    const valor = e.detail === 0 ? Number(botao.dataset.posicao) : valorPelaPosicao(e, botao);
    nota = nota === valor ? 0 : valor; 
    previa = null;
    desenharEstrelas();
});

caixaEstrelas.addEventListener("mousemove", function (e) {
    const botao = e.target.closest(".estrela");
    if (!botao || !usuarioAtual()) return;

    previa = valorPelaPosicao(e, botao);
    desenharEstrelas();
});

caixaEstrelas.addEventListener("mouseleave", function () {
    previa = null;
    desenharEstrelas();
});

campoResenha.addEventListener("input", function () {
    contador.textContent = campoResenha.value.length;
});

document.getElementById("form-resenha").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!usuarioAtual()) return;

    const avaliacoes = pegarAvaliacoes();
    const resenha = campoResenha.value.trim();
    const chave = chaveAvaliacao();

    if (nota === 0 && !resenha) {
        delete avaliacoes[chave];
    } else {
        avaliacoes[chave] = {
            estrelas: nota,
            resenha: resenha,
            data: Date.now()
        };
    }

    localStorage.setItem("avaliacoes", JSON.stringify(avaliacoes));

    btnSalvar.textContent = "Avaliação salva!";
    setTimeout(() => btnSalvar.textContent = "Salvar avaliação", 2000);
});
    }
    localStorage.setItem("avaliacoes", JSON.stringify(avaliacoes));

    btnSalvar.textContent = "Avaliação salva!";
    setTimeout(() => btnSalvar.textContent = "Salvar avaliação", 2000);
});
