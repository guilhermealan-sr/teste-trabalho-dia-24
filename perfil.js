const telaConta = document.getElementById("tela-conta");
const telaPerfil = document.getElementById("tela-perfil");
const caixaCadastro = document.getElementById("caixa-cadastro");
const caixaLogin = document.getElementById("caixa-login");
const areaEditar = document.getElementById("area-editar");
const campoFoto = document.getElementById("campo-foto");
const campoBusca = document.getElementById("campo-busca");
const listaResultados = document.getElementById("lista-resultados");
const modalBusca = document.getElementById("modal-busca");
const modalLista = document.getElementById("modal-lista");
const campoBuscaLista = document.getElementById("campo-busca-lista");
const listaResultadosLista = document.getElementById("lista-resultados-lista");

const maxFavoritos = 4;

let fotoNova;

function mostrarCadastro() {
    caixaCadastro.hidden = false;
    caixaLogin.hidden = true;
}

function mostrarLogin() {
    caixaCadastro.hidden = true;
    caixaLogin.hidden = false;
}

function mostrarTelaConta() {
    telaPerfil.hidden = true;
    telaConta.hidden = false;
    if (pegarUsuarios().length == 0) {
        mostrarCadastro();
    } else {
        mostrarLogin();
    }
}

function desenharFoto(lugar, foto, nick, tamanho) {
    if (foto) {
        lugar.innerHTML = `<img src="${foto}" class="foto-perfil ${tamanho}">`;
    } else {
        lugar.innerHTML = `<div class="foto-perfil foto-inicial ${tamanho}">${nick[0].toUpperCase()}</div>`;
    }
}

