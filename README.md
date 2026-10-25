# Ayon Mondal — Interactive MBA Marketing Portfolio

> **Bridging Analytical Physics & Creative Marketing Strategy**  
> An interactive, responsive, high-performance portfolio website built for an MBA Marketing student at IILM University, Greater Noida. Combining data analytics, consumer psychology, brand strategy, and creative storytelling.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fayonmondal340%2FPORTFOLIO-WEBSITE-)

---

## 🌟 Highlights & Key Features

- **Cinematic Canvas Notebook Engine**: High-performance, 60fps RAF canvas scroll animation rendering 299 progressive frames with tiered preloading, nearest-frame resilience, and responsive DPR scaling.
- **Modern Interactive UI**: Custom magnetic cursor tracker, ripple click physics, active scroll-spy navigation, and glassmorphism styling.
- **Featured Strategic Projects**:
  1. *E-Commerce Sales Analytics Dashboard (Power BI / DAX)* — Includes an interactive embedded dashboard modal preview.
  2. *Retail Sales Data Analysis & Strategy Presentation (Trendista)* — Excel spreadsheet model & strategic presentation.
  3. *Market Research: Plant-Based Beverages* — Consumer behavior & market opportunity study.
- **Marketing Insights & Publications**: 5 bespoke editorial articles covering the Attention Economy, AI in Creative Strategy, David Ogilvy's principles, Starbucks behavioral pricing, and iPhone vs. Android consumer identity.
- **Aesthetic Professional Workspace**: Executive office & strategy desk imagery reflecting modern business & analytical focus.
- **Vercel-Ready & Zero-Config**: Optimized with `vercel.json` edge caching, immutable frame headers, and high-speed CDN delivery.

---

## 🚀 One-Click Deploy to Vercel

### Method 1: Via Vercel Web Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** > **"Project"**.
3. Import the repository: `ayonmondal340/PORTFOLIO-WEBSITE-`.
4. Keep the default settings:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./`
   - **Build Command**: *(leave empty or default)*
   - **Output Directory**: `./`
5. Click **"Deploy"**. Vercel will instantly publish your site with a custom `.vercel.app` URL and free SSL!

### Method 2: Via Vercel CLI
```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Deploy directly from your project directory
vercel
```

---

## 💻 Running Locally

### Option A: Using the PowerShell Built-in Server
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
# Open http://localhost:3000 in your browser
```

### Option B: Using Node.js / NPX
```bash
npx serve .
```

### Option C: Using Python
```bash
python -m http.server 3000
```

---

## 📁 Repository Structure

```
├── index.html                  # Main responsive portfolio structure
├── vercel.json                 # Vercel deployment & CDN edge caching configuration
├── package.json                # Project metadata and quick-start scripts
├── .gitignore                  # Git ignore rules
├── server.ps1                  # Local lightweight HTTP development server
├── css/
│   └── styles.css              # Custom styling, animations, responsive design
├── js/
│   ├── main.js                 # Global UI interactivity, scroll-spy, modal logic
│   └── notebook-scroller.js    # Canvas RAF frame-by-frame animation engine
├── assets/
│   └── images/
│       ├── profile-workspace.jpg      # Executive office/workspace portrait
│       ├── project-01-powerbi.svg     # Power BI analytics vector artwork
│       ├── project-02-trendista.svg   # Retail analytics vector artwork
│       ├── project-03-plant-based.svg # Plant-based research vector artwork
│       └── blog-01..05-*.svg          # 5 bespoke editorial article covers
└── ezgif-frame-001.jpg..300.jpg       # 300 cinematic notebook animation frames
```

---

## 📄 License
MIT © Ayon Mondal
