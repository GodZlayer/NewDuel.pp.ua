import { sendWebSocketMessage } from "./ws.js";
import { Connection, PublicKey, clusterApiUrl } from "/node_modules/@solana/web3.js/lib/index.mjs";


const SOLANA_TOKEN_ADDRESS = "A7qmEo17Xm2PgLmXuTjJ4fFePQpDU6s5mDBQEJRxcbH2";

async function initPhantomIntegration() {
    console.log("🔍 Verificando Phantom Wallet...");

    if (!window.solana || !window.solana.isPhantom) {
        console.warn("❌ Phantom Wallet não encontrada!");
        return null;
    }

    try {
        const wallet = await window.solana.connect();
        const activeWallet = wallet.publicKey.toString();
        console.log("🔗 Carteira conectada:", activeWallet);

        const token = localStorage.getItem("token");
        if (!token) {
            console.warn("⚠️ Token de sessão ausente. Faça login novamente.");
            return null;
        }

        return new Promise((resolve) => {
            sendWebSocketMessage({ action: "verify", token }, async (response) => {
                if (!response.success) {
                    console.warn("⚠️ Sessão inválida. Faça login novamente.");
                    resolve(null);
                    return;
                }

                const linkedWallet = response.walletAddress;
                const username = response.user;

                if (linkedWallet !== activeWallet) {
                    console.warn("⚠️ Carteira ativa não corresponde à vinculada. Troque para a carteira correta.");
                    resolve(null);
                    return;
                }

                console.log("✅ Carteira correta conectada!");

                const balance = await getWalletBalance(activeWallet);
                resolve({ username, walletAddress: activeWallet, balance });
            });
        });

    } catch (error) {
        console.error("❌ Erro ao conectar à Phantom Wallet:", error);
        return null;
    }
}

// 🔹 Obtém saldo da carteira diretamente da extensão Phantom
async function getWalletBalance(walletAddress) {
    try {
        const connection = new Connection(clusterApiUrl("devnet"));
        const accountInfo = await connection.getParsedAccountInfo(new PublicKey(walletAddress));

        if (!accountInfo.value) {
            console.warn("⚠️ Nenhuma informação encontrada para essa carteira.");
            return "0.00";
        }

        // 🔹 Filtra o saldo do token NDC (NewDuelCoin)
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(new PublicKey(walletAddress), {
            programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
        });

        let balance = "0.00";
        tokenAccounts.value.forEach((account) => {
            const tokenInfo = account.account.data.parsed.info;
            if (tokenInfo.mint === SOLANA_TOKEN_ADDRESS) {
                balance = tokenInfo.tokenAmount.uiAmountString;
            }
        });

        console.log(`✅ Saldo NDC: ${balance}`);
        return balance;
    } catch (error) {
        console.error("❌ Erro ao obter saldo da carteira:", error);
        return "Erro ao buscar saldo";
    }
}

export { initPhantomIntegration };
