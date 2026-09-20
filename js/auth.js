const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

// Show / Hide password
togglePassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.setAttribute("aria-label", "Hide password");

        togglePassword.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg"
                width="22" height="22" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M3 3l18 18"></path>
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"></path>
                <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a17.3 17.3 0 0 1-3.1 4.2"></path>
                <path d="M6.6 6.6C3.7 8.4 2 12 2 12s3.5 8 10 8a10.8 10.8 0 0 0 4.1-.8"></path>
            </svg>
        `;
    } else {
        passwordInput.type = "password";
        togglePassword.setAttribute("aria-label", "Show password");

        togglePassword.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg"
                width="22" height="22" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }
});

// Login
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;

    try {
        const response = await fetch(
            `/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        );

        const users = await response.json();

        if (users.length > 0) {
            message.textContent = "Login successful!";
            message.style.color = "green";

            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(users[0])
            );
        } else {
            message.textContent = "Invalid email or password.";
            message.style.color = "red";
        }
    } catch (error) {
        message.textContent = "Unable to connect to the server.";
        message.style.color = "red";
        console.error(error);
    }
});