// --- Starfield Canvas Setup ---
let canvas, ctx;
let stars = [];
// Adaptive star check (will be set after DOM loads)
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
let numStars = isMobile ? 300 : 600; // default, may be recalculated on init

function setCanvasSize() {
    // Use the full document height so the starfield extends past the viewport
    canvas.width = document.documentElement.scrollWidth || window.innerWidth;
    canvas.height = Math.max(document.documentElement.scrollHeight, window.innerHeight);
}

function initializeStars() {
    stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.2,
            alpha: Math.random() * 0.5 + 0.2
        });
    }
}

function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();
    });
}

window.addEventListener('resize', () => {
    // Update isMobile on resize (e.g. orientation change)
    isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    numStars = isMobile ? 300 : 600;
    setCanvasSize();
    initializeStars();
    drawStars(); // Redraw stars on resize
});

// If the document height changes (e.g., content loads or user scrolls),
// ensure canvas covers the full document and redraw stars when needed.
window.addEventListener('scroll', () => {
    // Only resize if document height grew beyond current canvas height
    const docH = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    if (docH > canvas.height) {
        setCanvasSize();
        initializeStars();
        drawStars();
    }
});

// Defer all DOM-dependent initialization to an init() routine so it can
// run whether DOMContentLoaded has already fired or not.
function init() {
    // Query DOM elements that the script depends on
    canvas = document.getElementById('starfield');
    if (canvas) ctx = canvas.getContext('2d');

    // Query SVG elements after DOM is ready so they exist when used
    pathElement = document.getElementById('gaussianPath');
    pointsContainer = document.getElementById('dataPointsContainer');

    // Re-evaluate mobile sizing now that we know viewport
    isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    numStars = isMobile ? 300 : 600;

    setCanvasSize();
    initializeStars();
    drawStars();

    // Hook up elements used elsewhere
    // (safe to query now)
    // --- Internationalization (EN / PT) ---
    const translations = {
        en: {
            'nav.about': 'About',
            'nav.services': 'Services',
            'nav.cta': 'Get in Touch',
            'brand': 'Gauss',
            'tagline': 'Reaching beyond the average',
            'about.heading': 'About Us',
            'about.text': `We are a multidisciplinary team of four professionals, master's finalists from FEUP, bringing together expertise in industrial engineering, industrial management, software engineering, artificial intelligence, and data science. With hands-on experience in projects at FEUP, INESCTEC, and JuniFEUP, we are now seeking pilot projects that offer high impact and significant opportunities for growth. We specialize in addressing complex logistical and operational challenges through AI-driven solutions, process optimization, and custom software development—delivering real value where our competencies matter most.`,
            'services.heading': 'Our Services',
            'services.tagline': 'From chaos to clarity—optimal solutions for complex problems',
            'services.h3': 'Consultancy & Industrial Optimization',
            'services.p': 'We focus on industrial engineering and optimization across operations, logistics and maintenance — practical, measurable improvements delivered through consultancy.',
            'services.li1': '<strong>Supply chain & inventory optimization</strong> — network design, inventory policies and routing to lower costs and increase service levels.',
            'services.li2': '<strong>Process and operational optimization</strong> — time studies, value‑stream mapping and throughput improvements.',
            'services.li3': '<strong>Maintenance & reliability engineering</strong> — failure mode analysis, predictive maintenance strategies, spare‑parts optimization.',
            'services.li4': '<strong>Production planning & scheduling</strong> — robust plans that align capacity, constraints and demand variability.',
            'services.li5': '<strong>Decision support & analytics</strong> — clear KPIs, dashboards and scenario analysis to support management decisions.',
            'services.cta': 'Contact Us',
            'contact.heading': 'Get in Touch',
            'contact.p': "We'd love to hear about your project. Reach out with a brief description of your challenge and we'll follow up with a tailored approach and next steps.",
            'contact.email': '<strong>Email:</strong> contact@gauss.pt',
            'footer.line1': '<strong>Gauss</strong> — Turning data into decisions.',
            'footer.line2': '© 2025 Gauss. All rights reserved.'
        },
        pt: {
            'nav.about': 'Sobre',
            'nav.services': 'Serviços',
            'nav.cta': 'Contacte-nos',
            'brand': 'Gauss',
            'tagline': 'Ir além da média',
            'about.heading': 'Sobre Nós',
            'about.text': `Somos uma equipa multidisciplinar de quatro profissionais, finalistas de mestrado na FEUP, com competências em engenharia industrial, gestão industrial, <em>software engineering</em>, <em>artificial intelligence</em> e <em>data science</em>. Com experiência prática em projetos na FEUP, INESCTEC e JuniFEUP, procuramos projetos-piloto de alto impacto com potencial de crescimento. Especializamo-nos em resolver desafios logísticos e operacionais complexos através de soluções orientadas por <em>AI</em>, otimização de processos e desenvolvimento de <em>custom software</em>, entregando valor mensurável onde as nossas competências fazem diferença.`,
            'services.heading': 'Serviços',
            'services.tagline': 'Da incerteza à clareza—soluções ótimas para problemas complexos',
            'services.h3': 'Consultoria & Otimização Industrial',
            'services.p': 'Focamo-nos em engenharia industrial e otimização nas operações, logística e manutenção — melhorias práticas e mensuráveis entregues por consultoria.',
            'services.li1': '<strong>Otimização da cadeia de abastecimento e inventário</strong> — desenho de rede, políticas de inventário e rotas para reduzir custos e aumentar níveis de serviço.',
            'services.li2': '<strong>Otimização de processos e operações</strong> — estudos de tempos, mapeamento de <em>value‑stream</em> e melhorias de throughput.',
            'services.li3': '<strong>Manutenção & engenharia de fiabilidade</strong> — análise de modos de falha, estratégias de manutenção preditiva e otimização de stocks de peças.',
            'services.li4': '<strong>Planeamento e programação de produção</strong> — planos robustos que alinham capacidade, restrições e variabilidade da procura.',
            'services.li5': '<strong>Suporte à decisão & analytics</strong> — KPIs claros, <em>dashboards</em> e análise de cenários para suportar decisões de gestão.',
            'services.cta': 'Contacte-nos',
            'contact.heading': 'Contacte-nos',
            'contact.p': 'Queremos saber sobre o seu projeto. Envie-nos uma breve descrição do desafio e responderemos com uma abordagem personalizada e próximos passos.',
            'contact.email': '<strong>Email:</strong> contact@gauss.pt',
            'footer.line1': '<strong>Gauss</strong> — Transformamos dados em decisões.',
            'footer.line2': '© 2025 Gauss. Todos os direitos reservados.'
        }
    };

    function applyTranslations(lang) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = (translations[lang] && translations[lang][key]) ? translations[lang][key] : (translations['en'][key] || '');
            // allow HTML in translations (we control the strings)
            el.innerHTML = val;
        });

        // mark active language button
        document.querySelectorAll('.lang-switch').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
    }

    // wire language buttons
    document.querySelectorAll('.lang-switch').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const chosen = btn.dataset.lang;
            localStorage.setItem('site_lang', chosen);
            applyTranslations(chosen);
        });
    });

    // choose initial language (persisted or from navigator)
    const saved = localStorage.getItem('site_lang');
    const browserPref = (navigator.language || navigator.userLanguage || 'en').startsWith('pt') ? 'pt' : 'en';
    const initialLang = saved || browserPref || 'en';
    applyTranslations(initialLang);

    // start the curve + points animation loop
    amplitude = computeAmplitude(stdDev);
    updateCurve();

    // Start data point spawning interval (ensure only one interval)
    if (!window.__dataPointInterval) {
        window.__dataPointInterval = setInterval(() => {
            addDataPoint();
        }, isMobile ? 180 : 120);
    }
}

