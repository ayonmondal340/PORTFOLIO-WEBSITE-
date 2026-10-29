/**
 * Minimalist Monochrome Particle Network Engine
 * Author: Senior Frontend Specialist & Performance Engineer for Ayon Mondal Portfolio
 * 
 * Inspired by architectural network graphs:
 * - High performance, RAF-driven canvas rendering with devicePixelRatio capping (max 2).
 * - Organic drifting nodes of varying size with hair-thin proximity connecting lines.
 * - Gentle mouse/touch interaction (repulsion & subtle elasticity).
 * - Adaptive node density scaled to viewport dimensions.
 * - Page Visibility API tab pause & prefers-reduced-motion accessibility support.
 * - Dynamic activation/deactivation: Only runs AFTER the notebook scroll animation completes.
 */

class ParticleNetwork {
  constructor(options = {}) {
    this.canvas = typeof options.canvas === 'string' 
      ? document.querySelector(options.canvas) 
      : (options.canvas || document.getElementById('particleNetworkCanvas'));

    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d', { alpha: true });
    if (!this.ctx) return;

    // Configuration
    this.baseColor = options.baseColor || '20, 20, 20'; // Neutral monochrome dark gray / charcoal
    this.maxDistance = options.maxDistance || 135;
    this.mouseRadius = options.mouseRadius || 140;
    this.repelForce = options.repelForce || 0.6;
    
    // Performance & Accessibility
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.isRunning = false;
    this.isActive = false;
    this.rafId = null;

    // State
    this.width = 0;
    this.height = 0;
    this.particles = [];
    this.mouse = { x: -9999, y: -9999, isActive: false };

    // Bound listeners for clean lifecycle
    this.handleResize = this.debounce(this.handleResize.bind(this), 120);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);
    this.tick = this.tick.bind(this);

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.spawnParticles();

    // Attach passive window events
    window.addEventListener('resize', this.handleResize, { passive: true });
    window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', this.handleMouseLeave, { passive: true });
    window.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    window.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    document.addEventListener('visibilitychange', this.handleVisibility);

    // Initial render
    this.drawFrame();

