// Application Data
const applicationData = {
    accounts: [
        {
            "id": "acc_001",
            "name": "TechCorp Enterprise",
            "type": "enterprise",
            "status": "active",
            "parent": null,
            "children": ["acc_002", "acc_003", "acc_004"],
            "users": 245,
            "lastActivity": "2 horas atrás",
            "region": "América do Norte"
        },
        {
            "id": "acc_002",
            "name": "TechCorp - Desenvolvimento",
            "type": "department",
            "status": "active",
            "parent": "acc_001",
            "children": ["acc_005"],
            "users": 45,
            "lastActivity": "1 hora atrás",
            "region": "América do Norte"
        },
        {
            "id": "acc_003",
            "name": "TechCorp - Marketing",
            "type": "department",
            "status": "active",
            "parent": "acc_001",
            "children": [],
            "users": 32,
            "lastActivity": "3 horas atrás",
            "region": "América do Norte"
        },
        {
            "id": "acc_004",
            "name": "TechCorp - Vendas",
            "type": "department",
            "status": "limited",
            "parent": "acc_001",
            "children": [],
            "users": 28,
            "lastActivity": "5 horas atrás",
            "region": "América do Norte"
        },
        {
            "id": "acc_005",
            "name": "TechCorp - Equipe QA",
            "type": "team",
            "status": "active",
            "parent": "acc_002",
            "children": [],
            "users": 12,
            "lastActivity": "30 minutos atrás",
            "region": "América do Norte"
        },
        {
            "id": "acc_006",
            "name": "Global Manufacturing Ltd",
            "type": "enterprise",
            "status": "active",
            "parent": null,
            "children": ["acc_007", "acc_008"],
            "users": 178,
            "lastActivity": "1 dia atrás",
            "region": "Europa"
        },
        {
            "id": "acc_007",
            "name": "GM - Produção",
            "type": "department",
            "status": "active",
            "parent": "acc_006",
            "children": [],
            "users": 89,
            "lastActivity": "2 horas atrás",
            "region": "Europa"
        },
        {
            "id": "acc_008",
            "name": "GM - Logística",
            "type": "department",
            "status": "suspended",
            "parent": "acc_006",
            "children": [],
            "users": 34,
            "lastActivity": "3 dias atrás",
            "region": "Europa"
        },
        {
            "id": "acc_009",
            "name": "StartupXYZ",
            "type": "startup",
            "status": "trial",
            "parent": null,
            "children": [],
            "users": 8,
            "lastActivity": "6 horas atrás",
            "region": "Ásia Pacífico"
        },
        {
            "id": "acc_010",
            "name": "Individual - João Silva",
            "type": "individual",
            "status": "active",
            "parent": null,
            "children": [],
            "users": 1,
            "lastActivity": "1 hora atrás",
            "region": "América do Norte"
        }
    ],
    currentUser: {
        name: "Admin User",
        role: "super_admin",
        permissions: ["read", "write", "admin", "delete"]
    },
    recentAccounts: ["acc_001", "acc_005", "acc_009", "acc_006"],
    accountStats: {
        total: 10,
        active: 7,
        suspended: 1,
        trial: 1,
        limited: 1,
        newThisMonth: 3
    }
};

// Global state
let currentAccount = applicationData.accounts[0];
let filteredAccounts = [...applicationData.accounts];
let sortOrder = { column: null, direction: 'asc' };

// DOM Elements
const elements = {
    sidebarToggle: document.getElementById('sidebarToggle'),
    sidebar: document.getElementById('sidebar'),
    globalSearch: document.getElementById('globalSearch'),
    searchSuggestions: document.getElementById('searchSuggestions'),
    searchFiltersBtn: document.getElementById('searchFiltersBtn'),
    searchFilters: document.getElementById('searchFilters'),
    accountTypeFilter: document.getElementById('accountTypeFilter'),
    statusFilter: document.getElementById('statusFilter'),
    accountSwitcher: document.getElementById('accountSwitcher'),
    accountDropdown: document.getElementById('accountDropdown'),
    accountSearch: document.getElementById('accountSearch'),
    currentAccountName: document.getElementById('currentAccountName'),
    currentAccountStatus: document.getElementById('currentAccountStatus'),
    recentAccountsList: document.getElementById('recentAccountsList'),
    allAccountsList: document.getElementById('allAccountsList'),
    sidebarSearch: document.getElementById('sidebarSearch'),
    accountTree: document.getElementById('accountTree'),
    activityTimeline: document.getElementById('activityTimeline'),
    accountsTable: document.getElementById('accountsTable'),
    accountsTableBody: document.getElementById('accountsTableBody'),
    tableFilter: document.getElementById('tableFilter'),
    refreshTable: document.getElementById('refreshTable')
};

