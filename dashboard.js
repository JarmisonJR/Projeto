class Dashboard {
    constructor() {
        // Busca o nome salvo ou define o padrão
        this.usuarioNome = localStorage.getItem('SAD_USER_NAME') || "Técnico";
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.renderizarBoasVindas();
            
            // Inicializa as outras funções do seu sistema
            showScreen('home-screen');
            atualizarData();
            updateStats();
            aplicarTemaSalvo();
        });
    }

    renderizarBoasVindas() {
        const welcomeElement = document.getElementById('welcome-text');
        if (welcomeElement) {
            // Usa o nome guardado na classe
            welcomeElement.innerText = `Bem-vindo, Técnico ${this.usuarioNome}!`;
        }
    }
}

// Inicia a classe Dashboard
const appDashboard = new Dashboard();

// --- SISTEMA DE NAVEGAÇÃO ---
function showScreen(id) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    
    const mainLayout = document.getElementById('main-layout');
    if (mainLayout) mainLayout.classList.remove('hidden');

    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        const acao = btn.getAttribute('onclick');
        if (acao && acao.includes(id)) {
            btn.classList.add('active');
        }
    });

    if (id === 'lista-screen') renderTable();
    updateStats();
}

// --- GESTÃO DE ORDENS (CRUD) ---
const serviceForm = document.getElementById('serviceForm');
if (serviceForm) {
    serviceForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const novaOS = {
            id: Math.floor(100 + Math.random() * 899),
            cliente: document.getElementById('cli-nome').value,
            aparelho: document.getElementById('apa-nome').value,
            defeito: document.getElementById('apa-defeito').value,
            data: document.getElementById('apa-data').value,
            status: 'Pendente'
        };

        let osList = JSON.parse(localStorage.getItem('SAD_PRO_OS') || '[]');
        osList.push(novaOS);
        localStorage.setItem('SAD_PRO_OS', JSON.stringify(osList));

        this.reset();
        
        openConfirm(
            "Ordem Registrada", 
            "A ordem de serviço foi salva com sucesso! Deseja ver a lista agora?", 
            () => showScreen('lista-screen'),
            "Ver Lista"
        );
    });
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;

    let osList = JSON.parse(localStorage.getItem('SAD_PRO_OS') || '[]');
    
    if (osList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 40px; color: #71717a;">Nenhuma ordem salva.</td></tr>';
        return;
    }

    tbody.innerHTML = [...osList].reverse().map(os => `
        <tr>
            <td>#${os.id}</td>
            <td><b>${os.cliente}</b></td>
            <td>${os.aparelho}<br><small style="color: #71717a;">${os.defeito}</small></td>
            <td>
                <span class="status-badge ${os.status === 'Pendente' ? 'status-pendente' : 'status-concluido'}" 
                      onclick="toggleStatus(${os.id})" 
                      style="cursor:pointer">
                    ${os.status}
                </span>
            </td>
            <td>
                <button onclick="confirmarExclusao(${os.id})" class="btn-del">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function toggleStatus(id) {
    let osList = JSON.parse(localStorage.getItem('SAD_PRO_OS') || '[]');
    osList = osList.map(os => {
        if (os.id == id) os.status = (os.status === 'Pendente') ? 'Concluído' : 'Pendente';
        return os;
    });
    localStorage.setItem('SAD_PRO_OS', JSON.stringify(osList));
    renderTable();
    updateStats();
}

function confirmarExclusao(id) {
    openConfirm("Apagar Registro?", "Esta ação não pode ser desfeita.", () => {
        let osList = JSON.parse(localStorage.getItem('SAD_PRO_OS') || '[]');
        osList = osList.filter(os => os.id !== id);
        localStorage.setItem('SAD_PRO_OS', JSON.stringify(osList));
        renderTable();
        updateStats();
    }, "Confirmar");
}

function openConfirm(titulo, msg, acao, textoBotao = "Confirmar") {
    const modal = document.getElementById('custom-confirm');
    const btnSim = document.getElementById('confirm-yes');
    if(!modal || !btnSim) return;

    document.getElementById('confirm-title').innerText = titulo;
    document.getElementById('confirm-message').innerText = msg;
    btnSim.innerText = textoBotao;
    modal.classList.remove('hidden');

    const novoBtnSim = btnSim.cloneNode(true);
    btnSim.parentNode.replaceChild(novoBtnSim, btnSim);

    novoBtnSim.onclick = () => {
        if (acao) acao();
        closeConfirm();
    };
}

function closeConfirm() {
    const modal = document.getElementById('custom-confirm');
    if (modal) modal.classList.add('hidden');
}

function updateStats() {
    const osList = JSON.parse(localStorage.getItem('SAD_PRO_OS') || '[]');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let abertas = 0;
    let urgentes = 0;

    osList.forEach(os => {
        if (os.status === 'Pendente') {
            abertas++;
            const dataPrazo = new Date(os.data);
            dataPrazo.setHours(0, 0, 0, 0);
            if (dataPrazo < hoje) urgentes++;
        }
    });

    if(document.getElementById('count-open')) document.getElementById('count-open').innerText = abertas;
    if(document.getElementById('count-total')) document.getElementById('count-total').innerText = osList.length;
    if(document.getElementById('count-urgent')) document.getElementById('count-urgent').innerText = urgentes;
}

function atualizarData() {
    const el = document.getElementById('current-date');
    if (el) {
        el.innerText = new Date().toLocaleDateString('pt-br', { weekday: 'long', day: 'numeric', month: 'long' });
    }
}

function aplicarTemaSalvo() {
    const saved = localStorage.getItem('SAD_PRO_THEME');
    if (saved === 'light') {
        document.body.classList.replace('dark-theme', 'light-theme');
        const icon = document.getElementById('theme-icon');
        if (icon) icon.classList.replace('fa-moon', 'fa-sun');
    }
}
function confirmarSair() {
    // Abre o seu modal customizado
    openConfirm(
        "Sair do Sistema", 
        "Deseja realmente encerrar sua sessão atual?", 
        () => {
            // Esta é a ação executada ao clicar em "Sim, Confirmar"
            // Substitua 'index.html' pelo nome da sua página de login ou destino
            window.location.href = "index.html"; 
        }
    );
}
