// CONFIGURAÇÕES GERAIS
const slots = [
    "07:20 - 08:10", "08:10 - 09:00", "09:20 - 10:10", "10:10 - 11:00",
    "11:00 - 11:50", "12:00 - 13:00", "13:10 - 14:00", "14:00 - 14:50",
    "15:10 - 16:00", "16:00 - 16:50"
];
const postosMon = [
    "Fila (Álcool em Gel) - Manhã",
    "Sucos - Intervalo Almoço",
    "Fila (Álcool em Gel) - Almoço",
    "Portaria - Intervalo Almoço",
    "Fila - Intervalo Tarde"
];
const excecoesNomes = ["da", "de", "do", "das", "dos", "e"];

let currentLab = "Lab Informática";

// --- FUNÇÃO DE PADRONIZAÇÃO DE NOMES ---
function padronizarNome(str) {
    if (!str) return "";
    return str.toLowerCase().trim().split(' ').map(palavra => {
        if (excecoesNomes.includes(palavra)) return palavra;
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    }).join(' ');
}

// --- SISTEMA DE LOGIN / CADASTRO ---
function toggleAuth(type) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    if (type === 'signup') {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    } else {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    }
}

function handleSignup() {
    const email = document.getElementById('reg-email').value.trim();
    const nomeRaw = document.getElementById('reg-nome').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const cargo = document.getElementById('reg-cargo').value;

    if (!email.endsWith("@gmail.com")) return alert("Erro: Utilize um e-mail @gmail.com!");
    if (!nomeRaw || pass.length < 4) return alert("Erro: Preencha todos os campos.");

    const nome = padronizarNome(nomeRaw);
    localStorage.setItem(`user-${email}`, JSON.stringify({ nome, email, pass, cargo }));
    alert("Conta criada com sucesso! Faça login.");
    toggleAuth('login');
}

function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    const user = JSON.parse(localStorage.getItem(`user-${email}`));

    if (user && user.pass === pass) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('app-content').style.display = 'block';
        document.getElementById('welcome-user').innerText = `Olá, ${user.nome}!`;
        showSection('menu');
    } else {
        alert("E-mail ou senha incorretos.");
    }
}

function logout() { location.reload(); }

// --- GERENCIAMENTO DE CADASTROS (PROFS/TURMAS/MONITORES) ---
function cadastrarItem(tipo, inputId) {
    const input = document.getElementById(inputId);
    let valor = input.value.trim();
    if (!valor) return;

    valor = (tipo === 'turmas') ? valor.toUpperCase() : padronizarNome(valor);

    let lista = JSON.parse(localStorage.getItem(tipo)) || [];
    if (!lista.includes(valor)) {
        lista.push(valor);
        localStorage.setItem(tipo, JSON.stringify(lista));
    }
    input.value = "";
    renderListasCadastros();
}

function renderListasCadastros() {
    ['professores', 'turmas', 'monitores'].forEach(tipo => {
        const el = document.getElementById(`list-${tipo}`);
        const dados = JSON.parse(localStorage.getItem(tipo)) || [];
        el.innerHTML = dados.map(i => `
            <li>
                <span>${i}</span>
                <button onclick="removerItem('${tipo}','${i}')">Remover</button>
            </li>`).join('');
    });
}

function removerItem(tipo, item) {
    let lista = JSON.parse(localStorage.getItem(tipo)).filter(i => i !== item);
    localStorage.setItem(tipo, JSON.stringify(lista));
    renderListasCadastros();
}

// --- NAVEGAÇÃO ---
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    if(id === 'menu') {
        document.getElementById('main-menu').classList.add('active');
    } else {
        document.getElementById(`sec-${id}`).classList.add('active');
        if(id === 'cadastros') renderListasCadastros();
        if(id === 'reservas') renderTable();
        if(id === 'monitoria') renderMonitoria();
    }
}

function changeLab(name) {
    currentLab = name;
    document.getElementById('currentLabTitle').innerText = name;
    renderTable();
}

