const formCadastro = document.querySelector('form');

formCadastro.addEventListener('submit', (e) => {
    e.preventDefault();

    // Pega o que foi digitado
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    // Salva no banco de dados local do navegador
    localStorage.setItem('emailCadastrado', email);
    localStorage.setItem('senhaCadastrada', senha);

    alert('Cadastro realizado! Agora faça login para entrar.');

    // Retorna para a página de login
    window.location.href = "index.html"; 
});
class Cadastro {
    constructor() {
        this.form = document.getElementById('auth-form'); // Id do seu formulário
        this.inputNome = document.getElementById('reg-nome');
        this.bindEvents();
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', () => this.salvarUsuario());
        }
    }

    salvarUsuario() {
        const usuarioNome = this.inputNome.value;
        if (nome) {
            // Salva o nome no "banco de dados" do navegador
            localStorage.setItem('SAD_USER_NAME', usuarioNome);
        }
    }
}

// Inicializa a lógica de cadastro
new Cadastro();