function salvarUsuario(usuario) {
    const usuarios = pegarUsuarios();
    const posicao = usuarios.findIndex(u => u.email == usuario.email);
    usuarios[posicao] = usuario;
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function pegarFavoritos() {
    const favoritos = pegarUsuarioLogado().favoritos || [];
    return favoritos.filter(id => bancoFilmes.some(f => f.id == id));
}

function desenharFavoritos() {
    const ids = pegarFavoritos();
    let html = "";

    for (let i = 0; i < maxFavoritos; i++) {
        const filme = bancoFilmes.find(f => f.id == ids[i]);
        if (filme) {
            html += `<div class="slot">
                <span class="slot-titulo">${filme.titulo}</span>
                <img src="${filme.imagem}" onerror="this.style.display='none'">
                <button type="button" class="btn-remover" onclick="removerFavorito(${filme.id})">✕</button>
            </div>`;
        } else {
            html += `<button type="button" class="slot slot-vazio" data-bs-toggle="modal" data-bs-target="#modal-busca">+</button>`;
        }
    }

    document.getElementById("grade-favoritos").innerHTML = html;
}


function pegarLista() {
    const lista = pegarUsuarioLogado().lista || [];
    return lista.filter(id => bancoFilmes.some(f => f.id == id));
}

function desenharLista() {
    const ids = pegarLista();
    let html = "";

    ids.forEach(function (id) {
        const filme = bancoFilmes.find(f => f.id == id);
        html += `<div class="slot">
            <span class="slot-titulo">${filme.titulo}</span>
            <a href="${paginaDoFilme(filme)}"><img src="${filme.imagem}" alt="Cartaz de ${filme.titulo}" onerror="this.style.display='none'"></a>
            <button type="button" class="btn-remover" onclick="removerDaLista(${filme.id})">✕</button>
        </div>`;
    });

    document.getElementById("grade-lista").innerHTML = html;
    document.getElementById("lista-vazia").hidden = ids.length > 0;
    document.getElementById("contador-lista").textContent = ids.length;
}

function adicionarNaLista(id) {
    const usuario = pegarUsuarioLogado();
    const lista = pegarLista();
    if (lista.includes(id)) return;

    lista.push(id);
    usuario.lista = lista;
    salvarUsuario(usuario);
    bootstrap.Modal.getInstance(modalLista).hide();
    desenharLista();
}

function removerDaLista(id) {
    const usuario = pegarUsuarioLogado();
    usuario.lista = pegarLista().filter(f => f != id);
    salvarUsuario(usuario);
    desenharLista();
}

function desenharResultadosLista() {
    const ids = pegarLista();
    const busca = tirarAcentos(campoBuscaLista.value.trim());
    let html = "";

    bancoFilmes.forEach(function (filme) {
        if (ids.includes(filme.id)) return;
        if (!tirarAcentos(filme.titulo).includes(busca)) return;
        html += `<button type="button" class="resultado" onclick="adicionarNaLista(${filme.id})">
            <img src="${filme.imagem}" onerror="this.style.visibility='hidden'">
            <div>${filme.titulo}<br><small>${filme.genero}</small></div>
        </button>`;
    });

    listaResultadosLista.innerHTML = html || '<p class="texto-cinza m-2">Nenhum filme encontrado.</p>';
}

function voltarParaFilme() {
    const voltar = new URLSearchParams(location.search).get("voltar");
    // só volta para páginas .html do próprio site (sem "..", sem http://)
    if (voltar && !voltar.includes("..") && /^[\w\-%.]+(\/[\w\-%.]+)*\.html(\?id=\d+)?$/.test(voltar)) {
        location.href = voltar;
    }
}

function mostrarPerfil() {
    const usuario = pegarUsuarioLogado();
    telaConta.hidden = true;
    telaPerfil.hidden = false;

    document.getElementById("perfil-nick").textContent = usuario.nick;

    const bio = document.getElementById("perfil-bio");
    bio.textContent = usuario.bio || "";
    bio.hidden = !usuario.bio;

    desenharFoto(document.getElementById("area-foto"), usuario.foto, usuario.nick, "");
    desenharFavoritos();
    desenharLista();
}

function adicionarFavorito(id) {
    const usuario = pegarUsuarioLogado();
    const favoritos = pegarFavoritos();
    if (favoritos.length >= maxFavoritos) return;

    favoritos.push(id);
    usuario.favoritos = favoritos;
    salvarUsuario(usuario);
    bootstrap.Modal.getInstance(modalBusca).hide();
    desenharFavoritos();
}

function removerFavorito(id) {
    const usuario = pegarUsuarioLogado();
    usuario.favoritos = usuario.favoritos.filter(f => f != id);
    salvarUsuario(usuario);
    desenharFavoritos();
}

function tirarAcentos(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function desenharResultados() {
    const ids = pegarFavoritos();
    const busca = tirarAcentos(campoBusca.value.trim());
    let html = "";

    bancoFilmes.forEach(function (filme) {
        if (ids.includes(filme.id)) return;
        if (!tirarAcentos(filme.titulo).includes(busca)) return;
        html += `<button type="button" class="resultado" onclick="adicionarFavorito(${filme.id})">
            <img src="${filme.imagem}" onerror="this.style.visibility='hidden'">
            <div>${filme.titulo}<br><small>${filme.genero}</small></div>
        </button>`;
    });

    listaResultados.innerHTML = html || '<p class="texto-cinza m-2">Nenhum filme encontrado.</p>';
}

function desenharPrevia() {
    const usuario = pegarUsuarioLogado();
    const foto = fotoNova === undefined ? usuario.foto : fotoNova;
    const nick = document.getElementById("edit-nick").value.trim() || usuario.nick;
    desenharFoto(document.getElementById("previa-foto"), foto, nick, "foto-pequena");
}

document.getElementById("ir-login").addEventListener("click", function (e) {
    e.preventDefault();
    mostrarLogin();
});

document.getElementById("ir-cadastro").addEventListener("click", function (e) {
    e.preventDefault();
    mostrarCadastro();
});

document.getElementById("form-cadastro").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("cad-email").value.trim().toLowerCase();
    const nick = document.getElementById("cad-nick").value.trim();
    const senha = document.getElementById("cad-senha").value;
    const confirmar = document.getElementById("cad-confirmar").value;
    const erro = document.getElementById("erro-cadastro");
    const usuarios = pegarUsuarios();

    if (nick.length < 3) {
        erro.textContent = "O nickname precisa ter pelo menos 3 letras.";
    } else if (senha.length < 6) {
        erro.textContent = "A senha precisa ter pelo menos 6 caracteres.";
    } else if (senha != confirmar) {
        erro.textContent = "As senhas não são iguais.";
    } else if (usuarios.find(u => u.email == email)) {
        erro.textContent = "Já existe uma conta com esse email.";
    } else if (usuarios.find(u => u.nick.toLowerCase() == nick.toLowerCase())) {
        erro.textContent = "Esse nickname já está em uso.";
    } else {
        usuarios.push({ email: email, nick: nick, senha: senha, foto: "", bio: "", favoritos: [] });
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        localStorage.setItem("logado", email);
        mostrarPerfil();
        voltarParaFilme();
    }
});

