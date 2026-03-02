const slots = ["07:20 - 08:10", "08:10 - 09:00", "09:20 - 10:10", "10:10 - 11:00", "11:00 - 11:50", "12:00 - 13:00", "13:10 - 14:00", "14:00 - 14:50", "15:10 - 16:00", "16:00 - 16:50"];
const postosMon = ["Fila (Manhã)", "Sucos (Almoço)", "Fila (Almoço)", "Portaria (Almoço)", "Fila (Tarde)"];
const excecoesNomes = ["da", "de", "do", "das", "dos", "e"];
let currentLab = "";

// --- PADRONIZAÇÃO DE NOMES ---
function formatarNome(str) {
    if (!str) return "";
    return str.toLowerCase().trim().split(' ').map(palavra => {
        if (excecoesNomes.includes(palavra)) return palavra;
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    }).join(' ');
}

// --- SISTEMA DE AUTENTICAÇÃO ---
function toggleAuth(type) {
    document.getElementById('login-form').style.display = type === 'signup' ? 'none' : 'block';
    document.getElementById('signup-form').style.display = type === 'signup' ? 'block' : 'none';
}

function handleSignup() {
    const email = document.getElementById('reg-email').value.trim();
    const nomeRaw = document.getElementById('reg-nome').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const cargo = document.getElementById('reg-cargo').value;

    if (!email.endsWith("@gmail.com")) {
        return alert("Erro: Somente e-mails @gmail.com são permitidos.");
    }
    
    if (!nomeRaw || pass.length < 4) {
        return alert("Preencha o nome e uma senha de no mínimo 4 caracteres.");
    }

    const nome = formatarNome(nomeRaw);
    localStorage.setItem(`user-${email}`, JSON.stringify({ nome, email, pass, cargo }));
    alert(`Usuário ${nome} cadastrado com sucesso!`);
    toggleAuth('login');
}

function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    const user = JSON.parse(localStorage.getItem(`user-${email}`));

    if (user && user.pass === pass) {
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('app-content').style.display = 'flex';
        document.getElementById('welcome-user').innerText = `Olá, ${user.nome}!`;
        showSection('menu');
    } else {
        alert("Acesso negado: E-mail ou senha incorretos.");
    }
}

function logout() { location.reload(); }

// --- GERENCIAMENTO DE CADASTROS ---
function cadastrarItem(tipo, inputId) {
    const input = document.getElementById(inputId);
    let valor = input.value.trim();
    if (!valor) return;

    valor = (tipo === 'turmas') ? valor.toUpperCase() : formatarNome(valor);

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
        if(!el) return;
        const dados = JSON.parse(localStorage.getItem(tipo)) || [];
        el.innerHTML = dados.map(i => `
            <li>
                <span>${i}</span>
                <button onclick="removerItem('${tipo}','${i}')">×</button>
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
    document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
    const targetId = (id === 'menu') ? 'main-menu' : `sec-${id}`;
    const targetElement = document.getElementById(targetId);
    if (targetElement) targetElement.classList.add('active');
    
    if(id === 'cadastros') renderListasCadastros();
    if(id === 'monitoria') renderMonitoria();
}

function openLab(name) {
    currentLab = name;
    const titleEl = document.getElementById('currentLabTitle');
    if(titleEl) titleEl.innerText = name;
    showSection('reservas');
    renderTable();
}

// --- HELPER PARA DATA E DIA DA SEMANA ---
function infoData(inputId, badgeId) {
    const dataInput = document.getElementById(inputId).value;
    if (!dataInput) return null;

    const dataObj = new Date(dataInput + 'T12:00:00'); // Evita erro de fuso horário
    const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const diaNome = diasSemana[dataObj.getDay()];
    
    document.getElementById(badgeId).innerText = diaNome;
    return { data: dataInput, dia: diaNome };
}

// --- RESERVA DE LABORATÓRIOS ---
function renderTable() {
    const tbody = document.getElementById('tableBody');
    const info = infoData('datePickerReservas', 'calendar-info-res');
    
    if (!info) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center">Selecione uma data para ver as reservas.</td></tr>';
        return;
    }

    const listaProfs = JSON.parse(localStorage.getItem('professores')) || [];
    const listaTurmas = JSON.parse(localStorage.getItem('turmas')) || [];

    tbody.innerHTML = slots.map((slot, i) => {
        const isLunch = slot === "12:00 - 13:00";
        const key = `res-${currentLab}-${info.data}-${slot}`;
        const data = JSON.parse(localStorage.getItem(key)) || { prof: '', turma: '' };

        return `
            <tr class="${isLunch ? 'lunch' : ''}">
                <td class="time-cell"><strong>${slot}</strong></td>
                <td>
                    <select onchange="autoSaveRes('${slot}', ${i})" id="p-${i}" ${isLunch ? 'disabled' : ''}>
                        <option value="">Selecione o Professor</option>
                        ${listaProfs.map(p => `<option value="${p}" ${data.prof === p ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <select onchange="autoSaveRes('${slot}', ${i})" id="t-${i}" ${isLunch ? 'disabled' : ''}>
                        <option value="">Selecione a Turma</option>
                        ${listaTurmas.map(t => `<option value="${t}" ${data.turma === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </td>
            </tr>`;
    }).join('');
}

function autoSaveRes(slot, i) {
    const dataInput = document.getElementById('datePickerReservas').value;
    const prof = document.getElementById(`p-${i}`).value;
    const turma = document.getElementById(`t-${i}`).value;
    localStorage.setItem(`res-${currentLab}-${dataInput}-${slot}`, JSON.stringify({ prof, turma }));
}

// --- MONITORIA ---
function renderMonitoria() {
    const tbody = document.getElementById('tableBodyMonitoria');
    const info = infoData('datePickerMonitoria', 'calendar-info-mon');

    if (!info) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center">Selecione uma data para ver a monitoria.</td></tr>';
        return;
    }

    const listaMon = JSON.parse(localStorage.getItem('monitores')) || [];
    const listaTurmas = JSON.parse(localStorage.getItem('turmas')) || [];

    tbody.innerHTML = postosMon.map((posto, i) => {
        const key = `mon-${info.data}-${posto}`;
        const data = JSON.parse(localStorage.getItem(key)) || { nome: '', turma: '' };

        return `
            <tr>
                <td><strong>${posto}</strong></td>
                <td>
                    <select onchange="autoSaveMon('${posto}', ${i})" id="mn-${i}">
                        <option value="">Selecione o Monitor</option>
                        ${listaMon.map(m => `<option value="${m}" ${data.nome === m ? 'selected' : ''}>${m}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <select onchange="autoSaveMon('${posto}', ${i})" id="mt-${i}">
                        <option value="">Selecione a Turma</option>
                        ${listaTurmas.map(t => `<option value="${t}" ${data.turma === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </td>
            </tr>`;
    }).join('');
}

function autoSaveMon(posto, i) {
    const dataInput = document.getElementById('datePickerMonitoria').value;
    const nome = document.getElementById(`mn-${i}`).value;
    const turma = document.getElementById(`mt-${i}`).value;
    localStorage.setItem(`mon-${dataInput}-${posto}`, JSON.stringify({ nome, turma }));
}

// --- INICIALIZAÇÃO ---
window.onload = () => {
    // Define a data de hoje como padrão para os inputs de data
    const hoje = new Date().toISOString().split('T')[0];
    const inputsData = ['datePickerReservas', 'datePickerMonitoria'];
    
    inputsData.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.value = hoje;
        }
    });
};
