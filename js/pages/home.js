export const homeTitle = "Home";

function createHomePage() {
    const content = document.getElementById("content");
    if (!content) return;

    const username = localStorage.getItem("username");
    const accountType = localStorage.getItem("accountType");

    let welcomeMessage = "Este é um sistema projetado para tornar sua experiência mais interativa e eficiente. Explore as funcionalidades e aproveite ao máximo.";
    let accountStatus = "";

    if (username) {
        const accountDisplay = accountType === "3" ? "Admin"
                           : accountType === "2" ? "Premium"
                           : "Free";
                           
        welcomeMessage = `Olá, <strong>${username}</strong>! Bem-vindo de volta ao NewDuel.`;
        accountStatus = `<p class="lead">Sua conta é do tipo: <strong>${accountDisplay}</strong>.</p>`;
    }

    content.innerHTML = `
        <main role="main" class="inner cover text-center">
            <h1 class="cover-heading">Bem-vindo ao NewDuel</h1>
            <p class="lead">${welcomeMessage}</p>
            ${accountStatus}
            <p class="lead">
                <a href="#" data-page="about" class="btn btn-lg btn-primary">Saiba mais</a>
            </p>
        </main>
    `;
}

export { createHomePage };
