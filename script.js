// Variables globales
let scene, camera, renderer, particles, avatar;
let currentExperience = 1;
let isMenuOpen = false;

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    initThreeJS();
    initScrollAnimations();
    initNavigation();
    initCarousel();
    initCounters();
    initSkillBars();
    initContactForm();
    initFloatingParticles();
    initModalSystem();
    
    // Start animations
    animate();
});

// Three.js : arrière-plan 3D et avatar
function initThreeJS() {
    const heroBackground = document.getElementById('hero-background');
    const heroAvatar = document.getElementById('hero-avatar');
    
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    heroBackground.appendChild(renderer.domElement);
    
    // Create rotating background geometry
    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);
    
    // Create floating particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 100;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x00d4ff,
        size: 0.5,
        transparent: true,
        opacity: 0.6
    });
    
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    // Create 3D avatar
    const avatarGeometry = new THREE.IcosahedronGeometry(2, 1);
    const avatarMaterial = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
    avatar.position.set(0, 0, -10);
    scene.add(avatar);
    
    camera.position.z = 30;
    
    // Gérer le redimensionnement de la fenêtre
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Rotate background elements
    if (scene.children[0]) {
        scene.children[0].rotation.x += 0.005;
        scene.children[0].rotation.y += 0.01;
    }
    
    // Animate particles
    if (particles) {
        particles.rotation.y += 0.002;
        const positions = particles.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.01;
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animate avatar
    if (avatar) {
        avatar.rotation.x += 0.01;
        avatar.rotation.y += 0.02;
        avatar.position.y = Math.sin(Date.now() * 0.001) * 0.5;
    }
    
    renderer.render(scene, camera);
}

// Animations de défilement GSAP
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Effet de défilement de la navbar
    ScrollTrigger.create({
        trigger: "body",
        start: "top -80",
        end: "bottom bottom",
        onUpdate: (self) => {
            if (self.direction === 1) {
                document.getElementById('navbar').classList.add('scrolled');
            } else {
                document.getElementById('navbar').classList.remove('scrolled');
            }
        }
    });
    
    // Animations des sections
    gsap.utils.toArray('section').forEach((section, i) => {
        gsap.fromTo(section, 
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
    
    // Animations de la timeline
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
        gsap.fromTo(item,
            { opacity: 0, x: i % 2 === 0 ? -100 : 100 },
            {
                opacity: 1,
                x: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 80%",
                    onEnter: () => item.classList.add('animate')
                }
            }
        );
    });
    
    // Animation des cartes
    gsap.utils.toArray('.cert-card, .project-card').forEach((card, i) => {
        gsap.fromTo(card,
            { opacity: 0, y: 50, scale: 0.8 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                delay: i * 0.1,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%"
                }
            }
        );
    });
    
    // Animation des éléments de compétences
    gsap.utils.toArray('.skill-item').forEach((skill, i) => {
        gsap.fromTo(skill,
            { opacity: 0, x: -50 },
            {
                opacity: 1,
                x: 0,
                duration: 0.5,
                delay: i * 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: skill,
                    start: "top 85%",
                    onEnter: () => {
                        skill.classList.add('animate');
                        animateSkillBar(skill);
                    }
                }
            }
        );
    });
}

