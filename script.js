/*
  Make It Green – Core Script
  Handles authentication, navigation, OCR scanning, product analysis,
  mission management and recycling guide lookup. Data is stored in
  localStorage to persist user sessions without a backend.
*/

(function () {
  // Elements
  const authSection = document.getElementById('auth-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const scanSection = document.getElementById('scan-section');
  const missionsSection = document.getElementById('missions-section');
  const guideSection = document.getElementById('guide-section');
  const navBar = document.getElementById('nav-bar');
  const userEmailSpan = document.getElementById('user-email');
  const ecoScoreElem = document.getElementById('eco-score');
  const ecoBadgeElem = document.getElementById('eco-badge');
  const recentActivity = document.getElementById('recent-activity');
  // Auth forms
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const showSignupLink = document.getElementById('show-signup');
  const showLoginLink = document.getElementById('show-login');
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  // Nav buttons
  const navDashboard = document.getElementById('nav-dashboard');
  const navScan = document.getElementById('nav-scan');
  const navMissions = document.getElementById('nav-missions');
  const navGuide = document.getElementById('nav-guide');
  const logoutBtn = document.getElementById('logout-button');
  // Dashboard quick action buttons
  const goScanBtn = document.getElementById('go-scan');
  const goMissionsBtn = document.getElementById('go-missions');
  const goGuideBtn = document.getElementById('go-guide');
  // Scan elements
  const ticketInput = document.getElementById('ticket-input');
  const scanBtn = document.getElementById('scan-btn');
  const scanLoading = document.getElementById('scan-loading');
  const scanResults = document.getElementById('scan-results');
  // Missions
  const missionsListElem = document.getElementById('missions-list');
  // Guide
  const guideSearch = document.getElementById('guide-search');
  const guideSearchBtn = document.getElementById('guide-search-btn');
  const guideResult = document.getElementById('guide-result');

  // Hard‑coded missions (could be fetched from a backend later)
  const missions = [
    { id: 1, title: 'Apporter votre propre sac réutilisable', points: 10 },
    { id: 2, title: 'Éteindre les lumières inutiles', points: 10 },
    { id: 3, title: 'Utiliser un gobelet réutilisable', points: 15 },
    { id: 4, title: 'Ne pas gaspiller de nourriture aujourd’hui', points: 20 },
    { id: 5, title: 'Se déplacer à vélo ou à pied', points: 15 },
  ];

  // Simple recycling guide dictionary
  const guideData = {
    'bouteille plastique': 'À mettre dans le bac jaune (plastique). Videz et aplatissez-la.',
    'canette': 'À déposer dans le bac jaune (métal).',
    'papier': 'À recycler dans le bac bleu (papier/carton).',
    'verre': 'À déposer dans le conteneur à verre (pas de couvercle ou bouchon).',
    'pile': 'À apporter dans un point de collecte spécialisé (supermarché, déchetterie).',
    'textile': 'Apporter dans un point relais ou donner à une association.',
    'ampoule': 'À apporter en magasin ou en déchetterie (déchets dangereux).',
  };

  /**
   * Utility to get stored users from localStorage.
   */
  function getUsers() {
    const data = localStorage.getItem('mgi_users');
    return data ? JSON.parse(data) : {};
  }

  /**
   * Save users back to localStorage.
   */
  function saveUsers(users) {
    localStorage.setItem('mgi_users', JSON.stringify(users));
  }

  /**
   * Get current user email.
   */
  function getCurrentUser() {
    return localStorage.getItem('mgi_current_user');
  }

  /**
   * Set current user email.
   */
  function setCurrentUser(email) {
    if (email) localStorage.setItem('mgi_current_user', email);
    else localStorage.removeItem('mgi_current_user');
  }

  /**
   * Show only the desired section.
   */
  function showSection(section) {
    // hide all sections
    [authSection, dashboardSection, scanSection, missionsSection, guideSection].forEach(
      (sec) => (sec.style.display = 'none')
    );
    // show requested section
    section.style.display = 'block';
  }

  /**
   * Refresh dashboard information.
   */
  function refreshDashboard() {
    const email = getCurrentUser();
    if (!email) return;
    const users = getUsers();
    const user = users[email];
    userEmailSpan.textContent = email;
    ecoScoreElem.textContent = user.score || 0;
    // set badge text based on score
    let badge = '🌱';
    if (user.score >= 80) badge = '🌳';
    else if (user.score >= 50) badge = '🍀';
    else if (user.score >= 20) badge = '🌿';
    ecoBadgeElem.textContent = badge;
    // update recent activity (missions completed)
    recentActivity.innerHTML = '';
    if (user.missions) {
      const done = Object.values(user.missions).filter((m) => m).length;
      if (done > 0) {
        const p = document.createElement('p');
        p.textContent = `${done} mission${done > 1 ? 's' : ''} accomplie${done > 1 ? 's' : ''}`;
        recentActivity.appendChild(p);
      }
    }
  }

  /**
   * Populate missions list UI.
   */
  function populateMissions() {
    const email = getCurrentUser();
    const users = getUsers();
    const user = users[email];
    missionsListElem.innerHTML = '';
    missions.forEach((mission, index) => {
      const card = document.createElement('div');
      card.className = 'mission-card';
      const done = user.missions && user.missions[mission.id];
      if (done) card.classList.add('completed');
      const title = document.createElement('span');
      title.textContent = mission.title;
      const btn = document.createElement('button');
      btn.textContent = done ? 'Validée' : `+${mission.points} pts`;
      btn.disabled = !!done;
      btn.className = done ? 'secondary' : 'primary';
      btn.addEventListener('click', () => {
        // mark as completed
        if (!user.missions) user.missions = {};
        user.missions[mission.id] = true;
        user.score = (user.score || 0) + mission.points;
        saveUsers(users);
        refreshDashboard();
        populateMissions();
      });
      card.appendChild(title);
      card.appendChild(btn);
      missionsListElem.appendChild(card);
    });
  }

  /**
   * Handle login.
   */
  loginBtn.addEventListener('click', () => {
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    const users = getUsers();
    if (!users[email]) {
      alert('Aucun compte trouvé pour cet email.');
      return;
    }
    if (users[email].password !== password) {
      alert('Mot de passe incorrect.');
      return;
    }
    setCurrentUser(email);
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    navBar.style.display = 'flex';
    refreshDashboard();
    showSection(dashboardSection);
  });

  /**
   * Handle signup.
   */
  signupBtn.addEventListener('click', () => {
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value;
    if (!email || !password) {
      alert('Veuillez renseigner email et mot de passe.');
      return;
    }
    const users = getUsers();
    if (users[email]) {
      alert('Un compte avec cet email existe déjà.');
      return;
    }
    users[email] = { password: password, score: 0, missions: {} };
    saveUsers(users);
    setCurrentUser(email);
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    navBar.style.display = 'flex';
    refreshDashboard();
    showSection(dashboardSection);
  });

  // Switch between login and signup forms
  showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  });
  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
  });

  // Navigation controls
  navDashboard.addEventListener('click', () => {
    refreshDashboard();
    showSection(dashboardSection);
  });
  navScan.addEventListener('click', () => showSection(scanSection));
  navMissions.addEventListener('click', () => {
    populateMissions();
    showSection(missionsSection);
  });
  navGuide.addEventListener('click', () => showSection(guideSection));
  logoutBtn.addEventListener('click', () => {
    setCurrentUser(null);
    navBar.style.display = 'none';
    showSection(authSection);
  });

  // Quick links in dashboard
  goScanBtn.addEventListener('click', () => showSection(scanSection));
  goMissionsBtn.addEventListener('click', () => {
    populateMissions();
    showSection(missionsSection);
  });
  goGuideBtn.addEventListener('click', () => showSection(guideSection));

  // Guide search
  guideSearchBtn.addEventListener('click', () => {
    const term = guideSearch.value.trim().toLowerCase();
    guideResult.innerHTML = '';
    if (!term) return;
    const info = guideData[term];
    const card = document.createElement('div');
    card.className = 'guide-result';
    if (info) {
      card.textContent = info;
    } else {
      card.textContent = "Désolé, aucune information trouvée pour cet objet.";
    }
    guideResult.appendChild(card);
  });

  /**
   * Analyse the uploaded ticket using Tesseract.js.
   */
  scanBtn.addEventListener('click', async () => {
    const file = ticketInput.files[0];
    scanResults.innerHTML = '';
    if (!file) {
      alert('Veuillez sélectionner une image.');
      return;
    }
    scanLoading.style.display = 'block';
    try {
      const worker = Tesseract.create({ logger: (m) => console.log(m) });
      const { data } = await worker.recognize(file, 'fra');
      await worker.terminate();
      scanLoading.style.display = 'none';
      const lines = data.text.split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 2);
      if (lines.length === 0) {
        scanResults.innerHTML = '<p>Aucun texte détecté.</p>';
        return;
      }
      // Limit to first 8 lines to avoid long delays
      const limited = lines.slice(0, 8);
      for (const line of limited) {
        const card = await createProductCard(line);
        scanResults.appendChild(card);
      }
    } catch (err) {
      console.error(err);
      scanLoading.style.display = 'none';
      scanResults.innerHTML = '<p>Erreur lors de l\'analyse du ticket. Veuillez réessayer.</p>';
    }
  });

  /**
   * Create a product card by querying Open Food Facts API.
   * @param {string} query Product name extracted from receipt
   */
  async function createProductCard(query) {
    const container = document.createElement('div');
    container.className = 'product-card';
    const title = document.createElement('h4');
    title.textContent = query;
    container.appendChild(title);
    const scoreLine = document.createElement('p');
    scoreLine.className = 'score-label';
    const altLine = document.createElement('p');
    const diyLine = document.createElement('p');
    container.appendChild(scoreLine);
    container.appendChild(altLine);
    container.appendChild(diyLine);
    // Try to fetch product from OFF
    let grade = null;
    try {
      const url = `https://world.openfoodfacts.org/api/v2/search?search_term=${encodeURIComponent(
        query
      )}&page_size=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          const prod = data.products[0];
          grade = prod.nutriscore_grade || prod.ecoscore_grade || null;
        }
      }
    } catch (e) {
      console.warn('API error', e);
    }
    let verdict;
    if (grade) {
      const g = grade.toLowerCase();
      if (['a', 'b'].includes(g)) verdict = 'bon';
      else if (g === 'c') verdict = 'moyen';
      else verdict = 'mauvais';
    } else {
      verdict = 'inconnu';
    }
    scoreLine.textContent = `Score écologique : ${verdict}`;
    // Suggest alternatives
    if (verdict === 'mauvais') {
      altLine.textContent = 'Alternative : choisissez un produit local ou biologique.';
    } else if (verdict === 'moyen') {
      altLine.textContent = 'Alternative : préférez un produit en vrac ou sans emballage.';
    } else if (verdict === 'bon') {
      altLine.textContent = 'Bonne nouvelle ! Ce produit est plutôt respectueux.';
    } else {
      altLine.textContent = 'Alternative : optez pour des produits durables.';
    }
    // DIY suggestions based on category keywords
    const lower = query.toLowerCase();
    if (lower.includes('détergent') || lower.includes('nettoyant')) {
      diyLine.textContent = 'DIY : réalisez votre propre nettoyant multi‑usages avec du vinaigre blanc et du citron.';
    } else if (lower.includes('shampoing')) {
      diyLine.textContent = 'DIY : préparez un shampoing naturel avec du savon de Marseille et des huiles essentielles.';
    } else if (lower.includes('lingette') || lower.includes('essuie')) {
      diyLine.textContent = 'DIY : utilisez des lingettes lavables en tissu au lieu de jetables.';
    } else {
      diyLine.textContent = '';
    }
    return container;
  }

  /**
   * Initialize app on load: check if user is logged in.
   */
  function init() {
    const current = getCurrentUser();
    if (current) {
      navBar.style.display = 'flex';
      refreshDashboard();
      showSection(dashboardSection);
    } else {
      showSection(authSection);
    }
    // Render icons when ready
    if (window.feather) feather.replace();
  }

  window.addEventListener('DOMContentLoaded', init);
})();