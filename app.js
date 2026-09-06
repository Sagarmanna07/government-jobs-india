/* =========================================================
   GOVTJOBSINDIA - MAIN JAVASCRIPT
   ========================================================= */


/* ---------------------------------------------------------
   BASIC HELPERS
--------------------------------------------------------- */

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

    const date = new Date(
        dateString + "T00:00:00"
    );

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


function getJobById(id) {

    return JOBS.find(
        job => job.id === id
    );
}


function getSavedJobs() {

    try {

        return JSON.parse(
            localStorage.getItem("govtJobsIndiaSavedJobs")
        ) || [];

    } catch (error) {

        return [];

    }
}


function saveJobs(list) {

    localStorage.setItem(
        "govtJobsIndiaSavedJobs",
        JSON.stringify(list)
    );
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

    document
        .querySelectorAll("[data-save-id]")
        .forEach(button => {

            const id =
                button.getAttribute(
                    "data-save-id"
                );

            const saved =
                isSaved(id);

            button.classList.toggle(
                "saved",
                saved
            );

            button.innerHTML =
                saved ? "★" : "☆";

            button.title =
                saved
                    ? "Remove saved job"
                    : "Save job";

        });
}


/* ---------------------------------------------------------
   MOBILE MENU
--------------------------------------------------------- */

function setupMobileMenu() {

    const toggle =
        document.getElementById(
            "menuToggle"
        );

    const nav =
        document.getElementById(
            "mainNav"
        );

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener(
        "click",
        () => {

            nav.classList.toggle(
                "open"
            );

        }
    );

}


/* ---------------------------------------------------------
   JOB CARD
--------------------------------------------------------- */

function createJobCard(job) {

    const vacancies =
        job.vacancies
            ? job.vacancies.toLocaleString("en-IN")
            : "See Notification";

    return `

        <article class="job-card">

            <div class="job-top">

                <span class="job-category">
                    ${escapeHTML(job.category)}
                </span>

                <button
                    class="save-btn ${isSaved(job.id) ? "saved" : ""}"
                    data-save-id="${escapeHTML(job.id)}"
                    aria-label="Save job">

                    ${isSaved(job.id) ? "★" : "☆"}

                </button>

            </div>


            <h3>
                ${escapeHTML(job.title)}
            </h3>


            <p class="job-org">
                ${escapeHTML(job.organization)}
            </p>


            <div class="job-meta">

                <div class="meta-item">
                    Location
                    <strong>
                        ${escapeHTML(job.location)}
                    </strong>
                </div>

                <div class="meta-item">
                    Vacancies
                    <strong>
                        ${vacancies}
                    </strong>
                </div>

                <div class="meta-item">
                    Qualification
                    <strong>
                        ${escapeHTML(job.qualification)}
                    </strong>
                </div>

                <div class="meta-item">
                    Last Date
                    <strong class="deadline">
                        ${formatDate(job.deadline)}
                    </strong>
                </div>

            </div>


            <div class="job-actions">

                <a
                    href="job-detail.html?id=${encodeURIComponent(job.id)}"
                    class="btn btn-outline">

                    View Details

                </a>

                <a
                    href="${escapeHTML(job.applyUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-primary">

                    Apply Now

                </a>

            </div>

        </article>

    `;
}


/* ---------------------------------------------------------
   EVENT DELEGATION FOR SAVE
--------------------------------------------------------- */

function setupSaveButtons() {

    document.addEventListener(
        "click",
        function(event) {

            const button =
                event.target.closest(
                    "[data-save-id]"
                );

            if (!button) {
                return;
            }

            const id =
                button.getAttribute(
                    "data-save-id"
                );

            toggleSave(id);

        }
    );

}


/* ---------------------------------------------------------
   HOME PAGE
--------------------------------------------------------- */

