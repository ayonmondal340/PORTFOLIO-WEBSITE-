/**
 * Cinematic Notebook Frame-by-Frame Scroll Engine
 * Author: Senior Frontend Specialist for Ayon Mondal Portfolio
 *
 * Implements high-performance, RAF-driven canvas rendering of 299 notebook frames
 * with tiered preloading, nearest-frame resilience, responsive DPR scaling,
 * aspect-ratio preservation, and seamless transition to website content.
 */

class NotebookScroller {
  constructor(options = {}) {
    this.track = document.querySelector(options.track || '#heroScrollTrack');
    this.canvas = document.querySelector(options.canvas || '#notebookCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d', { alpha: false }) : null;

    // Frame sequence configuration: Frame 002 is closed notebook; Frame 300 is full paper texture
    this.startFrame = options.startFrame || 2;
    this.endFrame = options.endFrame || 300;
    this.totalFrames = this.endFrame - this.startFrame + 1;

    // Frame storage & status
    this.cache = new Map(); // frameIndex -> HTMLImageElement
    this.loadingPromises = new Map();
    this.loadedCount = 0;
    this.isInitialReady = false;
    this.isKeyframesReady = false;

    // Animation physics & state
    this.targetProgress = 0;
    this.currentProgress = 0;
    this.targetFrame = this.startFrame;
    this.currentFrame = this.startFrame;
    this.lastRenderedFrame = -1;
    this.rafId = null;
    this.isTicking = false;

    // User preferences & responsiveness
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.lerpFactor = this.prefersReducedMotion ? 1.0 : (options.lerpFactor || 0.16);

    // Audio synthesis for tactile page turning
    this.audioEnabled = false;
    this.audioCtx = null;
    this.lastAudioFrame = this.startFrame;

    // UI callbacks
    this.onProgress = options.onProgress || null;
    this.onLoadProgress = options.onLoadProgress || null;
    this.onReady = options.onReady || null;

    // Bound listeners for clean destruction
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.tick = this.tick.bind(this);

    this.init();
  }

  getFramePath(index) {
    const padded = String(index).padStart(3, '0');
    return `./ezgif-frame-${padded}.jpg`;
  }

  async init() {
    if (!this.track || !this.canvas || !this.ctx) {
      console.error('NotebookScroller: Required DOM elements missing.');
      return;
    }

    // High performance canvas defaults
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    // Set initial size
    this.handleResize();

    // Attach listeners
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.handleResize, { passive: true });

    // Step 1: Preload Frame 2 (initial state) immediately
    await this.preloadSingleFrame(this.startFrame);
    this.isInitialReady = true;
    this.renderFrame(this.startFrame);

    if (this.onReady) {
      this.onReady();
    }

    // Step 2: Preload Tier 1 (Keyframes + initial opening frames 2-35)
    this.preloadTier1();

