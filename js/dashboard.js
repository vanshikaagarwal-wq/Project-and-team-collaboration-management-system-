// Check authentication on page load
document.addEventListener("DOMContentLoaded", function () {
    const loggedInUser = localStorage.getItem("loggedInUser");

    // If user is not logged in, redirect to login page
    if (!loggedInUser) {
        window.location.href = "login.html";
        return;
    }

    try {
        const user = JSON.parse(loggedInUser);
        const userNameElement = document.getElementById("userName");
        if (userNameElement && user.name) {
            userNameElement.textContent = user.name;
        }
    } catch (e) {
        console.error("Error reading user session", e);
    }

    // Initialize tasks and listeners
    loadTasks();
    setupEventListeners();
});

// Initial sample tasks (stored in localStorage)
const defaultTasks = [
    {
        id: 1,
        title: "Setup User Authentication Pages",
        assignee: "Team Member",
        priority: "High",
        dueDate: "2026-10-30",
        status: "Completed"
    },
    {
        id: 2,
        title: "Build Dashboard Layout & UI",
        assignee: "Vedansh",
        priority: "High",
        dueDate: "2026-11-02",
        status: "Completed"
    },
    {
        id: 3,
        title: "Connect JSON Server with Task APIs",
        assignee: "Vedansh",
        priority: "Medium",
        dueDate: "2026-11-05",
        status: "In Progress"
    },
    {
        id: 4,
        title: "Prepare Final Project Documentation",
        assignee: "Team",
        priority: "Low",
        dueDate: "2026-11-10",
        status: "Pending"
    }
];

// Load and render tasks from localStorage
function getTasks() {
    const stored = localStorage.getItem("teamTasks");
    if (!stored) {
        localStorage.setItem("teamTasks", JSON.stringify(defaultTasks));
        return defaultTasks;
    }
    return JSON.parse(stored);
}

function saveTasks(tasks) {
    localStorage.setItem("teamTasks", JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    const tasks = getTasks();
    const tbody = document.getElementById("taskTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    let inProgressCount = 0;
    let completedCount = 0;

    tasks.forEach(task => {
        if (task.status === "In Progress") inProgressCount++;
        if (task.status === "Completed") completedCount++;

        const tr = document.createElement("tr");

        // Status badge class
        let badgeClass = "pending";
        if (task.status === "In Progress") badgeClass = "in-progress";
        if (task.status === "Completed") badgeClass = "completed";

        tr.innerHTML = `
            <td><strong>${escapeHtml(task.title)}</strong></td>
            <td>${escapeHtml(task.assignee)}</td>
            <td>${escapeHtml(task.priority)}</td>
            <td>${task.dueDate}</td>
            <td><span class="badge ${badgeClass}">${task.status}</span></td>
            <td>
                ${task.status !== "Completed" ? `<button class="action-btn complete" onclick="markComplete(${task.id})">Done</button>` : ""}
                <button class="action-btn delete" onclick="deleteTask(${task.id})">Delete</button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // Update stats count
    const totalEl = document.getElementById("totalTasks");
    const inProgressEl = document.getElementById("inProgressTasks");
    const completedEl = document.getElementById("completedTasks");

    if (totalEl) totalEl.textContent = tasks.length;
    if (inProgressEl) inProgressEl.textContent = inProgressCount;
    if (completedEl) completedEl.textContent = completedCount;
}

// Add new task
function setupEventListeners() {
    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        });
    }

    // Task Form
    const taskForm = document.getElementById("taskForm");
    if (taskForm) {
        taskForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const title = document.getElementById("taskTitle").value.trim();
            const assignee = document.getElementById("taskAssignee").value.trim();
            const priority = document.getElementById("taskPriority").value;
            const dueDate = document.getElementById("taskDueDate").value;
            const status = document.getElementById("taskStatus").value;

            if (!title || !assignee || !dueDate) return;

            const tasks = getTasks();
            const newTask = {
                id: Date.now(),
                title: title,
                assignee: assignee,
                priority: priority,
                dueDate: dueDate,
                status: status
            };

            tasks.push(newTask);
            saveTasks(tasks);

            taskForm.reset();
        });
    }
}

// Global actions
window.markComplete = function (taskId) {
    const tasks = getTasks().map(t => {
        if (t.id === taskId) {
            t.status = "Completed";
        }
        return t;
    });
    saveTasks(tasks);
};

window.deleteTask = function (taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
        const tasks = getTasks().filter(t => t.id !== taskId);
        saveTasks(tasks);
    }
};

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function loadTasks() {
    renderTasks();
}
