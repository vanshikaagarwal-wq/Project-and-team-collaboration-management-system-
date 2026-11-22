const signupForm = document.getElementById("signupForm");
const message = document.getElementById("message");

signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Check password match
    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        message.style.color = "red";
        return;
    }

    try {
        // Check duplicate email
        const checkResponse = await fetch(
            `/users?email=${encodeURIComponent(email)}`
        );

        const existingUsers = await checkResponse.json();

        if (existingUsers.length > 0) {
            message.textContent = "Email already registered.";
            message.style.color = "red";
            return;
        }

        // Create new user
        const response = await fetch("/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                role: "member"
            })
        });

        if (!response.ok) {
            throw new Error("Registration failed.");
        }

        // Also sync local storage
        const localUsers = JSON.parse(localStorage.getItem("users") || "[]");
        localUsers.push({
            id: String(Date.now()),
            name: name,
            email: email,
            password: password,
            role: "member"
        });
        localStorage.setItem("users", JSON.stringify(localUsers));

        message.textContent = "Registration successful!";
        message.style.color = "green";

        signupForm.reset();
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);

    } catch (error) {
        // Fallback for offline mode
        const localUsers = JSON.parse(localStorage.getItem("users") || "[]");
        if (localUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            message.textContent = "Email already registered.";
            message.style.color = "red";
            return;
        }
        localUsers.push({
            id: String(Date.now()),
            name: name,
            email: email,
            password: password,
            role: "member"
        });
        localStorage.setItem("users", JSON.stringify(localUsers));
        message.textContent = "Registration successful!";
        message.style.color = "green";
        signupForm.reset();
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);
    }
});