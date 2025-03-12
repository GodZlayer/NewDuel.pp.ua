function createFooter() {
    const footerContainer = document.getElementById("footer");
    if (!footerContainer) {
        console.error("Elemento #footer não encontrado!");
        return;
    }

    footerContainer.innerHTML = `
        <footer class="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
            <div class="col-md-4 d-flex align-items-center">
                <a href="/" class="mb-3 me-2 mb-md-0 text-body-secondary text-decoration-none lh-1">
                    <i class="fas fa-gamepad fa-lg"></i>
                </a>
                <span class="mb-3 mb-md-0 text-body-secondary">© 2025 NewDuel Game - Made By GodZlayer</span>
            </div>

            <ul class="nav col-md-4 justify-content-end list-unstyled d-flex">
                <li class="ms-3"><a class="text-body-secondary" href="#"><i class="fab fa-twitter fa-lg"></i></a></li>
                <li class="ms-3"><a class="text-body-secondary" href="#"><i class="fab fa-instagram fa-lg"></i></a></li>
                <li class="ms-3"><a class="text-body-secondary" href="#"><i class="fab fa-facebook fa-lg"></i></a></li>
            </ul>
        </footer>
    `;
}

// Exporta a função para ser utilizada no loader.js
export { createFooter };