    // Start RAF loop
    this.startRaf();
  }

  /**
   * Preload a single image frame with promise caching
   */
  preloadSingleFrame(index) {
    if (this.cache.has(index)) {
      return Promise.resolve(this.cache.get(index));
    }
    if (this.loadingPromises.has(index)) {
      return this.loadingPromises.get(index);
    }

    const promise = new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        this.cache.set(index, img);
        this.loadedCount++;
        if (this.onLoadProgress) {
          const pct = Math.min(100, Math.round((this.loadedCount / this.totalFrames) * 100));
          this.onLoadProgress(pct, this.loadedCount, this.totalFrames);
        }
        resolve(img);
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = this.getFramePath(index);
    });

    this.loadingPromises.set(index, promise);
    return promise;
  }

  /**
   * Tier 1 preloading: Initial opening sequence (2-35) and keyframes
   */
  async preloadTier1() {
    const tier1Set = new Set();

    // Opening cover frames
    for (let i = this.startFrame; i <= Math.min(35, this.endFrame); i++) {
      tier1Set.add(i);
    }
    // Keyframes every 8 frames across the rest
    for (let i = 40; i <= this.endFrame; i += 8) {
      tier1Set.add(i);
    }
    // Also include final frames (280-300) for smooth zoom preview
    for (let i = 280; i <= this.endFrame; i++) {
      tier1Set.add(i);
    }

    const tier1Array = Array.from(tier1Set);
    await this.loadBatch(tier1Array, 6);
    this.isKeyframesReady = true;

    // Trigger frame re-render at current scroll
    this.handleScroll();

    // Step 3: Idle load all remaining frames
    this.preloadRemainingTier2();
  }

  /**
   * Background loader for all remaining intermediate frames using requestIdleCallback
   */
  preloadRemainingTier2() {
    const remaining = [];
    for (let i = this.startFrame; i <= this.endFrame; i++) {
      if (!this.cache.has(i) && !this.loadingPromises.has(i)) {
        remaining.push(i);
      }
    }

    const loadNextChunk = () => {
      if (remaining.length === 0) return;
      const chunk = remaining.splice(0, 8);
      this.loadBatch(chunk, 4).then(() => {
        if (window.requestIdleCallback) {
          window.requestIdleCallback(loadNextChunk, { timeout: 200 });
        } else {
          setTimeout(loadNextChunk, 50);
        }
      });
    };

    if (window.requestIdleCallback) {
      window.requestIdleCallback(loadNextChunk, { timeout: 300 });
    } else {
      setTimeout(loadNextChunk, 80);
    }
  }

  /**
   * Concurrency-controlled batch loader
   */
  async loadBatch(indices, concurrency = 4) {
    const pool = [];
    for (const idx of indices) {
      const p = this.preloadSingleFrame(idx);
      pool.push(p);
      if (pool.length >= concurrency) {
        await Promise.race(pool);
        for (let j = pool.length - 1; j >= 0; j--) {
          if (this.cache.has(indices[j])) {
            pool.splice(j, 1);
          }
        }
      }
    }
    await Promise.all(pool);
  }

  /**
   * Resilient Nearest Frame Search: Canvas NEVER flickers or shows empty
   */
  getNearestLoadedFrame(targetIdx) {
    if (this.cache.has(targetIdx)) {
      return this.cache.get(targetIdx);
    }

    for (let delta = 1; delta <= 30; delta++) {
      const down = targetIdx - delta;
      if (down >= this.startFrame && this.cache.has(down)) {
        return this.cache.get(down);
      }
      const up = targetIdx + delta;
      if (up <= this.endFrame && this.cache.has(up)) {
        return this.cache.get(up);
      }
    }

    return this.cache.get(this.startFrame) || null;
  }

  handleScroll() {
    if (!this.track) return;

    const rect = this.track.getBoundingClientRect();
    const scrollDist = this.track.offsetHeight - window.innerHeight;

    if (scrollDist <= 0) {
      this.targetProgress = 0;
    } else {
      const p = -rect.top / scrollDist;
      this.targetProgress = Math.max(0, Math.min(1, p));
    }

    this.targetFrame = this.startFrame + this.targetProgress * (this.totalFrames - 1);

    if (this.prefersReducedMotion) {
      this.currentProgress = this.targetProgress;
      this.currentFrame = this.targetFrame;
      this.renderFrame(Math.round(this.currentFrame));
    } else {
      this.startRaf();
    }

    if (this.onProgress) {
      this.onProgress(this.targetProgress, Math.round(this.targetFrame));
    }
  }

  handleResize() {
    if (!this.canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    const newCanvasWidth = Math.round(width * dpr);
    const newCanvasHeight = Math.round(height * dpr);

    if (this.canvas.width !== newCanvasWidth || this.canvas.height !== newCanvasHeight) {
      this.canvas.width = newCanvasWidth;
      this.canvas.height = newCanvasHeight;
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;

      if (this.lastRenderedFrame > 0) {
        this.renderFrame(this.lastRenderedFrame);
      }
    }
  }

  startRaf() {
    if (!this.isTicking) {
      this.isTicking = true;
      this.rafId = requestAnimationFrame(this.tick);
    }
  }

  tick() {
    const delta = this.targetFrame - this.currentFrame;

    if (Math.abs(delta) > 0.04) {
      this.currentFrame += delta * this.lerpFactor;
      this.currentProgress += (this.targetProgress - this.currentProgress) * this.lerpFactor;

      const frameToRender = Math.round(this.currentFrame);
      if (frameToRender !== this.lastRenderedFrame) {
        this.renderFrame(frameToRender);

        if (this.audioEnabled && Math.abs(frameToRender - this.lastAudioFrame) >= 8) {
          if (frameToRender >= 30 && frameToRender <= 230) {
            this.playPaperFrictionSound();
            this.lastAudioFrame = frameToRender;
          }
        }
      }

      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.currentFrame = this.targetFrame;
      this.currentProgress = this.targetProgress;
      const finalFrame = Math.round(this.currentFrame);
      if (finalFrame !== this.lastRenderedFrame) {
        this.renderFrame(finalFrame);
      }
      this.isTicking = false;
      this.rafId = null;
    }
  }

  /**
   * Core Canvas Rendering
   */
  renderFrame(frameIndex) {
    const img = this.getNearestLoadedFrame(frameIndex);
    if (!img || !img.naturalWidth || !this.ctx) return;

    this.lastRenderedFrame = frameIndex;

    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const iw = img.naturalWidth || 1920;
    const ih = img.naturalHeight || 1080;

    const progress = (frameIndex - this.startFrame) / (this.totalFrames - 1);

    // Seamlessly blend into the website's surface-bright (#faf9f6 = RGB 250, 249, 246)
    if (progress > 0.85) {
      const zoomFactor = (progress - 0.85) / 0.15;
      const r = Math.round(143 + (250 - 143) * zoomFactor);
      const g = Math.round(142 + (249 - 142) * zoomFactor);
      const b = Math.round(137 + (246 - 137) * zoomFactor);
      this.ctx.fillStyle = `rgb(${r},${g},${b})`;
    } else {
      this.ctx.fillStyle = '#8F8E89';
    }
    this.ctx.fillRect(0, 0, cw, ch);

    // Responsive scaling
    const screenAspect = cw / ch;
    const imgAspect = iw / ih;

    let scale;

    if (screenAspect >= imgAspect) {
      scale = cw / iw;
      if (scale * ih < ch) scale = ch / ih;
    } else {
      const containScale = Math.min(cw / (iw * 0.82), ch / ih);
      const coverScale = Math.max(cw / iw, ch / ih);

      if (progress < 0.65) {
        scale = containScale;
      } else if (progress < 0.90) {
        const blend = (progress - 0.65) / 0.25;
        scale = containScale + (coverScale - containScale) * blend;
      } else {
        scale = coverScale * 1.02;
      }
    }

    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    this.ctx.drawImage(img, dx, dy, dw, dh);
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  toggleAudio(forceState) {
    if (forceState !== undefined) {
      this.audioEnabled = forceState;
    } else {
      this.audioEnabled = !this.audioEnabled;
    }

    if (this.audioEnabled && !this.audioCtx) {
      this.initAudio();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioEnabled;
  }

  playPaperFrictionSound() {
    if (!this.audioEnabled || !this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const bufferSize = this.audioCtx.sampleRate * 0.05;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800 + Math.random() * 400;
      filter.Q.value = 1.8;

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.05);
    } catch (err) {}
  }

  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.cache.clear();
    this.loadingPromises.clear();
  }
}

window.NotebookScroller = NotebookScroller;
