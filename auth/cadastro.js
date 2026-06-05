const API = "http://localhost:8080/auth/cadastrar";
const form = document.getElementById("form-cadastro");
const nameInput = document.getElementById("nome-id");
const emailInput = document.getElementById("email-id");
const passwordInput = document.getElementById("senha-id");
const btnToggle = document.getElementById("btnToggle");
const messageBox = document.getElementById("message");

btnToggle.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";

    const icon = btnToggle.querySelector("i");
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
});

function showMessage(text, type = "info") {
    messageBox.textContent = text;
    messageBox.className = `message ${type}`;
}

function clearMessage() {
    showMessage("", "info");
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleSignup(event) {
    event.preventDefault();
    clearMessage();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    if (!name || !email || !password) {
        showMessage("Preencha todos os campos obrigatórios.", "error");
        return;
    }

    if (!isValidEmail(email)) {
        showMessage("Por favor, use um e-mail válido.", "error");
        return;
    }

    if (password.length < 6) {
        showMessage("A senha deve ter pelo menos 6 caracteres.", "error");
        return;
    }

    try {
        const response = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const body = await response.json().catch(() => ({}));

        if (!response.ok) {
            const message = body.mensagem || body.message || "Erro ao cadastrar. Tente novamente.";
            showMessage(message, "error");
            return;
        }

        showMessage("Cadastro realizado com sucesso! Redirecionando para login...", "success");
        setTimeout(() => {
            window.location.href = "authLogin.html";
        }, 900);
    } catch (error) {
        showMessage("Erro de conexão. Verifique o servidor e tente novamente.", "error");
    }
}

form.addEventListener("submit", handleSignup);

