/**
 * FinPulse CA Services - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Elements
    const header = document.getElementById('header');
    const faders = document.querySelectorAll('.fade-in');
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    // Sticky Header Logic
    const config = {
        rootMargin: '0px',
        threshold: 0
    };

    // We can also just use scroll event for header for immediate feedback
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Intersection Observer for scroll animations (fade-in)
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // Mobile Menu Toggle (Basic implementation)
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            alert('Mobile menu toggled! (Add a mobile drawer/dropdown here in a real implementation)');
        });
    }

    // Financial Network Canvas Animation
    class FinancialNetwork {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.particleCount = 45;
            this.mouse = { x: null, y: null, radius: 150 };
            
            this.init();
            this.animate();
            
            window.addEventListener('resize', () => this.resize());
            window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        }

        init() {
            this.resize();
            this.createParticles();
        }

        resize() {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        }

        handleMouseMove(e) {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        }

        createParticles() {
            this.particles = [];
            for (let i = 0; i < this.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                    type: Math.floor(Math.random() * 3) // 0: Dot, 1: Square, 2: Plus
                });
            }
        }

        drawLines() {
            const maxDistance = 150;
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const dx = this.particles[i].x - this.particles[j].x;
                    const dy = this.particles[i].y - this.particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        const opacity = 1 - (distance / maxDistance);
                        this.ctx.beginPath();
                        this.ctx.strokeStyle = `rgba(45, 212, 191, ${opacity * 0.15})`; // Teal lines
                        this.ctx.lineWidth = 0.8;
                        this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                        this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                        this.ctx.stroke();
                    }
                }
                
                // Mouse connection
                const mdx = this.particles[i].x - this.mouse.x;
                const mdy = this.particles[i].y - this.mouse.y;
                const mDistance = Math.sqrt(mdx * mdx + mdy * mdy);
                
                if (mDistance < this.mouse.radius) {
                    const mOpacity = 1 - (mDistance / this.mouse.radius);
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(45, 212, 191, ${mOpacity * 0.5})`; // Brighter teal for mouse
                    this.ctx.lineWidth = 1.2;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.stroke();
                }
            }
        }

        drawParticles() {
            this.ctx.fillStyle = 'rgba(45, 212, 191, 0.6)';
            this.particles.forEach(p => {
                this.ctx.beginPath();
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = '#2DD4BF';
                if (p.type === 0) {
                    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                } else if (p.type === 1) {
                    this.ctx.rect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
                } else {
                    const s = p.size * 1.5;
                    this.ctx.moveTo(p.x - s, p.y);
                    this.ctx.lineTo(p.x + s, p.y);
                    this.ctx.moveTo(p.x, p.y - s);
                    this.ctx.lineTo(p.x, p.y + s);
                }
                this.ctx.fill();

                // Update Position
                p.x += p.vx;
                p.y += p.vy;

                // Boundary collision
                if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
            });
        }

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawLines();
            this.drawParticles();
            requestAnimationFrame(() => this.animate());
        }
    }

    // Floating CA Elements (Vibrant Icons)
    class FloatingElements {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            if (!this.container) return;
            this.icons = [
                { name: 'calculator', color: 'var(--vibrant-teal)' },
                { name: 'book', color: 'var(--vibrant-amber)' },
                { name: 'layers', color: 'var(--vibrant-indigo)' },
                { name: 'file-text', color: 'var(--vibrant-rose)' },
                { name: 'trending-up', color: 'var(--vibrant-mint)' },
                { name: 'database', color: 'var(--vibrant-teal)' },
                { name: 'coins', color: 'var(--vibrant-amber)' }
            ];
            this.elements = [];
            this.init();
        }

        init() {
            for (let i = 0; i < 8; i++) {
                this.createIcon();
            }
            this.animate();
        }

        createIcon() {
            const iconData = this.icons[Math.floor(Math.random() * this.icons.length)];
            const el = document.createElement('div');
            el.className = 'floating-icon';
            el.innerHTML = `<i data-lucide="${iconData.name}"></i>`;
            el.style.color = iconData.color;
            
            const size = 30 + Math.random() * 40;
            el.style.fontSize = `${size}px`;
            
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            
            const item = {
                el,
                x: posX,
                y: posY,
                vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1,
                rotation: Math.random() * 360,
                rv: (Math.random() - 0.5) * 0.2
            };
            
            el.style.left = `${item.x}%`;
            el.style.top = `${item.y}%`;
            el.style.transform = `rotate(${item.rotation}deg)`;
            
            this.container.appendChild(el);
            this.elements.push(item);
            lucide.createIcons({ attrs: { class: 'icon-svg' } });
        }

        animate() {
            this.elements.forEach(item => {
                item.x += item.vx;
                item.y += item.vy;
                item.rotation += item.rv;
                
                if (item.x < -10) item.x = 110;
                if (item.x > 110) item.x = -10;
                if (item.y < -10) item.y = 110;
                if (item.y > 110) item.y = -10;
                
                item.el.style.left = `${item.x}%`;
                item.el.style.top = `${item.y}%`;
                item.el.style.transform = `rotate(${item.rotation}deg)`;
            });
            requestAnimationFrame(() => this.animate());
        }
    }

    // Initialize All Background Animations
    const servicesNetwork = new FinancialNetwork('servicesCanvas');
    const aboutNetwork = new FinancialNetwork('aboutCanvas');
    const contactNetwork = new FinancialNetwork('contactCanvas');

    const servicesIcons = new FloatingElements('servicesIcons');
    const aboutIcons = new FloatingElements('aboutIcons');
    const contactIcons = new FloatingElements('contactIcons');

    // Add parallax to service cards
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 8;
            const rotateY = (centerX - x) / 8;
            
            card.style.transform = `translateY(-15px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `translateY(0) scale(1) rotateX(0) rotateY(0)`;
        });
    });

    // Contact Form Backend Connection
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // UI Feedback: Submitting...
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Submitting...';
            btn.disabled = true;
            if (window.lucide) lucide.createIcons(); // re-init new icon if needed

            // API Call
            fetch("https://finpulse-backend-3tz1.onrender.com/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    message
                })
            })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || data.message || 'Network response was not ok');
                }
                return data;
            })
            .then(data => {
                // UI Feedback: Form submitted! Please check your email.
                formStatus.style.color = '#10B981'; // Success Green
                formStatus.textContent = 'Form submitted! Please check your email.';
                contactForm.reset();
                
                btn.innerHTML = originalText;
                btn.disabled = false;
                if (window.lucide) lucide.createIcons();
                
                setTimeout(() => {
                    formStatus.textContent = '';
                }, 5000);
            })
            .catch(error => {
                // UI Feedback: Error message
                console.error('Error:', error);
                formStatus.style.color = '#EF4444'; // Error Red
                formStatus.textContent = error.message.includes('server') 
                    ? 'Failed to send message. Please check if the server is running.'
                    : error.message;
                
                btn.innerHTML = originalText;
                btn.disabled = false;
                if (window.lucide) lucide.createIcons();
                
                setTimeout(() => {
                    formStatus.textContent = '';
                }, 5000);
            });
        });
    }
});
