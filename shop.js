let discountMultiplier = 1; 

// --- SÖTÉT MÓD LOGIKA ---
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('shop_dark_mode', isDark);
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    const btns = document.querySelectorAll('.theme-btn');
    btns.forEach(btn => {
        btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
}

if(localStorage.getItem('shop_dark_mode') === 'true') {
    document.body.classList.add('dark-mode');
}

// --- MÉRET VÁLASZTÓ MODAL LOGIKA ---
let currentProduct = null;

function openCartModal(id, name, price, img, needsSize) {
    // Ha nem kell méret (pl. óra, táska), egyből kosárba teszi
    if(!needsSize) {
        addToCart(id, name, price, img);
        return;
    }
    
    let modal = document.getElementById('size-modal');
    if(!modal) {
        alert("Hiba: A méretválasztó ablak hiányzik a HTML-ből!");
        return;
    }

    // Elmentjük az adatokat
    currentProduct = { id: String(id), name: name, price: parseInt(price), img: img, size: 'M' }; 
    
    document.getElementById('modal-title').innerText = name;
    document.getElementById('modal-price').innerText = formatPrice(price);
    
    document.querySelectorAll('.modal-size-btn').forEach(b => b.classList.remove('active'));
    let defaultBtn = document.querySelector('.modal-size-btn[data-size="M"]');
    if(defaultBtn) defaultBtn.classList.add('active');
    
    modal.classList.add('active');
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
}

function closeCartModal() {
    let modal = document.getElementById('size-modal');
    if(modal) {
        modal.classList.remove('active');
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
    }
}

function selectModalSize(size, element) {
    currentProduct.size = size;
    document.querySelectorAll('.modal-size-btn').forEach(b => b.classList.remove('active'));
    element.classList.add('active');
}

function confirmAddToCart() {
    if(currentProduct) {
        // Egyedi ID a méret alapján (pl. "1-M") és a névhez hozzáfűzzük a méretet!
        let finalId = currentProduct.id + '-' + currentProduct.size;
        let finalName = currentProduct.name + ' - Méret: ' + currentProduct.size;
        
        addToCart(finalId, finalName, currentProduct.price, currentProduct.img);
        closeCartModal();
    }
}

// --- KOSÁR RENDSZER ---
function getCart() { return JSON.parse(localStorage.getItem('premium_cart')) || []; }
function saveCart(cart) { localStorage.setItem('premium_cart', JSON.stringify(cart)); updateBadge(); }

function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    if(!toast) return;
    toast.innerText = message;
    toast.style.backgroundColor = isError ? "#ef4444" : "#3b82f6";
    toast.className = "show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

function addToCart(id, name, price, img) {
    let cart = getCart();
    let strId = String(id); // Biztos ami biztos, szöveggé alakítjuk az ID-t
    let item = cart.find(i => i.id === strId);
    
    if(item) {
        item.qty++;
    } else {
        cart.push({ id: strId, name: name, price: parseInt(price), img: img, qty: 1 });
    }
    
    saveCart(cart);
    showToast("Bekerült a kosárba!");
}

function updateQty(id, change) {
    let cart = getCart();
    let strId = String(id);
    let item = cart.find(i => i.id === strId);
    
    if(item) {
        item.qty += change;
        if(item.qty <= 0) {
            cart = cart.filter(i => i.id !== strId);
        }
        saveCart(cart);
        renderCart();
        renderCheckout();
    }
}

function removeFromCart(id) {
    let cart = getCart();
    let strId = String(id);
    cart = cart.filter(i => i.id !== strId); // A törlés javítva!
    saveCart(cart);
    renderCart();
    renderCheckout();
}

function clearCart() { localStorage.removeItem('premium_cart'); updateBadge(); }

function updateBadge() {
    let cart = getCart();
    let count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-badge').forEach(el => el.innerText = count);
}

function formatPrice(price) { return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Ft"; }

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-price');
    if(!container) return;

    let cart = getCart();
    if(cart.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 50px 0;"><h3 style="color:var(--text-muted);">A kosarad üres.</h3></div>`;
        if(totalEl) totalEl.innerText = "0 Ft";
        document.getElementById('checkout-btn-container').style.display = 'none';
        return;
    }

    document.getElementById('checkout-btn-container').style.display = 'block';
    let html = '';
    let total = 0;
    cart.forEach(item => {
        let subtotal = item.price * item.qty;
        total += subtotal;
        html += `
            <div class="cart-item">
                <div class="cart-product-info">
                    <img src="${item.img}" alt="${item.name}">
                    <div><h3 class="product-title" style="font-size:14px;">${item.name}</h3><p class="product-price">${formatPrice(item.price)} / db</p></div>
                </div>
                <div>
                    <div class="qty-selector">
                        <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
                        <input type="text" class="qty-input" value="${item.qty}" readonly>
                        <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
                    </div>
                </div>
                <div style="font-weight: 700; font-size: 18px;">${formatPrice(subtotal)}</div>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')">×</button>
            </div>`;
    });
    container.innerHTML = html;
    if(totalEl) totalEl.innerText = formatPrice(total);
}

function renderCheckout() {
    const container = document.getElementById('checkout-summary-items');
    const totalEl = document.getElementById('checkout-final-total');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const discountRow = document.getElementById('discount-row');
    const discountAmount = document.getElementById('discount-amount');
    
    if(!container) return;

    let cart = getCart();
    if(cart.length === 0) { window.location.href = "demo-cart.html"; return; }

    let html = '';
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.qty;
        html += `
            <div style="display:flex; justify-content:space-between; margin-bottom: 15px; font-size:15px;">
                <div style="display:flex; gap:15px; align-items:center;">
                    <div style="position:relative;">
                        <img src="${item.img}" style="width:60px; height:60px; border-radius:8px; object-fit:cover; border:1px solid var(--border-color);">
                        <span style="position:absolute; top:-5px; right:-5px; background:var(--text-muted); color:white; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px;">${item.qty}</span>
                    </div>
                    <span style="font-weight:500;">${item.name}</span>
                </div>
                <span style="font-weight:600;">${formatPrice(item.price * item.qty)}</span>
            </div>`;
    });
    container.innerHTML = html;
    subtotalEl.innerText = formatPrice(total);

    if(discountMultiplier < 1) {
        discountRow.classList.add('active');
        let saving = total * (1 - discountMultiplier);
        discountAmount.innerText = "-" + formatPrice(saving);
        totalEl.innerText = formatPrice(total * discountMultiplier);
    } else {
        discountRow.classList.remove('active');
        totalEl.innerText = formatPrice(total);
    }
}

