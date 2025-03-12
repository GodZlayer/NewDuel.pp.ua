const socket = new WebSocket("wss://ws.newduel.pp.ua:8443");

socket.onopen = () => {
    console.log("✅ WebSocket conectado com sucesso!");

    const token = localStorage.getItem("token");
    if (token) {
        socket.send(JSON.stringify({ action: "verify", token }));
    }
};

socket.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        console.log("📩 Mensagem recebida:", data);

        document.dispatchEvent(new CustomEvent("wsMessage", { detail: data }));

    } catch (error) {
        console.warn("⚠️ Mensagem recebida não é JSON:", event.data);
    }
};

socket.onerror = (error) => {
    console.error("❌ Erro no WebSocket:", error);
};

socket.onclose = () => {
    console.warn("🔴 Conexão WebSocket fechada.");
};

// ✅ Adiciona `sendWebSocketMessage`
function sendWebSocketMessage(message, callback) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        socket.addEventListener("open", () => socket.send(JSON.stringify(message)));
    }

    document.addEventListener("wsMessage", function listener(event) {
        const data = event.detail;
        if (data.success || data.error) {
            callback(data);
            document.removeEventListener("wsMessage", listener);
        }
    });
}

export { socket, sendWebSocketMessage };
