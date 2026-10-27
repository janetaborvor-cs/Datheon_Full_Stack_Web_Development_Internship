
"use strict";

/* ==========================================
   TASKFLOW — TASK MANAGER
   CRUD, filtering, searching, sorting,
   localStorage, due dates and mobile menu
========================================== */

const STORAGE_KEY = "taskflow-tasks-v1";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  taskList: $("#task-list"),
  taskForm: $("#task-form"),
  modal: $("#task-modal"),
  modalTitle: $("#modal-title"),
  saveButton: $("#save-task-button"),
  taskId: $("#task-id"),
  taskTitle: $("#task-title"),
  taskDescription: $("#task-description"),
  taskCategory: $("#task-category"),
  taskDueDate: $("#task-due-date"),
  search: $("#task-search"),
  sort: $("#sort-tasks"),
  toast: $("#toast"),
  sidebar: $("#sidebar"),
  mobileMenu: $("#mobile-menu-button"),
  progress: $("#completion-progress"),
  progressFill: $("#completion-progress-fill"),
};

let tasks = loadTasks();
let currentFilter = "all";
let currentCategory = null;
let toastTimeout;
let previouslyFocusedElement = null;

/* ---------- Storage ---------- */

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((task) =>
      task &&
      typeof task.id === "string" &&
      typeof task.title === "string" &&
      typeof task.completed === "boolean"
    ).map((task) => ({
      id: task.id,
      title: task.title.slice(0, 120),
      description: typeof task.description === "string"
        ? task.description.slice(0, 500)
        : "",
      category: ["Work", "Personal", "Study", "Other"].includes(task.category)
        ? task.category
        : "Other",
      dueDate: typeof task.dueDate === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)
        ? task.dueDate
        : "",
      completed: task.completed,
      createdAt: Number.isFinite(task.createdAt)
        ? task.createdAt
        : Date.now(),
      updatedAt: Number.isFinite(task.updatedAt)
        ? task.updatedAt
        : Date.now(),
    }));
  } catch (error) {
    console.error("Could not load saved tasks:", error);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error("Could not save tasks:", error);
    showToast("Couldn't save tasks. Check your browser storage settings.");
    return false;
  }
}

/* ---------- Helpers ---------- */

function createId() {
  if (typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function showToast(message) {
  clearTimeout(toastTimeout);

  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  toastTimeout = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2600);
}

/* ---------- Task statistics ---------- */

function updateStatistics() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const active = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  $("#stat-total").textContent = total;
  $("#stat-active").textContent = active;
  $("#stat-completed").textContent = completed;
  $("#stat-rate").textContent = `${rate}%`;

  $("#all-count").textContent = total;
  $("#active-count").textContent = active;
  $("#completed-count").textContent = completed;

  elements.progressFill.style.width = `${rate}%`;
  elements.progress.setAttribute("aria-valuenow", String(rate));
}

/* ---------- Task filtering and sorting ---------- */

function getVisibleTasks() {
  const query = elements.search.value.trim().toLowerCase();

  let result = tasks.filter((task) => {
    if (currentFilter === "active" && task.completed) return false;
    if (currentFilter === "completed" && !task.completed) return false;

    if (currentCategory && task.category !== currentCategory) {
      return false;
    }

    const searchableText =
      `${task.title} ${task.description} ${task.category}`.toLowerCase();

    return searchableText.includes(query);
  });

  switch (elements.sort.value) {
    case "due":
      result.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return b.createdAt - a.createdAt;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
      break;

    case "title":
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;

    default:
      result.sort((a, b) => b.createdAt - a.createdAt);
  }

  return result;
}

function getPageTitle() {
  if (currentCategory) return currentCategory;

  return {
    all: "All Tasks",
    active: "Active Tasks",
    completed: "Completed Tasks",
  }[currentFilter] || "All Tasks";
}

/* ---------- Render task list ---------- */

