import { initPhantomIntegration } from "../phantom.js";

async function createCarteiraPage() {
    const content = document.getElementById("content");
    if (!content) {
        console.error("❌ Elemento #content não encontrado!");
        return;
    }

    content.innerHTML = `
        <div class="wallet-container">
            <h2>Carteira Phantom</h2>
            <p id="walletStatus" class="wallet-status">🔄 Verificando carteira...</p>
            <div id="walletDetails" class="hidden">
                <h3>Detalhes da Carteira</h3>
                <p><strong>Usuário:</strong> <span id="walletUser">---</span></p>
                <p><strong>Endereço:</strong> <span id="walletAddress">---</span></p>
                <p><strong>Saldo NDC:</strong> <span id="walletBalance">Carregando...</span></p>
            </div>
        </div>
    `;

    try {
        const walletData = await initPhantomIntegration();

        if (walletData) {
            document.getElementById("walletStatus").classList.add("hidden");
            document.getElementById("walletDetails").classList.remove("hidden");
            document.getElementById("walletUser").textContent = walletData.username;
            document.getElementById("walletAddress").textContent = walletData.walletAddress;
            document.getElementById("walletBalance").textContent = `${walletData.balance} NDC`;
        } else {
            document.getElementById("walletStatus").textContent = "❌ Erro ao carregar a carteira.";
        }
    } catch (error) {
        console.error("❌ Erro ao inicializar carteira:", error);
        document.getElementById("walletStatus").textContent = "❌ Erro ao inicializar carteira.";
    }
}

export { createCarteiraPage };