// Ensure init() runs whether DOMContentLoaded already fired or not.
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// --- Curve Interaction ---
const svgNS = "http://www.w3.org/2000/svg";
// Defer querying these SVG elements until the DOM is ready to avoid
// null references when the script runs before the elements exist.
let pathElement;
let pointsContainer;

const width = 1400;
const height = 600;
// Start with a smaller stdDev so the initial peak is much higher
let stdDev = 40;
let amplitude = 280;
const baseline = 500;
let mean = width / 2;

// --- Amplitude control ---
const MIN_STDDEV = 40;   // smallest allowed std deviation (keeps peak visible)
const MAX_STDDEV = 300;  // largest allowed std deviation
const MAX_AMPLITUDE = 700; // maximum pixel height for peak (increased for larger magnitude)
const MIN_AMPLITUDE = 80;  // minimum pixel height for peak
 
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function computeAmplitude(std) {
    // Clamp std to sensible bounds to avoid extreme peaks
    const s = clamp(std, MIN_STDDEV, MAX_STDDEV);
    // Gaussian PDF peak value at mean: 1/(s * sqrt(2*pi))
    const pdfAtS = 1 / (s * Math.sqrt(2 * Math.PI));
    const pdfAtMin = 1 / (MIN_STDDEV * Math.sqrt(2 * Math.PI));
    const normalized = pdfAtS / pdfAtMin; // between ~0 and 1
    // Add a small bias so that middle/std values map to a slightly higher peak.
    const bias = 0.32; // emphasize the peak a bit more
    const amp = (normalized * (1 - bias) + bias) * MAX_AMPLITUDE;
    return clamp(amp, MIN_AMPLITUDE, MAX_AMPLITUDE);
}

