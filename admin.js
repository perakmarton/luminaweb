// =========================================
// 1. ALAPFUNKCIÓK (Téma, Toast, Menü)
// =========================================
function setActiveMenuItem() {
    let currentUrl = window.location.pathname.split('/').pop();
    if (currentUrl === '') currentUrl = 'demo-admin.html'; 
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    menuItems.forEach(item => {
        if (!item.getAttribute('href').includes('index.html')) {
            item.classList.remove('active'); 
            if (item.getAttribute('href') === currentUrl) item.classList.add('active');
        }
    });
}

function showAdminToast(message, color = 'var(--admin-primary)') {
    const toast = document.getElementById("admin-toast");
    if(!toast) return;
    toast.innerText = message;
    toast.style.backgroundColor = color;
    toast.classList.add("show");
    setTimeout(() => { toast.classList.remove("show"); }, 3000);
}

function toggleAdminTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('admin_dark_mode', isDark);
    updateAdminThemeIcon(isDark);
}

function updateAdminThemeIcon(isDark) {
    const btns = document.querySelectorAll('.theme-btn');
    btns.forEach(btn => { btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'; });
    const dropIcon = document.getElementById('dropdown-theme-icon');
    const dropText = document.getElementById('dropdown-theme-text');
    if(dropIcon) dropIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    if(dropText) dropText.innerText = isDark ? 'Be' : 'Ki';
}

document.addEventListener('DOMContentLoaded', () => {
    const isDark = localStorage.getItem('admin_dark_mode') === 'true';
    if(isDark) document.body.classList.add('dark-mode');
    updateAdminThemeIcon(isDark);
    setActiveMenuItem();
    if(document.getElementById('orders-tbody')) initPagination();
    initDragAndDrop(); // Drag & Drop indítása
});

// =========================================
// 2. PROFIL MENÜ LOGIKA
// =========================================
function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    if(dropdown) dropdown.classList.toggle('active');
}

document.addEventListener('click', (e) => {
    const container = document.querySelector('.profile-menu-container');
    const dropdown = document.getElementById('profileDropdown');
    if(container && dropdown && !container.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// =========================================
// 3. LAPOZÓ ÉS SZŰRŐ RENDSZER
// =========================================
let currentPage = 1;
const rowsPerPage = 5;
let allRows = [];
let filteredRows = [];

function initPagination() {
    allRows = Array.from(document.querySelectorAll('#orders-tbody tr'));
    filteredRows = allRows;
    renderTablePage(1);
}

function filterOrders() {
    const searchInput = document.getElementById('order-search').value.toLowerCase();
    const statusFilter = document.getElementById('order-status-filter').value;
    filteredRows = allRows.filter(row => {
        const orderId = row.cells[0].innerText.toLowerCase();
        const customerName = row.cells[2].innerText.toLowerCase();
        const statusText = row.cells[5].innerText.trim();
        const matchesSearch = orderId.includes(searchInput) || customerName.includes(searchInput);
        const matchesStatus = (statusFilter === "Minden státusz") || (statusText === statusFilter);
        return matchesSearch && matchesStatus;
    });
    renderTablePage(1); 
}

function renderTablePage(page) {
    const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;
    allRows.forEach(row => row.style.display = 'none');
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    for (let i = start; i < end && i < filteredRows.length; i++) {
        filteredRows[i].style.display = '';
    }
    const info = document.getElementById('pagination-info');
    if(info) {
        let itemsEnd = (end > filteredRows.length) ? filteredRows.length : end;
        let itemsStart = filteredRows.length === 0 ? 0 : start + 1;
        info.innerText = `Mutatva: ${itemsStart} - ${itemsEnd} (Összesen: ${filteredRows.length} rendelés)`;
    }
    const controls = document.getElementById('pagination-controls');
    if(controls) {
        let html = `<button class="action-btn" onclick="renderTablePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Előző</button>`;
        for(let i=1; i<=totalPages; i++) {
            let activeClass = i === currentPage ? 'active style="background: var(--admin-primary); color: white;"' : '';
            html += `<button class="action-btn" ${activeClass} onclick="renderTablePage(${i})">${i}</button>`;
        }
        html += `<button class="action-btn" onclick="renderTablePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Következő</button>`;
        controls.innerHTML = html;
    }
}

// =========================================
// 4. CSV EXPORT
// =========================================
function exportRealCSV(btn) {
    let originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generálás...';
    btn.disabled = true;
    setTimeout(() => {
        let csvContent = "\uFEFF" + "Rendelés ID;Dátum;Ügyfél;Termékek;Összeg;Státusz\n";
        let allTableRows = Array.from(document.querySelectorAll('#orders-tbody tr'));
        allTableRows.forEach(row => {
            let rowData = [];
            for(let i=0; i<6; i++) {
                let cellText = row.cells[i].innerText.replace(/(\r\n|\n|\r)/gm, " ").trim();
                rowData.push('"' + cellText + '"');
            }
            csvContent += rowData.join(";") + "\n";
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "rendelesek_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showAdminToast("Sikeres exportálás! A fájl letöltve.", "#10b981");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 1200);
}

// =========================================
// 5. RENDELÉS RÉSZLETEK ÉS SZERKESZTÉS (SZEM IKON)
// =========================================
let currentOpenOrderId = null;

function applyStatusColorToSelect(el, status) {
    if(!el) return;
    if(status === 'Teljesítve') { el.style.color = '#10b981'; el.style.borderColor = '#10b981'; }
    else if(status === 'Visszatérítve') { el.style.color = '#ef4444'; el.style.borderColor = '#ef4444'; }
    else { el.style.color = '#f59e0b'; el.style.borderColor = '#f59e0b'; } 
}

function openOrderDetails(id, customer, total, defaultStatus, items, address = "Nem megadott cím", payment = "Bankkártya (Stripe)", courier = "GLS Futárszolgálat") {
    currentOpenOrderId = id;
    
    const viewDiv = document.getElementById('order-info-view');
    const editDiv = document.getElementById('order-info-edit');
    if(viewDiv) viewDiv.style.display = 'block';
    if(editDiv) editDiv.style.display = 'none';

    document.getElementById('modal-order-id').innerText = id;
    document.getElementById('modal-order-total').innerText = total;
    document.getElementById('modal-order-items').innerText = items;
    document.getElementById('modal-order-customer').innerText = customer;
    
    if(document.getElementById('modal-order-address')) document.getElementById('modal-order-address').innerText = address;
    if(document.getElementById('modal-order-payment')) document.getElementById('modal-order-payment').innerText = payment;
    if(document.getElementById('modal-order-courier')) document.getElementById('modal-order-courier').innerText = courier;

    let realStatus = defaultStatus;
    const allRows = document.querySelectorAll('#orders-tbody tr');
    allRows.forEach(row => {
        if (row.cells[0].innerText.trim() === id) {
            realStatus = row.cells[5].innerText.trim();
        }
    });
    
    const statusSelect = document.getElementById('modal-order-status-select');
    if(statusSelect) {
        statusSelect.value = realStatus;
        applyStatusColorToSelect(statusSelect, realStatus);
    }

    document.getElementById('order-details-modal').classList.add('active');
}

function closeOrderDetails() {
    document.getElementById('order-details-modal').classList.remove('active');
}

function updateOrderStatus() {
    if (!currentOpenOrderId) return;
    const statusSelect = document.getElementById('modal-order-status-select');
    const newStatus = statusSelect.value;
    const customerName = document.getElementById('modal-order-customer').innerText;
    
    applyStatusColorToSelect(statusSelect, newStatus);
    
    const allRows = document.querySelectorAll('#orders-tbody tr');
    allRows.forEach(row => {
        if (row.cells[0].innerText.trim() === currentOpenOrderId) {
            const statusCell = row.cells[5];
            if(newStatus === 'Teljesítve') statusCell.innerHTML = '<span class="status-badge status-success">Teljesítve</span>';
            else if(newStatus === 'Visszatérítve') statusCell.innerHTML = '<span class="status-badge" style="background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid #ef4444;">Visszatérítve</span>';
            else statusCell.innerHTML = '<span class="status-badge status-pending">Feldolgozás alatt</span>';
        }
    });

    showAdminToast(`Státusz módosítva. Email küldése a(z) ${customerName} ügyfélnek...`, '#3b82f6');
    setTimeout(() => {
        showAdminToast(`Rendszer üzenet: Email sikeresen kézbesítve! (${newStatus})`, '#10b981');
    }, 1800);
}

function toggleEditCustomerInfo() {
    const viewDiv = document.getElementById('order-info-view');
    const editDiv = document.getElementById('order-info-edit');
    
    if (viewDiv.style.display !== 'none') {
        document.getElementById('edit-order-customer').value = document.getElementById('modal-order-customer').innerText;
        document.getElementById('edit-order-address').value = document.getElementById('modal-order-address').innerText;
        document.getElementById('edit-order-payment').value = document.getElementById('modal-order-payment').innerText;
        document.getElementById('edit-order-courier').value = document.getElementById('modal-order-courier').innerText;
        viewDiv.style.display = 'none';
        editDiv.style.display = 'block';
    } else {
        viewDiv.style.display = 'block';
        editDiv.style.display = 'none';
    }
}

function saveCustomerInfoEdit() {
    const newCustomer = document.getElementById('edit-order-customer').value;
    const newAddress = document.getElementById('edit-order-address').value;
    const newPayment = document.getElementById('edit-order-payment').value;
    const newCourier = document.getElementById('edit-order-courier').value;
    
    document.getElementById('modal-order-customer').innerText = newCustomer;
    document.getElementById('modal-order-address').innerText = newAddress;
    document.getElementById('modal-order-payment').innerText = newPayment;
    document.getElementById('modal-order-courier').innerText = newCourier;
    
    const allRows = document.querySelectorAll('#orders-tbody tr');
    allRows.forEach(row => {
        if (row.cells[0].innerText.trim() === currentOpenOrderId) {
            row.cells[2].innerText = newCustomer; 
            const btn = row.querySelector('.action-btn');
            const total = document.getElementById('modal-order-total').innerText;
            const status = document.getElementById('modal-order-status-select').value;
            const items = document.getElementById('modal-order-items').innerText;
            btn.setAttribute('onclick', `openOrderDetails('${currentOpenOrderId}', '${newCustomer}', '${total}', '${status}', '${items}', '${newAddress}', '${newPayment}', '${newCourier}')`);
        }
    });
    
    toggleEditCustomerInfo();
    showAdminToast("Ügyféladatok sikeresen frissítve!", "var(--admin-success)");
}

// =========================================
// 6. MODERN TÖRLÉS LOGIKA
// =========================================
function openDeleteConfirmModal() {
    if (!currentOpenOrderId) return;
    document.getElementById('delete-confirm-modal').classList.add('active');
}

function closeDeleteConfirmModal() {
    document.getElementById('delete-confirm-modal').classList.remove('active');
}

function executeOrderDeletion() {
    if (!currentOpenOrderId) return; 
    const tableBody = document.getElementById('orders-tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    const targetRow = rows.find(r => r.cells[0].innerText.trim() === currentOpenOrderId);
    
    if (targetRow) {
        targetRow.remove();
        allRows = Array.from(document.querySelectorAll('#orders-tbody tr'));
        filterOrders(); 
        showAdminToast(`A ${currentOpenOrderId} rendelés törölve!`, 'var(--admin-danger)');
        closeDeleteConfirmModal();
        closeOrderDetails();
    }
}

// =========================================
// 7. ÚJ RENDELÉS (DRAG & DROP, VALIDÁCIÓ)
// =========================================
function openAddOrderModal() {
    const modal = document.getElementById('add-order-modal');
    if(modal) {
        document.getElementById('order-items-container').innerHTML = ''; // Teljesen üres kosár alapból!
        document.getElementById('new-order-total').value = '0 Ft';
        modal.classList.add('active');
    }
}

function closeAddOrderModal() {
    const modal = document.getElementById('add-order-modal');
    if(modal) modal.classList.remove('active');
}

function initDragAndDrop() {
    const container = document.getElementById('order-items-container');
    if(container) {
        container.addEventListener('dragover', e => {
            e.preventDefault(); 
            const dragging = document.querySelector('.dragging');
            if(!dragging) return;
            const afterElement = getDragAfterElement(container, e.clientY);
            if (afterElement == null) {
                container.appendChild(dragging);
            } else {
                container.insertBefore(dragging, afterElement);
            }
        });
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.order-item-row:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function addOrderItemRow() {
    const container = document.getElementById('order-items-container');
    const template = document.getElementById('item-row-template');
    if(!template) return;
    
    const clone = template.content.cloneNode(true);
    const newRow = clone.querySelector('.order-item-row');
    
    newRow.addEventListener('dragstart', () => newRow.classList.add('dragging'));
    newRow.addEventListener('dragend', () => newRow.classList.remove('dragging'));
    
    container.appendChild(newRow);
    calculateNewOrderTotal(); 
}

function removeOrderItemRow(btn) {
    const row = btn.closest('.order-item-row');
    row.remove();
    calculateNewOrderTotal(); 
}

function calculateNewOrderTotal() {
    const rows = document.querySelectorAll('.order-item-row');
    let totalSum = 0;
    rows.forEach(row => {
        const productSelect = row.querySelector('.item-product');
        const qtyInput = row.querySelector('.item-qty');
        if (productSelect && productSelect.value && qtyInput && qtyInput.value) {
            totalSum += (parseInt(productSelect.value) * parseInt(qtyInput.value));
        }
    });
    const totalInput = document.getElementById('new-order-total');
    if (totalInput) totalInput.value = totalSum.toLocaleString('hu-HU') + ' Ft';
}

function addNewOrder(event) {
    event.preventDefault();
    const rows = document.querySelectorAll('.order-item-row');
    
    if (rows.length === 0) {
        showAdminToast('Hiba: Nem adtál hozzá tételt!', 'var(--admin-danger)');
        return; 
    }

    const customer = document.getElementById('new-order-customer').value;
    const address = document.getElementById('new-order-address').value;
    const payment = document.getElementById('new-order-payment').value; 
    const courier = document.getElementById('new-order-courier').value; 
    const status = document.getElementById('new-order-status').value;
    const total = document.getElementById('new-order-total').value;
    
    let itemsArray = [];
    rows.forEach(row => {
        const productSelect = row.querySelector('.item-product');
        const qtyInput = row.querySelector('.item-qty');
        if (productSelect.value && qtyInput.value) {
            const productName = productSelect.options[productSelect.selectedIndex].getAttribute('data-name');
            itemsArray.push(`${qtyInput.value}x ${productName}`);
        }
    });
    
    if (itemsArray.length === 0) {
        showAdminToast('Hiba: Kérlek válassz terméket!', 'var(--admin-danger)');
        return;
    }

    const finalItemsText = itemsArray.join(', ');
    const randomId = '#ORD-' + Math.floor(1000 + Math.random() * 9000);
    const today = new Date();
    const dateStr = `Ma, ${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
    
    let badgeHtml = '';
    if(status === 'Teljesítve') badgeHtml = '<span class="status-badge status-success">Teljesítve</span>';
    else if(status === 'Visszatérítve') badgeHtml = '<span class="status-badge" style="background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid #ef4444;">Visszatérítve</span>';
    else badgeHtml = '<span class="status-badge status-pending">Feldolgozás alatt</span>';
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><strong>${randomId}</strong></td>
        <td>${dateStr}</td>
        <td>${customer}</td>
        <td>${finalItemsText}</td>
        <td>${total}</td>
        <td>${badgeHtml}</td>
        <td><button class="action-btn" onclick="openOrderDetails('${randomId}', '${customer}', '${total}', '${status}', '${finalItemsText}', '${address}', '${payment}', '${courier}')"><i class="fas fa-eye"></i></button></td>
    `;
    
    const tbody = document.getElementById('orders-tbody');
    tbody.insertBefore(newRow, tbody.firstChild);
    
    allRows = Array.from(document.querySelectorAll('#orders-tbody tr'));
    filterOrders();
    
    showAdminToast(`Sikeres: ${randomId} hozzáadva!`, 'var(--admin-success)');
    
    event.target.reset(); 
    document.getElementById('new-order-total').value = '0 Ft'; 
    const notes = document.getElementById('new-order-notes');
    if(notes) notes.value = ''; 
    document.getElementById('order-items-container').innerHTML = '';
    closeAddOrderModal(); 
}

// =========================================
// 8. ÜGYFÉL KEZELÉS (Hozzáadás, Szerkesztés, Modern Törlés, Dátum)
// =========================================
let currentEditCustomerId = null; 
let customerToDeleteId = null;

// A) MEGLÉVŐ ÜGYFÉL SZERKESZTÉSE
function openEditCustomer(id, name, email, date) {
    currentEditCustomerId = id;
    
    // TRÜKK: Ha a gomb nem adta át a dátumot, ellopjuk a táblázatból!
    let finalDate = date;
    if (!finalDate) {
        const row = document.getElementById('customer-row-' + id);
        if (row && row.cells[3]) {
            finalDate = row.cells[3].innerText.trim();
        }
    }

    const idEl = document.getElementById('edit-customer-id');
    const nameEl = document.getElementById('edit-customer-name');
    const emailEl = document.getElementById('edit-customer-email');
    const dateEl = document.getElementById('edit-customer-date'); // Ez itt a Dátum!
    
    if(idEl) idEl.value = id;
    if(nameEl) nameEl.value = name;
    if(emailEl) emailEl.value = email;
    if(dateEl) dateEl.value = finalDate; // Bekerül a modálba!
    
    const modal = document.getElementById('edit-customer-modal');
    if(modal) modal.classList.add('active');
}

function closeEditCustomer() { 
    const modal = document.getElementById('edit-customer-modal');
    if(modal) modal.classList.remove('active'); 
}

function saveCustomerChanges(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mentés...';
    
    setTimeout(() => {
        const newId = document.getElementById('edit-customer-id').value;
        const newName = document.getElementById('edit-customer-name').value;
        const newEmail = document.getElementById('edit-customer-email').value;
        const newDate = document.getElementById('edit-customer-date').value; // Kiolvassuk az új dátumot
        
        const row = document.getElementById('customer-row-' + currentEditCustomerId);
        if (row) {
            row.id = 'customer-row-' + newId;
            const cells = row.querySelectorAll('td');
            cells[0].innerHTML = `<strong>${newId}</strong>`;
            cells[1].innerText = newName;
            cells[2].innerText = newEmail;
            cells[3].innerText = newDate; // FRISSÍTJÜK A TÁBLÁZATBAN A DÁTUMOT!
            
            const actionCell = cells[4];
            actionCell.innerHTML = `
                <button class="action-btn" onclick="openEditCustomer('${newId}', '${newName}', '${newEmail}', '${newDate}')"><i class="fas fa-pen"></i> Szerkesztés</button>
                <button class="action-btn" style="color:var(--admin-danger);" onclick="openDeleteCustomerModal('${newId}')"><i class="fas fa-trash"></i></button>
            `;
        }
        
        closeEditCustomer();
        showAdminToast("Ügyfél adatai sikeresen frissítve!", "var(--admin-success)");
        btn.innerHTML = originalText;
    }, 800);
}

// B) ÚJ ÜGYFÉL HOZZÁADÁSA
function openAddCustomerModal() {
    const randomId = 'CUST' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('add-customer-id').value = randomId;
    document.getElementById('add-customer-name').value = '';
    document.getElementById('add-customer-email').value = '';
    document.getElementById('add-customer-modal').classList.add('active');
}

function closeAddCustomerModal() {
    document.getElementById('add-customer-modal').classList.remove('active');
}

function addNewCustomer(e) {
    e.preventDefault();
    const id = document.getElementById('add-customer-id').value;
    const name = document.getElementById('add-customer-name').value;
    const email = document.getElementById('add-customer-email').value;
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}. ${String(today.getMonth() + 1).padStart(2, '0')}. ${String(today.getDate()).padStart(2, '0')}.`;
    
    const newRow = document.createElement('tr');
    newRow.id = 'customer-row-' + id;
    newRow.innerHTML = `
        <td><strong>${id}</strong></td>
        <td>${name}</td>
        <td>${email}</td>
        <td>${dateStr}</td>
        <td>
            <button class="action-btn" onclick="openEditCustomer('${id}', '${name}', '${email}', '${dateStr}')"><i class="fas fa-pen"></i> Szerkesztés</button>
            <button class="action-btn" style="color:var(--admin-danger);" onclick="openDeleteCustomerModal('${id}')"><i class="fas fa-trash"></i></button>
        </td>
    `;
    
    const tbody = document.querySelector('.admin-table tbody');
    if(tbody) tbody.insertBefore(newRow, tbody.firstChild);
    showAdminToast(`Sikeres: ${name} hozzáadva!`, 'var(--admin-success)');
    e.target.reset();
    closeAddCustomerModal();
}

// C) MODERN ÜGYFÉL TÖRLÉS UI
// TRÜKK: Ha a HTML-ben a régi kódot hagytad, az is az új ablakot nyitja meg!
function deleteCustomer(id) {
    openDeleteCustomerModal(id);
}

function openDeleteCustomerModal(id) {
    customerToDeleteId = id;
    const modal = document.getElementById('delete-customer-confirm-modal');
    if(modal) modal.classList.add('active');
}

function closeDeleteCustomerModal() {
    customerToDeleteId = null;
    const modal = document.getElementById('delete-customer-confirm-modal');
    if(modal) modal.classList.remove('active');
}

function executeCustomerDeletion() {
    if (!customerToDeleteId) return;
    
    // Megkeressük a piros gombot a modális ablakban
    const btn = document.querySelector('#delete-customer-confirm-modal .btn-danger');
    const originalText = btn.innerHTML;
    
    // 1. VIZUÁLIS EFFEKT BEKAPCSOLÁSA (Pörgő ikon, letiltás)
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Törlés folyamatban...';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none'; // Ne tudjon kétszer rányomni
    
    // 2. KÉSLELTETETT VÉGREHAJTÁS (0.8 másodperc műdráma)
    setTimeout(() => {
        const row = document.getElementById('customer-row-' + customerToDeleteId);
        if(row) {
            // Eltüntetjük a sort a táblázatból szép lassan
            row.style.transition = "all 0.4s ease";
            row.style.opacity = "0";
            row.style.transform = "translateX(-20px)";
            
            // Fél másodperc múlva ténylegesen kiszedjük a HTML-ből
            setTimeout(() => row.remove(), 400);
            
            showAdminToast(`Ügyfél (${customerToDeleteId}) véglegesen törölve.`, 'var(--admin-danger)');
        }
        
        closeDeleteCustomerModal();
        
        // Gomb visszaállítása eredeti állapotába (ha legközelebb megnyitná)
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        }, 300);
        
    }, 800);
}
function submitRestock(e) {
    e.preventDefault();
    const termek = document.getElementById('restock-product');
    const termekNev = termek.options[termek.selectedIndex].text;
    const db = document.getElementById('restock-qty').value;
    const btn = e.target.querySelector('button');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rendelés elküldése...';
    setTimeout(() => {
        showAdminToast(`Sikeres berendelés: ${db} db - ${termekNev}`, '#10b981');
        e.target.reset();
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Beszállítói Rendelés Elküldése';
    }, 1500);
}

// =========================================
// 9. MODERN BERENDELÉS (RESTOCK) KOSÁR LOGIKA (Árszámolóval)
// =========================================

// Ez tartja nyilván, hogy mi van a kosárban, ÉS az árát is! { sku: price }
let restockCart = {};

function calculateRestockTotal() {
    let total = 0;
    for (const sku in restockCart) {
        const qtyInput = document.getElementById(`qty-${sku}`);
        if (qtyInput) {
            const qty = parseInt(qtyInput.value) || 0;
            const price = restockCart[sku];
            total += (qty * price);
        }
    }
    const totalEl = document.getElementById('restock-total-price');
    if (totalEl) totalEl.innerText = total.toLocaleString('hu-HU') + ' Ft';
}

function addToRestockCart(sku, name, price = 0) {
    const container = document.getElementById('restock-cart-container');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const submitBtn = document.getElementById('restock-submit-btn');

    if(emptyMsg) emptyMsg.style.display = 'none';
    submitBtn.disabled = false;

    // Ha már benne van, csak növeljük a darabszámot
    if (document.getElementById(`row-${sku}`)) {
        const qtyInput = document.getElementById(`qty-${sku}`);
        qtyInput.value = parseInt(qtyInput.value) + 1;
        
        const row = document.getElementById(`row-${sku}`);
        row.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        setTimeout(() => row.style.backgroundColor = 'transparent', 300);
        
        calculateRestockTotal(); // Azonnali árszámolás
        return;
    }

    // Eltároljuk az árat a memóriában
    restockCart[sku] = parseInt(price);

    const row = document.createElement('div');
    row.className = 'restock-cart-item';
    row.id = `row-${sku}`;
    
    // Figyeld a value="1"-et és az oninput eseményt!
    row.innerHTML = `
        <div class="restock-cart-title">${name} <br><span style="font-size: 10px; color: var(--admin-muted); font-family: monospace;">${sku}</span></div>
        <div>
            <input type="number" id="qty-${sku}" class="form-control" min="1" value="1" style="padding: 6px; font-size: 13px; text-align: center;" oninput="calculateRestockTotal()">
        </div>
        <div>
            <button type="button" class="action-btn" style="color: var(--admin-danger); border-color: var(--admin-danger); margin: 0; padding: 6px 10px;" onclick="removeFromRestockCart('${sku}')"><i class="fas fa-trash"></i></button>
        </div>
    `;

    container.appendChild(row);
    showAdminToast(`${name} hozzáadva a listához.`, '#3b82f6');
    calculateRestockTotal(); 
}

function removeFromRestockCart(sku) {
    const row = document.getElementById(`row-${sku}`);
    if (row) row.remove();
    delete restockCart[sku];

    if (Object.keys(restockCart).length === 0) {
        document.getElementById('empty-cart-msg').style.display = 'block';
        document.getElementById('restock-submit-btn').disabled = true;
    }
    calculateRestockTotal();
}

function submitModernRestock(e) {
    e.preventDefault();
    const btn = document.getElementById('restock-submit-btn');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Beszerzés küldése...';
    btn.style.opacity = '0.8';
    
    const itemCount = Object.keys(restockCart).length;

    setTimeout(() => {
        showAdminToast(`Sikeres berendelés leadva a partnernek! (${itemCount} tétel)`, '#10b981');
        
        document.getElementById('restock-cart-container').innerHTML = '<p id="empty-cart-msg" style="color: var(--admin-muted); font-size: 13px; text-align: center; margin: 15px 0;">Kattints a + gombra egy termék hozzáadásához.</p>';
        restockCart = {};
        
        // Reseteljük a gombot és az árat
        btn.innerHTML = originalText;
        btn.style.opacity = '1';
        btn.disabled = true;
        document.getElementById('restock-total-price').innerText = '0 Ft';
        
        e.target.reset();
    }, 1800);
}

// =========================================
// 10. MÉRET VÁLASZTÓ LOGIKA (Ruházathoz, ártovábbítással)
// =========================================
let pendingRestockSku = '';
let pendingRestockName = '';
let pendingRestockPrice = 0; // ÚJ: Elmentjük az árat is

function openSizeSelector(sku, name, price) {
    pendingRestockSku = sku;
    pendingRestockName = name;
    pendingRestockPrice = price; 
    
    document.getElementById('pending-product-name').innerText = name;
    document.getElementById('size-select-input').value = 'M'; 
    document.getElementById('size-selector-modal').classList.add('active');
}

function closeSizeSelector() {
    document.getElementById('size-selector-modal').classList.remove('active');
}

function confirmSizeSelection() {
    const size = document.getElementById('size-select-input').value;
    
    if (size === 'ALL') {
        const sizes = ['S', 'M', 'L', 'XL'];
        sizes.forEach(s => {
            // Továbbítjuk az árat is!
            addToRestockCart(`${pendingRestockSku}-${s}`, `${pendingRestockName} (${s})`, pendingRestockPrice);
        });
    } else {
        addToRestockCart(`${pendingRestockSku}-${size}`, `${pendingRestockName} (${size})`, pendingRestockPrice);
    }
    
    closeSizeSelector();
}