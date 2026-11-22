// Authentication Check
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
    // Nav elements
    const navUserName = document.getElementById("navUserName");
    const navAvatar = document.getElementById("navAvatar");
    if (navUserName) navUserName.textContent = loggedInUser.name || "User";
    if (navAvatar && loggedInUser.avatar) navAvatar.src = loggedInUser.avatar;

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        });
    }

    // Populate profile details
    renderProfileView();
    loadUserTasks();

    // Attach form listeners
    setupProfileForm();
    setupPasswordForm();
});

function renderProfileView() {
    // Hero Elements
    const heroName = document.getElementById("profileHeroName");
    const heroRole = document.getElementById("profileHeroRole");
    const heroTitle = document.getElementById("profileHeroTitle");
    const heroDept = document.getElementById("profileHeroDept");
    const heroEmail = document.getElementById("profileHeroEmail");
    const heroLocation = document.getElementById("profileHeroLocation");
    const heroAvatar = document.getElementById("profileHeroAvatar");

    if (heroName) heroName.textContent = loggedInUser.name || "User";
    if (heroRole) heroRole.textContent = loggedInUser.role || "Member";
    if (heroTitle) heroTitle.textContent = loggedInUser.title || loggedInUser.role || "Member";
    if (heroEmail) heroEmail.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        ${escapeHTML(loggedInUser.email || "")}
    `;
    if (heroDept) heroDept.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
        ${escapeHTML(loggedInUser.department || "General")}
    `;
    if (heroLocation) heroLocation.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        ${escapeHTML(loggedInUser.location || "Remote")}
    `;
    if (heroAvatar && loggedInUser.avatar) {
        heroAvatar.src = loggedInUser.avatar;
    }

    // Form inputs
    const inputName = document.getElementById("profileName");
    const inputEmail = document.getElementById("profileEmail");
    const inputTitle = document.getElementById("profileTitle");
    const inputDept = document.getElementById("profileDepartment");
    const inputPhone = document.getElementById("profilePhone");
    const inputLoc = document.getElementById("profileLocation");
    const inputAvatar = document.getElementById("profileAvatar");
    const inputBio = document.getElementById("profileBio");

    if (inputName) inputName.value = loggedInUser.name || "";
    if (inputEmail) inputEmail.value = loggedInUser.email || "";
    if (inputTitle) inputTitle.value = loggedInUser.title || "";
    if (inputDept) inputDept.value = loggedInUser.department || "Engineering";
    if (inputPhone) inputPhone.value = loggedInUser.phone || "";
    if (inputLoc) inputLoc.value = loggedInUser.location || "";
    if (inputAvatar) inputAvatar.value = loggedInUser.avatar || "";
    if (inputBio) inputBio.value = loggedInUser.bio || "";
}

function setupProfileForm() {
    const form = document.getElementById("profileForm");
    const message = document.getElementById("profileMessage");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        message.textContent = "Saving changes...";
        message.style.color = "#2563eb";

        const updatedData = {
            name: document.getElementById("profileName").value.trim(),
            title: document.getElementById("profileTitle").value.trim(),
            department: document.getElementById("profileDepartment").value,
            phone: document.getElementById("profilePhone").value.trim(),
            location: document.getElementById("profileLocation").value.trim(),
            avatar: document.getElementById("profileAvatar").value.trim() || loggedInUser.avatar,
            bio: document.getElementById("profileBio").value.trim()
        };

        // Merge into loggedInUser
        loggedInUser = { ...loggedInUser, ...updatedData };
        localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));

        // Update local users cache
        const localUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const idx = localUsers.findIndex(u => String(u.id) === String(loggedInUser.id));
        if (idx !== -1) {
            localUsers[idx] = { ...localUsers[idx], ...updatedData };
            localStorage.setItem("users", JSON.stringify(localUsers));
        }

        // Try API PATCH
        try {
            await fetch(`/users/${loggedInUser.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            });
        } catch (err) {
            console.warn("Could not patch /users on server, saved locally.");
        }

        // Update Nav & Hero
        const navUserName = document.getElementById("navUserName");
        const navAvatar = document.getElementById("navAvatar");
        if (navUserName) navUserName.textContent = loggedInUser.name;
        if (navAvatar && loggedInUser.avatar) navAvatar.src = loggedInUser.avatar;

        renderProfileView();
        message.textContent = "Profile updated successfully!";
        message.style.color = "#16a34a";

        setTimeout(() => {
            message.textContent = "";
        }, 3000);
    });
}

function setupPasswordForm() {
    const form = document.getElementById("passwordChangeForm");
    const message = document.getElementById("passwordMessage");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const currentPass = document.getElementById("currentPassword").value;
        const newPass = document.getElementById("newPassword").value;
        const confirmPass = document.getElementById("confirmNewPassword").value;

        // Check current password
        if (loggedInUser.password && currentPass !== loggedInUser.password) {
            message.textContent = "Current password does not match.";
            message.style.color = "#dc2626";
            return;
        }

        // Check new password match
        if (newPass !== confirmPass) {
            message.textContent = "New passwords do not match.";
            message.style.color = "#dc2626";
            return;
        }

        if (newPass.length < 6) {
            message.textContent = "Password must be at least 6 characters.";
            message.style.color = "#dc2626";
            return;
        }

        message.textContent = "Updating password...";
        message.style.color = "#2563eb";

        loggedInUser.password = newPass;
        localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));

        // Update local users cache
        const localUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const idx = localUsers.findIndex(u => String(u.id) === String(loggedInUser.id));
        if (idx !== -1) {
            localUsers[idx].password = newPass;
            localStorage.setItem("users", JSON.stringify(localUsers));
        }

        // Try API PATCH
        try {
            await fetch(`/users/${loggedInUser.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPass })
            });
        } catch (err) {
            console.warn("Could not patch password on server, updated locally.");
        }

        message.textContent = "Password updated successfully!";
        message.style.color = "#16a34a";
        form.reset();

        setTimeout(() => {
            message.textContent = "";
        }, 3000);
    });
}

async function loadUserTasks() {
    const container = document.getElementById("myTasksList");
    if (!container) return;

    try {
        let tasks = [];
        const res = await fetch("/tasks");
        if (res.ok) {
            tasks = await res.json();
            localStorage.setItem("tasks", JSON.stringify(tasks));
        } else {
            tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        }

        // Filter tasks assigned to current user
        const myTasks = tasks.filter(t => String(t.assignedTo) === String(loggedInUser.id));

        if (myTasks.length === 0) {
            container.innerHTML = `<p class="empty-state">No tasks currently assigned to you.</p>`;
            return;
        }

        container.innerHTML = myTasks.slice(0, 5).map(task => {
            const statusSlug = (task.status || "to-do").toLowerCase().replace(/\s+/g, "-");
            return `
                <div class="task-mini-item">
                    <span class="task-mini-title">${escapeHTML(task.title)}</span>
                    <span class="badge badge-${statusSlug}">${escapeHTML(task.status || "To Do")}</span>
                </div>
            `;
        }).join("");
    } catch (err) {
        container.innerHTML = `<p class="empty-state">No tasks found.</p>`;
    }
}

function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
