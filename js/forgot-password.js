const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");

const toggleNewPassword = document.getElementById("toggleNewPassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

const eyeIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"></path>
    <circle cx="12" cy="12" r="3"></circle>
</svg>
`;

const eyeOffIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true">
    <path d="M3 3l18 18"></path>
    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"></path>
    <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a17.3 17.3 0 0 1-3.1 4.2"></path>
    <path d="M6.6 6.6C3.7 8.4 2 12 2 12s3.5 8 10 8a10.8 10.8 0 0 0 4.1-.8"></path>
</svg>
`;

// New Password
toggleNewPassword.addEventListener("click", function () {
    if (newPasswordInput.type === "password") {
        newPasswordInput.type = "text";
        toggleNewPassword.innerHTML = eyeOffIcon;
        toggleNewPassword.setAttribute("aria-label", "Hide password");
    } else {
        newPasswordInput.type = "password";
        toggleNewPassword.innerHTML = eyeIcon;
        toggleNewPassword.setAttribute("aria-label", "Show password");
    }
});

// Confirm Password
toggleConfirmPassword.addEventListener("click", function () {
    if (confirmPasswordInput.type === "password") {
        confirmPasswordInput.type = "text";
        toggleConfirmPassword.innerHTML = eyeOffIcon;
        toggleConfirmPassword.setAttribute("aria-label", "Hide password");
    } else {
        confirmPasswordInput.type = "password";
        toggleConfirmPassword.innerHTML = eyeIcon;
        toggleConfirmPassword.setAttribute("aria-label", "Show password");
    }
});
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const message = document.getElementById("message");

forgotPasswordForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Check password match
    if (newPassword !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        message.style.color = "red";
        return;
    }

    try {
        // Find user by email
        const response = await fetch(
            `/users?email=${encodeURIComponent(email)}`
        );

        const users = await response.json();

        if (users.length === 0) {
            message.textContent = "Email not registered.";
            message.style.color = "red";
            return;
        }

        const user = users[0];

        // Update password
        const updateResponse = await fetch(`/users/${user.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: newPassword
            })
        });

        if (!updateResponse.ok) {
            throw new Error("Password update failed.");
        }

        message.textContent = "Password reset successful!";
        message.style.color = "green";

        forgotPasswordForm.reset();

    } catch (error) {
        message.textContent = "Unable to reset password. Please try again.";
        message.style.color = "red";
        console.error(error);
    }
});