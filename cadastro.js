class Cadastro {
    constructor() {
        // Seleciona o formulário (use o ID ou a tag form)
        this.form = document.querySelector('form'); 
        this.inputNome = document.getElementById('reg-nome');
        this.inputEmail = document.getElementById('email');
        this.inputSenha = document.getElementById('password');
        this.bindEvents();
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarEContinuar();
            });
        }
    }

    salvarEContinuar() {
        const nome = this.inputNome.value;
        const email = this.inputEmail.value;
        const senha = this.inputSenha.value;

        if (nome && email && senha) {
            // Salva tudo no LocalStorage
            localStorage.setItem('SAD_USER_NAME', nome);
            localStorage.setItem('emailCadastrado', email);
            localStorage.setItem('senhaCadastrada', senha);

            alert('Cadastro realizado! Agora faça login para entrar.');
            window.location.href = "index.html"; 
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    }
}

new Cadastro();
