// Authentication Check
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser) {
    window.location.href = "login.html";
}

// Global data caches
let projectsData = [];
let tasksData = [];
let usersData = [];
let activitiesData = [];

document.addEventListener("DOMContentLoaded", async function () {
    // Populate User Details
    const navUserName = document.getElementById("navUserName");
    const navAvatar = document.getElementById("navAvatar");
    const welcomeUserName = document.getElementById("welcomeUserName");

    if (navUserName) navUserName.textContent = loggedInUser.name || "User";
    if (welcomeUserName) welcomeUserName.textContent = loggedInUser.name || "User";
    if (navAvatar && loggedInUser.avatar) navAvatar.src = loggedInUser.avatar;

    // Logout Handler
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        });
    }

    // Load All Data
    await loadDashboardData();
});

// Helper API Fetch with Local Storage Fallback
async function fetchData(endpoint, storageKey) {
    try {
        const res = await fetch(endpoint);
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem(storageKey, JSON.stringify(data));
            return data;
        }
        throw new Error(`Failed to fetch ${endpoint}`);
    } catch (err) {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
            return JSON.parse(cached);
        }
        // Fallback to embedded seed data if nothing is cached yet
        return getDefaultSeedData(storageKey);
    }
}

async function loadDashboardData() {
    try {
        [projectsData, tasksData, usersData, activitiesData] = await Promise.all([
            fetchData("/projects", "projects"),
            fetchData("/tasks", "tasks"),
            fetchData("/users", "users"),
            fetchData("/activities", "activities")
        ]);

        renderStats();
        renderActiveProjects();
        renderPriorityTasks();
        renderTeamSnapshot();
        renderActivityFeed();
    } catch (e) {
        console.error("Dashboard data load error:", e);
    }
}

function renderStats() {
    const totalProjects = projectsData.length;
    const activeProjects = projectsData.filter(p => p.status === "In Progress" || p.status === "Planning").length;
    const totalTasks = tasksData.length;
    const completedTasks = tasksData.filter(t => t.status === "Completed").length;
    const activeTasks = totalTasks - completedTasks;
    const totalTeam = usersData.length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const statProjects = document.getElementById("statProjectsCount");
    const statProjectsSub = document.getElementById("statProjectsSub");
    const statTasks = document.getElementById("statTasksCount");
    const statTasksSub = document.getElementById("statTasksSub");
    const statTeam = document.getElementById("statTeamCount");
    const statTeamSub = document.getElementById("statTeamSub");
    const statRate = document.getElementById("statCompletionRate");
    const statRateSub = document.getElementById("statCompletionSub");

    if (statProjects) statProjects.textContent = totalProjects;
    if (statProjectsSub) statProjectsSub.textContent = `${activeProjects} active`;
    if (statTasks) statTasks.textContent = activeTasks;
    if (statTasksSub) statTasksSub.textContent = `${completedTasks} completed`;
    if (statTeam) statTeam.textContent = totalTeam;
    if (statTeamSub) statTeamSub.textContent = "Across all departments";
    if (statRate) statRate.textContent = `${completionRate}%`;
    if (statRateSub) statRateSub.textContent = `${completedTasks} of ${totalTasks} tasks done`;
}

function renderActiveProjects() {
    const container = document.getElementById("projectsList");
    if (!container) return;

    if (!projectsData || projectsData.length === 0) {
        container.innerHTML = `<p class="empty-state">No projects found. Create your first project!</p>`;
        return;
    }

    const displayProjects = projectsData.slice(0, 4);
    container.innerHTML = displayProjects.map(project => {
        const statusSlug = (project.status || "in-progress").toLowerCase().replace(/\s+/g, "-");
        const prioritySlug = (project.priority || "medium").toLowerCase();
        const progress = project.progress || 0;

        return `
            <div class="project-item">
                <div class="project-header-row">
                    <a href="projects.html" class="project-title">${escapeHTML(project.title)}</a>
                    <div>
                        <span class="badge badge-${prioritySlug}">${escapeHTML(project.priority || "Medium")}</span>
                        <span class="badge badge-${statusSlug}">${escapeHTML(project.status || "In Progress")}</span>
                    </div>
                </div>
                <p class="project-desc">${escapeHTML(project.description || "")}</p>
                <div class="project-meta">
                    <div class="progress-container">
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">${progress}% complete</span>
                    </div>
                    <span class="due-date">Due: ${formatDate(project.endDate)}</span>
                </div>
            </div>
        `;
    }).join("");
}

