<?php
header("Content-Type: text/html; charset=UTF-8");
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<link rel="icon" type="image/png" href="img/logo.png">

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carregando...</title>
    <link rel="stylesheet" href="js/css/style.css">
</head>
<body>

    <!-- Preloader -->
    <div id="preloader">
        <div class="preloader-container">
            <img src="img/logo.png" alt="Logo" class="preloader-logo">
            <div class="loader-circle"></div>
        </div>
    </div>

    <!-- Container principal (inicialmente oculto) -->
    <div id="app" style="display: none;">
        <script type="module" src="js/loader.js"></script>
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", function () {
            const preloader = document.getElementById("preloader");
            const app = document.getElementById("app");

            const minPreloaderTime = 2000; // Tempo mínimo de 2 segundos
            const startTime = performance.now(); // Marca o tempo de início

            function removePreloader() {
                const elapsedTime = performance.now() - startTime; // Tempo decorrido
                const remainingTime = Math.max(0, minPreloaderTime - elapsedTime);

                setTimeout(() => {
                    preloader.style.opacity = "0"; // Suaviza a saída
                    setTimeout(() => {
                        preloader.style.display = "none"; // Remove o preloader
                        app.style.display = "block"; // Exibe o conteúdo
                    }, 500); // Tempo para o fade-out
                }, remainingTime);
            }

            // Caso a página já tenha carregado antes dos 2 segundos
            if (document.readyState === "complete") {
                removePreloader();
            } else {
                window.addEventListener("load", removePreloader); // Remove o preloader após o load
            }

            // Garante que, mesmo que o evento "load" demore, o preloader saia no tempo certo
            setTimeout(() => {
                removePreloader();
            }, minPreloaderTime + 500);
        });
    </script>

</body>
</html>