function generatePath(currentMean, currentStdDev, currentAmplitude) {
  let path = 'M 0 ' + (baseline - (currentAmplitude * Math.exp(-Math.pow(0 - currentMean, 2) / (2 * Math.pow(currentStdDev, 2)))));
  for (let x = 1; x <= width; x += 5) {
    const exponent = -Math.pow(x - currentMean, 2) / (2 * Math.pow(currentStdDev, 2));
    const y = baseline - (currentAmplitude * Math.exp(exponent));
    path += ` L ${x} ${y}`;
  }
  return path;
}

// --- Mouse Interaction ---
const cursorDot = document.querySelector('.cursor-dot');
let lastKnownMouseX = window.innerWidth / 2;
let lastKnownMouseY = window.innerHeight / 2;

// Throttle cursor updates for better performance
let cursorUpdateScheduled = false;
window.addEventListener('mousemove', (e) => {
    lastKnownMouseX = e.clientX;
    lastKnownMouseY = e.clientY;
    
    if (!cursorUpdateScheduled && !isMobile) {
        cursorUpdateScheduled = true;
        requestAnimationFrame(() => {
            cursorDot.style.left = `${lastKnownMouseX}px`;
            cursorDot.style.top = `${lastKnownMouseY}px`;
            cursorUpdateScheduled = false;
        });
    }
});

// Touch support for mobile
if (isMobile) {
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            lastKnownMouseX = e.touches[0].clientX;
            lastKnownMouseY = e.touches[0].clientY;
        }
    }, { passive: true });
}

function updateCurve() {
    const targetMean = (lastKnownMouseX / window.innerWidth) * (width - 400) + 200;
    mean += (targetMean - mean) * 0.1;

    const targetStdDev = 100 + (lastKnownMouseY / window.innerHeight) * 200;
    stdDev += (targetStdDev - stdDev) * 0.1;

    // Recompute amplitude from a stable, clamped function so the peak
    // never grows uncontrollably when stdDev becomes very small.
    amplitude = computeAmplitude(stdDev);

    pathElement.setAttribute('d', generatePath(mean, stdDev, amplitude));
    
    // Always update and draw data points
    updateDataPoints();
    drawDataPoints();
    
    requestAnimationFrame(updateCurve);
}

// --- Data Points on Curve ---
const dataPoints = [];
const MAX_POINTS = isMobile ? 40 : 60; // Fewer points on mobile for better performance
const POINT_LIFETIME = 1500; // milliseconds (reduced from 3000)
const ENTRY_DURATION = 400; // milliseconds for entry animation
const EXIT_DURATION = 400; // milliseconds for exit animation

