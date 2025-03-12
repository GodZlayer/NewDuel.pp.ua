import { sendWebSocketMessage } from "./ws.js";
import { renderPage } from "./loader.js";

function checkSession(callback) {
    const token = localStorage.getItem("token");
    
    if (!token) {
        console.log("🚪 Nenhuma sessão ativa.");
        callback(false);
        return;
    }

    sendWebSocketMessage({ action: "verify", token }, (response) => {
        if (response.success) {
            console.log(`🔄 Sessão restaurada: ${response.user} (${response.accountType})`);
            localStorage.setItem("username", response.user);
            localStorage.setItem("accountType", response.accountType);
            callback(true, response.user, response.accountType);
        } else {
            console.log("❌ Token inválido, removendo sessão...");
            logoutUser();
            callback(false);
        }
    });
}

function logoutUser() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.log("🚪 Nenhuma sessão ativa para encerrar.");
        return;
    }

    sendWebSocketMessage({ action: "logout", token }, (response) => {
        console.log(response.success ? "✅ Logout realizado." : "❌ Erro ao deslogar.");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("accountType");
        renderPage("home");
    });
}

export { checkSession, logoutUser };
