document.addEventListener('DOMContentLoaded', () => {
  // ─── Element References ───────────────────────────────────────────
  const particleCanvas = document.getElementById('particleCanvas');
  const algoGrid = document.getElementById('algoGrid');
  const statTicker = document.getElementById('statTicker');
  const contactForm = document.getElementById('contactForm');
  const weavePath = document.getElementById('weave-path');

  // ─── 2. Particle Canvas ───────────────────────────────────────────
  if (particleCanvas) {
    const ctx = particleCanvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 25 : 60;

    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      particleCanvas.width = width * dpr;
      particleCanvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 1 + 1,
          baseAlpha: Math.random() * 0.3 + 0.2
        });
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        
        // Wrap around
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 58, 237, ${p.baseAlpha})`;
        ctx.fill();
        
        // Connect lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(124, 58, 237, ${0.06 * (1 - dist/90)})`;
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });

    resizeCanvas();
    initParticles();
    animateParticles();
  }

  // ─── 3. Scroll Reveal ─────────────────────────────────────────────
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    reveals.forEach(r => revealObserver.observe(r));
  }

  // ─── 4. BFS Algorithmic Routing Grid ──────────────────────────────
  if (algoGrid) {
    let nodes = [];
    let bfsInterval = null;
    let isRunning = false;
    let cols = 0;
    let rows = 0;

    function setupGrid() {
      algoGrid.innerHTML = '';
      nodes = [];
      const rect = algoGrid.getBoundingClientRect();
      cols = Math.floor(rect.width / 45);
      rows = Math.floor(rect.height / 45);
      
      const totalNodes = Math.min(cols * rows, 250); // Cap at 250
      
      for (let i = 0; i < totalNodes; i++) {
        const node = document.createElement('div');
        node.className = 'algo-node';
        algoGrid.appendChild(node);
        nodes.push(node);
      }
    }

    function runBFS() {
      if (nodes.length === 0 || isRunning) return;
      isRunning = true;
      
      // Reset
      nodes.forEach(n => n.classList.remove('active-path'));
      
      const startIdx = Math.floor(Math.random() * nodes.length);
      const queue = [startIdx];
      const visited = new Set([startIdx]);
      
      bfsInterval = setInterval(() => {
        if (queue.length === 0) {
          clearInterval(bfsInterval);
          setTimeout(() => {
            isRunning = false;
            if (document.visibilityState === 'visible') {
               runBFS();
            }
          }, 2500);
          return;
        }
        
        const current = queue.shift();
        if(nodes[current]) nodes[current].classList.add('active-path');
        
        // Add neighbors (approximate grid based on simple index math)
        const neighbors = [
          current - 1, current + 1,
          current - cols, current + cols
        ];
        
        neighbors.forEach(n => {
          if (n >= 0 && n < nodes.length && !visited.has(n) && Math.random() > 0.3) {
            visited.add(n);
            queue.push(n);
          }
        });
      }, 100);
    }

    setupGrid();

    const algoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!isRunning) runBFS();
        } else {
          clearInterval(bfsInterval);
          isRunning = false;
        }
      });
    }, { threshold: 0.1 });

    if(algoGrid.parentElement) algoObserver.observe(algoGrid.parentElement);
    
    window.addEventListener('resize', () => {
      clearInterval(bfsInterval);
      isRunning = false;
      setupGrid();
    });
  }

  // ─── 5. Panther Sense (Proximity Card Lighting) ───────────────────
  const pantherGrid = document.querySelector('.panther-sense-grid');
  if (pantherGrid) {
    pantherGrid.addEventListener('mousemove', (e) => {
      const cards = pantherGrid.querySelectorAll('.project-card');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // ─── 6. Stat Ticker ───────────────────────────────────────────────
  if (statTicker) {
    const track = statTicker.querySelector('.stat-ticker-track');
    const items = statTicker.querySelectorAll('.stat-item');
    if (track && items.length > 0) {
      let currentStat = 0;
      track.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      
      setInterval(() => {
        const itemHeight = items[0].offsetHeight;
        currentStat = (currentStat + 1) % items.length;
        track.style.transform = `translateY(-${currentStat * itemHeight}px)`;
      }, 3000);
    }
  }

  // ─── 7. Vibranium Weave (Scroll Progress) ─────────────────────────
  if (weavePath) {
    const totalLength = weavePath.getTotalLength();
    weavePath.style.strokeDasharray = totalLength;
    weavePath.style.strokeDashoffset = totalLength;

    window.addEventListener('scroll', () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = window.scrollY / scrollable;
      // Limit progress between 0 and 1 to prevent strange SVG rendering
      const safeProgress = Math.max(0, Math.min(1, progress));
      weavePath.style.strokeDashoffset = totalLength * (1 - safeProgress);
    }, { passive: true });
  }

  // ─── 8. Accordion Logic ───────────────────────────────────────────
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');
      
      // Optional: Close all other accordions
      document.querySelectorAll('.accordion-item').forEach(acc => {
        acc.classList.remove('active');
      });

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // ─── 9. Contact Form ──────────────────────────────────────────────
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);
      const btn = contactForm.querySelector('.submit-btn');
      
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      fetch("https://formsubmit.co/ajax/adityav2707@gmail.com", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
        if(data.success) {
          alert("Thanks for reaching out! I'll get back to you soon.");
          contactForm.reset();
        } else {
          alert("Oops! There was a problem submitting your form. Please try again.");
        }
      })
      .catch(error => {
        console.log(error);
        alert("Oops! There was a problem submitting your form. Please try again.");
      })
      .finally(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      });
    });
  }

  // ─── 10. Smooth Scroll for Anchor Links ────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ─── 11. Scroll to Top Button & Top Name Bar ────────────────────────
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  const topNameBar = document.querySelector('.top-name-bar');
  const heroName = document.querySelector('.hero h1');
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Scroll to Top Button Logic
    if (scrollTopBtn) {
      if (scrollY > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }

    // Hero Name Fade Out Logic
    if (heroName) {
      const scrollRatio = Math.min(1, scrollY / 120);
      const opacity = Math.max(0, 1 - scrollRatio);
      const blurVal = scrollRatio * 5; // blurs from 0px to 5px
      
      heroName.style.opacity = opacity;
      heroName.style.filter = `blur(${blurVal}px)`;
    }

    // Top Name Bar Logic
    if (topNameBar) {
      if (scrollY > 120) {
        topNameBar.classList.add('visible');
      } else {
        topNameBar.classList.remove('visible');
      }
    }
  }, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