function addDataPoint() {
    // Sample from Gaussian distribution: use Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    // Map z to x coordinate based on current mean and stdDev
    const targetX = mean + z * stdDev;
    
    // Only add if within reasonable bounds
    if (targetX >= -200 && targetX <= width + 200) {
        const exponent = -Math.pow(targetX - mean, 2) / (2 * Math.pow(stdDev, 2));
        const targetY = baseline - (amplitude * Math.exp(exponent));
        
        // Diagonal shooting star: enter and exit following the same path
        const fromLeft = targetX < width / 2;
        const startX = fromLeft ? targetX - 150 : targetX + 150;
        const startY = targetY - 150; // start above the curve
        
        // Exit follows the same path in reverse (back to where it came from)
        const exitX = fromLeft ? targetX - 150 : targetX + 150;
        const exitY = targetY - 150; // exit back above the curve
        
        dataPoints.push({
            startX: startX,
            startY: startY,
            targetX: targetX,
            targetY: targetY,
            exitX: exitX,
            exitY: exitY,
            currentX: startX,
            currentY: startY,
            opacity: 0,
            createdAt: Date.now()
        });
        
        // Keep max points limit
        if (dataPoints.length > MAX_POINTS) {
            dataPoints.shift();
        }
    }
}

function updateDataPoints() {
    const now = Date.now();
    
    // Update and remove expired points
    for (let i = dataPoints.length - 1; i >= 0; i--) {
        const point = dataPoints[i];
        const age = now - point.createdAt;
        
        if (age > POINT_LIFETIME) {
            dataPoints.splice(i, 1);
        } else if (age < ENTRY_DURATION) {
            // Entry animation: diagonal entry like a shooting star from top
            const progress = age / ENTRY_DURATION;
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            point.currentX = point.startX + (point.targetX - point.startX) * eased;
            point.currentY = point.startY + (point.targetY - point.startY) * eased;
            point.opacity = progress;
        } else if (age > POINT_LIFETIME - EXIT_DURATION) {
            // Exit animation: diagonal exit like a shooting star to bottom
            const exitAge = age - (POINT_LIFETIME - EXIT_DURATION);
            const progress = exitAge / EXIT_DURATION;
            const eased = Math.pow(progress, 3); // ease-in cubic
            
            point.currentX = point.targetX + (point.exitX - point.targetX) * eased;
            point.currentY = point.targetY + (point.exitY - point.targetY) * eased;
            point.opacity = 1 - progress;
        } else {
            // Stay at target position
            point.currentX = point.targetX;
            point.currentY = point.targetY;
            point.opacity = 1;
        }
    }
}

// Cache for circle elements to avoid recreating
let circleElements = [];

function drawDataPoints() {
    const container = pointsContainer || document.getElementById('dataPointsContainer');
    if (!container) return; // nothing to draw yet
    
    // Reuse existing circles or create new ones as needed
    while (circleElements.length < dataPoints.length) {
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('r', 3);
        container.appendChild(circle);
        circleElements.push(circle);
    }
    
    // Hide extra circles
    while (circleElements.length > dataPoints.length) {
        const circle = circleElements.pop();
        container.removeChild(circle);
    }
    
    // Update circle positions and opacity
    dataPoints.forEach((point, i) => {
        const circle = circleElements[i];
        circle.setAttribute('cx', point.currentX);
        circle.setAttribute('cy', point.currentY);
        circle.setAttribute('fill', `rgba(139, 92, 246, ${point.opacity * 0.8})`);
    });
}

// NOTE: spawning interval is started from DOMContentLoaded to avoid running before DOM is ready

// --- Mobile Menu Toggle ---
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navCenter = document.getElementById('navCenter');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navCenter.classList.toggle('active');
        mobileMenuOverlay.classList.toggle('active');
        mobileMenuOverlay.style.display = navCenter.classList.contains('active') ? 'block' : 'none';
    });
    
    // Close menu when clicking overlay
    mobileMenuOverlay.addEventListener('click', () => {
        mobileMenuToggle.classList.remove('active');
        navCenter.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        mobileMenuOverlay.style.display = 'none';
    });
    
    // Close menu when clicking a nav link
    document.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navCenter.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            mobileMenuOverlay.style.display = 'none';
        });
    });
}

// --- Initializations ---
// Initialization (canvas, stars, amplitude, and animation loop) is
// handled inside the DOMContentLoaded handler to ensure any DOM
// elements (SVG path, containers) are present before use.