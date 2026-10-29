/* ==========================================================================
   1. ESTADO GLOBAL (IDIOMA E TEMA COM PERSISTÊNCIA)
   ========================================================================== */
const htmlEl = document.documentElement;
const langBtn = document.getElementById("lang-toggle");
const flagIcon = document.getElementById("flag-icon");
const langText = document.getElementById("lang-text");
const themeBtn = document.getElementById("theme-toggle");
const themeText = document.getElementById("theme-text");
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mainNav = document.getElementById("main-nav");

let currentLang = localStorage.getItem("portfolio_lang") || "pt";
let currentTheme = localStorage.getItem("portfolio_theme") || "dark";

/* ==========================================================================
   2. FUNDO ANIMADO DE REDE DE PARTÍCULAS (CANVAS)
   ========================================================================== */
const canvas = document.getElementById("network-bg");
const ctx = canvas.getContext("2d");

let particles = [];
const mouse = { x: null, y: null, radius: 150 };

window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.6 + 1.2;
        this.speedX = (Math.random() - 0.5) * 0.65;
        this.speedY = (Math.random() - 0.5) * 0.65;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
        const isLight = currentTheme === "light";
        ctx.fillStyle = isLight
            ? "rgba(79, 70, 229, 0.55)"
            : "rgba(148, 163, 184, 0.82)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const area = canvas.width * canvas.height;
    const total = Math.min(95, Math.max(38, Math.floor(area / 14500)));

    for (let i = 0; i < total; i++) {
        particles.push(new Particle());
    }
}

