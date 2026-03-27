// Navigációs sáv üveghatás görgetéskor
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Modális Ablak Logika (Bejelentkezés, Regisztráció, Elfelejtett jelszó)
function openModal(type) {
    const overlay = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const desc = document.getElementById('modalDesc');
    const submitBtn = document.getElementById('modalSubmitBtn');
    
    // Lekérjük a dinamikus elemeket
    const nameGroup = document.getElementById('nameGroup');
    const passwordGroup = document.getElementById('passwordGroup');
    const googleBtn = document.getElementById('modalGoogleBtn');
    const divider = document.getElementById('modalDivider');
    const footer = document.getElementById('modalFooter');

    // 1. BEJELENTKEZÉS
    if(type === 'login') {
        title.innerText = 'Üdv újra!';
        desc.innerText = 'Jelentkezz be a fiókodba a folytatáshoz.';
        submitBtn.innerText = 'Bejelentkezés';
        
        nameGroup.style.display = 'none';
        passwordGroup.style.display = 'block';
        googleBtn.style.display = 'flex';
        divider.style.display = 'flex';
        
        footer.innerHTML = 'Nincs még fiókod? <a onclick="openModal(\'register\')">Regisztrálj!</a>';
    } 
    // 2. REGISZTRÁCIÓ / DEMÓ
    else if(type === 'register' || type === 'demo') {
        title.innerText = 'Kezdd el ingyen';
        desc.innerText = 'Próbáld ki a TaskFlow összes funkcióját 14 napig.';
        submitBtn.innerText = 'Fiók létrehozása';
        
        nameGroup.style.display = 'block';
        passwordGroup.style.display = 'block';
        googleBtn.style.display = 'flex';
        divider.style.display = 'flex';
        
        footer.innerHTML = 'Már van fiókod? <a onclick="openModal(\'login\')">Jelentkezz be!</a>';
    }
    // 3. ÚJ: ELFELEJTETT JELSZÓ
    else if(type === 'forgot') {
        title.innerText = 'Jelszó visszaállítása';
        desc.innerText = 'Add meg az email címed, és küldünk egy biztonsági linket a visszaállításhoz.';
        submitBtn.innerText = 'Visszaállító link küldése';
        
        // Elrejtjük a felesleges dolgokat
        nameGroup.style.display = 'none';
        passwordGroup.style.display = 'none';
        googleBtn.style.display = 'none';
        divider.style.display = 'none';
        
        footer.innerHTML = 'Vissza a <a onclick="openModal(\'login\')">Bejelentkezéshez</a>';
    }
    
    overlay.classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// Ablak bezárása ha a sötét részre kattintanak
document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// =========================================
// TOAST ÉRTESÍTÉSEK
// =========================================
function showSaasToast(message, type = 'success') {
    const toast = document.getElementById("saas-toast");
    if(!toast) return;
    
    toast.innerText = message;
    toast.className = ''; // Letisztítjuk az előző osztályokat
    toast.classList.add(type);
    toast.classList.add("show");
    
    setTimeout(() => { 
        toast.classList.remove("show"); 
    }, 3000);
}

// =========================================
// GOMB SZIMULÁCIÓ ÉS VALIDÁCIÓ (Javítva!)
// =========================================
function submitForm() {
    const title = document.getElementById('modalTitle').innerText;
    
    // 1. VALIDÁCIÓ (Ellenőrizzük az üres mezőket)
    const nameGroup = document.getElementById('nameGroup');
    const passwordGroup = document.getElementById('passwordGroup');
    const emailInput = document.querySelector('.modal input[type="email"]');
    
    let isEmpty = false;

    // A) Név ellenőrzése (csak ha regisztráció van nyitva)
    if (nameGroup.style.display !== 'none') {
        const nameInput = nameGroup.querySelector('input');
        if (nameInput && nameInput.value.trim() === '') isEmpty = true;
    }

    // B) Email ellenőrzése (ezt mindig kérjük)
    if (emailInput && emailInput.value.trim() === '') isEmpty = true;

    // C) Jelszó ellenőrzése (csak ha nem az elfelejtett jelszó menüben vagyunk)
    if (passwordGroup.style.display !== 'none') {
        const passInput = passwordGroup.querySelector('input[type="password"]');
        if (passInput && passInput.value.trim() === '') isEmpty = true;
    }

    // HA ÜRES VALAMELYIK LÁTHATÓ MEZŐ: Piros hiba és megállítjuk a mentést!
    if (isEmpty) {
        showSaasToast('Hiba: Kérlek töltsd ki az összes adatot!', 'error');
        return; 
    }

    // 2. HA MINDEN KITÖLTVE: Indulhat a mentés szimuláció
    const btn = document.getElementById('modalSubmitBtn');
    const originalText = btn.innerText;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Feldolgozás...';
    btn.style.opacity = '0.8';
    btn.style.pointerEvents = 'none'; // Megakadályozzuk a dupla kattintást
    
    setTimeout(() => {
        // Visszaállítjuk a gombot
        btn.innerHTML = originalText;
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        
        // Ürítjük az inputokat a következő megnyitásra
        const allInputs = document.querySelectorAll('.modal input');
        allInputs.forEach(input => input.value = '');
        
        // Bezárjuk a felugró ablakot
        closeModal();
        
        // Dinamikus, profi UI értesítés
        if (title === 'Üdv újra!') {
            showSaasToast('Sikeres bejelentkezés!', 'success');
        } else if (title === 'Jelszó visszaállítása') {
            showSaasToast('Visszaállító link elküldve az email címedre.', 'info');
        } else {
            showSaasToast('Fiók sikeresen létrehozva!', 'success');
        }
    }, 1200);
}

// =========================================
// TOAST ÉRTESÍTÉSEK
// =========================================
function showSaasToast(message, type = 'success') {
    const toast = document.getElementById("saas-toast");
    if(!toast) return;
    
    toast.innerText = message;
    toast.className = ''; // Letisztítjuk az előző osztályokat
    toast.classList.add(type);
    toast.classList.add("show");
    
    setTimeout(() => { 
        toast.classList.remove("show"); 
    }, 3000);
}

// =========================================
// AUTOMATIKUS AKTÍV MENÜPONT (SaaS)
// =========================================
function setSaaSActiveMenu() {
    let currentUrl = window.location.pathname.split('/').pop();
    
    // Ha a gyökérben vagyunk, a főoldal az aktív (opcionális)
    if (currentUrl === '' || currentUrl === 'demo-saas.html') currentUrl = 'demo-saas.html';

    const menuLinks = document.querySelectorAll('.nav-links .menu-link');
    
    menuLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentUrl) {
            link.classList.add('active');
        }
    });
}

// Futtatás betöltéskor
document.addEventListener('DOMContentLoaded', () => {
    setSaaSActiveMenu();
});