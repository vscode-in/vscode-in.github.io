// --- 1. Mobile Menu & Navigation ---
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenu && navMenu) {
    mobileMenu.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileMenu.classList.remove('active');
    }));
}

// --- 2. Animations (Scroll Reveal) ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            if (entry.target.classList.contains('counter')) {
                startCounter(entry.target);
                entry.target.classList.remove('counter'); 
            }
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.hidden-up, .hidden-left, .hidden-right').forEach(el => observer.observe(el));
document.querySelectorAll('.counter').forEach(el => observer.observe(el.parentElement));

// Updated Counter Logic
function startCounter(el) {
    const targetStr = el.getAttribute('data-target');
    const suffix = el.getAttribute('data-suffix') || '';
    const target = parseFloat(targetStr);
    const isFloat = targetStr.includes('.');
    
    let count = 0; 
    el.innerText = "0"; 
    
    const updateCount = () => {
        const speed = target / 50; 
        
        if(count < target) {
            count += speed;
            if (count > target) count = target;

            if(isFloat) {
                el.innerText = count.toFixed(1) + suffix;
            } else {
                el.innerText = Math.ceil(count) + suffix;
            }
            setTimeout(updateCount, 30);
        } else {
            el.innerText = targetStr + suffix;
        }
    };
    updateCount();
}

// --- 3. Typewriter Effect ---
const typeElement = document.querySelector('.typewriter-text');
if (typeElement) {
    const textToType = typeElement.getAttribute('data-text');
    let typeIndex = 0;

    function typeWriter() {
        if (typeIndex < textToType.length) {
            typeElement.innerHTML += textToType.charAt(typeIndex);
            typeIndex++;
            setTimeout(typeWriter, 100);
        }
    }
    setTimeout(typeWriter, 500);
}

// --- 4. Goal Planner Logic ---
if (document.getElementById('goal-planner')) {
    let currentStep = 1;
    const totalSteps = 5; 

    window.showStep = function(step) {
        document.querySelectorAll('.planner-step').forEach(s => s.classList.remove('active'));
        const stepElement = document.getElementById(`step${step}`);
        if(stepElement) {
            stepElement.classList.add('active');
            let progress = (step / totalSteps) * 100;
            if(step === 4) progress = 85; 
            if(step === 5) progress = 100;
            const progressBar = document.getElementById('progressBar');
            if(progressBar) progressBar.style.width = `${progress}%`;
            currentStep = step;
        }
    }

    window.nextStep = function(targetStep) {
        if(currentStep === 1 && !document.getElementById('monthlyIncome').value) { alert("Please enter your monthly income."); return; }
        if(currentStep === 2 && !document.getElementById('goalType').value) { alert("Please select a goal."); return; }
        if(currentStep === 3 && !document.getElementById('targetAmount').value) { alert("Please enter the target amount."); return; }
        showStep(targetStep);
    }

    window.prevStep = function(targetStep) { showStep(targetStep); }

    window.calculateGoal = function() {
        const targetAmountInput = document.getElementById('targetAmount');
        const currentSavingsInput = document.getElementById('currentSavings');
        const goalYearsInput = document.getElementById('goalYears');
        const goalTypeInput = document.getElementById('goalType');

        if(!targetAmountInput || !goalYearsInput) return;

        const targetAmount = parseFloat(targetAmountInput.value) || 0;
        const currentSavings = parseFloat(currentSavingsInput.value) || 0;
        const years = parseFloat(goalYearsInput.value) || 1;
        
        const rate = 15; 
        const monthlyRate = rate / 12 / 100;
        const months = years * 12;
        const currentSavingsFV = currentSavings * Math.pow((1 + rate/100), years);
        let requiredAmount = targetAmount - currentSavingsFV;
        
        const requiredSIPEl = document.getElementById('requiredSIP');

        if(requiredAmount <= 0) {
            if(requiredSIPEl) requiredSIPEl.innerText = "Goal Met!";
        } else {
            const factor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * (1 + monthlyRate);
            const monthlySIP = requiredAmount / factor;
            if(requiredSIPEl) requiredSIPEl.innerText = '₹ ' + Math.ceil(monthlySIP).toLocaleString('en-IN');
        }
        
        showStep(5);
    }

    window.resetPlanner = function() {
        const form = document.getElementById('plannerForm');
        if(form) form.reset();
        
        const yearValue = document.getElementById('yearValue');
        if(yearValue) yearValue.innerText = "5 Years";
        
        showStep(1);
    }
}

