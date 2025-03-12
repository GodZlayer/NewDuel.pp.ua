const fs = require("fs");
const https = require("https");
const WebSocket = require("ws");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fetch = require("node-fetch");
const saltRounds = 10;

// 🔹 Configuração do banco de dados
const db = new sqlite3.Database("/home/newduel.pp.ua/public_html/users.db", (err) => {
    if (err) {
        console.error("❌ Erro ao conectar ao banco de dados:", err);
    } else {
        console.log("✅ Conectado ao banco de dados SQLite.");
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            account_type INTEGER DEFAULT 1,
            wallet_address TEXT DEFAULT NULL
        )`);
    }
});

// 🔹 Configuração do SSL
const server = https.createServer({
    cert: fs.readFileSync("/etc/letsencrypt/live/ws.newduel.pp.ua/fullchain.pem"),
    key: fs.readFileSync("/etc/letsencrypt/live/ws.newduel.pp.ua/privkey.pem"),
});

// 🔹 Criar servidor WebSocket
const wss = new WebSocket.Server({ server, host: "0.0.0.0" });

// 🔹 Chave secreta para JWT
const SECRET_KEY = process.env.JWT_SECRET_KEY;
if (!SECRET_KEY) {
    console.error("⚠️ Erro: Variável de ambiente JWT_SECRET_KEY não configurada!");
    process.exit(1);
}

// 🔹 Token da Solana Devnet
const SOLSCAN_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3NDE3MjQyMjU4ODgsImVtYWlsIjoic2FudG9zcy5jb2dAZ21haWwuY29tIiwiYWN0aW9uIjoidG9rZW4tYXBpIiwiYXBpVmVyc2lvbiI6InYyIiwiaWF0IjoxNzQxNzI0MjI1fQ.F8Us6sqlLCMzwsTgheQUKjIIa-kUV0z-U7nCpHMsogc";
const SOLANA_TOKEN_ADDRESS = "A7qmEo17Xm2PgLmXuTjJ4fFePQpDU6s5mDBQEJRxcbH2";

// 🔹 Verifica e salva sessões ativas
const userSessions = new Map();

// ✅ Evento ao conectar WebSocket
wss.on("connection", (ws) => {
    console.log("✅ Novo cliente conectado!");

    ws.on("message", async (data) => {
        try {
            const message = JSON.parse(data);

            // 🔹 Verifica token do usuário e retorna dados da conta
            if (message.action === "verify") {
                const { token } = message;
                try {
                    const decoded = jwt.verify(token, SECRET_KEY);
                    const username = decoded.username;

                    db.get("SELECT account_type, wallet_address FROM users WHERE username = ?", [username], (err, row) => {
                        if (err || !row) {
                            ws.send(JSON.stringify({ error: "❌ Erro ao buscar conta no banco." }));
                            return;
                        }

                        const accountType = row.account_type.toString();
                        const walletAddress = row.wallet_address || null;
                        userSessions.set(username, { ws, accountType, walletAddress });

                        console.log(`🔄 Sessão restaurada: ${username} (Carteira: ${walletAddress})`);
                        ws.send(JSON.stringify({
                            success: "✅ Token válido",
                            user: username,
                            accountType,
                            walletAddress
                        }));
                    });
                } catch (error) {
                    ws.send(JSON.stringify({ error: "❌ Token inválido ou expirado." }));
                }
            }

            // 🔹 Vincula a carteira ao usuário caso não esteja no banco
            else if (message.action === "link_wallet") {
                const { walletAddress, token } = message;
                if (!walletAddress || !token) {
                    ws.send(JSON.stringify({ error: "❌ Dados inválidos." }));
                    return;
                }

                try {
                    const decoded = jwt.verify(token, SECRET_KEY);
                    const username = decoded.username;

                    db.run("UPDATE users SET wallet_address = ? WHERE username = ?", [walletAddress, username], function (err) {
                        if (err) {
                            console.error("❌ Erro ao salvar carteira:", err);
                            ws.send(JSON.stringify({ error: "❌ Erro ao salvar carteira no banco." }));
                        } else if (this.changes === 0) {
                            ws.send(JSON.stringify({ error: "❌ Usuário não encontrado." }));
                        } else {
                            console.log(`✅ Carteira vinculada: ${walletAddress} -> Usuário: ${username}`);
                            ws.send(JSON.stringify({ success: "✅ Carteira vinculada com sucesso!", walletAddress }));
                        }
                    });
                } catch (error) {
                    ws.send(JSON.stringify({ error: "❌ Token inválido ou expirado." }));
                }
            }

            // 🔹 Verifica saldo diretamente pela extensão Phantom Wallet
            else if (message.action === "get_balance_from_phantom") {
                const { walletAddress } = message;
                if (!walletAddress) {
                    ws.send(JSON.stringify({ error: "❌ Endereço da carteira não encontrado." }));
                    return;
                }

                console.log(`🔄 Solicitando saldo da carteira via extensão Phantom: ${walletAddress}`);

                ws.send(JSON.stringify({
                    action: "request_balance_from_phantom",
                    walletAddress
                }));
            }

        } catch (error) {
            ws.send(JSON.stringify({ error: "❌ Formato de mensagem inválido" }));
        }
    });

    // 🔹 Evento quando o cliente desconecta
    ws.on("close", () => {
        userSessions.forEach((session, username) => {
            if (session.ws === ws) {
                userSessions.delete(username);
                console.log(`🔴 Sessão encerrada: ${username}`);
            }
        });
    });
});

// 🔹 Iniciar servidor WebSocket
server.listen(8443, "0.0.0.0", () => {
    console.log("🚀 Servidor WebSocket rodando na porta 8443...");
});