function applyCoupon() {
    const input = document.getElementById('coupon-code');
    const code = input.value.trim().toUpperCase();
    if(code === "ADMIN") {
        discountMultiplier = 0.85; 
        renderCheckout();
        showToast("Kuponkód elfogadva! -15%");
        input.value = "";
    } else { showToast("Hibás kuponkód!", true); }
}

function formatCardNumber(e) {
    let input = e.target;
    let val = input.value.replace(/\D/g, ''); 
    const icon = document.getElementById('card-icon');
    
    if(icon) {
        if (val.length === 0) { icon.src = "https://cdn-icons-png.flaticon.com/512/1086/1086741.png"; icon.style.opacity = "0.3"; }
        else if (val.startsWith('4')) { icon.src = "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"; icon.style.opacity = "1"; }
        else if (val.startsWith('5')) { icon.src = "https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg"; icon.style.opacity = "1"; }
    }
    if(val.length > 0) val = val.match(/.{1,4}/g).join('-');
    input.value = val.substring(0, 19);
}

function formatExp(e) {
    let val = e.target.value.replace(/\D/g, '');
    if(val.length > 2) val = val.substring(0,2) + '/' + val.substring(2,4);
    e.target.value = val.substring(0,5);
}

function simulatePayment() {
    const fields = ['email', 'last-name', 'first-name', 'address', 'city', 'zip', 'cc-number', 'cc-exp', 'cc-cvc'];
    let isValid = true;
    
    document.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));

    fields.forEach(f => {
        let el = document.getElementById(f);
        if(el) {
            let val = el.value.trim();
            if(val === '' || (f === 'email' && !val.includes('@')) || (f === 'cc-number' && val.length < 19) || (f === 'cc-exp' && val.length < 5) || (f === 'cc-cvc' && val.length < 3)) {
                el.parentElement.classList.add('has-error');
                isValid = false;
            }
        }
    });

    if(!isValid) { showToast("Kérjük, töltsd ki helyesen a pirossal jelölt mezőket!", true); return; }

    const btn = document.getElementById('pay-btn');
    btn.innerHTML = "Feldolgozás...";
    btn.style.opacity = "0.7";
    btn.disabled = true;
    
    setTimeout(() => {
        clearCart();
        window.location.href = "demo-success.html";
    }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    updateThemeIcon(document.body.classList.contains('dark-mode'));
    updateBadge();
    renderCart();
    renderCheckout();

    const ccInput = document.getElementById('cc-number');
    if(ccInput) { ccInput.addEventListener('input', formatCardNumber); formatCardNumber({target: ccInput}); }
    const expInput = document.getElementById('cc-exp');
    if(expInput) expInput.addEventListener('input', formatExp);
    const cvcInput = document.getElementById('cc-cvc');
    if(cvcInput) cvcInput.addEventListener('input', function(e) { this.value = this.value.replace(/\D/g, '').substring(0,3); });
});