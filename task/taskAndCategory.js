const API = "http://localhost:8080";
const token = localStorage.getItem("token");

const categoryInput = document.getElementById("categoryName");
const taskTitleInput = document.getElementById("taskTitulo");
const taskDescriptionInput = document.getElementById("descricao");
const taskCategorySelect = document.getElementById("taskCatId");
const categoryList = document.getElementById("listCategories");
const taskList = document.getElementById("listaTarefas");
const messageBox = document.getElementById("pageMessage");
const createCategoryButton = document.getElementById("createCategoryButton");
const logoutButton = document.getElementById("logout");
const formTarefa = document.getElementById("formTarefa");

if (!token) {
    window.location.href = "../auth/authLogin.html";
}

function showMessage(text, type = "info") {
    messageBox.textContent = text;
    messageBox.className = text ? `message ${type}` : "message";
}

function ensureAuth(response) {
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        window.location.href = "../auth/authLogin.html";
        return false;
    }
    return true;
}

function fetchAuth(url, options = {}) {
    return fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...options.headers
        }
    });
}

async function carregarCategorias() {
    const response = await fetchAuth(`${API}/category`);
    if (!ensureAuth(response)) return;

    const categories = await response.json().catch(() => []);
    if (!response.ok) {
        showMessage("Não foi possível carregar categorias.", "error");
        return;
    }

    taskCategorySelect.innerHTML = `<option value="">Categoria...</option>`;
    categoryList.innerHTML = "";

    if (categories.length === 0) {
        categoryList.innerHTML = `<li class="empty-item">Nenhuma categoria criada ainda.</li>`;
        return;
    }

    categories.forEach(category => {
        taskCategorySelect.innerHTML += `<option value="${category.id}">${category.nome}</option>`;
        categoryList.innerHTML += `<li>${category.nome}</li>`;
    });
}

async function createCategory() {
    const nome = categoryInput.value.trim();
    if (!nome) {
        showMessage("Informe um nome para a categoria.", "error");
        return;
    }

    const response = await fetchAuth(`${API}/category`, {
        method: "POST",
        body: JSON.stringify({ nome })
    });

    if (!ensureAuth(response)) return;

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
        showMessage(body.mensagem || body.message || "Erro ao criar categoria.", "error");
        return;
    }

    categoryInput.value = "";
    showMessage("Categoria criada com sucesso.", "success");
    carregarCategorias();
}

async function carregarTarefas() {
    const response = await fetchAuth(`${API}/task/getMyTasks`);
    if (!ensureAuth(response)) return;

    const tasks = await response.json().catch(() => []);
    if (!response.ok) {
        showMessage("Não foi possível carregar tarefas.", "error");
        return;
    }

    taskList.innerHTML = "";
    if (!Array.isArray(tasks) || tasks.length === 0) {
        taskList.innerHTML = `<div class="empty-state">Nenhuma tarefa encontrada. Crie a primeira tarefa para começar.</div>`;
        return;
    }

    tasks.forEach(task => {
        const isConcluida = task.status === "CONCLUIDO";
        taskList.innerHTML += `
            <article class="task-card ${isConcluida ? "completed" : "pending"}">
                <div class="task-card-header">
                    <span class="task-category">${task.categoryName || "Geral"}</span>
                    <span class="task-status">${isConcluida ? "Concluída" : "Pendente"}</span>
                </div>
                <h3>${task.title}</h3>
                <p>${task.description || "Sem descrição"}</p>
                <div class="task-actions">
                    <button type="button" class="secondary-button" onclick="alternarStatus(${task.id})">
                        ${isConcluida ? "Refazer" : "Concluir"}
                    </button>
                    <button type="button" class="danger-button" onclick="deletarTarefa(${task.id})">Deletar</button>
                </div>
            </article>
        `;
    });
}

formTarefa.addEventListener("submit", async event => {
    event.preventDefault();
    showMessage("", "info");

    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const categoryId = taskCategorySelect.value;

    if (!title) {
        showMessage("Informe um título para a tarefa.", "error");
        return;
    }

    const response = await fetchAuth(`${API}/task/create`, {
        method: "POST",
        body: JSON.stringify({ title, description, categoryId })
    });

    if (!ensureAuth(response)) return;

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        showMessage(body.mensagem || body.message || "Erro ao criar a tarefa.", "error");
        return;
    }

    taskTitleInput.value = "";
    taskDescriptionInput.value = "";
    showMessage("Tarefa criada com sucesso.", "success");
    carregarTarefas();
});

async function alternarStatus(id) {
    const response = await fetchAuth(`${API}/task/updateMyTaskStatus/${id}`, { method: "PATCH" });
    if (!ensureAuth(response)) return;

    if (response.status !== 204) {
        showMessage("Houve um erro ao alterar o status da tarefa.", "error");
        return;
    }

    showMessage("Status da tarefa atualizado.", "success");
    carregarTarefas();
}

async function deletarTarefa(id) {
    const confirmation = confirm("Deseja realmente deletar essa tarefa?");
    if (!confirmation) {
        showMessage("A tarefa não foi apagada.", "info");
        return;
    }

    const response = await fetchAuth(`${API}/task/deleteMyTask/${id}`, { method: "DELETE" });
    if (!ensureAuth(response)) return;

    if (response.status !== 204) {
        showMessage("Houve um erro ao deletar a tarefa.", "error");
        return;
    }

    showMessage("Tarefa deletada com sucesso.", "success");
    carregarTarefas();
}

function Logout() {
    localStorage.clear();
    window.location.href = "../auth/authLogin.html";
}

createCategoryButton.addEventListener("click", createCategory);
logoutButton.addEventListener("click", Logout);

carregarCategorias();
carregarTarefas();