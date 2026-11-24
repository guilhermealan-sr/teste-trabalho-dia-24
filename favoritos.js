function adicionarFavorito(id) {
    const email = localStorage.getItem("logado");

    if (!email) {
        alert("Faça login para adicionar favoritos!");
        window.location.href = "perfil.html";
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(u => u.email === email);

    if (!usuario) return;

    if (!usuario.favoritos) {
        usuario.favoritos = [];
    }

    if (usuario.favoritos.includes(id)) {
        alert("Esse filme já está nos seus favoritos!");
        return;
    }

    if (usuario.favoritos.length >= 4) {
        alert("Você só pode adicionar 4 filmes favoritos!");
        return;
    }

    usuario.favoritos.push(id);

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    mostrarNotificacao("Filme adicionado aos favoritos!");
}
document.querySelectorAll("#listaFilmes .card").forEach((card, index) => {
    const area = card.querySelector(".card-body");

    if (!area) return;

    const botao = document.createElement("button");

    botao.className = "btn-verde";
    botao.style.cssText = "font-size: 14px; padding: 6px 12px; margin-top: 10px;";
    botao.textContent = "+ Adicionar aos favoritos";
    botao.onclick = () => adicionarFavorito(index + 1);

    area.appendChild(botao);
});
function mostrarNotificacao(mensagem) {
    const notificacao = document.createElement("div");

    notificacao.textContent = "✓  " + mensagem;

    notificacao.style.cssText = `
        position: fixed;
        bottom: 25px;
        right: 25px;
        background: #222;
        color: white;
        border-left: 4px solid #28a745;
        padding: 16px 22px;
        border-radius: 8px;
        font-size: 14px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.4);
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    document.body.appendChild(notificacao);

    setTimeout(() => notificacao.style.opacity = "1", 10);

    setTimeout(() => {
        notificacao.style.opacity = "0";
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
}