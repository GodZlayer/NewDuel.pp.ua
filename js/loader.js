import { checkSession } from "./auth.js";
import { createHeader } from "./pages/header.js";
import { createFooter } from "./pages/footer.js";
import { initPhantomIntegration } from "./phantom.js";

let currentPage = "home";

// ✅ Função para carregar CSS corretamente
function loadCSS(filename) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = filename;
    document.head.appendChild(link);
}

// ✅ Carregar estilos principais
loadCSS("./js/css/style.css");

// ✅ Adiciona CDNs de Bootstrap, FontAwesome e Solana Web3.js
function addCDNs() {
    const bootstrapLink = document.createElement("link");
    bootstrapLink.rel = "stylesheet";
    bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";
    document.head.appendChild(bootstrapLink);

    const fontAwesomeLink = document.createElement("link");
    fontAwesomeLink.rel = "stylesheet";
    fontAwesomeLink.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    document.head.appendChild(fontAwesomeLink);

    // ✅ Corrige erro de Web3.js não encontrado
    const solanaWeb3Script = document.createElement("script");
    solanaWeb3Script.src = "https://cdn.jsdelivr.net/npm/@solana/web3.js@1.73.0/lib/index.umd.min.js";
    solanaWeb3Script.defer = true;
    document.head.appendChild(solanaWeb3Script);
}

// ✅ Atualiza dinamicamente o título da página
function updatePageTitle(title) {
    document.title = `NewDuel - ${title}`;
}

// ✅ Configura a estrutura base da página
function setupPageStructure() {
    document.body.innerHTML = "";
    document.body.style.cssText = "display: flex; flex-direction: column; height: 100vh; margin: 0; overflow: hidden;";

    const headerContainer = document.createElement("div");
    headerContainer.id = "header";

    const contentContainer = document.createElement("div");
    contentContainer.id = "content";
    contentContainer.style.cssText = "flex: 1; display: flex; justify-content: center; align-items: center; overflow: auto;";

    const footerContainer = document.createElement("div");
    footerContainer.id = "footer";

    document.body.append(headerContainer, contentContainer, footerContainer);
}

// ✅ Ajusta a altura da página para ser responsiva
function adjustLayout() {
    const content = document.getElementById("content");
    if (content) {
        const headerHeight = document.getElementById("header").offsetHeight || 0;
        const footerHeight = document.getElementById("footer").offsetHeight || 0;
        content.style.height = `${window.innerHeight - headerHeight - footerHeight}px`;
    }
}

// ✅ Renderiza a página dinamicamente
function renderPage(page) {
    currentPage = page;
    const content = document.getElementById("content");
    if (!content) {
        console.error("❌ Elemento #content não encontrado! Abortando renderização.");
        return;
    }

    content.innerHTML = "";

    switch (page) {
        case "home":
            updatePageTitle("Home");
            import("./pages/home.js").then(({ createHomePage }) => createHomePage());
            break;
        case "login":
            updatePageTitle("Login");
            import("./pages/login.js").then(({ createLoginPage }) => createLoginPage());
            break;
        case "register":
            updatePageTitle("Registro");
            import("./pages/register.js").then(({ createRegisterPage }) => createRegisterPage());
            break;
        case "wallet":
            updatePageTitle("Carteira");
            import("./pages/carteira.js").then(({ createCarteiraPage }) => createCarteiraPage());
            break;
        default:
            updatePageTitle("Página Não Encontrada");
            content.innerHTML = "<p>Página não encontrada</p>";
    }
    adjustLayout();
}

// ✅ Inicializa a página e configura os eventos de navegação
function init() {
    addCDNs();
    setupPageStructure();
    checkSession((isAuthenticated, username, accountType) => {
        if (isAuthenticated) {
            localStorage.setItem("username", username);
            localStorage.setItem("accountType", accountType);
        }
        createHeader();
        createFooter();
        renderPage("home");
    });

    adjustLayout();

    document.body.addEventListener("click", (event) => {
        const target = event.target.closest("[data-page]");
        if (target) {
            event.preventDefault();
            const page = target.getAttribute("data-page");
            renderPage(page);
        }
    });
}

// ✅ Evento quando o DOM estiver completamente carregado
document.addEventListener("DOMContentLoaded", () => {
    init(); // 🚀 Inicializa estrutura
    initPhantomIntegration(); // 🔹 Inicializa integração com a Phantom Wallet
});

window.addEventListener("resize", adjustLayout);

// ✅ Exportação correta
export { renderPage, currentPage };