function connectParticles() {
    const isLight = currentTheme === "light";
    const maxDist = 140;

    for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
            const dx = particles[a].x - particles[b].x;
            const dy = particles[a].y - particles[b].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDist) {
                const alpha = (1 - distance / maxDist) * (isLight ? 0.25 : 0.32);
                ctx.strokeStyle = isLight
                    ? `rgba(79, 70, 229, ${alpha})`
                    : `rgba(99, 102, 241, ${alpha})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }

        // Conexão interativa com o cursor
        if (mouse.x !== null && mouse.y !== null) {
            const mdx = particles[a].x - mouse.x;
            const mdy = particles[a].y - mouse.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mDist < mouse.radius) {
                const mAlpha = (1 - mDist / mouse.radius) * 0.45;
                ctx.strokeStyle = isLight
                    ? `rgba(8, 145, 178, ${mAlpha})`
                    : `rgba(34, 211, 238, ${mAlpha})`;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
        p.update();
        p.draw();
    });

    connectParticles();
    requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
    resizeCanvas();
    initParticles();
});

resizeCanvas();
initParticles();
animate();

/* ==========================================================================
   3. ALTERNÂNCIA DE TEMA (CLARO E ESCURO)
   ========================================================================== */
function updateThemeUI() {
    htmlEl.setAttribute("data-theme", currentTheme);
    document.body.classList.toggle("light-mode", currentTheme === "light");

    if (themeText) {
        if (currentTheme === "dark") {
            themeText.dataset.pt = "Claro";
            themeText.dataset.en = "Light";
        } else {
            themeText.dataset.pt = "Escuro";
            themeText.dataset.en = "Dark";
        }
        themeText.textContent = themeText.dataset[currentLang];
    }
}

if (themeBtn) {
    themeBtn.addEventListener("click", () => {
        currentTheme = currentTheme === "dark" ? "light" : "dark";
        localStorage.setItem("portfolio_theme", currentTheme);
        updateThemeUI();
    });
}

/* ==========================================================================
   4. ALTERNÂNCIA DE IDIOMA (PORTUGUÊS / INGLÊS)
   ========================================================================== */
function updateLanguage() {
    htmlEl.setAttribute("lang", currentLang === "pt" ? "pt-BR" : "en");

    const elements = document.querySelectorAll("[data-pt][data-en]");
    elements.forEach((el) => {
        el.textContent = el.dataset[currentLang];
    });

    const inputs = document.querySelectorAll("[data-placeholder-pt][data-placeholder-en]");
    inputs.forEach((input) => {
        input.placeholder = currentLang === "pt"
            ? input.dataset.placeholderPt
            : input.dataset.placeholderEn;
    });

    if (currentLang === "pt") {
        flagIcon.src = "https://flagcdn.com/w20/us.png";
        langText.textContent = "EN";
    } else {
        flagIcon.src = "https://flagcdn.com/w20/br.png";
        langText.textContent = "PT";
    }

    updateThemeUI();
}

if (langBtn) {
    langBtn.addEventListener("click", () => {
        currentLang = currentLang === "pt" ? "en" : "pt";
        localStorage.setItem("portfolio_lang", currentLang);
        updateLanguage();
        resetTypingEffect();
    });
}

/* ==========================================================================
   5. EFEITO DE DIGITAÇÃO (TYPING EFFECT BILINGUE)
   ========================================================================== */
const typingElement = document.getElementById("typing-text");
const typingPhrases = {
    pt: [
        "Redes de Computadores & Cibersegurança",
        "Estudante de Ciência da Computação (5º Período)",
        "Desenvolvedor Python, C & TypeScript",
        "Gestão de Vulnerabilidades (CVEs) & SecOps",
        "Infraestrutura, Virtualização & Linux"
    ],
    en: [
        "Computer Networks & Cybersecurity",
        "Computer Science Student (5th Semester)",
        "Python, C & TypeScript Developer",
        "Vulnerability Management (CVEs) & SecOps",
        "Infrastructure, Virtualization & Linux"
    ]
};

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingTimeout = null;

function runTypingEffect() {
    if (!typingElement) return;
    const list = typingPhrases[currentLang] || typingPhrases.pt;
    const currentPhrase = list[phraseIndex % list.length];

    if (isDeleting) {
        charIndex--;
        typingElement.textContent = currentPhrase.substring(0, charIndex);
    } else {
        charIndex++;
        typingElement.textContent = currentPhrase.substring(0, charIndex);
    }

    let delay = isDeleting ? 35 : 70;

    if (!isDeleting && charIndex === currentPhrase.length) {
        delay = 1900;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % list.length;
        delay = 350;
    }

    typingTimeout = setTimeout(runTypingEffect, delay);
}

function resetTypingEffect() {
    if (typingTimeout) clearTimeout(typingTimeout);
    charIndex = 0;
    isDeleting = false;
    runTypingEffect();
}

/* ==========================================================================
   6. FILTRO DE PROJETOS POR CATEGORIA
   ========================================================================== */
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".projeto");

filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.dataset.filter;
        projectCards.forEach((card) => {
            const categories = card.dataset.category || "";
            if (filter === "all" || categories.includes(filter)) {
                card.classList.remove("hidden");
            } else {
                card.classList.add("hidden");
            }
        });
    });
});

/* ==========================================================================
   7. MENU MOBILE E SCROLL REVEAL / NAVEGAÇÃO ATIVA
   ========================================================================== */
if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("open");
        mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    mainNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("open");
            mobileMenuBtn.setAttribute("aria-expanded", "false");
        });
    });
}

const revealElements = document.querySelectorAll(".scroll-reveal");
const sections = document.querySelectorAll("main > section");
const navLinks = document.querySelectorAll(".nav-link");

function handleScroll() {
    const windowHeight = window.innerHeight;

    revealElements.forEach((el) => {
        const elementTop = el.getBoundingClientRect().top;
        if (elementTop < windowHeight - 80) {
            el.classList.add("visible");
        }
    });

    let currentSectionId = "sobre";
    sections.forEach((section) => {
        const top = section.offsetTop - 160;
        if (window.scrollY >= top) {
            currentSectionId = section.getAttribute("id");
        }
    });

    navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${currentSectionId}`);
    });
}

window.addEventListener("scroll", handleScroll);
window.addEventListener("load", () => {
    updateLanguage();
    updateThemeUI();
    runTypingEffect();
    handleScroll();
});
