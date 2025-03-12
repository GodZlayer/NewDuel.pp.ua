import { sendWebSocketMessage } from "../ws.js";
import { renderPage } from "../loader.js";

function createRegisterPage() {
    const content = document.getElementById("content");
    if (!content) {
        console.error("Elemento #content não encontrado!");
        return;
    }

    content.innerHTML = `
        <div class="form-container text-center">
            <form id="registerForm">
                <img class="mb-4" src="img/logo.png" alt="Logo" width="100">
                <h1 class="h3 mb-3 fw-normal">Criar conta</h1>
                <p id="register-status" style="color: orange;">⏳ Criando conta...</p>

                <div class="form-floating">
                    <input type="text" class="form-control" id="newUsername" placeholder="Usuário" required>
                    <label for="newUsername">Usuário</label>
                </div>
                <div class="form-floating">
                    <input type="password" class="form-control" id="newPassword" placeholder="Senha" required>
                    <label for="newPassword">Senha</label>
                </div>

                <button id="registerButton" class="w-100 btn btn-lg btn-success" type="submit">Registrar</button>
                <p class="mt-3"><a href="#" data-page="login">Já tem uma conta? Faça login</a></p>
            </form>
        </div>
    `;

    document.getElementById("registerForm").addEventListener("submit", function(event) {
        event.preventDefault();
        const username = document.getElementById("newUsername").value;
        const password = document.getElementById("newPassword").value;

        handleRegister(username, password);
    });

    document.querySelector("[data-page='login']").addEventListener("click", (event) => {
        event.preventDefault();
        renderPage("login");
    });
}

// Função para atualizar o status dinamicamente
function updateRegisterStatus(message, color = "red") {
    const statusBox = document.getElementById("register-status");
    if (statusBox) {
        statusBox.textContent = message;
        statusBox.style.color = color;
        statusBox.style.display = "block";
    }
}

// Função para registrar o usuário
function handleRegister(username, password) {
    const registerButton = document.getElementById("registerButton");

    updateRegisterStatus("⏳ Criando conta...", "orange");
    registerButton.disabled = true; // Desativa o botão enquanto processa

    sendWebSocketMessage({ action: "register", username, password }, (response) => {
        console.log("📩 Resposta do WebSocket:", response); // Log para debug

        if (response.success) {
            updateRegisterStatus("✅ Conta criada com sucesso! Redirecionando...", "green");

            // Aguarda 2 segundos antes de redirecionar
            setTimeout(() => {
                renderPage("login");
            }, 2000);
        } else {
            updateRegisterStatus(`❌ ${response.error}`, "red");
            registerButton.disabled = false; // Reativa o botão caso ocorra erro
        }
    });
}

// WebSocket escutando atualizações de status
const socket = new WebSocket("wss://ws.newduel.pp.ua:8443");

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === "statusUpdate") {
        updateRegisterStatus(data.message, data.success ? "green" : "red");

        // Se a conta foi criada com sucesso, redirecionar após 2 segundos
        if (data.success) {
            setTimeout(() => {
                renderPage("login");
            }, 2000);
        }
    }
};

export { createRegisterPage, handleRegister };
