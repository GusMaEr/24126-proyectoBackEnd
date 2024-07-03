// script.js



// Function to handle form submission
function handleFormSubmit(event, url) {
  event.preventDefault();

  const form = event.target;
  const username = form.querySelector('input[type="text"]').value;
  const password = form.querySelector('input[type="password"]').value;
 

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (data.auth) {
      localStorage.setItem('token', data.token);
      alert(`${url === '/register' ? 'Registro' : 'Inicio de sesión'} exitoso!`);
    } else {
      alert(`Error en el ${url === '/register' ? 'registro' : 'inicio de sesión'}.`);
    }
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
    alert('Ocurrió un error. Por favor, inténtelo de nuevo.');
  });
}

// Event listeners for form submissions
document.getElementById('register-form').addEventListener('submit', function(event) {
  handleFormSubmit(event, '/register');
});

document.getElementById('login-form').addEventListener('submit', function(event) {
  handleFormSubmit(event, '/login');
});
