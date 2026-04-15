const menuToggle = document.querySelector("[data-menu-toggle]");
const navPanel = document.querySelector("[data-nav-panel]");
const scrollIndicator = document.querySelector("[data-scroll-indicator]");

function setMenuOpen(isOpen) {
    if (!menuToggle) {
        return;
    }

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
}

if (menuToggle && navPanel) {
    menuToggle.addEventListener("click", () => {
        const expanded = menuToggle.getAttribute("aria-expanded") === "true";
        setMenuOpen(!expanded);
    });

    navPanel.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            setMenuOpen(false);
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 720) {
            setMenuOpen(false);
        }
    });
}

function updateScrollIndicator() {
    if (!scrollIndicator) {
        return;
    }

    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
    scrollIndicator.style.transform = `scaleX(${progress})`;
}

updateScrollIndicator();
window.addEventListener("scroll", updateScrollIndicator, { passive: true });
