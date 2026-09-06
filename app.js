/* =========================================================
   GOVTJOBSINDIA - MAIN JAVASCRIPT
   ========================================================= */

// BASIC HELPERS
function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
    if (!dateString) {
        return "Not specified";
    }
    const date = new Date(dateString + "T00:00:00");
    if (Number.isNaN(date.getTime())) {
        return dateString;
    }
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function getJobById(id) {
    return JOBS.find(job => job.id === id);
}

function getSavedJobs() {
    try {
        return JSON.parse(localStorage.getItem("govtJobsIndiaSavedJobs")) || [];
    } catch (error) {
        return [];
    }
}

function saveJobs(list) {
    localStorage.setItem("govtJobsIndiaSavedJobs", JSON.stringify(list));
}

function isSaved(id) {
    return getSavedJobs().includes(id);
}

function toggleSave(id) {
    const saved = getSavedJobs();
    const index = saved.indexOf(id);
    if (index >= 0) {
        saved.splice(index, 1);
    } else {
        saved.push(id);
    }
    saveJobs(saved);
    updateSaveButtons();
}

function updateSaveButtons() {
    document.querySelectorAll("[data-save-id]").forEach(button => {
        const id = button.getAttribute("data-save-id");
        const saved = isSaved(id);
        button.classList.toggle("saved", saved);
        button.innerHTML = saved ? "★" : "☆";
        button.title = saved ? "Remove saved job" : "Save job";
    });
}

// MOBILE MENU
function setupMobileMenu() {
    const toggle = document.getElementById("menuToggle");
    const nav = document.getElementById("mainNav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
        nav.classList.toggle("open");
    });
}

// JOB CARD
function createJobCard(job) {
    const vacancies = job.vacancies ? job.vacancies.toLocaleString("en-IN") : "See Notification";
    return `
        <article class="job-card">
            <div class="job-top">
                <span class="job-category">${escapeHTML(job.category)}</span>
                <button class="save-btn ${isSaved(job.id) ? "saved" : ""}" data-save-id="${escapeHTML(job.id)}" aria-label="Save job">
                    ${isSaved(job.id) ? "★" : "☆"}
                </button>
            </div>
            <h3>${escapeHTML(job.title)}</h3>
            <p class="job-org">${escapeHTML(job.organization)}</p>
            <div class="job-meta">
                <div class="meta-item">Location <strong>${escapeHTML(job.location)}</strong></div>
                <div class="meta-item">Vacancies <strong>${vacancies}</strong></div>
                <div class="meta-item">Qualification <strong>${escapeHTML(job.qualification)}</strong></div>
                <div class="meta-item">Last Date <strong class="deadline">${formatDate(job.deadline)}</strong></div>
            </div>
            <div class="job-actions">
                <a href="job-details.html?id=${encodeURIComponent(job.id)}" class="btn btn-outline">View Details</a>
                <a href="${escapeHTML(job.applyUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Apply Now</a>
            </div>
        </article>
    `;
}

// SAVE BUTTONS
function setupSaveButtons() {
    document.addEventListener("click", function(event) {
        const button = event.target.closest("[data-save-id]");
        if (!button) return;
        const id = button.getAttribute("data-save-id");
        toggleSave(id);
    });
}

