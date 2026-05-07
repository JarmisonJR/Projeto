class CadastroManager {
    constructor() {
        // Seleciona o formulário de cadastro
        this.form = document.querySelector('form');
        
        // Seleciona os inputs (Certifique-se que os IDs no HTML são estes)
        this.inputNome = document.getElementById('reg-nome');
        this.inputEmail = document.getElementById('email');
        this.inputSenha = document.getElementById('password');

        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.executarFluxoCadastro(e));
        } else {
            console.error("Formulário de cadastro não encontrado!");
        }
    }

    executarFluxoCadastro(event) {
        // 1. Impede o recarregamento padrão da página
        event.preventDefault();

        // 2. Captura os valores atuais
        const nome = this.inputNome.value.trim();
        const email = this.inputEmail.value.trim();
        const senha = this.inputSenha.value.trim();

        // 3. Validação simples
        if (nome === "" || email === "" || senha === "") {
            alert("Por favor, preencha todos os campos para continuar.");
            return;
        }

        // 4. Salva as informações no LocalStorage
        // O nome que será usado no "Bem-vindo" da Dashboard
        localStorage.setItem('SAD_USER_NAME', nome);
        
        // Credenciais para validar o login depois
        localStorage.setItem('emailCadastrado', email);
        localStorage.setItem('senhaCadastrada', senha);

        // 5. Feedback visual e redirecionamento
        alert(`Conta criada com sucesso, ${nome}!`);
        
        // Envia o usuário para a página de login
        window.location.href = "index.html"; 
    }
}

// Inicializa a classe assim que o script carregar
new CadastroManager();
