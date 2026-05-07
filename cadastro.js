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
