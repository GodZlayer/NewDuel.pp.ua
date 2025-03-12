import express from "express";
import path from "path";

const app = express();
app.use("/node_modules", express.static(path.resolve("node_modules")));

app.listen(3000, () => console.log("🚀 Servidor rodando em http://localhost:3000"));