function renderPriorityTasks() {
    const container = document.getElementById("tasksList");
    if (!container) return;

    if (!tasksData || tasksData.length === 0) {
        container.innerHTML = `<p class="empty-state">No tasks pending. Great work!</p>`;
        return;
    }

    // Sort to show incomplete tasks first, high priority first
    const priorityWeight = { "High": 3, "Medium": 2, "Low": 1 };
    const sortedTasks = [...tasksData].sort((a, b) => {
        if (a.status === "Completed" && b.status !== "Completed") return 1;
        if (a.status !== "Completed" && b.status === "Completed") return -1;
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    }).slice(0, 5);

    container.innerHTML = sortedTasks.map(task => {
        const isDone = task.status === "Completed";
        const prioritySlug = (task.priority || "medium").toLowerCase();

        return `
            <div class="task-item ${isDone ? 'task-completed' : ''}" data-task-id="${task.id}">
                <div class="task-left">
                    <input type="checkbox" class="task-check" ${isDone ? "checked" : ""} onchange="toggleTaskStatus('${task.id}', this.checked)">
                    <span class="task-title">${escapeHTML(task.title)}</span>
                </div>
                <div class="task-right">
                    <span class="badge badge-${prioritySlug}">${escapeHTML(task.priority || "Normal")}</span>
                    <span class="task-date">${formatDate(task.dueDate)}</span>
                </div>
            </div>
        `;
    }).join("");
}

async function toggleTaskStatus(taskId, isChecked) {
    const newStatus = isChecked ? "Completed" : "In Progress";

    // Update in local array
    const task = tasksData.find(t => String(t.id) === String(taskId));
    if (task) {
        task.status = newStatus;
        localStorage.setItem("tasks", JSON.stringify(tasksData));
        renderStats();
        renderPriorityTasks();
    }

    // Try PATCH to server
    try {
        await fetch(`/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
    } catch (e) {
        console.warn("Server unavailable for task update, saved locally.");
    }
}

function renderTeamSnapshot() {
    const container = document.getElementById("teamList");
    if (!container) return;

    if (!usersData || usersData.length === 0) {
        container.innerHTML = `<p class="empty-state">No team members found.</p>`;
        return;
    }

    const members = usersData.slice(0, 5);
    container.innerHTML = members.map(u => `
        <div class="member-row">
            <div class="member-info">
                <img class="member-avatar" src="${u.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}" alt="${escapeHTML(u.name)}">
                <div>
                    <h4 class="member-name">${escapeHTML(u.name)}</h4>
                    <p class="member-role">${escapeHTML(u.role || "Member")}</p>
                </div>
            </div>
            <span class="member-badge">${escapeHTML(u.department || "General")}</span>
        </div>
    `).join("");
}

function renderActivityFeed() {
    const container = document.getElementById("activityFeed");
    if (!container) return;

    if (!activitiesData || activitiesData.length === 0) {
        container.innerHTML = `<p class="empty-state">No recent activities logged.</p>`;
        return;
    }

    const displayActivities = activitiesData.slice(0, 6);
    container.innerHTML = displayActivities.map(act => `
        <div class="activity-item">
            <div class="activity-bullet"></div>
            <div>
                <div class="activity-content">
                    <strong>${escapeHTML(act.userName || "User")}</strong> ${escapeHTML(act.action || "performed action")}
                    <em>${escapeHTML(act.target || "")}</em>
                </div>
                <div class="activity-time">${timeAgo(act.timestamp)}</div>
            </div>
        </div>
    `).join("");
}

// Utility Functions
function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateStr) {
    if (!dateStr) return "No date";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function timeAgo(dateStr) {
    if (!dateStr) return "Recently";
    const d = new Date(dateStr);
    const diff = Math.floor((new Date() - d) / 1000);
    if (isNaN(diff) || diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function getDefaultSeedData(key) {
    return [];
}
