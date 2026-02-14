/* =========================
   EYES: follow cursor + blink
   ========================= */

const eyes = Array.from(document.querySelectorAll(".eye"));
const pupils = Array.from(document.querySelectorAll(".pupil"));

let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

function setPointer(x, y) {
  pointer.x = x;
  pointer.y = y;
}

window.addEventListener("mousemove", (e) => setPointer(e.clientX, e.clientY), { passive: true });
window.addEventListener("touchmove", (e) => {
  const t = e.touches?.[0];
  if (t) setPointer(t.clientX, t.clientY);
}, { passive: true });

function animateEyes() {
  pupils.forEach((pupil, i) => {
    const eye = eyes[i];
    if (!eye) return;

    const rect = eye.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = pointer.x - cx;
    const dy = pointer.y - cy;

    const max = Math.min(rect.width, rect.height) * 0.18;
    const angle = Math.atan2(dy, dx);
    const dist = Math.min(max, Math.hypot(dx, dy) / 14);

    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;

    pupil.style.transform = `translate(${x}px, ${y}px)`;
  });

  requestAnimationFrame(animateEyes);
}
requestAnimationFrame(animateEyes);

function blinkOnce() {
  eyes.forEach((eye) => eye.classList.add("blink"));
  setTimeout(() => {
    eyes.forEach((eye) => eye.classList.remove("blink"));
  }, 140);
}

function randomBlinkLoop() {
  const next = 1800 + Math.random() * 2200;
  setTimeout(() => {
    blinkOnce();
    if (Math.random() < 0.2) setTimeout(blinkOnce, 220);
    randomBlinkLoop();
  }, next);
}
randomBlinkLoop();

// Blink on click (cute)
window.addEventListener("mousedown", blinkOnce);

/* =========================
   JELLYFISH BACKGROUND
   ========================= */

const canvas = document.getElementById("jellyCanvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener("resize", resize);
resize();

const blobs = Array.from({ length: 26 }).map(() => {
  const r = 3 + Math.random() * 8;
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r,
    phase: Math.random() * Math.PI * 2
  };
});

function draw() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  ctx.fillStyle = "rgba(88,166,255,0.06)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  blobs.forEach((b) => {
    b.phase += 0.01;
    b.x += b.vx + Math.cos(b.phase) * 0.12;
    b.y += b.vy + Math.sin(b.phase) * 0.12;

    // cursor repel
    const dx = b.x - pointer.x;
    const dy = b.y - pointer.y;
    const d = Math.hypot(dx, dy);
    if (d < 160) {
      const push = (160 - d) / 160;
      b.x += (dx / (d + 0.001)) * push * 1.6;
      b.y += (dy / (d + 0.001)) * push * 1.6;
    }

    // wrap
    if (b.x < -50) b.x = window.innerWidth + 50;
    if (b.x > window.innerWidth + 50) b.x = -50;
    if (b.y < -50) b.y = window.innerHeight + 50;
    if (b.y > window.innerHeight + 50) b.y = -50;

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(88,166,255,0.22)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * 2.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(88,166,255,0.06)";
    ctx.fill();
  });

  // connect lines
  for (let i = 0; i < blobs.length; i++) {
    for (let j = i + 1; j < blobs.length; j++) {
      const a = blobs[i], b = blobs[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 140) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(88,166,255,${0.10 * (1 - d / 140)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(draw);
}
draw();