// --- TABELA DE RESERVAS ---
function renderTable() {
    const tbody = document.getElementById('tableBody');
    const sem = document.getElementById('semanaSelect').value;
    const dia = document.getElementById('diaSelect').value;
    const listaProfs = JSON.parse(localStorage.getItem('professores')) || [];
    const listaTurmas = JSON.parse(localStorage.getItem('turmas')) || [];

    tbody.innerHTML = '';
    slots.forEach((slot, i) => {
        const isLunch = slot === "12:00 - 13:00";
        const key = `res-${currentLab}-${sem}-${dia}-${slot}`;
        const data = JSON.parse(localStorage.getItem(key)) || { prof: '', turma: '' };

        const row = document.createElement('tr');
        if (isLunch) row.className = 'lunch-row';
        if (data.turma && !isLunch) row.className = 'filled-row';

        row.innerHTML = `
            <td class="time-cell">${slot}</td>
            <td>
                <select id="p-${i}" ${isLunch ? 'disabled' : ''}>
                    <option value="">Selecione Professor</option>
                    ${listaProfs.map(p => `<option value="${p}" ${data.prof === p ? 'selected' : ''}>${p}</option>`).join('')}
                </select>
            </td>
            <td>
                <select id="t-${i}" ${isLunch ? 'disabled' : ''}>
                    <option value="">Selecione Turma</option>
                    ${listaTurmas.map(t => `<option value="${t}" ${data.turma === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
            </td>
            <td><button class="btn-save-row" onclick="saveReserva('${slot}', ${i})">Gravar</button></td>
        `;
        tbody.appendChild(row);
    });
}

function saveReserva(slot, i) {
    if (slot === "12:00 - 13:00") return;
    const sem = document.getElementById('semanaSelect').value;
    const dia = document.getElementById('diaSelect').value;
    const prof = document.getElementById(`p-${i}`).value;
    const turma = document.getElementById(`t-${i}`).value;

    localStorage.setItem(`res-${currentLab}-${sem}-${dia}-${slot}`, JSON.stringify({ prof, turma }));
    renderTable();
}

// --- TABELA DE MONITORIA ---
function renderMonitoria() {
    const tbody = document.getElementById('tableBodyMonitoria');
    const sem = document.getElementById('monSemanaSelect').value;
    const dia = document.getElementById('monDiaSelect').value;
    const listaMon = JSON.parse(localStorage.getItem('monitores')) || [];
    const listaTurmas = JSON.parse(localStorage.getItem('turmas')) || [];

    tbody.innerHTML = '';
    postosMon.forEach((posto, i) => {
        const key = `mon-S${sem}-${dia}-${posto}`;
        const data = JSON.parse(localStorage.getItem(key)) || { nome: '', turma: '' };

        const row = document.createElement('tr');
        if (data.nome) row.className = 'filled-row';

        row.innerHTML = `
            <td><strong>${posto}</strong></td>
            <td>
                <select id="mn-${i}">
                    <option value="">Selecione Monitor</option>
                    ${listaMon.map(m => `<option value="${m}" ${data.nome === m ? 'selected' : ''}>${m}</option>`).join('')}
                </select>
            </td>
            <td>
                <select id="mt-${i}">
                    <option value="">Selecione Turma</option>
                    ${listaTurmas.map(t => `<option value="${t}" ${data.turma === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
            </td>
            <td><button class="btn-save-row" onclick="saveMon('${posto}', ${i})">Gravar</button></td>
        `;
        tbody.appendChild(row);
    });
}

function saveMon(posto, i) {
    const sem = document.getElementById('monSemanaSelect').value;
    const dia = document.getElementById('monDiaSelect').value;
    const nome = document.getElementById(`mn-${i}`).value;
    const turma = document.getElementById(`mt-${i}`).value;

    localStorage.setItem(`mon-S${sem}-${dia}-${posto}`, JSON.stringify({ nome, turma }));
    renderMonitoria();
}

// INICIALIZAÇÃO DE SELETORES
window.onload = () => {
    const semSelectors = [document.getElementById('semanaSelect'), document.getElementById('monSemanaSelect')];
    const diaSelectors = [document.getElementById('diaSelect'), document.getElementById('monDiaSelect')];
    
    [1,2,3,4].forEach(n => semSelectors.forEach(s => s.innerHTML += `<option value="${n}">Semana ${n}</option>`));
    ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"].forEach(d => diaSelectors.forEach(s => s.innerHTML += `<option value="${d}">${d}</option>`));
};