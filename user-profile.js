const API_URL = `${window.location.origin}/users`;

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const profileName = document.getElementById("profileName");
const profileRole = document.getElementById("profileRole");
const editButton = document.getElementById("editButton");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const message = document.getElementById("message");

let currentUser = null;
let originalName = "";

function setEditing(editing) {
    nameInput.readOnly = !editing;
    editButton.hidden = editing;
    saveButton.hidden = !editing;
    cancelButton.hidden = !editing;
}

function displayProfile() {
    nameInput.value = currentUser.name || "";
    emailInput.value = currentUser.email || "";
    profileName.textContent = currentUser.name || "User";
    profileRole.textContent = currentUser.role || "Member";
    originalName = currentUser.name || "";
}

async function loadProfile() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not load users");
        }

        const users = await response.json();

        currentUser = users.find(
            user => user.email === "test@example.com"
        );

        if (!currentUser) {
            message.textContent = "User not found in database.";
            return;
        }

        displayProfile();
        setEditing(false);
        message.textContent = "";
    } catch (error) {
        message.textContent =
            "Unable to load profile. Check JSON Server.";
        console.error(error);
    }
}
editButton.addEventListener("click", () => {
    originalName = nameInput.value;
    message.textContent = "";
    setEditing(true);
    nameInput.focus();
});

cancelButton.addEventListener("click", () => {
    nameInput.value = originalName;
    message.textContent = "";
    setEditing(false);
});

saveButton.addEventListener("click", async () => {
    const newName = nameInput.value.trim();

    if (!newName) {
        message.textContent = "Please enter your name.";
        return;
    }

    saveButton.disabled = true;

    try {
        const response = await fetch(`${API_URL}/${currentUser.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName })
        });

        if (!response.ok) throw new Error("Profile update failed");

        currentUser = await response.json();

        localStorage.setItem("loggedInUser", JSON.stringify(currentUser));
        displayProfile();
        setEditing(false);
        message.textContent = "Profile saved successfully!";
        console.log("User profile updated successfully.");
    } catch (error) {
        message.textContent = "Could not save changes. Try again.";
        console.error(error);
    } finally {
        saveButton.disabled = false;
    }
});

loadProfile();