function setupHomePage() {

    const categoryGrid =
        document.getElementById(
            "categoryGrid"
        );

    if (!categoryGrid) {
        return;
    }


    const categories = [

        {
            name: "Banking",
            icon: "🏦"
        },

        {
            name: "Railway",
            icon: "🚆"
        },

        {
            name: "Defence",
            icon: "🛡️"
        },

        {
            name: "SSC",
            icon: "📋"
        },

        {
            name: "UPSC",
            icon: "🏛️"
        },

        {
            name: "Teaching",
            icon: "📚"
        },

        {
            name: "Engineering",
            icon: "⚙️"
        },

        {
            name: "IT",
            icon: "💻"
        },

        {
            name: "Medical",
            icon: "🩺"
        },

        {
            name: "Apprentice",
            icon: "🔧"
        },

        {
            name: "Research",
            icon: "🔬"
        },

        {
            name: "Post Office",
            icon: "📮"
        }

    ];


    categoryGrid.innerHTML =
        categories.map(
            category => `

                <a
                    href="jobs.html?category=${encodeURIComponent(category.name)}"
                    class="category-card">

                    <div class="category-icon">
                        ${category.icon}
                    </div>

                    <h3>
                        ${escapeHTML(category.name)}
                    </h3>

                </a>

            `
        ).join("");


    /* TRENDING */

    const trending =
        document.getElementById(
            "trendingJobs"
        );

    if (trending) {

        const sorted =
            [...JOBS]
                .sort(
                    (a, b) =>
                        (b.vacancies || 0) -
                        (a.vacancies || 0)
                )
                .slice(0, 6);


        trending.innerHTML =
            sorted.map(
                createJobCard
            ).join("");

    }


    /* DEADLINE */

    const deadlineContainer =
        document.getElementById(
            "deadlineJobs"
        );

    if (deadlineContainer) {

        const now =
            new Date();

        const sorted =
            [...JOBS]
                .filter(
                    job =>
                        new Date(
                            job.deadline
                        ) >= now
                )
                .sort(
                    (a, b) =>
                        new Date(a.deadline) -
                        new Date(b.deadline)
                )
                .slice(0, 6);


        deadlineContainer.innerHTML =
            sorted.length
                ? sorted.map(
                    createJobCard
                ).join("")
                : `
                    <div class="empty-state">
                        <h3>No upcoming deadlines</h3>
                        <p>Check again later.</p>
                    </div>
                `;

    }


    /* NEW JOBS */

    const newJobs =
        document.getElementById(
            "newJobs"
        );

    if (newJobs) {

        const sorted =
            [...JOBS]
                .sort(
                    (a, b) =>
                        new Date(b.posted) -
                        new Date(a.posted)
                )
                .slice(0, 6);


        newJobs.innerHTML =
            sorted.map(
                createJobCard
            ).join("");

    }


    /* HOME SEARCH */

    const searchForm =
        document.getElementById(
            "homeSearch"
        );

    const searchInput =
        document.getElementById(
            "homeSearchInput"
        );


    if (searchForm && searchInput) {

        searchForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const query =
                    searchInput.value.trim();

                window.location.href =
                    "jobs.html?search=" +
                    encodeURIComponent(query);

            }
        );

    }

}


/* ---------------------------------------------------------
   FILTER OPTIONS
--------------------------------------------------------- */

function uniqueValues(key) {

    return [
        ...new Set(
            JOBS
                .map(
                    job => job[key]
                )
                .filter(Boolean)
        )
    ].sort();

}


function populateSelect(
    element,
    values
) {

    if (!element) {
        return;
    }

    values.forEach(
        value => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                value;

            option.textContent =
                value;

            element.appendChild(
                option
            );

        }
    );

}


/* ---------------------------------------------------------
   JOBS PAGE
--------------------------------------------------------- */

let currentPage = 1;

const JOBS_PER_PAGE = 20;