// Utility Functions
function getAccountById(id) {
    return applicationData.accounts.find(acc => acc.id === id);
}

function getAccountChildren(parentId) {
    return applicationData.accounts.filter(acc => acc.parent === parentId);
}

function getTopLevelAccounts() {
    return applicationData.accounts.filter(acc => acc.parent === null);
}

function searchAccounts(query) {
    if (!query) return applicationData.accounts;
    
    const lowerQuery = query.toLowerCase();
    return applicationData.accounts.filter(acc => 
        acc.name.toLowerCase().includes(lowerQuery) ||
        acc.type.toLowerCase().includes(lowerQuery) ||
        acc.region.toLowerCase().includes(lowerQuery)
    );
}

function getStatusText(status) {
    const statusMap = {
        'active': 'Ativo',
        'suspended': 'Suspenso',
        'limited': 'Limitado',
        'trial': 'Trial'
    };
    return statusMap[status] || status;
}

function getTypeText(type) {
    const typeMap = {
        'enterprise': 'Enterprise',
        'department': 'Departamento',
        'team': 'Equipe',
        'individual': 'Individual',
        'startup': 'Startup'
    };
    return typeMap[type] || type;
}

function getTypeIcon(type) {
    const iconMap = {
        'enterprise': 'fas fa-building',
        'department': 'fas fa-sitemap',
        'team': 'fas fa-users',
        'individual': 'fas fa-user',
        'startup': 'fas fa-rocket'
    };
    return iconMap[type] || 'fas fa-circle';
}

// Sidebar Functions
function toggleSidebar() {
    elements.sidebar.classList.toggle('collapsed');
    if (window.innerWidth <= 768) {
        elements.sidebar.classList.toggle('open');
    }
}

function buildAccountTree() {
    const tree = buildTreeNode(null);
    elements.accountTree.innerHTML = tree;
    attachTreeEventListeners();
}

function buildTreeNode(parentId, level = 0) {
    const children = parentId ? getAccountChildren(parentId) : getTopLevelAccounts();
    if (children.length === 0) return '';
    
    return children.map(account => {
        const hasChildren = account.children && account.children.length > 0;
        const isExpanded = level < 2; // Auto-expand first two levels
        
        return `
            <div class="tree-node">
                <div class="tree-item ${account.id === currentAccount.id ? 'active' : ''}" 
                     data-account-id="${account.id}">
                    <div class="expand-icon ${hasChildren ? (isExpanded ? 'expanded' : '') : ''}">
                        ${hasChildren ? '<i class="fas fa-chevron-right"></i>' : ''}
                    </div>
                    <div class="account-type-icon ${account.type}">
                        <i class="${getTypeIcon(account.type)}"></i>
                    </div>
                    <span class="account-name">${account.name}</span>
                    <div class="status-indicator ${account.status}"></div>
                </div>
                ${hasChildren ? `
                    <div class="tree-children ${isExpanded ? 'expanded' : ''}">
                        ${buildTreeNode(account.id, level + 1)}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function attachTreeEventListeners() {
    const treeItems = elements.accountTree.querySelectorAll('.tree-item');
    treeItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const accountId = item.dataset.accountId;
            const account = getAccountById(accountId);
            
            if (e.target.closest('.expand-icon')) {
                toggleTreeNode(item);
            } else {
                switchToAccount(account);
            }
        });
    });
}

function toggleTreeNode(treeItem) {
    const expandIcon = treeItem.querySelector('.expand-icon');
    const treeChildren = treeItem.parentNode.querySelector('.tree-children');
    
    if (treeChildren) {
        expandIcon.classList.toggle('expanded');
        treeChildren.classList.toggle('expanded');
    }
}

// Search Functions
function setupGlobalSearch() {
    let searchTimeout;
    
    elements.globalSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            handleGlobalSearch(e.target.value);
        }, 300);
    });
    
    elements.globalSearch.addEventListener('focus', () => {
        if (elements.globalSearch.value) {
            elements.searchSuggestions.classList.add('show');
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            elements.searchSuggestions.classList.remove('show');
            elements.searchFilters.classList.remove('show');
        }
    });
}

function handleGlobalSearch(query) {
    if (!query) {
        elements.searchSuggestions.classList.remove('show');
        return;
    }
    
    const results = searchAccounts(query);
    displaySearchSuggestions(results.slice(0, 5));
}

