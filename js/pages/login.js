import { sendWebSocketMessage } from "../ws.js";
import { renderPage } from "../loader.js";

function createLoginPage() {
    const content = document.getElementById("content");
    if (!content) {
        console.error("Elemento #content não encontrado!");
        return;
    }

    content.innerHTML = `
        <div class="form-container text-center">
            <form id="loginForm">
                <img class="mb-4" src="img/logo.png" alt="Logo" width="100">
                <h1 class="h3 mb-3 fw-normal">Faça login</h1>
                <p id="login-status"></p>


                <div class="form-floating">
                    <input type="text" class="form-control" id="username" placeholder="Usuário" required>
                    <label for="username">Usuário</label>
                </div>
                <div class="form-floating">
                    <input type="password" class="form-control" id="password" placeholder="Senha" required>
                    <label for="password">Senha</label>
                </div>

                <button class="w-100 btn btn-lg btn-primary" type="submit">Entrar</button>
                <p class="mt-3"><a href="#" data-page="register">Criar uma conta</a></p>
            </form>
        </div>
    `;

    document.getElementById("loginForm").addEventListener("submit", function(event) {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        handleLogin(username, password); // Chama a função handleLogin
    });

    document.querySelector("[data-page='register']").addEventListener("click", (event) => {
        event.preventDefault();
        renderPage("register");
    });
}

// Função para exibir status do login dinamicamente
function updateLoginStatus(message, isSuccess = false) {
    const statusBox = document.getElementById("login-status");
    if (statusBox) {
        statusBox.textContent = message;
        statusBox.style.color = isSuccess ? "green" : "red";
        statusBox.style.display = "block";
    }
}

function handleLogin(username, password, callback) {
    sendWebSocketMessage({ action: "login", username, password }, (response) => {
        console.log("📩 Resposta do WebSocket:", response);

        if (response.success && response.token) {
            console.log("✅ Login bem-sucedido!");

            // Salva sessão
            localStorage.setItem("token", response.token);
            localStorage.setItem("username", username);
            localStorage.setItem("accountType", response.accountType);

            callback(true);
        } else {
            console.error("❌ Erro no login:", response.error);
            callback(false, response.error);
        }
    });
}




export { createLoginPage, handleLogin };