document.getElementById("form-login").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const senha = document.getElementById("login-senha").value;
    const usuario = pegarUsuarios().find(u => u.email == email && u.senha == senha);

    if (usuario) {
        localStorage.setItem("logado", email);
        mostrarPerfil();
        voltarParaFilme();
    } else {
        document.getElementById("erro-login").textContent = "Email ou senha incorretos.";
    }
});

document.getElementById("btn-editar").addEventListener("click", function () {
    if (!areaEditar.hidden) {
        areaEditar.hidden = true;
        return;
    }
    const usuario = pegarUsuarioLogado();
    document.getElementById("edit-nick").value = usuario.nick;
    document.getElementById("edit-bio").value = usuario.bio || "";
    document.getElementById("erro-editar").textContent = "";
    document.getElementById("erro-foto").textContent = "";
    campoFoto.value = "";
    fotoNova = undefined;
    desenharPrevia();
    areaEditar.hidden = false;
});

document.getElementById("btn-cancelar").addEventListener("click", function () {
    areaEditar.hidden = true;
});

document.getElementById("btn-trocar-foto").addEventListener("click", function () {
    campoFoto.click();
});

document.getElementById("btn-remover-foto").addEventListener("click", function () {
    fotoNova = "";
    campoFoto.value = "";
    desenharPrevia();
});

document.getElementById("edit-nick").addEventListener("input", desenharPrevia);

campoFoto.addEventListener("change", function () {
    const arquivo = campoFoto.files[0];
    const erro = document.getElementById("erro-foto");
    erro.textContent = "";
    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
        erro.textContent = "Escolha um arquivo de imagem.";
        return;
    }

    const leitor = new FileReader();
    leitor.onload = function () {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement("canvas");
            const lado = Math.min(img.width, img.height);
            canvas.width = 200;
            canvas.height = 200;
            canvas.getContext("2d").drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, 200, 200);
            fotoNova = canvas.toDataURL("image/jpeg", 0.85);
            desenharPrevia();
        };
        img.onerror = function () {
            erro.textContent = "Não foi possível abrir essa imagem.";
        };
        img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
});

areaEditar.addEventListener("submit", function (e) {
    e.preventDefault();
    const usuario = pegarUsuarioLogado();
    const nick = document.getElementById("edit-nick").value.trim();
    const erro = document.getElementById("erro-editar");
    const repetido = pegarUsuarios().find(u => u.email != usuario.email && u.nick.toLowerCase() == nick.toLowerCase());

    if (nick.length < 3) {
        erro.textContent = "O nickname precisa ter pelo menos 3 letras.";
    } else if (repetido) {
        erro.textContent = "Esse nickname já está em uso.";
    } else {
        usuario.nick = nick;
        usuario.bio = document.getElementById("edit-bio").value.trim();
        if (fotoNova !== undefined) usuario.foto = fotoNova;
        salvarUsuario(usuario);
        areaEditar.hidden = true;
        mostrarPerfil();
    }
});

modalBusca.addEventListener("show.bs.modal", function () {
    campoBusca.value = "";
    desenharResultados();
});

modalBusca.addEventListener("shown.bs.modal", function () {
    campoBusca.focus();
});

campoBusca.addEventListener("input", desenharResultados);

modalLista.addEventListener("show.bs.modal", function () {
    campoBuscaLista.value = "";
    desenharResultadosLista();
});

modalLista.addEventListener("shown.bs.modal", function () {
    campoBuscaLista.focus();
});

campoBuscaLista.addEventListener("input", desenharResultadosLista);

document.getElementById("btn-sair").addEventListener("click", function () {
    localStorage.removeItem("logado");
    areaEditar.hidden = true;
    mostrarTelaConta();
});

if (pegarUsuarioLogado()) {
    mostrarPerfil();
} else {
    mostrarTelaConta();
    if (location.search == "?cadastro") mostrarCadastro();
}
