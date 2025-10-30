document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the email and password values
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const resp = await fetch("http://localhost:5001/signIn", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });
        const data = await resp.json();

       if (!resp.ok) {
      alert(data.message || 'Error al iniciar sesión');
      return;
    }
    localStorage.setItem('token', data.token);
    // Redirigir o actualizar UI
    alert('Inicio de sesión exitoso');
    console.log("inicio de sesion exitoso");
  } catch (err) {
    console.error(err);
    alert('No se pudo conectar al servidor');
  }
});

document.getElementById("newUserForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent the default form submission
    // Get the email and password values
    const newName = document.getElementById("newUsername").value;
    const newEmail = document.getElementById("newEmail").value;
    const newPasswd = document.getElementById("newPassword").value;
    try {
        const resp = await fetch("http://localhost:5001/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ newName, newEmail, newPasswd })
        });
        const data = await resp.json();

        if (!resp.ok) {
            alert(data.message || 'Error al registrar usuario');
            return;
        }
        alert('Registro exitoso');
        console.log("registro exitoso");
    } catch (err) {
        console.error(err);
        alert('No se pudo conectar al servidor');
    }
});
//how to change register form display none to showing
document.getElementById("registerButton").addEventListener("click", function() {
    document.getElementById("registerForm").style.display = "block";
    document.getElementById("loginForm").style.display = "none";
});
