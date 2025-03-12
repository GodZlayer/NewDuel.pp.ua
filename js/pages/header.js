import { checkSession, logoutUser } from "../auth.js";
import { renderPage } from "../loader.js";

function createHeader() {
    console.log("🛠️ Criando o Header...");

    const headerContainer = document.getElementById("header");
    if (!headerContainer) {
        console.warn("⚠️ Header ainda não carregou. Abortando criação.");
        return;
    }

    let token = localStorage.getItem("token");
    let accountType = localStorage.getItem("accountType");
    let username = localStorage.getItem("username");

    let userDropdown;
    if (token) {
        let statusText = `Status: ${accountType === "3" ? "Admin" : accountType === "2" ? "Premium" : "Free"}`;

        userDropdown = `
            <div class="dropdown">
                <button class="dropbtn"><i class="fas fa-user"></i> ${username || "Carregando..."}</button>
                <div class="dropdown-content">
                    <span class="dropdown-status">${statusText}</span>
                    <div class="dropdown-divider"></div>
                    <a href="#" id="logoutBtn">Logout</a>
                </div>
            </div>
        `;
    } else {
        userDropdown = `
            <div class="dropdown">
                <button class="dropbtn" id="authDropdown"><i class="fas fa-user"></i> Login/Registro</button>
                <div class="dropdown-content">
                    <a href="#" id="loginBtn">Login</a>
                    <a href="#" id="registerBtn">Registro</a>
                </div>
            </div>
        `;
    }

    // 🔹 Definir a navegação correta para cada tipo de usuário
    let navigationLinks = `
        <a href="#" data-page="home">Home</a>
        <a href="#" data-page="about">Sobre</a>
    `;

    if (token) {
        navigationLinks += `<a href="#" data-page="wallet">Carteira</a>`;
    }

    headerContainer.innerHTML = `
        <div class="top-bar">
            <img src="img/logo.png" alt="Logo" class="logo">
            ${userDropdown}
        </div>
        <div class="bottom-bar">
            <nav>
                ${navigationLinks}
            </nav>
        </div>
    `;

    // ✅ Eventos de clique para navegação dinâmica
    document.querySelectorAll("[data-page]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const page = link.getAttribute("data-page");
            console.log(`🔄 Navegando para: ${page}`);
            renderPage(page);
        });
    });

    // ✅ Eventos para login e registro
    document.getElementById("loginBtn")?.addEventListener("click", (event) => {
        event.preventDefault();
        renderPage("login");
    });

    document.getElementById("registerBtn")?.addEventListener("click", (event) => {
        event.preventDefault();
        renderPage("register");
    });

    // ✅ Evento de logout
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        logoutUser(() => {
            createHeader();
            renderPage("home");
        });
    });
}

// ✅ Executar a verificação de sessão e atualizar o header corretamente
document.addEventListener("DOMContentLoaded", () => {
    checkSession((isAuthenticated, username, accountType) => {
        if (isAuthenticated) {
            localStorage.setItem("username", username);
            localStorage.setItem("accountType", accountType);
        }
        createHeader();
    });
});

export { createHeader };