function setupJobsPage() {

    const jobsList =
        document.getElementById(
            "jobsList"
        );

    if (!jobsList) {
        return;
    }


    const searchInput =
        document.getElementById(
            "jobSearch"
        );

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );

    const locationFilter =
        document.getElementById(
            "locationFilter"
        );

    const qualificationFilter =
        document.getElementById(
            "qualificationFilter"
        );

    const salaryFilter =
        document.getElementById(
            "salaryFilter"
        );

    const sortFilter =
        document.getElementById(
            "sortFilter"
        );

    const resetButton =
        document.getElementById(
            "resetFilters"
        );


    populateSelect(
        categoryFilter,
        uniqueValues("category")
    );


    populateSelect(
        locationFilter,
        uniqueValues("location")
    );


    populateSelect(
        qualificationFilter,
        uniqueValues("qualification")
    );


    /* URL PARAMETERS */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const urlSearch =
        params.get("search");

    const urlCategory =
        params.get("category");

    const urlSort =
        params.get("sort");


    if (urlSearch && searchInput) {

        searchInput.value =
            urlSearch;

    }


    if (urlCategory && categoryFilter) {

        categoryFilter.value =
            urlCategory;

    }


    if (urlSort && sortFilter) {

        sortFilter.value =
            urlSort;

    }


    function refresh() {

        currentPage = 1;

        renderJobs();

    }


    [
        searchInput,
        categoryFilter,
        locationFilter,
        qualificationFilter,
        salaryFilter,
        sortFilter
    ].forEach(
        element => {

            if (!element) {
                return;
            }

            element.addEventListener(
                "input",
                refresh
            );

            element.addEventListener(
                "change",
                refresh
            );

        }
    );


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            () => {

                searchInput.value = "";

                categoryFilter.value = "";

                locationFilter.value = "";

                qualificationFilter.value = "";

                salaryFilter.value = "";

                sortFilter.value = "newest";

                refresh();

            }
        );

    }


    function getFilteredJobs() {

        let filtered =
            [...JOBS];


        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        if (search) {

            filtered =
                filtered.filter(
                    job => {

                        const text =
                            [
                                job.title,
                                job.organization,
                                job.category,
                                job.location,
                                job.qualification
                            ]
                            .join(" ")
                            .toLowerCase();

                        return text.includes(
                            search
                        );

                    }
                );

        }


        if (categoryFilter.value) {

            filtered =
                filtered.filter(
                    job =>
                        job.category ===
                        categoryFilter.value
                );

        }


        if (locationFilter.value) {

            filtered =
                filtered.filter(
                    job =>
                        job.location ===
                        locationFilter.value
                );

        }


        if (qualificationFilter.value) {

            filtered =
                filtered.filter(
                    job =>
                        job.qualification ===
                        qualificationFilter.value
                );

        }


        if (salaryFilter.value) {

            const minimum =
                Number(
                    salaryFilter.value
                );

            filtered =
                filtered.filter(
                    job => {

                        const salaryText =
                            String(
                                job.salary || ""
                            );

                        const numbers =
                            salaryText.match(
                                /\d[\d,]*/g
                            );

                        if (!numbers) {
                            return true;
                        }

                        const highest =
                            Math.max(
                                ...numbers.map(
                                    number =>
                                        Number(
                                            number.replace(
                                                /,/g,
                                                ""
                                            )
                                        )
                                )
                            );

                        return highest >= minimum;

                    }
                );

        }


        const sort =
            sortFilter.value;


        if (sort === "deadline") {

            filtered.sort(
                (a, b) =>
                    new Date(a.deadline) -
                    new Date(b.deadline)
            );

        }


        else if (sort === "vacancies") {

            filtered.sort(
                (a, b) =>
                    (b.vacancies || 0) -
                    (a.vacancies || 0)
            );

        }


        else if (sort === "title") {

            filtered.sort(
                (a, b) =>
                    a.title.localeCompare(
                        b.title
                    )
            );

        }


        else {

            filtered.sort(
                (a, b) =>
                    new Date(b.posted) -
                    new Date(a.posted)
            );

        }


        return filtered;

    }


    function renderJobs() {

        const filtered =
            getFilteredJobs();


        const total =
            filtered.length;


        const start =
            (currentPage - 1) *
            JOBS_PER_PAGE;


        const end =
            start +
            JOBS_PER_PAGE;


        const pageJobs =
            filtered.slice(
                start,
                end
            );


        const resultsCount =
            document.getElementById(
                "resultsCount"
            );


        if (resultsCount) {

            resultsCount.textContent =
                `${total} job${total !== 1 ? "s" : ""} found`;

        }


        if (!pageJobs.length) {

            jobsList.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No jobs found
                    </h3>

                    <p>
                        Try changing your search or filters.
                    </p>

                </div>

            `;

        } else {

            jobsList.innerHTML =
                pageJobs
                    .map(
                        createJobCard
                    )
                    .join("");

        }


        renderPagination(
            total
        );

        updateSaveButtons();

    }


    function renderPagination(total) {

        const pagination =
            document.getElementById(
                "pagination"
            );

        if (!pagination) {
            return;
        }


        const totalPages =
            Math.ceil(
                total /
                JOBS_PER_PAGE
            );


        if (totalPages <= 1) {

            pagination.innerHTML = "";

            return;

        }


        let html = "";


        if (currentPage > 1) {

            html += `

                <button
                    class="page-btn"
                    data-page="${currentPage - 1}">

                    ←

                </button>

            `;

        }


        for (
            let page = 1;
            page <= totalPages;
            page++
        ) {

            if (
                page === 1 ||
                page === totalPages ||
                Math.abs(
                    page - currentPage
                ) <= 2
            ) {

                html += `

                    <button
                        class="page-btn ${page === currentPage ? "active" : ""}"
                        data-page="${page}">

                        ${page}

                    </button>

                `;

            }

        }


        if (
            currentPage < totalPages
        ) {

            html += `

                <button
                    class="page-btn"
                    data-page="${currentPage + 1}">

                    →

                </button>

            `;

        }


        pagination.innerHTML =
            html;


        pagination
            .querySelectorAll(
                "[data-page]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            currentPage =
                                Number(
                                    button.dataset.page
                                );

                            renderJobs();

                            window.scrollTo({
                                top: 0,
                                behavior: "smooth"
                            });

                        }
                    );

                }
            );

    }


    renderJobs();

}


/* ---------------------------------------------------------
   JOB DETAIL PAGE
--------------------------------------------------------- */

function setupJobDetailPage() {

    const container =
        document.getElementById(
            "jobDetail"
        );

    if (!container) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");


    const job =
        getJobById(id);


    if (!job) {

        container.innerHTML = `

            <section class="section">

                <div class="empty-state">

                    <h3>
                        Job Not Found
                    </h3>

                    <p>
                        The requested job could not be found.
                    </p>

                    <br>

                    <a
                        href="jobs.html"
                        class="btn btn-primary">

                        Browse Government Jobs

                    </a>

                </div>

            </section>

        `;

        return;

    }


    document.title =
        `${job.title} - GovtJobsIndia`;


    const vacancies =
        job.vacancies
            ? job.vacancies.toLocaleString("en-IN")
            : "See Notification";


    container.innerHTML = `

        <section class="detail-wrapper">

            <div class="detail-header">

                <span class="badge">
                    ${escapeHTML(job.category)}
                </span>

                <h1>
                    ${escapeHTML(job.title)}
                </h1>

                <p class="detail-org">
                    ${escapeHTML(job.organization)}
                </p>


                <div class="detail-badges">

                    <span class="badge">
                        📍 ${escapeHTML(job.location)}
                    </span>

                    <span class="badge">
                        🎓 ${escapeHTML(job.qualification)}
                    </span>

                    <span class="badge">
                        📋 ${vacancies} Vacancies
                    </span>

                </div>


                <div class="countdown-box"
                     id="countdown">

                    Checking deadline...

                </div>

            </div>


            <div class="detail-body">


                <div class="detail-grid">


                    <div class="detail-item">

                        <span>
                            Organization
                        </span>

                        <strong>
                            ${escapeHTML(job.organization)}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Category
                        </span>

                        <strong>
                            ${escapeHTML(job.category)}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Vacancies
                        </span>

                        <strong>
                            ${vacancies}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Qualification
                        </span>

                        <strong>
                            ${escapeHTML(job.qualification)}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Location
                        </span>

                        <strong>
                            ${escapeHTML(job.location)}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Salary
                        </span>

                        <strong>
                            ${escapeHTML(job.salary)}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Posted Date
                        </span>

                        <strong>
                            ${formatDate(job.posted)}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Last Date
                        </span>

                        <strong>
                            ${formatDate(job.deadline)}
                        </strong>

                    </div>


                </div>


                <div class="detail-section">

                    <h2>
                        Job Description
                    </h2>

                    <p>
                        ${escapeHTML(job.description)}
                    </p>

                </div>


                <div class="detail-section">

                    <h2>
                        Eligibility
                    </h2>

                    <p>
                        ${escapeHTML(job.eligibility)}
                    </p>

                </div>


                <div class="detail-section">

                    <h2>
                        Selection Process
                    </h2>

                    <p>
                        ${escapeHTML(job.selection)}
                    </p>

                </div>


                <div class="detail-section">

                    <h2>
                        Application Process
                    </h2>

                    <p>
                        ${escapeHTML(job.process)}
                    </p>

                </div>


                <div class="detail-section">

                    <h2>
                        Documents Required
                    </h2>

                    <p>
                        ${escapeHTML(job.documents)}
                    </p>

                </div>


                <!-- INTERNAL SOURCE DETAILS -->

                <div class="detail-section">

                    <h2>
                        Source Details
                    </h2>

                    <div class="source-details">

                        <p>
                            This section contains the job
                            information available on
                            GovtJobsIndia.
                        </p>

                        <ul>

                            <li>
                                Organization:
                                ${escapeHTML(job.organization)}
                            </li>

                            <li>
                                Job Category:
                                ${escapeHTML(job.category)}
                            </li>

                            <li>
                                Location:
                                ${escapeHTML(job.location)}
                            </li>

                            <li>
                                Qualification:
                                ${escapeHTML(job.qualification)}
                            </li>

                            <li>
                                Vacancies:
                                ${vacancies}
                            </li>

                            <li>
                                Application Mode:
                                ${escapeHTML(job.applicationMode)}
                            </li>

                            <li>
                                Posted Date:
                                ${formatDate(job.posted)}
                            </li>

                            <li>
                                Last Date:
                                ${formatDate(job.deadline)}
                            </li>

                        </ul>

                        <p>
                            Candidates should verify all
                            details against the official
                            recruitment notification before
                            applying.
                        </p>

                    </div>

                </div>


                <!-- LINKS -->

                <div class="detail-section">

                    <h2>
                        Important Links
                    </h2>

                    <div class="important-links">

                        <a
                            href="${escapeHTML(job.applyUrl)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn-primary">

                            Apply Now

                        </a>


                        <a
                            href="${escapeHTML(job.officialUrl)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn-outline">

                            Official Website

                        </a>


                        <button
                            class="btn btn-outline"
                            id="shareWhatsApp">

                            WhatsApp Share

                        </button>


                        <button
                            class="btn btn-outline"
                            id="shareFacebook">

                            Facebook Share

                        </button>


                        <button
                            class="btn btn-outline"
                            data-save-id="${escapeHTML(job.id)}">

                            ${isSaved(job.id) ? "★" : "☆"}
                            Save Job

                        </button>

                    </div>

                </div>


            </div>

        </section>

    `;


    setupCountdown(
        job.deadline
    );


    const whatsapp =
        document.getElementById(
            "shareWhatsApp"
        );


    if (whatsapp) {

        whatsapp.addEventListener(
            "click",
            () => {

                const text =
                    `${job.title} - GovtJobsIndia`;

                const url =
                    window.location.href;

                const shareUrl =
                    "https://wa.me/?text=" +
                    encodeURIComponent(
                        text + "\n" + url
                    );

                window.open(
                    shareUrl,
                    "_blank"
                );

            }
        );

    }


    const facebook =
        document.getElementById(
            "shareFacebook"
        );


    if (facebook) {

        facebook.addEventListener(
            "click",
            () => {

                const url =
                    "https://www.facebook.com/sharer/sharer.php?u=" +
                    encodeURIComponent(
                        window.location.href
                    );

                window.open(
                    url,
                    "_blank"
                );

            }
        );

    }


    updateSaveButtons();

}


/* ---------------------------------------------------------
   COUNTDOWN
--------------------------------------------------------- */

function setupCountdown(
    deadline
) {

    const element =
        document.getElementById(
            "countdown"
        );

    if (!element) {
        return;
    }


    function update() {

        const deadlineDate =
            new Date(
                deadline +
                "T23:59:59"
            );


        const now =
            new Date();


        const difference =
            deadlineDate -
            now;


        if (difference <= 0) {

            element.textContent =
                "Application deadline has passed.";

            return;

        }


        const days =
            Math.floor(
                difference /
                (1000 * 60 * 60 * 24)
            );


        const hours =
            Math.floor(
                (difference /
                    (1000 * 60 * 60)) %
                    24
            );


        const minutes =
            Math.floor(
                (difference /
                    (1000 * 60)) %
                    60
            );


        const seconds =
            Math.floor(
                (difference /
                    1000) %
                    60
            );


        element.textContent =
            `⏳ ${days} Days ${hours} Hours ${minutes} Minutes ${seconds} Seconds remaining`;

    }


    update();

    setInterval(
        update,
        1000
    );

}


/* ---------------------------------------------------------
   CONTACT
--------------------------------------------------------- */

function setupContactPage() {

    const form =
        document.getElementById(
            "contactForm"
        );

    if (!form) {
        return;
    }


    const status =
        document.getElementById(
            "contactStatus"
        );


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                document.getElementById(
                    "name"
                ).value.trim();


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const subject =
                document.getElementById(
                    "subject"
                ).value.trim();


            const message =
                document.getElementById(
                    "message"
                ).value.trim();


            const mailBody =
                `Name: ${name}\n\n` +
                `Email: ${email}\n\n` +
                `Message:\n${message}`;


            const mailto =
                "mailto:support@govtjobsindia.com" +
                "?subject=" +
                encodeURIComponent(
                    subject
                ) +
                "&body=" +
                encodeURIComponent(
                    mailBody
                );


            window.location.href =
                mailto;


            if (status) {

                status.textContent =
                    "Opening your email application...";

            }

        }
    );

}


/* ---------------------------------------------------------
   YEAR
--------------------------------------------------------- */

function setupYear() {

    document
        .querySelectorAll(
            "#currentYear"
        )
        .forEach(
            element => {

                element.textContent =
                    new Date().getFullYear();

            }
        );

}


/* ---------------------------------------------------------
   INITIALIZE
--------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupMobileMenu();

        setupSaveButtons();

        setupHomePage();

        setupJobsPage();

        setupJobDetailPage();

        setupContactPage();

        setupYear();

    }
);