// HOME PAGE
function setupHomePage() {
    const categoryGrid = document.getElementById("categoryGrid");
    if (!categoryGrid) return;

    const categories = [
        { name: "Banking", icon: "🏦" },
        { name: "Railway", icon: "🚆" },
        { name: "Defence", icon: "🛡️" },
        { name: "SSC", icon: "📋" },
        { name: "UPSC", icon: "🏛️" },
        { name: "Teaching", icon: "📚" },
        { name: "Engineering", icon: "⚙️" },
        { name: "IT", icon: "💻" },
        { name: "Medical", icon: "🩺" },
        { name: "Apprentice", icon: "🔧" },
        { name: "Research", icon: "🔬" },
        { name: "Post Office", icon: "📮" }
    ];

    categoryGrid.innerHTML = categories.map(category => `
        <a href="jobs.html?category=${encodeURIComponent(category.name)}" class="category-card">
            <div class="category-icon">${category.icon}</div>
            <h3>${escapeHTML(category.name)}</h3>
        </a>
    `).join("");

    // TRENDING
    const trending = document.getElementById("trendingJobs");
    if (trending) {
        const sorted = [...JOBS].sort((a, b) => (b.vacancies || 0) - (a.vacancies || 0)).slice(0, 6);
        trending.innerHTML = sorted.map(createJobCard).join("");
    }

    // DEADLINE
    const deadlineContainer = document.getElementById("deadlineJobs");
    if (deadlineContainer) {
        const now = new Date();
        const sorted = [...JOBS]
            .filter(job => new Date(job.deadline) >= now)
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
            .slice(0, 6);
        deadlineContainer.innerHTML = sorted.length ? sorted.map(createJobCard).join("") : `
            <div class="empty-state">
                <h3>No upcoming deadlines</h3>
                <p>Check again later.</p>
            </div>
        `;
    }

    // NEW JOBS
    const newJobs = document.getElementById("newJobs");
    if (newJobs) {
        const sorted = [...JOBS].sort((a, b) => new Date(b.posted) - new Date(a.posted)).slice(0, 6);
        newJobs.innerHTML = sorted.map(createJobCard).join("");
    }

    // HOME SEARCH
    const searchForm = document.getElementById("homeSearch");
    const searchInput = document.getElementById("homeSearchInput");
    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", event => {
            event.preventDefault();
            const query = searchInput.value.trim();
            window.location.href = "jobs.html?search=" + encodeURIComponent(query);
        });
    }
}

// FILTER OPTIONS
function uniqueValues(key) {
    return [...new Set(JOBS.map(job => job[key]).filter(Boolean))].sort();
}

function populateSelect(element, values) {
    if (!element) return;
    values.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        element.appendChild(option);
    });
}

// JOBS PAGE
let currentPage = 1;
const JOBS_PER_PAGE = 20;

function setupJobsPage() {
    const jobsList = document.getElementById("jobsList");
    if (!jobsList) return;

    const searchInput = document.getElementById("jobSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const locationFilter = document.getElementById("locationFilter");
    const qualificationFilter = document.getElementById("qualificationFilter");
    const salaryFilter = document.getElementById("salaryFilter");
    const sortFilter = document.getElementById("sortFilter");
    const resetButton = document.getElementById("resetFilters");

    populateSelect(categoryFilter, uniqueValues("category"));
    populateSelect(locationFilter, uniqueValues("location"));
    populateSelect(qualificationFilter, uniqueValues("qualification"));

    // URL PARAMETERS
    const params = new URLSearchParams(window.location.search);
    const urlSearch = params.get("search");
    const urlCategory = params.get("category");
    const urlSort = params.get("sort");

    if (urlSearch && searchInput) searchInput.value = urlSearch;
    if (urlCategory && categoryFilter) categoryFilter.value = urlCategory;
    if (urlSort && sortFilter) sortFilter.value = urlSort;

    function refresh() {
        currentPage = 1;
        renderJobs();
    }

    [searchInput, categoryFilter, locationFilter, qualificationFilter, salaryFilter, sortFilter].forEach(element => {
        if (!element) return;
        element.addEventListener("input", refresh);
        element.addEventListener("change", refresh);
    });

    if (resetButton) {
        resetButton.addEventListener("click", () => {
            searchInput.value = "";
            categoryFilter.value = "";
            locationFilter.value = "";
            qualificationFilter.value = "";
            salaryFilter.value = "";
            sortFilter.value = "newest";
            refresh();
        });
    }

    function getFilteredJobs() {
        let filtered = [...JOBS];
        const search = searchInput.value.trim().toLowerCase();
        if (search) {
            filtered = filtered.filter(job => {
                const text = [job.title, job.organization, job.category, job.location, job.qualification].join(" ").toLowerCase();
                return text.includes(search);
            });
        }
        if (categoryFilter.value) {
            filtered = filtered.filter(job => job.category === categoryFilter.value);
        }
        if (locationFilter.value) {
            filtered = filtered.filter(job => job.location === locationFilter.value);
        }
        if (qualificationFilter.value) {
            filtered = filtered.filter(job => job.qualification === qualificationFilter.value);
        }
        if (salaryFilter.value) {
            const minimum = Number