// Fonctionnalités de navigation
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        isMenuOpen = !isMenuOpen;
        
        // Animate hamburger bars
        const bars = hamburger.querySelectorAll('.bar');
        if (isMenuOpen) {
            gsap.to(bars[0], { rotation: 45, y: 7, duration: 0.3 });
            gsap.to(bars[1], { opacity: 0, duration: 0.3 });
            gsap.to(bars[2], { rotation: -45, y: -7, duration: 0.3 });
        } else {
            gsap.to(bars[0], { rotation: 0, y: 0, duration: 0.3 });
            gsap.to(bars[1], { opacity: 1, duration: 0.3 });
            gsap.to(bars[2], { rotation: 0, y: 0, duration: 0.3 });
        }
    });
    
    // Défilement fluide et mise en surbrillance du lien actif
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: { y: targetSection, offsetY: 70 },
                    ease: "power2.inOut"
                });
            }
            
            // Close mobile menu
            if (isMenuOpen) {
                hamburger.click();
            }
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Mettre à jour le lien actif lors du défilement
    ScrollTrigger.batch('section', {
        onEnter: (elements) => {
            const id = elements[0].id;
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        },
        onEnterBack: (elements) => {
            const id = elements[0].id;
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Carrousel d'expérience
function initCarousel() {
    showExperience(currentExperience);
}

function changeExperience(direction) {
    const cards = document.querySelectorAll('.experience-card');
    const indicators = document.querySelectorAll('.indicator');
    
    // Remove active class
    cards[currentExperience - 1].classList.remove('active');
    indicators[currentExperience - 1].classList.remove('active');
    
    // Update current experience
    currentExperience += direction;
    if (currentExperience > cards.length) currentExperience = 1;
    if (currentExperience < 1) currentExperience = cards.length;
    
    // Add active class with animation
    gsap.fromTo(cards[currentExperience - 1], 
        { opacity: 0, x: direction > 0 ? 50 : -50 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
    );
    
    cards[currentExperience - 1].classList.add('active');
    indicators[currentExperience - 1].classList.add('active');
}

function showCurrentExperience(n) {
    const cards = document.querySelectorAll('.experience-card');
    const indicators = document.querySelectorAll('.indicator');
    
    if (n === currentExperience) return;
    
    // Remove active class
    cards[currentExperience - 1].classList.remove('active');
    indicators[currentExperience - 1].classList.remove('active');
    
    currentExperience = n;
    
    // Add active class with animation
    gsap.fromTo(cards[currentExperience - 1], 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
    );
    
    cards[currentExperience - 1].classList.add('active');
    indicators[currentExperience - 1].classList.add('active');
}

function showExperience(n) {
    const cards = document.querySelectorAll('.experience-card');
    const indicators = document.querySelectorAll('.indicator');
    
    cards.forEach(card => card.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    if (cards[n - 1]) {
        cards[n - 1].classList.add('active');
        indicators[n - 1].classList.add('active');
    }
}

// Compteurs animés
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        
        ScrollTrigger.create({
            trigger: counter,
            start: "top 80%",
            onEnter: () => {
                gsap.to(counter, {
                    innerHTML: target,
                    duration: 2,
                    ease: "power2.out",
                    snap: { innerHTML: 1 },
                    onUpdate: function() {
                        counter.innerHTML = Math.ceil(counter.innerHTML);
                    }
                });
            }
        });
    });
}

// Animation des barres de compétences
function initSkillBars() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach(item => {
        const level = item.querySelector('.skill-level');
        const percentage = level.getAttribute('data-level');
        level.style.setProperty('--skill-width', percentage + '%');
    });
}

function animateSkillBar(skillItem) {
    const level = skillItem.querySelector('.skill-level');
    const percentage = level.getAttribute('data-level');
    
    gsap.to(level, {
        '--skill-width': percentage + '%',
        duration: 1.5,
        ease: "power2.out",
        delay: 0.2
    });
}

// Formulaire de contact
function initContactForm() {
    const form = document.getElementById('contact-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Message envoyé !';
            submitBtn.style.background = 'linear-gradient(135deg, #00ff88, #00d4ff)';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
                form.reset();
            }, 2000);
        }, 1500);
    });
    
    // Animation des labels flottants
    const inputs = document.querySelectorAll('.form-group input, .form-group textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            gsap.to(input.nextElementSibling, {
                y: -25,
                scale: 0.8,
                color: '#00d4ff',
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                gsap.to(input.nextElementSibling, {
                    y: 0,
                    scale: 1,
                    color: '#b0b0b0',
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });
    });
}