function displaySearchSuggestions(accounts) {
    if (accounts.length === 0) {
        elements.searchSuggestions.classList.remove('show');
        return;
    }
    
    const html = accounts.map(account => `
        <div class="search-suggestion" data-account-id="${account.id}">
            <strong>${account.name}</strong>
            <small> - ${getTypeText(account.type)} (${getStatusText(account.status)})</small>
        </div>
    `).join('');
    
    elements.searchSuggestions.innerHTML = html;
    elements.searchSuggestions.classList.add('show');
    
    // Add click listeners
    elements.searchSuggestions.querySelectorAll('.search-suggestion').forEach(item => {
        item.addEventListener('click', () => {
            const accountId = item.dataset.accountId;
            const account = getAccountById(accountId);
            switchToAccount(account);
            elements.globalSearch.value = '';
            elements.searchSuggestions.classList.remove('show');
        });
    });
}

function setupSearchFilters() {
    elements.searchFiltersBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.searchFilters.classList.toggle('show');
    });
    
    elements.accountTypeFilter.addEventListener('change', applyFilters);
    elements.statusFilter.addEventListener('change', applyFilters);
}

function applyFilters() {
    const typeFilter = elements.accountTypeFilter.value;
    const statusFilter = elements.statusFilter.value;
    
    filteredAccounts = applicationData.accounts.filter(account => {
        const matchesType = !typeFilter || account.type === typeFilter;
        const matchesStatus = !statusFilter || account.status === statusFilter;
        return matchesType && matchesStatus;
    });
    
    updateAccountsTable();
}

// Account Switcher Functions
function setupAccountSwitcher() {
    elements.accountSwitcher.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.accountDropdown.classList.toggle('show');
        if (elements.accountDropdown.classList.contains('show')) {
            populateAccountDropdown();
        }
    });
    
    elements.accountSearch.addEventListener('input', (e) => {
        filterAccountDropdown(e.target.value);
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.account-switcher')) {
            elements.accountDropdown.classList.remove('show');
        }
    });
}

function populateAccountDropdown() {
    // Recent accounts
    const recentAccounts = applicationData.recentAccounts
        .map(id => getAccountById(id))
        .filter(Boolean);
    
    elements.recentAccountsList.innerHTML = recentAccounts.map(account => `
        <div class="account-item" data-account-id="${account.id}">
            <div class="account-icon ${account.type}">
                <i class="${getTypeIcon(account.type)}"></i>
            </div>
            <div class="account-info">
                <div class="account-name">${account.name}</div>
                <span class="account-status ${account.status}">${getStatusText(account.status)}</span>
            </div>
        </div>
    `).join('');
    
    // All accounts
    elements.allAccountsList.innerHTML = applicationData.accounts.map(account => `
        <div class="account-item" data-account-id="${account.id}">
            <div class="account-icon ${account.type}">
                <i class="${getTypeIcon(account.type)}"></i>
            </div>
            <div class="account-info">
                <div class="account-name">${account.name}</div>
                <span class="account-status ${account.status}">${getStatusText(account.status)}</span>
            </div>
        </div>
    `).join('');
    
    // Add click listeners
    elements.accountDropdown.querySelectorAll('.account-item').forEach(item => {
        item.addEventListener('click', () => {
            const accountId = item.dataset.accountId;
            const account = getAccountById(accountId);
            switchToAccount(account);
            elements.accountDropdown.classList.remove('show');
        });
    });
}

function filterAccountDropdown(query) {
    const items = elements.accountDropdown.querySelectorAll('.account-item');
    const lowerQuery = query.toLowerCase();
    
    items.forEach(item => {
        const accountName = item.querySelector('.account-name').textContent.toLowerCase();
        if (accountName.includes(lowerQuery)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function switchToAccount(account) {
    currentAccount = account;
    elements.currentAccountName.textContent = account.name;
    elements.currentAccountStatus.textContent = getStatusText(account.status);
    elements.currentAccountStatus.className = `account-status ${account.status}`;
    
    // Update recent accounts
    const recentIndex = applicationData.recentAccounts.indexOf(account.id);
    if (recentIndex > -1) {
        applicationData.recentAccounts.splice(recentIndex, 1);
    }
    applicationData.recentAccounts.unshift(account.id);
    applicationData.recentAccounts = applicationData.recentAccounts.slice(0, 5);
    
    // Rebuild tree to highlight current account
    buildAccountTree();
    
    // Update activity timeline
    updateActivityTimeline();
}

// Table Functions
function setupAccountsTable() {
    // Sort functionality
    const sortableHeaders = elements.accountsTable.querySelectorAll('th[data-sort]');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.sort;
            if (sortOrder.column === column) {
                sortOrder.direction = sortOrder.direction === 'asc' ? 'desc' : 'asc';
            } else {
                sortOrder.column = column;
                sortOrder.direction = 'asc';
            }
            sortAccounts();
            updateAccountsTable();
        });
    });
    
    // Filter functionality
    elements.tableFilter.addEventListener('change', () => {
        const status = elements.tableFilter.value;
        if (status) {
            filteredAccounts = applicationData.accounts.filter(acc => acc.status === status);
        } else {
            filteredAccounts = [...applicationData.accounts];
        }
        updateAccountsTable();
    });
    
    // Refresh functionality
    elements.refreshTable.addEventListener('click', () => {
        elements.refreshTable.classList.add('loading');
        setTimeout(() => {
            elements.refreshTable.classList.remove('loading');
            updateAccountsTable();
        }, 1000);
    });
}

