

const API_BASE = 'https://phi-lab-server.vercel.app/api/v1/lab';

// Global state
let allIssues = [];
let currentTab = 'all';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const tabs = document.querySelectorAll('.flex.gap-2 button');
const issuesGrid = document.getElementById('issues-grid');
const loading = document.getElementById('loading');
const modal = document.getElementById('issue-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const issueCountElement = document.getElementById('issue-count');


document.addEventListener('DOMContentLoaded', () => {
    loadIssues();
});


tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => {
            t.classList.remove('bg-blue-700', 'text-white');
            t.classList.add('border', 'border-gray-300');
        });

        tab.classList.remove('border', 'border-gray-300');
        tab.classList.add('bg-blue-700', 'text-white');

        const tabText = tab.textContent.trim().toLowerCase();
        currentTab = tabText === 'all' ? 'all' : tabText;

        loadIssues();
    });
});


if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        loadIssues();
    });
}


function loadIssues() {

    issuesGrid.innerHTML = "";
    loading.classList.remove("hidden");

    const query = searchInput.value.trim();

    let url = API_BASE + "/issues";

    if (query !== "") {
        url = API_BASE + "/issues/search?q=" + query;
    }

    fetch(url)
        .then(function (res) {
            return res.json();
        })
        .then(function (result) {

            const issues = result.data;

            let filteredIssues = issues;

            if (currentTab === "open") {
                filteredIssues = issues.filter(function (issue) {
                    return issue.status.toLowerCase() === "open";
                });
            }

            if (currentTab === "closed") {
                filteredIssues = issues.filter(function (issue) {
                    return issue.status.toLowerCase() === "closed";
                });
            }

            updateIssueCount(filteredIssues.length, currentTab);

            renderIssues(filteredIssues);

            loading.classList.add("hidden");
        });
}

function renderIssues(issues) {
    issuesGrid.innerHTML = ''

    issues.forEach(function (issue) {

        const card = document.createElement("div");

        let borderColor = "border-green-500";

        if (issue.status && issue.status.toLowerCase() === "closed") {
            borderColor = "border-blue-500";
        }

        card.className = `bg-white rounded-xl shadow-md overflow-hidden border-t-4 ${borderColor} hover:shadow-lg transition`;

        // labels
        let labelsHTML = "";
        if (issue.labels) {
            issue.labels.forEach(function (label) {
                labelsHTML += `
                    <span class="px-3 py-1 text-xs rounded-full border border-orange-300 text-orange-500">
                        ${label}
                    </span>
                `;
            });
        }

        card.innerHTML = `
        <div class="p-5">

            <div class="flex justify-between items-start mb-3">

                <div class="flex items-center gap-3">
                    <img src="./assets/Open-Status.png" class="w-7 h-7" />
                </div>

                <span class="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                    ${issue.priority}
                </span>

            </div>

            <h2 class="text-lg font-semibold text-gray-800 mb-2">
                ${issue.title}
            </h2>

            <p class="text-sm text-gray-500 mb-4">
                ${issue.description}
            </p>

            <div class="flex gap-2 mb-4 flex-wrap">
                ${labelsHTML}
            </div>

        </div>

        <div class="border-t px-5 py-3 text-xs text-gray-500 flex justify-between">
            <span>#${issue.id} by ${issue.author}</span>
            <span>${issue.createdAt}</span>
        </div>
        `;

        card.addEventListener("click", function () {
            showModal(issue);
        });

        issuesGrid.appendChild(card);

    });

}


function showModal(issue) {
    modalTitle.textContent = issue.title || 'No Title';

    const statusBadge = issue.status?.toLowerCase() === 'open'
        ? '<span class="badge badge-success">Opened</span>'
        : '<span class="badge badge-neutral">Closed</span>';

    const labelsHTML = (issue.labels || []).map(l =>
        `<span class="px-3 py-1 text-xs rounded-full border border-orange-300 text-orange-500">${l}</span>`
    ).join('') || 'No labels';

   

    const priorityBadge = issue.priority?.toLowerCase() === 'high'
        ? '<span class="badge badge-error">HIGH</span>'
        : issue.priority?.toLowerCase() === 'medium'
            ? '<span class="badge badge-warning">MEDIUM</span>'
            : '<span class="badge badge-info">LOW</span>';

    modalBody.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center gap-3">
                ${statusBadge}
                <span class="text-sm text-gray-600">
                    Opened • Opened by <strong>${issue.author || 'Unknown'}</strong> • 
                    ${formatDate(issue.createdAt)}
                </span>
            </div>

            <div class="flex flex-wrap gap-2">
                ${labelsHTML}
            </div>

            <p class="text-gray-700">${issue.description || 'No description provided.'}</p>

            <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                <div>
                    <p class="text-sm text-gray-600">Assignee:</p>
                    <p class="font-medium">${issue.assignee || 'Unassigned'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Priority:</p>
                    ${priorityBadge}
                </div>
            </div>
        </div>
    `;

    modal.showModal();
}


function formatDate(dateStr) {
    if (!dateStr) return 'Unknown date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}


function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}


function updateIssueCount(count, tab) {
    let text = `${count} Issues`;

    if (tab === 'open') {
        text = `${count} Open Issues`;
    } else if (tab === 'closed') {
        text = `${count} Closed Issues`;
    }

    if (issueCountElement) {
        issueCountElement.textContent = text;
    }
}