// Effet de particules flottantes
function initFloatingParticles() {
    const particlesContainer = document.querySelector('.floating-particles');
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: #00d4ff;
            border-radius: 50%;
            opacity: ${Math.random() * 0.5 + 0.2};
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            pointer-events: none;
        `;
        
        particlesContainer.appendChild(particle);
        
        // Animate particle
        gsap.to(particle, {
            y: -100,
            x: Math.random() * 200 - 100,
            opacity: 0,
            duration: Math.random() * 3 + 2,
            repeat: -1,
            ease: "none",
            delay: Math.random() * 2
        });
    }
}

// Système de modales
function initModalSystem() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    // Modal data
    const modalData = {
        cert1: {
            title: 'Architecte de solutions AWS - Professionnel',
            content: `
                <h3>Architecte de solutions AWS - Professionnel</h3>
                <p><strong>Émis :</strong> 2023</p>
                <p><strong>ID d'accréditation :</strong> AWS-SAP-2023-001</p>
                <p>Cette certification valide des compétences techniques avancées et une expérience dans la conception d'applications et systèmes distribués sur la plateforme AWS.</p>
                <ul>
                    <li>Concevoir et déployer des applications dynamiquement scalables</li>
                    <li>Sélectionner les services AWS appropriés pour les applications</li>
                    <li>Migrer des applications complexes multi-niveaux vers AWS</li>
                    <li>Concevoir et déployer des opérations évolutives à l'échelle de l'entreprise</li>
                </ul>
            `
        },
        cert2: {
            title: 'Développeur professionnel Google Cloud',
            content: `
                <h3>Google Cloud Professional Cloud Developer</h3>
                <p><strong>Émis :</strong> 2022</p>
                <p><strong>ID d'accréditation :</strong> GCP-PCD-2022-001</p>
                <p>Démontre la maîtrise de la conception, de la construction et du déploiement d'applications sur Google Cloud Platform.</p>
                <ul>
                    <li>Concevoir des applications hautement scalables et disponibles</li>
                    <li>Déboguer et surveiller les applications</li>
                    <li>Intégrer les services Google Cloud</li>
                    <li>Gérer les données applicatives</li>
                </ul>
            `
        },
        cert3: {
            title: 'Microsoft Azure - Développeur Associé',
            content: `
                <h3>Microsoft Azure - Développeur Associé</h3>
                <p><strong>Émis :</strong> 2022</p>
                <p><strong>ID d'accréditation :</strong> AZ-204-2022-001</p>
                <p>Valide les compétences en développement de solutions cloud couvrant calcul, stockage, sécurité et supervision.</p>
                <ul>
                    <li>Développer des solutions de calcul Azure</li>
                    <li>Développer pour le stockage Azure</li>
                    <li>Mettre en œuvre la sécurité Azure</li>
                    <li>Surveiller et optimiser les solutions Azure</li>
                </ul>
            `
        },
        cert4: {
            title: 'Hacker Éthique Certifié (CEH)',
            content: `
                <h3>Hacker Éthique Certifié (CEH) (CEH)</h3>
                <p><strong>Émis :</strong> 2021</p>
                <p><strong>ID d'accréditation :</strong> CEH-2021-001</p>
                <p>Démontre la connaissance des vulnérabilités de sécurité et la manière de les traiter éthiquement.</p>
                <ul>
                    <li>Évaluation des vulnérabilités et tests d'intrusion</li>
                    <li>Sécurité des réseaux et détection d'intrusions</li>
                    <li>Sécurité des applications web</li>
                    <li>Réponse aux incidents et forensique</li>
                </ul>
            `
        },
        project1: {
            title: 'E-Commerce Platform',
            content: `
                <h3>Plateforme e‑commerce Full‑Stack</h3>
                <p><strong>Technologies :</strong> React, Node.js, MongoDB, Stripe API</p>
                <p><strong>Durée :</strong> 6 months</p>
                <p>A comprehensive e-commerce solution featuring real-time inventory management, secure payment processing, and advanced analytics.</p>
                <h4>Fonctionnalités clés :</h4>
                <ul>
                    <li>Real-time inventory tracking and management</li>
                    <li>Secure payment processing with Stripe integration</li>
                    <li>Advanced search and filtering capabilities</li>
                    <li>Admin dashboard with analytics and reporting</li>
                    <li>Mobile-responsive design</li>
                    <li>Multi-vendor support</li>
                </ul>
                <p><strong>Résultats :</strong> Increased client sales by 150% and reduced cart abandonment by 30%.</p>
            `
        },
        project2: {
            title: 'AI Chat Application',
            content: `
                <h3>Application de chat pilotée par IA</h3>
                <p><strong>Technologies :</strong> Vue.js, Python, WebSocket, TensorFlow</p>
                <p><strong>Durée :</strong> 4 months</p>
                <p>Real-time chat application with AI-powered responses and sentiment analysis capabilities.</p>
                <h4>Fonctionnalités clés :</h4>
                <ul>
                    <li>Real-time messaging with WebSocket</li>
                    <li>AI-powered chatbot responses</li>
                    <li>Sentiment analysis of conversations</li>
                    <li>Multi-language support</li>
                    <li>File sharing and media support</li>
                    <li>End-to-end encryption</li>
                </ul>
                <p><strong>Résultats :</strong> Achieved 95% user satisfaction rate and 40% reduction in response time.</p>
            `
        },
        project3: {
            title: 'Task Management System',
            content: `
                <h3>Système collaboratif de gestion de tâches</h3>
                <p><strong>Technologies :</strong> Angular, Express.js, PostgreSQL, Socket.io</p>
                <p><strong>Durée :</strong> 5 months</p>
                <p>Advanced project management tool with real-time collaboration and comprehensive analytics.</p>
                <h4>Fonctionnalités clés :</h4>
                <ul>
                    <li>Real-time collaboration and updates</li>
                    <li>Advanced project analytics and reporting</li>
                    <li>Kanban and Gantt chart views</li>
                    <li>Time tracking and resource management</li>
                    <li>Integration with popular tools (Slack, GitHub)</li>
                    <li>Custom workflow automation</li>
                </ul>
                <p><strong>Résultats :</strong> Improved team productivity by 60% and project delivery time by 25%.</p>
            `
        },
        project4: {
            title: 'Blockchain Wallet',
            content: `
                <h3>Portefeuille multi‑chaînes de cryptomonnaies</h3>
                <p><strong>Technologies :</strong> React Native, Solidity, Web3.js, Node.js</p>
                <p><strong>Durée :</strong> 8 months</p>
                <p>Secure cryptocurrency wallet supporting multiple blockchain networks with advanced security features.</p>
                <h4>Fonctionnalités clés :</h4>
                <ul>
                    <li>Multi-chain support (Bitcoin, Ethereum, Polygon)</li>
                    <li>Hardware wallet integration</li>
                    <li>DeFi protocol integration</li>
                    <li>Advanced security with biometric authentication</li>
                    <li>Portfolio tracking and analytics</li>
                    <li>Cross-platform mobile application</li>
                </ul>
                <p><strong>Résultats :</strong> Successfully launched with 10,000+ active users and zero security incidents.</p>
            `
        }
    };
    
    window.openModal = function(modalId) {
        const data = modalData[modalId];
        if (data) {
            modalBody.innerHTML = data.content;
            modal.style.display = 'block';
            
            gsap.fromTo(modal, 
                { opacity: 0 },
                { opacity: 1, duration: 0.3 }
            );
            
            gsap.fromTo('.modal-content',
                { scale: 0.7, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
            );
        }
    };
    
    window.closeModal = function() {
        gsap.to(modal, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                modal.style.display = 'none';
            }
        });
    };
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
}

// Fonctions utilitaires
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        gsap.to(window, {
            duration: 1,
            scrollTo: { y: section, offsetY: 70 },
            ease: "power2.inOut"
        });
    }
}

// Ajout d'effets de lueur déclenchés au défilement
ScrollTrigger.batch('.cert-card, .project-card, .skill-item', {
    onEnter: (elements) => {
        gsap.to(elements, {
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)',
            duration: 0.5,
            stagger: 0.1
        });
    },
    onLeave: (elements) => {
        gsap.to(elements, {
            boxShadow: '0 0 0px rgba(0, 212, 255, 0)',
            duration: 0.5,
            stagger: 0.1
        });
    }
});

// Effet parallax pour la section héros
gsap.to('.hero-content', {
    yPercent: -50,
    ease: "none",
    scrollTrigger: {
        trigger: '.hero-section',
        start: "top bottom",
        end: "bottom top",
        scrub: true
    }
});

// Effet de saisie pour le titre héros
function initTypingEffect() {
    const titleLines = document.querySelectorAll('.title-line');
    
    titleLines.forEach((line, index) => {
        const text = line.textContent;
        line.textContent = '';
        
        gsap.to(line, {
            duration: text.length * 0.05,
            delay: index * 0.5,
            ease: "none",
            onUpdate: function() {
                const progress = this.progress();
                const currentLength = Math.round(progress * text.length);
                line.textContent = text.substring(0, currentLength);
            }
        });
    });
}

// Initialiser l'effet de saisie après un délai
setTimeout(initTypingEffect, 1000);

// Effet de suivi de la souris
document.addEventListener('mousemove', (e) => {
    const cursor = document.querySelector('.cursor');
    if (!cursor) {
        const newCursor = document.createElement('div');
        newCursor.className = 'cursor';
        newCursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, #00d4ff, transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: difference;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(newCursor);
    }
    
    gsap.to('.cursor', {
        x: e.clientX - 10,
        y: e.clientY - 10,
        duration: 0.1
    });
});

// Observateur d'intersection pour animations supplémentaires
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observer tous les éléments animables
document.querySelectorAll('.cert-card, .project-card, .skill-item, .timeline-item').forEach(el => {
    observer.observe(el);
});

console.log('Portfolio initialisé avec succès ! 🚀');