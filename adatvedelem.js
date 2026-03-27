// =========================================
// ADATVÉDELEM LOGIKA (ScrollSpy Effekt)
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.toc-link');

    // Finom görgetés (Smooth Scroll) kattintáskor
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80, // Helyhagyás a rögzített fejlécnek
                    behavior: 'smooth'
                });
            }
        });
    });

    // Az aktív menüpont frissítése görgetés közben (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // Akkor vált, ha a szekció eléri a képernyő felső-középső részét
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Eltávolítjuk az active class-t az összesről
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Hozzáadjuk ahhoz, amelyik ID-ja megegyezik az épp látható szekcióéval
                const activeLink = document.querySelector(`.toc-link[href="#${entry.target.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    // Figyeljük az összes szekciót
    sections.forEach(section => {
        observer.observe(section);
    });
});