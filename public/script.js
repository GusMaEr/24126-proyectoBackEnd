// script.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const messageElement = document.getElementById('message');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    function showMessage(message, isError = false) {
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.classList.remove('hidden', 'success', 'error');
            messageElement.classList.add(isError ? 'error' : 'success');
            setTimeout(() => messageElement.classList.add('hidden'), 5000);
        } else {
            console.error('Element with id "message" not found');
        }
    }

    async function handleFormSubmit(event, url) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('Content-Type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('La respuesta no es de tipo JSON');
            }

            const text = await response.text();
            if (!text) {
                throw new Error('La respuesta del servidor está vacía');
            }

            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('Error al parsear JSON:', e);
                throw new Error('La respuesta del servidor no es JSON válido');
            }

            if (result.auth) {
                localStorage.setItem('token', result.token);
                showMessage(`${url === '/register' ? 'Registro' : 'Inicio de sesión'} exitoso!`);
                form.reset();
            } else {
                throw new Error(result.message || 'Error en la operación.');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(error.message, true);
        }
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (event) => handleFormSubmit(event, '/register'));
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => handleFormSubmit(event, '/login'));
    }

    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            if (passwordInput) {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                button.classList.toggle('fa-eye');
                button.classList.toggle('fa-eye-slash');
            }
        });
    });
});