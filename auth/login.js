const API = "http://localhost:8080/auth/logar";
const form = document.getElementById("form-login");
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

async function handleLogin(event) {
    event.preventDefault();
    clearMessage();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showMessage("Preencha todos os campos para continuar.", "error");
        return;
    }

    try {
        const response = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const body = await response.json().catch(() => ({}));

        if (!response.ok) {
            const message = body.message || body.mensagem || "Credenciais inválidas ou servidor indisponível.";
            showMessage(message, "error");
            return;
        }

        const token = body.token;
        if (!token) {
            showMessage("Resposta inesperada do servidor. Tente novamente mais tarde.", "error");
            return;
        }

        localStorage.setItem("token", token);
        showMessage("Login efetuado com sucesso. Redirecionando...", "success");
        setTimeout(() => {
            window.location.href = "../task/taskAndCategory.html";
        }, 600);
    } catch (error) {
        showMessage("Erro de conexão. Verifique o servidor e tente novamente.", "error");
    }
}

form.addEventListener("submit", handleLogin);