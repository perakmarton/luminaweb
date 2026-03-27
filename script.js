document.addEventListener('DOMContentLoaded', () => {

    // --- SÖTÉT MÓD LOGIKA ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    // Inicializálás: ellenőrizzük, hogy volt-e már mentett állapot
    if(localStorage.getItem('main_dark_mode') === 'true') {
        document.body.classList.add('dark-mode');
        if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }

    // A gomb funkciója a globális térben (hogy a HTML-ből hívható legyen a toggleDarkMode())
    window.toggleDarkMode = function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('main_dark_mode', isDark);
        
        if(themeToggleBtn) {
            themeToggleBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    };


    // --- 1. Ragadós Fejléc (Sticky Header Effect) ---
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- 2. Mobil Menü (Hamburger) ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-links a, .nav-btn');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = hamburger.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // --- 3. Görgetési Animációk ---
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in, .fade-up, .slide-in-left, .slide-in-right').forEach(el => observer.observe(el));

    // --- 4. FAQ Harmonika ---
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            if (question && answer) {
                question.addEventListener('click', () => {
                    const isOpen = question.classList.contains('active');
                    faqItems.forEach(otherItem => {
                        const otherQuestion = otherItem.querySelector('.faq-question');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherQuestion && otherAnswer) {
                            otherQuestion.classList.remove('active');
                            otherAnswer.style.maxHeight = null;
                        }
                    });
                    if (!isOpen) {
                        question.classList.add('active');
                        answer.style.maxHeight = answer.scrollHeight + "px";
                    }
                });
            }
        });
    }

    // --- 5. Űrlap választógombok ---
    const selectorGroups = document.querySelectorAll('.selector-group');
    if (selectorGroups.length > 0) {
        selectorGroups.forEach(group => {
            const buttons = group.querySelectorAll('.selector-btn');
            const hiddenInput = group.querySelector('input[type="hidden"]');
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    buttons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    if(hiddenInput) hiddenInput.value = btn.getAttribute('data-value');
                });
            });
        });
    }
});

// =========================================
// PROFI COOKIE KEZELŐ RENDSZER (CMP)
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('pro-cookie-banner');
    
    // Ellenőrizzük, van-e már elmentett beállítás
    const savedConsent = localStorage.getItem('proCookieConsent');
    
    // Ha nincs elmentve, 1 mp múlva felhúzzuk a sávot
    if (!savedConsent && banner) {
        setTimeout(() => { banner.classList.add('show'); }, 1000);
    }
});

// Gomb 1: Mindent elfogad
function acceptAllCookies() {
    const consent = { necessary: true, analytics: true, marketing: true };
    finalizeCookieSave(consent);
}

// Gomb 2: Csak a kötelezők
function rejectAllCookies() {
    const consent = { necessary: true, analytics: false, marketing: false };
    finalizeCookieSave(consent);
}

// Gomb 3: Testreszabás (Megnyitja a Modált)
function openCookieSettings() {
    // Kiolvassuk a jelenlegi beállítást (ha van), hogy a kapcsolók aszerint álljanak
    const saved = JSON.parse(localStorage.getItem('proCookieConsent') || '{"analytics": false, "marketing": false}');
    
    document.getElementById('toggle-analytics').checked = saved.analytics;
    document.getElementById('toggle-marketing').checked = saved.marketing;
    
    document.getElementById('cookie-settings-modal').classList.add('active');
}

function closeCookieSettings() {
    document.getElementById('cookie-settings-modal').classList.remove('active');
}

// Modál Gomb: Részletes beállítások mentése
function saveCookiePreferences() {
    const consent = {
        necessary: true,
        analytics: document.getElementById('toggle-analytics').checked,
        marketing: document.getElementById('toggle-marketing').checked
    };
    finalizeCookieSave(consent);
    closeCookieSettings();
}

// A végső mentés, ami elrejti a sávot is
function finalizeCookieSave(consentObj) {
    // Eltároljuk a gépén a pontos döntést!
    localStorage.setItem('proCookieConsent', JSON.stringify(consentObj));
    
    // Eltüntetjük a sávot
    const banner = document.getElementById('pro-cookie-banner');
    if (banner) banner.classList.remove('show');
    
    console.log("Cookie beállítások mentve:", consentObj);
}

// =========================================
// ÁRAJÁNLATKÉRŐ KÜLDÉSE (Formspree + Prémium Animáció)
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    const quotationForm = document.getElementById('quotation-form');

    if (quotationForm) {
        quotationForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Megállítjuk a hagyományos (oldalfrissítős) beküldést

            const form = event.target;
            const btn = document.getElementById('quotation-submit-btn');
            const originalText = btn.innerHTML;
            const formData = new FormData(form);

            // 1. Gomb animáció indítása (Töltés)
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Küldés folyamatban...';
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.8';

            try {
                // 2. ADATOK KÜLDÉSE A FORMSPREE-NEK (Láthatatlanul, a háttérben)
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // =========================================
                    // 3. SIKERES KÜLDÉS - PRÉMIUM ANIMÁCIÓ INDÍTÁSA
                    // =========================================
                    const premiumOverlay = document.getElementById('premium-success-overlay');
                    if (premiumOverlay) {
                        premiumOverlay.classList.add('active');
                        
                        // Sikeres hang effekt (opcionális, nagyon profi érzés)
                        let successSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
                        successSound.volume = 0.5;
                        successSound.play().catch(e => console.log("Böngésző automatikus némítás bekapcsolva"));
                    }

                    // 4. Űrlap kiürítése a sikeres küldés után
                    form.reset();
                    
                } else {
                    // Ha a Formspree valamiért hibát dob (pl. rossz email formátum)
                    alert("Hiba történt a küldés során. Kérlek ellenőrizd az adatokat és próbáld újra!");
                }
            } catch (error) {
                // Ha megszakad a net
                alert("Szerver hiba. Kérlek ellenőrizd az internetkapcsolatodat!");
            }

            // 5. Gomb visszaállítása eredeti állapotba
            btn.innerHTML = originalText;
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
        });
    }
});

// Függvény a prémium ablak bezárásához (A "Rendben, köszi!" gombra kattintva)
function closePremiumSuccess() {
    const overlay = document.getElementById('premium-success-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px', // Akkor vált, ha a szekció a képernyő felső részénél jár
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // Először mindenkitől levesszük az active-ot
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    // Megfigyeljük az összes szekciót, aminek van ID-ja
    sections.forEach(section => {
        observer.observe(section);
    });
});