// --- 5. Standard Calculator ---
if (document.getElementById('stdChart')) {
    let stdMode = 'sip';
    let stdChart = null;

    function initStandardCalc() {
        const ctx = document.getElementById('stdChart').getContext('2d');
        stdChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Invested Amount', 'Est. Returns'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#003366', '#FF9900'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: {family: 'Poppins'} } } }
            }
        });
        updateStandardCalc();
    }

    window.switchCalcMode = function(mode) {
        stdMode = mode;
        document.querySelectorAll('.calc-tab').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        const label = document.getElementById('investLabel');
        const range = document.getElementById('stdInvest');
        
        if(mode === 'lumpsum') {
            label.innerText = 'Total Investment';
            range.max = 5000000;
            if(range.value < 5000) range.value = 50000;
        } else {
            label.innerText = 'Monthly Investment';
            range.max = 100000;
        }
        updateStandardCalc();
    }

    function updateStandardCalc() {
        const P = parseFloat(document.getElementById('stdInvest').value);
        const R = parseFloat(document.getElementById('stdRate').value);
        const T = parseFloat(document.getElementById('stdTime').value);

        document.getElementById('dispInvest').innerText = '₹ ' + P.toLocaleString('en-IN');
        document.getElementById('dispRate').innerText = R + ' %';
        document.getElementById('dispTime').innerText = T + ' Yr';

        let invested = 0, total = 0;

        if (stdMode === 'sip') {
            const i = (R / 100) / 12;
            const n = T * 12;
            invested = P * n;
            total = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        } else {
            invested = P;
            total = P * Math.pow((1 + R / 100), T);
        }

        const returns = total - invested;

        document.getElementById('txtInvested').innerText = '₹ ' + Math.round(invested).toLocaleString('en-IN');
        document.getElementById('txtReturns').innerText = '₹ ' + Math.round(returns).toLocaleString('en-IN');
        document.getElementById('txtTotal').innerText = '₹ ' + Math.round(total).toLocaleString('en-IN');

        stdChart.data.datasets[0].data = [Math.round(invested), Math.round(returns)];
        stdChart.update();
    }

    ['stdInvest', 'stdRate', 'stdTime'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateStandardCalc);
    });

    initStandardCalc();
}

// --- 6. Carousels (UPDATED RESPONSIVE LOGIC) ---
if (document.getElementById('servicesTrack')) {
    window.scrollServices = (direction) => {
        const track = document.getElementById('servicesTrack');
        const card = track.querySelector('.service-slide-card');
        const scrollAmt = card ? card.offsetWidth + 30 : 320; 
        track.scrollBy({ left: direction * scrollAmt, behavior: 'smooth' });
    };
}

if (document.getElementById('testimonialTrack')) {
    window.scrollTestimonials = (direction) => {
        const track = document.getElementById('testimonialTrack');
        const card = track.querySelector('.testimonial-card');
        const scrollAmt = card ? card.offsetWidth + 30 : 350; 
        track.scrollBy({ left: direction * scrollAmt, behavior: 'smooth' });
    };
}

// --- 7. Particle Background ---
const canvas = document.getElementById('particle-canvas');
if (canvas) {
    const c = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray;
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.color = 'rgba(255, 255, 255, 0.2)';
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if(this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
            if(this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
        }
        draw() {
            c.fillStyle = this.color;
            c.beginPath();
            c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            c.fill();
        }
    }

    function initParticles() {
        particlesArray = [];
        for(let i=0; i<50; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animateParticles() {
        c.clearRect(0, 0, canvas.width, canvas.height);
        for(let i=0; i<particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    });
}

// --- 8. 3D Tilt Effect ---
document.addEventListener('mousemove', (e) => {
    document.querySelectorAll('.tilt-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        } else {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        }
    });
});

// Scroll Progress Bar
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
    
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollProgress = document.querySelector('.scroll-progress');
    if(scrollProgress) scrollProgress.style.width = (winScroll / height) * 100 + "%";
});

// --- UPDATED CONTACT FORM HANDLER (WhatsApp Redirect) ---
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btn = e.target.querySelector('button');
        const originalText = btn.innerText;
        
        // Get values
        const name = document.getElementById('c-name').value;
        const mobile = document.getElementById('c-mobile').value;
        const email = document.getElementById('c-email').value;

        // Construct WhatsApp URL
        const message = `Hello, I want to request a callback.\n\nName: ${name}\nMobile: ${mobile}\nEmail: ${email}`;
        const whatsappUrl = `https://wa.me/919988065069?text=${encodeURIComponent(message)}`;

        btn.innerHTML = 'Redirecting... <i class="fab fa-whatsapp"></i>';
        btn.disabled = true;
        
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
            btn.innerHTML = originalText;
            btn.disabled = false;
            e.target.reset();
        }, 1500);
    });
}
