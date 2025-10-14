// --- Starfield Canvas Setup ---
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let stars = [];
// Adaptive star count based on device
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
const numStars = isMobile ? 300 : 600; // Reduced for better performance
let animationPaused = false;

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

window.addEventListener('DOMContentLoaded', () => {
    setCanvasSize();
    initializeStars();
    drawStars();
});

// --- Curve Interaction ---
const svgNS = "http://www.w3.org/2000/svg";
const pathElement = document.getElementById('gaussianPath');
const pointsContainer = document.getElementById('dataPointsContainer');

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
    if (!animationPaused) {
        const targetMean = (lastKnownMouseX / window.innerWidth) * (width - 400) + 200;
        mean += (targetMean - mean) * 0.1;

        const targetStdDev = 100 + (lastKnownMouseY / window.innerHeight) * 200;
        stdDev += (targetStdDev - stdDev) * 0.1;

        // Recompute amplitude from a stable, clamped function so the peak
        // never grows uncontrollably when stdDev becomes very small.
        amplitude = computeAmplitude(stdDev);

        pathElement.setAttribute('d', generatePath(mean, stdDev, amplitude));
    }
    
    // Always update and draw data points
    updateDataPoints();
    drawDataPoints();
    
    requestAnimationFrame(updateCurve);
}

// --- Stop Button ---
const stopButton = document.getElementById('stop-button');
stopButton.innerHTML = '⏸'; // pause symbol
stopButton.addEventListener('click', () => {
    animationPaused = !animationPaused;
    stopButton.innerHTML = animationPaused ? '▶' : '⏸'; // play or pause
});

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
        
        // If animation is paused, preserve the current state
        if (animationPaused) {
            // Store the age when paused to resume correctly later
            if (!point.pausedAt) {
                point.pausedAt = age;
            }
            continue; // Skip all position/opacity updates
        } else if (point.pausedAt) {
            // Resume: adjust createdAt to maintain the same age as when paused
            point.createdAt = now - point.pausedAt;
            point.pausedAt = null;
        }
        
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
    const container = document.getElementById('dataPointsContainer');
    
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

// Add new point periodically
setInterval(() => {
    if (!animationPaused) {
        addDataPoint();
    }
}, isMobile ? 180 : 120); // Slower spawn rate on mobile

// --- Initializations ---
setCanvasSize();
initializeStars();
drawStars(); // Draw the stars initially
// Initialize amplitude based on starting stdDev and start animation
amplitude = computeAmplitude(stdDev);
updateCurve();