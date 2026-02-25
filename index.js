const turmasValidas = ["DS1", "DS2", "DS3", "MULTI1", "MULTI2", "MULTI3", "CTB1", "CTB2", "CTB3", "RDC1", "RDC2", "RDC3"];
const slots = ["07:20 - 08:10", "08:10 - 09:00", "09:20 - 10:10", "10:10 - 11:00", "11:00 - 11:50", "12:00 - 13:00", "13:10 - 14:00", "14:00 - 14:50", "15:10 - 16:00", "16:00 - 16:50"];
const cargosMonitoria = ["Fila (Álcool em Gel) Intervalo da Manhã", "Sucos - Intervalo do Almoço", "Fila (Álcool em Gel) - Intervalo do almoço", "Portaria - Intervalo do Almoço", "Fila - Intervalo da tarde"];

let currentLab = "Lab Informática";
let usuarioLogado = null;

// --- LOGIN E CADASTRO ---
function toggleAuth(type) {
    document.getElementById('login-form').style.display = type === 'signup' ? 'none' : 'block';
    document.getElementById('signup-form').style.display = type === 'signup' ? 'block' : 'none';
}

function handleSignup() {
    const nome = document.getElementById('reg-nome').value.trim();
    const matricula = document.getElementById('reg-matricula').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const cargo = document.getElementById('reg-cargo').value;

    if (!nome || !matricula || !email || pass.length < 6) {
        return alert("Preencha todos os dados corretamente (Senha mín. 6 caracteres).");
    }

    const user = { nome, matricula, email, pass, cargo };
    // CORRIGIDO: Uso de crases para Template Strings
    localStorage.setItem(`user-${email}`, JSON.stringify(user));
    alert("Cadastro concluído! Faça seu login.");
    toggleAuth('login');
}

function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    // CORRIGIDO: Uso de crases
    const savedUser = JSON.parse(localStorage.getItem(`user-${email}`));

    if (savedUser && savedUser.pass === pass) {
        usuarioLogado = savedUser;
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('app-content').style.display = 'block';
        // CORRIGIDO: Uso de crases
        document.getElementById('welcome-user').innerText = `Olá, ${savedUser.cargo} ${savedUser.nome.split(' ')[0]}!`;
        showSection('menu');
    } else {
        alert("Credenciais incorretas.");
    }
}

function logout() {
    location.reload();
}

// --- NAVEGAÇÃO ---
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    if (id === 'menu') {
        document.getElementById('main-menu').classList.add('active');
    } else {
        // CORRIGIDO: Uso de crases
        const target = document.getElementById(`sec-${id}`);
        if (target) {
            target.classList.add('active');
            id === 'reservas' ? renderTable() : renderMonitoria();
        }
    }
}

// --- RESERVAS ---
function changeLab(name) {
    currentLab = name;
    document.getElementById('currentLabTitle').innerText = name;
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    const semEl = document.getElementById('semanaSelect');
    const diaEl = document.getElementById('diaSelect');
    if (!tbody || !semEl || !diaEl) return;

    const semana = semEl.value;
    const dia = diaEl.value;
    tbody.innerHTML = '';

    slots.forEach((slot, index) => {
        const isLunch = slot === "12:00 - 13:00";
        // CORRIGIDO: Uso de crases
        const key = `reserva-${currentLab}-${semana}-${dia}-${slot}`;
        const saved = JSON.parse(localStorage.getItem(key)) || { prof: '', turma: '' };

        const row = document.createElement('tr');
        if (isLunch) row.classList.add('lunch-break');
        if (saved.turma && !isLunch) row.classList.add('reserved-row');

        row.innerHTML = `
            <td><strong>${slot}</strong></td>
            <td><input type="text" id="prof-${index}" value="${isLunch ? 'ALMOÇO' : saved.prof}" ${isLunch ? 'disabled' : ''}></td>
            <td><input type="text" id="turma-${index}" value="${isLunch ? 'LIVRE' : saved.turma}" ${isLunch ? 'disabled' : ''}></td>
            <td><button class="btn-save" onclick="saveBooking('${slot}', ${index})">Salvar</button></td>
        `;
        tbody.appendChild(row);
    });
}

function saveBooking(slot, index) {
    if (slot === "12:00 - 13:00") return;
    const semana = document.getElementById('semanaSelect').value;
    const dia = document.getElementById('diaSelect').value;
    // CORRIGIDO: Uso de crases
    const prof = document.getElementById(`prof-${index}`).value.trim();
    const turma = document.getElementById(`turma-${index}`).value.trim().toUpperCase();

    if (!prof || !turma) return alert("Erro: Preencha tudo.");
    if (!turmasValidas.includes(turma)) return alert("Turma inválida!");

    // CORRIGIDO: Uso de crases
    localStorage.setItem(`reserva-${currentLab}-${semana}-${dia}-${slot}`, JSON.stringify({ prof, turma }));
    alert("Reserva salva!");
    renderTable();
}

// --- MONITORIA ---
function renderMonitoria() {
    const tbody = document.getElementById('tableBodyMonitoria');
    const semEl = document.getElementById('monSemanaSelect');
    const diaEl = document.getElementById('monDiaSelect');
    if (!tbody || !semEl || !diaEl) return;

    const semana = semEl.value;
    const dia = diaEl.value;
    tbody.innerHTML = '';

    cargosMonitoria.forEach((cargo, index) => {
        // CORRIGIDO: Uso de crases
        const key = `mon-S${semana}-${dia}-${cargo}`;
        const saved = JSON.parse(localStorage.getItem(key)) || { nome: '', turma: '' };
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${cargo}</strong></td>
            <td><input type="text" id="mon-nome-${index}" value="${saved.nome}"></td>
            <td><input type="text" id="mon-turma-${index}" value="${saved.turma}"></td>
            <td><button class="btn-save" onclick="saveMonitoria('${cargo}', ${index})">Gravar</button></td>
        `;
        tbody.appendChild(row);
    });
}

function saveMonitoria(cargo, index) {
    const semana = document.getElementById('monSemanaSelect').value;
    const dia = document.getElementById('monDiaSelect').value;
    // CORRIGIDO: Uso de crases
    const nome = document.getElementById(`mon-nome-${index}`).value;
    const turma = document.getElementById(`mon-turma-${index}`).value;

    localStorage.setItem(`mon-S${semana}-${dia}-${cargo}`, JSON.stringify({ nome, turma }));
    alert("Monitoria gravada!");
}

function checkAutoReset() {
    if (new Date().getHours() >= 17) {
        Object.keys(localStorage).forEach(key => { 
            if (key.startsWith('reserva-')) localStorage.removeItem(key); 
        });
    }
}

window.onload = () => {
    checkAutoReset();
};
