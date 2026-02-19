/* ========================================
   FUTURISTIC PORTFOLIO — INTERACTIVITY
   ======================================== */

// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const htmlEl = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'dark';
htmlEl.setAttribute('data-theme', savedTheme);

function isLightMode() {
    return htmlEl.getAttribute('data-theme') === 'light';
}

themeToggle.addEventListener('click', () => {
    const newTheme = isLightMode() ? 'dark' : 'light';
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});


// ===== Particle System =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.5 ? '0, 240, 255' : '176, 102, 255';
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Mouse interaction
        if (mouse.x !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (120 - dist) / 120;
                this.x -= (dx / dist) * force * 1.5;
                this.y -= (dy / dist) * force * 1.5;
            }
        }

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.fill();
    }
}

function initParticles() {
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
    particles = [];
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}
initParticles();
window.addEventListener('resize', initParticles);

function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140) {
                const opacity = (1 - dist / 140) * 0.15;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    drawConnections();
    requestAnimationFrame(animateParticles);
}
animateParticles();


// ===== Navigation =====
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
});

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
    });
});


// ===== Typing Effect =====
const typingElement = document.getElementById('typingText');
const titles = [
    'AI Engineer',
    'Machine Learning Specialist',
    'Data Scientist',
    'Deep Learning Researcher',
    'Applied Mathematician'
];
let titleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    const currentTitle = titles[titleIndex];

    if (isDeleting) {
        typingElement.textContent = currentTitle.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingElement.textContent = currentTitle.substring(0, charIndex + 1);
        charIndex++;
    }

    let speed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentTitle.length) {
        speed = 2200;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        speed = 500;
    }

    setTimeout(typeEffect, speed);
}
typeEffect();


// ===== Scroll Reveal =====
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));


// ===== Animated Counters =====
const statNumbers = document.querySelectorAll('.stat-number');

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.getAttribute('data-target'));
            animateCounter(entry.target, target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(num => counterObserver.observe(num));

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
}


// ===== Skill Bar Animation =====
const skillFills = document.querySelectorAll('.skill-fill');

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const width = entry.target.getAttribute('data-width');
            entry.target.style.width = width + '%';
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

skillFills.forEach(fill => skillObserver.observe(fill));


// ===== Project Filtering =====
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
            const categories = card.getAttribute('data-category').split(' ');
            if (filter === 'all' || categories.includes(filter)) {
                card.classList.remove('hidden');
                card.style.animation = 'fadeInUp 0.5s ease-out forwards';
            } else {
                card.classList.add('hidden');
            }
        });
    });
});


// ===== Contact Form =====
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<span>Message Sent! ✓</span>';
    btn.style.background = 'linear-gradient(135deg, #00ff88, #00ccff)';

    setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.style.background = '';
        contactForm.reset();
    }, 3000);
});


// ===== Smooth Scroll for CTA buttons =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});


// ===== Project Card Glow Follow Mouse =====
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const glow = card.querySelector('.project-card-glow');
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        glow.style.left = `${x - rect.width}px`;
        glow.style.top = `${y - rect.height}px`;
    });
});


// ===== Neural Network Canvas Animation =====
const nnCanvas = document.getElementById('nnCanvas');
if (nnCanvas) {
    const nnCtx = nnCanvas.getContext('2d');
    let nnFrame = 0;

    function resizeNN() {
        nnCanvas.width = nnCanvas.parentElement.offsetWidth;
        nnCanvas.height = 350;
    }
    resizeNN();
    window.addEventListener('resize', resizeNN);

    const layers = [4, 6, 8, 10, 8, 6, 4, 2];

    function drawNN() {
        nnCtx.clearRect(0, 0, nnCanvas.width, nnCanvas.height);
        nnFrame++;

        const padding = 60;
        const layerSpacing = (nnCanvas.width - padding * 2) / (layers.length - 1);
        const nodePositions = [];

        // Calculate positions
        layers.forEach((count, li) => {
            const x = padding + li * layerSpacing;
            const nodeSpacing = (nnCanvas.height - padding * 2) / (count + 1);
            const layerNodes = [];
            for (let ni = 0; ni < count; ni++) {
                layerNodes.push({ x, y: padding + (ni + 1) * nodeSpacing });
            }
            nodePositions.push(layerNodes);
        });

        // Draw connections
        for (let li = 0; li < nodePositions.length - 1; li++) {
            for (let ni = 0; ni < nodePositions[li].length; ni++) {
                for (let nj = 0; nj < nodePositions[li + 1].length; nj++) {
                    const from = nodePositions[li][ni];
                    const to = nodePositions[li + 1][nj];
                    const pulse = Math.sin(nnFrame * 0.02 + li * 0.5 + ni * 0.3 + nj * 0.2) * 0.5 + 0.5;
                    nnCtx.beginPath();
                    nnCtx.moveTo(from.x, from.y);
                    nnCtx.lineTo(to.x, to.y);
                    nnCtx.strokeStyle = `rgba(0, 240, 255, ${0.03 + pulse * 0.08})`;
                    nnCtx.lineWidth = 0.5 + pulse * 0.5;
                    nnCtx.stroke();
                }
            }
        }

        // Draw nodes
        nodePositions.forEach((layer, li) => {
            layer.forEach((node, ni) => {
                const pulse = Math.sin(nnFrame * 0.03 + li + ni * 0.5) * 0.5 + 0.5;
                const r = 3 + pulse * 3;

                // Glow
                const grad = nnCtx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 4);
                grad.addColorStop(0, `rgba(0, 240, 255, ${0.2 + pulse * 0.3})`);
                grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
                nnCtx.fillStyle = grad;
                nnCtx.beginPath();
                nnCtx.arc(node.x, node.y, r * 4, 0, Math.PI * 2);
                nnCtx.fill();

                // Node
                nnCtx.beginPath();
                nnCtx.arc(node.x, node.y, r, 0, Math.PI * 2);
                nnCtx.fillStyle = `rgba(0, 240, 255, ${0.6 + pulse * 0.4})`;
                nnCtx.fill();
            });
        });

        // Draw signal pulse traveling through the network
        const signalLayer = (nnFrame * 0.015) % layers.length;
        const layerIdx = Math.floor(signalLayer);
        const progress = signalLayer - layerIdx;
        if (layerIdx < nodePositions.length - 1) {
            const fromLayer = nodePositions[layerIdx];
            const toLayer = nodePositions[layerIdx + 1];
            const fromNode = fromLayer[Math.floor(fromLayer.length / 2)];
            const toNode = toLayer[Math.floor(toLayer.length / 2)];
            const sx = fromNode.x + (toNode.x - fromNode.x) * progress;
            const sy = fromNode.y + (toNode.y - fromNode.y) * progress;
            const sGrad = nnCtx.createRadialGradient(sx, sy, 0, sx, sy, 20);
            sGrad.addColorStop(0, 'rgba(176, 102, 255, 0.8)');
            sGrad.addColorStop(1, 'rgba(176, 102, 255, 0)');
            nnCtx.fillStyle = sGrad;
            nnCtx.beginPath();
            nnCtx.arc(sx, sy, 20, 0, Math.PI * 2);
            nnCtx.fill();
        }

        requestAnimationFrame(drawNN);
    }
    drawNN();
}