function renderTasks() {
  const visibleTasks = getVisibleTasks();

  $("#task-section-title").firstChild.textContent = `${getPageTitle()} `;
  $("#visible-task-count").textContent = visibleTasks.length;

  if (visibleTasks.length === 0) {
    const hasTasks = tasks.length > 0;
    const heading = hasTasks
      ? "No matching tasks"
      : "Your next chapter starts here";

    const description = hasTasks
      ? "Try another filter or search term."
      : "Add your first task and turn your plans into progress.";

    elements.taskList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✦</div>
        <h3>${heading}</h3>
        <p>${description}</p>
        <button class="primary-button" id="empty-add-task">
          ＋ ${hasTasks ? "Create a task" : "Create your first task"}
        </button>
      </div>
    `;

    updateStatistics();
    return;
  }

  elements.taskList.innerHTML = visibleTasks.map((task) => {
    const isOverdue = task.dueDate &&
      task.dueDate < getTodayString() &&
      !task.completed;

    const isDueToday = task.dueDate === getTodayString() &&
      !task.completed;

    let dueClass = "due-badge";
    let dueLabel = `◷ ${formatDate(task.dueDate)}`;

    if (isOverdue) {
      dueClass += " overdue";
      dueLabel = `! Overdue · ${formatDate(task.dueDate)}`;
    } else if (isDueToday) {
      dueClass += " due-today";
      dueLabel = `◷ Due today`;
    }

    return `
      <article
        class="task-card ${task.completed ? "is-completed" : ""}"
        data-id="${escapeHTML(task.id)}"
      >
        <input
          class="task-checkbox"
          type="checkbox"
          data-action="toggle"
          aria-label="Mark ${escapeHTML(task.title)} as ${
            task.completed ? "active" : "completed"
          }"
          ${task.completed ? "checked" : ""}
        />

        <div class="task-main">
          <h3 class="task-title">${escapeHTML(task.title)}</h3>

          ${
            task.description
              ? `<p class="task-description">${escapeHTML(task.description)}</p>`
              : ""
          }

          <div class="task-meta">
            <span
              class="category-badge"
              data-category="${escapeHTML(task.category)}"
            >${escapeHTML(task.category)}</span>

            ${
              task.dueDate
                ? `<span class="${dueClass}">${dueLabel}</span>`
                : ""
            }
          </div>
        </div>

        <div class="task-actions">
          <button
            class="icon-button"
            data-action="edit"
            aria-label="Edit ${escapeHTML(task.title)}"
            title="Edit task"
          >✎</button>

          <button
            class="icon-button delete-button"
            data-action="delete"
            aria-label="Delete ${escapeHTML(task.title)}"
            title="Delete task"
          >⌫</button>
        </div>
      </article>
    `;
  }).join("");

  updateStatistics();
}

/* ---------- Modal controls ---------- */

function openModal(task = null) {
  previouslyFocusedElement = document.activeElement;

  elements.taskForm.reset();
  elements.taskId.value = task ? task.id : "";
  elements.taskTitle.value = task ? task.title : "";
  elements.taskDescription.value = task ? task.description : "";
  elements.taskCategory.value = task ? task.category : "Work";
  elements.taskDueDate.value = task ? task.dueDate : "";

  elements.modalTitle.textContent = task ? "Edit task" : "Create a task";
  elements.saveButton.textContent = task ? "Save Changes" : "Create Task";

  elements.modal.hidden = false;
  document.body.style.overflow = "hidden";
  elements.taskTitle.focus();
}

function closeModal() {
  elements.modal.hidden = true;
  document.body.style.overflow = "";

  if (previouslyFocusedElement &&
      typeof previouslyFocusedElement.focus === "function") {
    previouslyFocusedElement.focus();
  }
}

function editTask(id) {
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    showToast("Task not found.");
    return;
  }

  openModal(task);
}

/* ---------- Create and update tasks ---------- */

function handleTaskSubmit(event) {
  event.preventDefault();

  const title = elements.taskTitle.value.trim();
  const description = elements.taskDescription.value.trim();
  const category = elements.taskCategory.value;
  const dueDate = elements.taskDueDate.value;
  const id = elements.taskId.value;

  if (!title) {
    elements.taskTitle.focus();
    showToast("Please enter a task name.");
    return;
  }

  if (title.length > 120 || description.length > 500) {
    showToast("Please shorten the task details.");
    return;
  }

  if (!["Work", "Personal", "Study", "Other"].includes(category)) {
    showToast("Please select a valid category.");
    return;
  }

  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    showToast("Please select a valid due date.");
    return;
  }

  const now = Date.now();

  if (id) {
    const index = tasks.findIndex((task) => task.id === id);

    if (index === -1) {
      showToast("This task no longer exists.");
      closeModal();
      return;
    }

    const original = tasks[index];

    tasks[index] = {
      ...original,
      title,
      description,
      category,
      dueDate,
      updatedAt: now,
    };

    if (!saveTasks()) {
      tasks[index] = original;
      return;
    }

    closeModal();
    renderTasks();
    showToast("Task updated successfully.");
    return;
  }

  const newTask = {
    id: createId(),
    title,
    description,
    category,
    dueDate,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  tasks.unshift(newTask);

  if (!saveTasks()) {
    tasks = tasks.filter((task) => task.id !== newTask.id);
    return;
  }

  currentFilter = "all";
  currentCategory = null;
  syncFilterControls();

  closeModal();
  renderTasks();
  showToast("Your new task has been created!");
}

/* ---------- Complete and delete tasks ---------- */

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;

  const oldCompleted = task.completed;
  const oldUpdatedAt = task.updatedAt;

  task.completed = !task.completed;
  task.updatedAt = Date.now();

  if (!saveTasks()) {
    task.completed = oldCompleted;
    task.updatedAt = oldUpdatedAt;
    renderTasks();
    return;
  }

  renderTasks();
  showToast(task.completed ? "Another win! Task completed." : "Task marked active.");
}

function deleteTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;

  const confirmed = window.confirm(`Delete "${task.title}"? This cannot be undone.`);

  if (!confirmed) return;

  const oldTasks = tasks;
  tasks = tasks.filter((item) => item.id !== id);

  if (!saveTasks()) {
    tasks = oldTasks;
    renderTasks();
    return;
  }

  renderTasks();
  showToast("Task deleted.");
}

/* ---------- Filter controls ---------- */

function syncFilterControls() {
  $$("[data-filter]").forEach((button) => {
    const isActive = !currentCategory &&
      button.dataset.filter === currentFilter;

    button.classList.toggle("active", isActive);
  });

  $$(".category-filter").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.category === currentCategory
    );
  });

  $("#breadcrumb-title").textContent = getPageTitle();
}

function setFilter(filter) {
  if (!["all", "active", "completed"].includes(filter)) return;

  currentFilter = filter;
  currentCategory = null;

  syncFilterControls();
  renderTasks();
}

function setCategory(category) {
  if (!["Work", "Personal", "Study", "Other"].includes(category)) return;

  currentCategory = category;
  currentFilter = "all";

  syncFilterControls();
  renderTasks();
}

/* ---------- Mobile navigation ---------- */

function closeMobileMenu() {
  elements.sidebar.classList.remove("is-open");
  elements.mobileMenu.setAttribute("aria-expanded", "false");
  elements.mobileMenu.setAttribute("aria-label", "Open navigation menu");
}

function toggleMobileMenu() {
  const isOpen = elements.sidebar.classList.toggle("is-open");

  elements.mobileMenu.setAttribute("aria-expanded", String(isOpen));
  elements.mobileMenu.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu"
  );
}

/* ---------- Events ---------- */

elements.taskForm.addEventListener("submit", handleTaskSubmit);

$("#open-task-modal").addEventListener("click", () => openModal());

$("#empty-add-task").addEventListener("click", () => openModal());

$("#close-task-modal").addEventListener("click", closeModal);
$("#cancel-task").addEventListener("click", closeModal);

elements.modal.addEventListener("click", (event) => {
  if (event.target === elements.modal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!elements.modal.hidden) closeModal();
    closeMobileMenu();
  }
});

elements.taskList.addEventListener("click", (event) => {
  const addButton = event.target.closest("#empty-add-task");

  if (addButton) {
    openModal();
    return;
  }

  const button = event.target.closest("[data-action]");
  if (!button) return;

  const card = button.closest(".task-card");
  if (!card) return;

  const id = card.dataset.id;

  switch (button.dataset.action) {
    case "edit":
      editTask(id);
      break;

    case "delete":
      deleteTask(id);
      break;
  }
});

elements.taskList.addEventListener("change", (event) => {
  const checkbox = event.target.closest('[data-action="toggle"]');
  if (!checkbox) return;

  const card = checkbox.closest(".task-card");
  if (!card) return;

  toggleTask(card.dataset.id);
});

$$("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    setFilter(button.dataset.filter);
    closeMobileMenu();
  });
});

$$(".category-filter").forEach((button) => {
  button.addEventListener("click", () => {
    setCategory(button.dataset.category);
    closeMobileMenu();
  });
});

elements.search.addEventListener("input", renderTasks);
elements.sort.addEventListener("change", renderTasks);
elements.mobileMenu.addEventListener("click", toggleMobileMenu);

document.addEventListener("click", (event) => {
  if (
    window.innerWidth <= 760 &&
    elements.sidebar.classList.contains("is-open") &&
    !elements.sidebar.contains(event.target) &&
    !elements.mobileMenu.contains(event.target)
  ) {
    closeMobileMenu();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) closeMobileMenu();
});

/* ---------- Initial setup ---------- */

$("#today-label").textContent = new Date().toLocaleDateString(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
});

syncFilterControls();
renderTasks();