    // Start active immediately so it forms the dynamic backdrop for the opening editorial screen
    this.activate();
  }

  activate() {
    if (this.isActive) return;
    this.isActive = true;
    if (this.canvas) {
      this.canvas.classList.add('active');
    }
    if (!this.prefersReducedMotion && !this.isRunning) {
      this.start();
    }
  }

  deactivate() {
    this.isActive = false;
    if (this.canvas) {
      this.canvas.classList.remove('active');
    }
    this.stop();
  }

  resizeCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.scale(this.dpr, this.dpr);
  }

  handleResize() {
    const oldW = this.width;
    const oldH = this.height;
    this.resizeCanvas();

    // Scale particle positions or adjust count
    const targetCount = this.calculateParticleCount();
    if (this.particles.length !== targetCount) {
      this.spawnParticles();
    } else {
      const rx = this.width / (oldW || 1);
      const ry = this.height / (oldH || 1);
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].x *= rx;
        this.particles[i].y *= ry;
      }
    }

    if (this.prefersReducedMotion || !this.isRunning) {
      this.drawFrame();
    }
  }

  calculateParticleCount() {
    const area = this.width * this.height;
    // Scale count: ~38 on mobile up to ~95 on 4k/large desktop
    if (this.width < 768) {
      return Math.max(30, Math.min(45, Math.floor(area / 16000)));
    } else if (this.width < 1200) {
      return Math.max(50, Math.min(75, Math.floor(area / 17000)));
    } else {
      return Math.max(70, Math.min(105, Math.floor(area / 18000)));
    }
  }

  spawnParticles() {
    const count = this.calculateParticleCount();
    this.particles = [];

    for (let i = 0; i < count; i++) {
      // Create varied node weights inspired by the reference graphic
      const rand = Math.random();
      let radius, alpha;

      if (rand < 0.65) {
        // Delicate micro nodes (majority)
        radius = 1.0 + Math.random() * 1.2;
        alpha = 0.25 + Math.random() * 0.25;
      } else if (rand < 0.90) {
        // Medium structural junctions
        radius = 2.2 + Math.random() * 1.2;
        alpha = 0.45 + Math.random() * 0.25;
      } else {
        // Landmark anchor nodes
        radius = 3.6 + Math.random() * 1.4;
        alpha = 0.70 + Math.random() * 0.20;
      }

      // Slightly bias initial distribution towards the right/upper-right to echo the reference art
      let x = Math.random() * this.width;
      if (Math.random() < 0.35) {
        x = this.width * 0.5 + Math.random() * (this.width * 0.5);
      }

      const speed = 0.12 + Math.random() * 0.22;
      const angle = Math.random() * Math.PI * 2;

      this.particles.push({
        x: x,
        y: Math.random() * this.height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: radius,
        alpha: alpha,
        baseAlpha: alpha,
        mass: radius * 1.5
      });
    }
  }

  handleMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
    this.mouse.isActive = true;
  }

  handleMouseLeave() {
    this.mouse.isActive = false;
    this.mouse.x = -9999;
    this.mouse.y = -9999;
  }

  handleTouchMove(e) {
    if (e.touches && e.touches.length > 0) {
      this.mouse.x = e.touches[0].clientX;
      this.mouse.y = e.touches[0].clientY;
      this.mouse.isActive = true;
    }
  }

  handleTouchEnd() {
    this.mouse.isActive = false;
  }

  handleVisibility() {
    if (document.hidden) {
      this.stop();
    } else {
      if (this.isActive && !this.prefersReducedMotion) {
        this.start();
      }
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  tick() {
    if (!this.isRunning) return;
    this.update();
    this.drawFrame();
    this.rafId = requestAnimationFrame(this.tick);
  }

  update() {
    const pLen = this.particles.length;

    for (let i = 0; i < pLen; i++) {
      const p = this.particles[i];

      // Natural subtle drift
      p.x += p.vx;
      p.y += p.vy;

      // Soft boundary wrap-around with margin
      const margin = 20;
      if (p.x < -margin) p.x = this.width + margin;
      else if (p.x > this.width + margin) p.x = -margin;
      if (p.y < -margin) p.y = this.height + margin;
      else if (p.y > this.height + margin) p.y = -margin;

      // Gentle interactive mouse repulsion
      if (this.mouse.isActive) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const distSq = dx * dx + dy * dy;
        const mouseRadiusSq = this.mouseRadius * this.mouseRadius;

        if (distSq < mouseRadiusSq && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / this.mouseRadius) * this.repelForce;
          p.x += (dx / dist) * force * (2.5 / p.mass);
          p.y += (dy / dist) * force * (2.5 / p.mass);
        }
      }
    }
  }

  drawFrame() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const pLen = this.particles.length;
    const maxDistSq = this.maxDistance * this.maxDistance;

    // 1. Draw fine proximity connection lines
    this.ctx.lineWidth = 0.65;
    for (let i = 0; i < pLen; i++) {
      const p1 = this.particles[i];
      for (let j = i + 1; j < pLen; j++) {
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const dist = Math.sqrt(distSq);
          // Distance fade formula: quadratic ease-out for delicate lines
          const ratio = 1 - (dist / this.maxDistance);
          const lineAlpha = (ratio * ratio * 0.18).toFixed(3);

          this.ctx.strokeStyle = `rgba(${this.baseColor}, ${lineAlpha})`;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }

    // 2. Draw nodes
    for (let i = 0; i < pLen; i++) {
      const p = this.particles[i];
      this.ctx.fillStyle = `rgba(${this.baseColor}, ${p.alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseleave', this.handleMouseLeave);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('visibilitychange', this.handleVisibility);
    this.particles = [];
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  window.ParticleNetwork = ParticleNetwork;
}
