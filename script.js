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


// ===== Three.js 3D Particle Network =====
(function() {
    const container = document.getElementById('particles');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Mouse tracking
    const mouse = { x: 0, y: 0, target: { x: 0, y: 0 } };
    document.addEventListener('mousemove', e => {
        mouse.target.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.target.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // --- Particles ---
    const PARTICLE_COUNT = 120;
    const SPREAD = 40;
    const CONNECTION_DIST = 8;
    const positions = [];
    const velocities = [];
    const sizes = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions.push(
            (Math.random() - 0.5) * SPREAD,
            (Math.random() - 0.5) * SPREAD,
            (Math.random() - 0.5) * SPREAD * 0.6
        );
        velocities.push(
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.005
        );
        sizes.push(Math.random() * 3 + 1.5);
    }

    const particleGeo = new THREE.BufferGeometry();
    const posAttr = new THREE.Float32BufferAttribute(positions, 3);
    particleGeo.setAttribute('position', posAttr);
    particleGeo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const particleMat = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: new THREE.Color(0x00f0ff) },
            uTime: { value: 0 }
        },
        vertexShader: [
            'attribute float size;',
            'uniform float uTime;',
            'varying float vAlpha;',
            'void main() {',
            '    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);',
            '    gl_PointSize = size * (8.0 / -mvPos.z);',
            '    gl_Position = projectionMatrix * mvPos;',
            '    vAlpha = 0.4 + 0.3 * sin(uTime * 1.5 + position.x * 0.5 + position.y * 0.3);',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform vec3 uColor;',
            'varying float vAlpha;',
            'void main() {',
            '    float d = distance(gl_PointCoord, vec2(0.5));',
            '    if (d > 0.5) discard;',
            '    float glow = 1.0 - smoothstep(0.0, 0.5, d);',
            '    gl_FragColor = vec4(uColor, glow * vAlpha);',
            '}'
        ].join('\n'),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- Connection lines ---
    const MAX_CONNECTIONS = 400;
    const linePositions = new Float32Array(MAX_CONNECTIONS * 6);
    const lineColors = new Float32Array(MAX_CONNECTIONS * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    lineGeo.setDrawRange(0, 0);

    const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(linesMesh);

    // --- Decorative wireframe shapes ---
    const icoGeo = new THREE.IcosahedronGeometry(3.5, 1);
    const icoMat = new THREE.MeshBasicMaterial({ color: 0xb066ff, wireframe: true, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    ico.position.set(10, 5, -8);
    scene.add(ico);

    const torusGeo = new THREE.TorusGeometry(2.5, 0.3, 8, 32);
    const torusMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(-12, -6, -5);
    scene.add(torus);

    const octaGeo = new THREE.OctahedronGeometry(2, 0);
    const octaMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending });
    const octa = new THREE.Mesh(octaGeo, octaMat);
    octa.position.set(-8, 8, -10);
    scene.add(octa);

    // --- Resize ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- Animate ---
    let time = 0;
    const cyanColor = new THREE.Color(0x00f0ff);
    const purpleColor = new THREE.Color(0xb066ff);

    function animate() {
        requestAnimationFrame(animate);
        time += 0.016;

        mouse.x += (mouse.target.x - mouse.x) * 0.05;
        mouse.y += (mouse.target.y - mouse.y) * 0.05;

        camera.position.x += (mouse.x * 3 - camera.position.x) * 0.02;
        camera.position.y += (mouse.y * 2 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);

        // Update particles
        const pos = posAttr.array;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;
            pos[i3]     += velocities[i3];
            pos[i3 + 1] += velocities[i3 + 1];
            pos[i3 + 2] += velocities[i3 + 2];
            const half = SPREAD / 2;
            if (Math.abs(pos[i3])     > half) velocities[i3]     *= -1;
            if (Math.abs(pos[i3 + 1]) > half) velocities[i3 + 1] *= -1;
            if (Math.abs(pos[i3 + 2]) > half * 0.6) velocities[i3 + 2] *= -1;
            pos[i3 + 1] += Math.sin(time * 0.8 + pos[i3] * 0.1) * 0.003;
        }
        posAttr.needsUpdate = true;

        // Update connections
        let connIdx = 0;
        for (let i = 0; i < PARTICLE_COUNT && connIdx < MAX_CONNECTIONS; i++) {
            for (let j = i + 1; j < PARTICLE_COUNT && connIdx < MAX_CONNECTIONS; j++) {
                const i3 = i * 3, j3 = j * 3;
                const dx = pos[i3] - pos[j3];
                const dy = pos[i3+1] - pos[j3+1];
                const dz = pos[i3+2] - pos[j3+2];
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                if (dist < CONNECTION_DIST) {
                    const ci = connIdx * 6;
                    linePositions[ci]   = pos[i3];
                    linePositions[ci+1] = pos[i3+1];
                    linePositions[ci+2] = pos[i3+2];
                    linePositions[ci+3] = pos[j3];
                    linePositions[ci+4] = pos[j3+1];
                    linePositions[ci+5] = pos[j3+2];
                    const alpha = 1 - dist / CONNECTION_DIST;
                    const mix = (pos[i3] + SPREAD/2) / SPREAD;
                    const col = cyanColor.clone().lerp(purpleColor, mix);
                    lineColors[ci]   = col.r * alpha;
                    lineColors[ci+1] = col.g * alpha;
                    lineColors[ci+2] = col.b * alpha;
                    lineColors[ci+3] = col.r * alpha;
                    lineColors[ci+4] = col.g * alpha;
                    lineColors[ci+5] = col.b * alpha;
                    connIdx++;
                }
            }
        }
        lineGeo.setDrawRange(0, connIdx * 2);
        lineGeo.attributes.position.needsUpdate = true;
        lineGeo.attributes.color.needsUpdate = true;

        // Rotate shapes
        ico.rotation.x += 0.003; ico.rotation.y += 0.005;
        torus.rotation.x += 0.004; torus.rotation.z += 0.006;
        octa.rotation.y += 0.007; octa.rotation.z += 0.003;

        particleMat.uniforms.uTime.value = time;

        // Theme-aware colors
        const isLight = htmlEl.getAttribute('data-theme') === 'light';
        if (!isLight) {
            particleMat.uniforms.uColor.value.set(0x00f0ff);
            icoMat.color.set(0xb066ff); torusMat.color.set(0x00f0ff); octaMat.color.set(0x00f0ff);
            lineMat.opacity = 0.35;
        } else {
            particleMat.uniforms.uColor.value.set(0x0070d2);
            icoMat.color.set(0x6d28d9); torusMat.color.set(0x0070d2); octaMat.color.set(0x0070d2);
            lineMat.opacity = 0.25;
        }

        renderer.render(scene, camera);
    }
    animate();
})();


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
