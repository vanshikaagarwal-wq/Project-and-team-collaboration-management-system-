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

        message.textContent = "Registration successful!";
        message.style.color = "green";

        signupForm.reset();

    } catch (error) {
        message.textContent = "Unable to register. Please try again.";
        message.style.color = "red";
        console.error(error);
    }
});