function sortAccounts() {
    filteredAccounts.sort((a, b) => {
        let aVal = a[sortOrder.column];
        let bVal = b[sortOrder.column];
        
        if (sortOrder.column === 'users') {
            aVal = parseInt(aVal);
            bVal = parseInt(bVal);
        }
        
        if (aVal < bVal) return sortOrder.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder.direction === 'asc' ? 1 : -1;
        return 0;
    });
}

function updateAccountsTable() {
    const html = filteredAccounts.map(account => `
        <tr>
            <td>${account.name}</td>
            <td>${getTypeText(account.type)}</td>
            <td><span class="table-status ${account.status}">${getStatusText(account.status)}</span></td>
            <td>${account.users}</td>
            <td>${account.lastActivity}</td>
            <td>${account.region}</td>
            <td>
                <div class="table-actions">
                    <button class="primary" onclick="viewAccount('${account.id}')">Ver</button>
                    <button onclick="editAccount('${account.id}')">Editar</button>
                    <button onclick="deleteAccount('${account.id}')">Excluir</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    elements.accountsTableBody.innerHTML = html;
}

// Activity Timeline
function updateActivityTimeline() {
    const activities = [
        {
            type: 'login',
            title: 'Novo login registrado',
            description: `Usuário fez login na conta ${currentAccount.name}`,
            time: '5 min atrás',
            icon: 'fas fa-sign-in-alt'
        },
        {
            type: 'create',
            title: 'Nova subconta criada',
            description: 'Subconta "Equipe de Design" foi criada',
            time: '2 horas atrás',
            icon: 'fas fa-plus'
        },
        {
            type: 'update',
            title: 'Configurações atualizadas',
            description: 'Permissões de usuário foram modificadas',
            time: '1 dia atrás',
            icon: 'fas fa-cog'
        },
        {
            type: 'login',
            title: 'Múltiplos logins',
            description: '15 usuários fizeram login hoje',
            time: '2 dias atrás',
            icon: 'fas fa-users'
        }
    ];
    
    const html = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-description">${activity.description}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
    
    elements.activityTimeline.innerHTML = html;
}

// Dashboard Stats
function updateDashboardStats() {
    document.getElementById('activeAccountsCount').textContent = applicationData.accountStats.active;
    document.getElementById('suspendedAccountsCount').textContent = applicationData.accountStats.suspended;
    document.getElementById('newAccountsCount').textContent = applicationData.accountStats.newThisMonth;
    document.getElementById('totalAccountsCount').textContent = applicationData.accountStats.total;
}

// Sidebar Search
function setupSidebarSearch() {
    elements.sidebarSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const treeItems = elements.accountTree.querySelectorAll('.tree-item');
        
        treeItems.forEach(item => {
            const accountName = item.querySelector('.account-name').textContent.toLowerCase();
            const treeNode = item.closest('.tree-node');
            
            if (accountName.includes(query) || !query) {
                treeNode.style.display = 'block';
            } else {
                treeNode.style.display = 'none';
            }
        });
    });
}

// Action Functions (placeholders for actual functionality)
window.viewAccount = function(accountId) {
    const account = getAccountById(accountId);
    alert(`Visualizando conta: ${account.name}`);
};

window.editAccount = function(accountId) {
    const account = getAccountById(accountId);
    alert(`Editando conta: ${account.name}`);
};

window.deleteAccount = function(accountId) {
    const account = getAccountById(accountId);
    if (confirm(`Tem certeza de que deseja excluir a conta: ${account.name}?`)) {
        alert(`Conta ${account.name} seria excluída (funcionalidade não implementada)`);
    }
};

// Responsive handling
function handleResize() {
    if (window.innerWidth > 768) {
        elements.sidebar.classList.remove('open');
    }
}

// Initialize Application
function initializeApp() {
    // Set initial filtered accounts
    filteredAccounts = [...applicationData.accounts];
    
    // Setup event listeners
    elements.sidebarToggle.addEventListener('click', toggleSidebar);
    
    // Initialize components
    setupGlobalSearch();
    setupSearchFilters();
    setupAccountSwitcher();
    setupAccountsTable();
    setupSidebarSearch();
    
    // Build initial UI
    buildAccountTree();
    updateAccountsTable();
    updateActivityTimeline();
    updateDashboardStats();
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    console.log('Sub-account management system initialized successfully!');
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);