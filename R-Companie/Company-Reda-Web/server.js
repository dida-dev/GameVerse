// Initialize Lucide Icons
lucide.createIcons();

// Theme Toggle Functionality
const themeToggleBtn = document.getElementById('themeToggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);

  sunIcon.style.display = newTheme === 'dark' ? 'block' : 'none';
  moonIcon.style.display = newTheme === 'light' ? 'block' : 'none';
});

// Dynamic Dashboard Chart Animations
function updateDashboard() {
  const bars = document.querySelectorAll('.chart-bar');
  bars.forEach(bar => {
    const randomHeight = Math.floor(Math.random() * 60) + 35;
    bar.style.height = randomHeight + '%';
  });
}
setInterval(updateDashboard, 2500);

// AI Terminal Simulation
function runAiDemo(promptText) {
  const inputEl = document.getElementById('aiInput');
  const outputEl = document.getElementById('aiOutput');
  inputEl.value = promptText;
  outputEl.innerHTML = `Analyzing request: "${promptText}"...`;

  setTimeout(() => {
    outputEl.innerHTML = `> Query Execution Plan Generated.<br>> Status: Optimal.<br>> Projected Insight: Realized 28.4% velocity increase over standard benchmark datasets.`;
  }, 800);
}

// Interactive Accordion (FAQ)
document.querySelectorAll('.faq-header').forEach(header => {
  header.addEventListener('click', () => {
    const item = header.parentElement;
    item.classList.toggle('active');
  });
});

// Dynamic Pricing Switcher (Monthly/Annual)
const pricingToggle = document.getElementById('pricingToggle');
const priceElements = document.querySelectorAll('.price-val');

pricingToggle.addEventListener('change', (e) => {
  const isAnnual = e.target.checked;
  priceElements.forEach(price => {
    price.textContent = isAnnual ? price.getAttribute('data-annual') : price.getAttribute('data-monthly');
  });
});

// Demo Form Submission Handler
function handleFormSubmit(event) {
  event.preventDefault();
  const status = document.getElementById('formStatus');
  status.style.color = 'var(--accent)';
  status.textContent = 'Encrypting & submitting request...';

  setTimeout(() => {
    status.style.color = '#10b981';
    status.textContent = 'Success! A solutions engineer will reach out shortly.';
    document.getElementById('demoForm').reset();
  }, 1200);
}

// Intersection Observer for Scroll Animations
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));