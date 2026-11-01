/**
 * ============================================================
 * CRYPTOCONNECT PRO - FRONTEND APPLICATION CONTROLLER
 * Architecture SPA réactive, multi-écrans & intégration REST API 100% connectée
 * ============================================================
 */

// État global de l'application
const AppState = {
  currentScreenId: 'screen-landing',
  isAuthenticated: false,
  currentUser: null,
  token: null,
  services: [],
  articles: [],
  selectedService: null,
  selectedArticle: null,
  activeDifficulty: 'all',
  searchQuery: '',
  selectedCurrency: 'USD', // 'USD', 'FCFA', 'EUR'
  cryptoRates: [],
  currencies: { USD: 1, FCFA: 605, EUR: 0.92 },
  adminData: {
    stats: null,
    users: [],
    kycList: [],
    requests: []
  }
};

// ============================================================
// INITIALISATION AU CHARGEMENT DU DOM
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  initScreenNavigation();
  initModals();
  initCurrencySwitcher();
  initConverterWidget();
  initLiveTicker();
  initServices();
  initEducation();
  initForms();
  initAdminDashboard();

  // Restaurer la session utilisateur sauvegardée si existante
  await checkExistingSession();

  // Routage automatique vers l'écran ciblé (#admin, admin.html, etc.)
  const targetScreen = sessionStorage.getItem('cc_target_screen');
  if (targetScreen) {
    sessionStorage.removeItem('cc_target_screen');
    setTimeout(() => navigateToScreen(targetScreen), 100);
  } else if (window.location.hash === '#admin' || window.location.pathname.endsWith('admin.html')) {
    setTimeout(() => navigateToScreen('screen-admin'), 100);
  }

  // Écouteur global pour actualiser les données
  loadUserRequests();
});

// Helper de notification Toast
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠️' : '✕';
  const color = type === 'success' ? '#10B981' : type === 'warning' ? '#F59E0B' : '#EF4444';
  toast.innerHTML = `<span style="color: ${color}; font-weight: 800; font-size: 16px;">${icon}</span> <span style="font-size: 13.5px; line-height: 1.4;">${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Helper pour requêtes fetch authentifiées
async function apiFetch(url, options = {}) {
  const headers = options.headers || {};
  if (AppState.token) {
    headers['Authorization'] = `Bearer ${AppState.token}`;
  }
  return fetch(url, { ...options, headers });
}

// ============================================================
// GESTION DE SESSION ET SYNCHRONISATION NAVBAR
// ============================================================
async function checkExistingSession() {
  const savedToken = localStorage.getItem('cc_token');
  if (!savedToken) {
    updateAuthUI();
    return;
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${savedToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      AppState.isAuthenticated = true;
      AppState.token = savedToken;
      AppState.currentUser = data.user;
      console.log('✅ Session restaurée:', data.user.name, `(${data.user.role})`);
    } else {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
      AppState.isAuthenticated = false;
      AppState.token = null;
      AppState.currentUser = null;
    }
  } catch (e) {
    console.warn('Session offline fallback');
  }

  updateAuthUI();
}

function updateAuthUI() {
  const navVisitor = document.getElementById('navVisitorAuthGroup');
  const navUser = document.getElementById('navUserAuthGroup');
  const navHome = document.getElementById('navLinkHome');
  const navHomeLabel = document.getElementById('navHomeLabel');
  const navAdmin = document.getElementById('navLinkAdmin');
  const mobileTabHome = document.getElementById('mobileTabHome');
  const adminRoleDisplay = document.getElementById('adminRoleDisplay');

  if (AppState.isAuthenticated && AppState.currentUser) {
    const user = AppState.currentUser;
    if (navVisitor) navVisitor.style.display = 'none';
    if (navUser) navUser.style.display = 'flex';
    if (navHome) navHome.setAttribute('data-nav-target', 'screen-home');
    if (navHomeLabel) navHomeLabel.textContent = 'Mon Espace';
    if (mobileTabHome) mobileTabHome.setAttribute('data-tab', 'screen-home');

    // Vérifier les droits administrateur
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    if (navAdmin) {
      navAdmin.style.display = isAdmin ? 'inline-flex' : 'none';
    }
    if (adminRoleDisplay) {
      adminRoleDisplay.textContent = (user.role || 'user').toUpperCase();
    }

    updateProfileUI();
  } else {
    if (navVisitor) navVisitor.style.display = 'flex';
    if (navUser) navUser.style.display = 'none';
    if (navHome) navHome.setAttribute('data-nav-target', 'screen-landing');
    if (navHomeLabel) navHomeLabel.textContent = 'Accueil';
    if (mobileTabHome) mobileTabHome.setAttribute('data-tab', 'screen-landing');
    if (navAdmin) navAdmin.style.display = 'none';
  }
}

async function logout() {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch (e) {}

  localStorage.removeItem('cc_token');
  localStorage.removeItem('cc_user');
  AppState.isAuthenticated = false;
  AppState.currentUser = null;
  AppState.token = null;

  updateAuthUI();
  showToast('Vous avez été déconnecté avec succès.');
  navigateToScreen('screen-landing');
}

// ============================================================
// NAVIGATION ENTRE LES ÉCRANS (SPA)
// ============================================================
function navigateToScreen(screenId) {
  // Protection de l'écran d'administration
  if (screenId === 'screen-admin') {
    if (!AppState.isAuthenticated || (AppState.currentUser?.role !== 'admin' && AppState.currentUser?.role !== 'super_admin')) {
      showToast('Accès réservé aux administrateurs. Connectez-vous avec le compte admin.', 'warning');
      openModal('modalLogin');
      return;
    }
    loadAdminDashboard();
  }

  // Protection du profil client
  if (screenId === 'screen-profile' && !AppState.isAuthenticated) {
    showToast('Veuillez vous connecter pour accéder à votre espace personnel.', 'warning');
    openModal('modalLogin');
    return;
  }

  const screens = document.querySelectorAll('.app-screen');
  screens.forEach((s) => s.classList.remove('active'));

  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    AppState.currentScreenId = screenId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Synchronisation des liens Desktop
  document.querySelectorAll('.nav-link-btn').forEach((btn) => {
    const targetAttr = btn.getAttribute('data-nav-target');
    if (
      targetAttr === screenId ||
      (screenId === 'screen-landing' && targetAttr === 'screen-landing') ||
      (screenId === 'screen-home' && targetAttr === 'screen-home')
    ) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Synchronisation des onglets mobiles
  document.querySelectorAll('.nav-tab-btn').forEach((tab) => {
    const tabTarget = tab.dataset.tab;
    if (
      tabTarget === screenId ||
      (screenId === 'screen-home' && tabTarget === 'screen-landing') ||
      (screenId === 'screen-landing' && tabTarget === 'screen-landing')
    ) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

function initScreenNavigation() {
  document.querySelectorAll('[data-nav-target]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const target = el.getAttribute('data-nav-target');
      if (target) navigateToScreen(target);
    });
  });

  document.querySelectorAll('.nav-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.dataset.tab;
      if (tabTarget) navigateToScreen(tabTarget);
    });
  });

  // Boutons Démo rapide
  const btnNavQuickDemo = document.getElementById('btnNavQuickDemo');
  if (btnNavQuickDemo) {
    btnNavQuickDemo.addEventListener('click', () => openModal('modalLogin'));
  }

  const btnLandingDemo = document.getElementById('btnLandingDemo');
  if (btnLandingDemo) {
    btnLandingDemo.addEventListener('click', () => openModal('modalLogin'));
  }

  // Boutons Auth Landing
  const btnLandingRegister = document.getElementById('btnLandingRegister');
  if (btnLandingRegister) {
    btnLandingRegister.addEventListener('click', () => openModal('modalRegister'));
  }

  const btnLandingLogin = document.getElementById('btnLandingLogin');
  if (btnLandingLogin) {
    btnLandingLogin.addEventListener('click', () => openModal('modalLogin'));
  }

  // Boutons Auth Navbar
  const btnNavRegister = document.getElementById('btnNavRegister');
  if (btnNavRegister) {
    btnNavRegister.addEventListener('click', () => openModal('modalRegister'));
  }

  const btnNavLogin = document.getElementById('btnNavLogin');
  if (btnNavLogin) {
    btnNavLogin.addEventListener('click', () => openModal('modalLogin'));
  }

  const btnNavLogout = document.getElementById('btnNavLogout');
  if (btnNavLogout) {
    btnNavLogout.addEventListener('click', () => logout());
  }

  // Raccourcis Home Dashboard
  const btnHomeProfile = document.getElementById('btnHomeProfile');
  if (btnHomeProfile) {
    btnHomeProfile.addEventListener('click', () => navigateToScreen('screen-profile'));
  }

  const btnHeroLearnMore = document.getElementById('btnHeroLearnMore');
  if (btnHeroLearnMore) {
    btnHeroLearnMore.addEventListener('click', () => openArticleDetail('cnt_001'));
  }

  const linkViewAllServices = document.getElementById('linkViewAllServices');
  if (linkViewAllServices) {
    linkViewAllServices.addEventListener('click', () => navigateToScreen('screen-services'));
  }

  const btnBackFromArticle = document.getElementById('btnBackFromArticle');
  if (btnBackFromArticle) {
    btnBackFromArticle.addEventListener('click', () => navigateToScreen('screen-education'));
  }

  const btnTriggerKycModal = document.getElementById('btnTriggerKycModal');
  if (btnTriggerKycModal) {
    btnTriggerKycModal.addEventListener('click', () => openModal('modalKyc'));
  }
}

// ============================================================
// GESTION DES MODALES
// ============================================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function initModals() {
  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });

  document.querySelectorAll('.app-modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  const btnSwitchToRegister = document.getElementById('btnSwitchToRegister');
  if (btnSwitchToRegister) {
    btnSwitchToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal('modalLogin');
      openModal('modalRegister');
    });
  }

  const btnSwitchToLogin = document.getElementById('btnSwitchToLogin');
  if (btnSwitchToLogin) {
    btnSwitchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal('modalRegister');
      openModal('modalLogin');
    });
  }

  // Démo 1-Clic : Client Kouassi Alain
  const btnQuickDemoLogin = document.getElementById('btnQuickDemoLogin');
  if (btnQuickDemoLogin) {
    btnQuickDemoLogin.addEventListener('click', async (e) => {
      e.preventDefault();
      await executeLogin('kouassi@email.com', 'Password123');
    });
  }

  // Démo 1-Clic : Super Administrateur
  const btnQuickDemoAdmin = document.getElementById('btnQuickDemoAdmin');
  if (btnQuickDemoAdmin) {
    btnQuickDemoAdmin.addEventListener('click', async (e) => {
      e.preventDefault();
      await executeLogin('admin@cryptoconnect.app', 'Admin@123456');
    });
  }

  // Menu Profil Actions
  const btnMenuRequests = document.getElementById('btnMenuRequests');
  if (btnMenuRequests) {
    btnMenuRequests.addEventListener('click', () => {
      loadUserRequests();
      showToast('Historique des demandes actualisé.');
    });
  }

  const btnMenuKyc = document.getElementById('btnMenuKyc');
  if (btnMenuKyc) {
    btnMenuKyc.addEventListener('click', () => openModal('modalKyc'));
  }

  const btnMenuFavorites = document.getElementById('btnMenuFavorites');
  if (btnMenuFavorites) {
    btnMenuFavorites.addEventListener('click', () => {
      navigateToScreen('screen-education');
      showToast('Découvrez nos guides recommandés dans l\'Académie !');
    });
  }

  const btnMenuLogout = document.getElementById('btnMenuLogout');
  if (btnMenuLogout) {
    btnMenuLogout.addEventListener('click', () => logout());
  }
}

// ============================================================
// COMMUTATEUR MULTI-DEVISES & CALCULATEUR INSTANTANÉ (ACCUEIL)
// ============================================================
function initCurrencySwitcher() {
  const container = document.getElementById('landingCurrencySwitcher');
  if (!container) return;

  container.querySelectorAll('.currency-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.currency-pill').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.selectedCurrency = btn.dataset.currency;
      renderAllTickerCards();
      updateConverterDisplay();
    });
  });
}

function initConverterWidget() {
  const amountInput = document.getElementById('converterAmountInput');
  const fromSelect = document.getElementById('converterFromSelect');
  const toSelect = document.getElementById('converterToSelect');
  const btnAction = document.getElementById('btnConverterAction');

  const recalculate = () => {
    const amount = parseFloat(amountInput?.value) || 0;
    const from = fromSelect?.value || 'USDT';
    const to = toSelect?.value || 'FCFA';

    // Trouver le prix USD de départ
    let fromUsd = 1;
    if (from === 'USD') fromUsd = 1;
    else if (from === 'FCFA') fromUsd = 1 / 605;
    else if (from === 'EUR') fromUsd = 1 / 0.92;
    else {
      const coin = AppState.cryptoRates.find((c) => c.symbol === from);
      if (coin) fromUsd = coin.priceUsd;
      else if (from === 'BTC') fromUsd = 68450;
      else if (from === 'ETH') fromUsd = 3520;
      else if (from === 'SOL') fromUsd = 184.5;
    }

    const totalUsd = amount * fromUsd;

    // Convertir vers la devise cible
    let result = 0;
    if (to === 'FCFA') result = Math.round(totalUsd * 605);
    else if (to === 'EUR') result = (totalUsd * 0.92).toFixed(2);
    else if (to === 'USD') result = totalUsd.toFixed(2);
    else {
      const targetCoin = AppState.cryptoRates.find((c) => c.symbol === to);
      const targetUsd = targetCoin ? targetCoin.priceUsd : 1;
      result = (totalUsd / targetUsd).toFixed(6);
    }

    const resInput = document.getElementById('converterResultInput');
    if (resInput) {
      resInput.value = typeof result === 'number' ? result.toLocaleString() : result;
    }

    const rateDisplay = document.getElementById('converterRateDisplay');
    if (rateDisplay) {
      if (from === 'USDT' && to === 'FCFA') {
        rateDisplay.innerHTML = 'Taux de change garanti : <strong>1 USDT = 605 FCFA (Wave / Orange Money)</strong>';
      } else {
        rateDisplay.innerHTML = `Simulation directe : <strong>${amount} ${from} ≈ ${resInput?.value} ${to}</strong>`;
      }
    }
  };

  if (amountInput) amountInput.addEventListener('input', recalculate);
  if (fromSelect) fromSelect.addEventListener('change', recalculate);
  if (toSelect) toSelect.addEventListener('change', recalculate);

  if (btnAction) {
    btnAction.addEventListener('click', () => {
      const amount = amountInput?.value || '100';
      const from = fromSelect?.value || 'USDT';
      const to = toSelect?.value || 'FCFA';

      navigateToScreen('screen-contact');
      const subjectInput = document.querySelector('#formContactMessage [name="subject"]');
      const msgInput = document.querySelector('#formContactMessage [name="message"]');
      if (subjectInput) {
        subjectInput.value = `Demande d'échange direct : ${amount} ${from} vers ${to}`;
      }
      if (msgInput) {
        msgInput.value = `Bonjour, je souhaite échanger immédiatement ${amount} ${from} contre des ${to} au taux affiché. Merci de me contacter pour finaliser le transfert.`;
      }
      showToast('Formulaire de transfert pré-rempli ! Transmettez votre demande en 1 clic.');
    });
  }
}

function updateConverterDisplay() {
  const amountInput = document.getElementById('converterAmountInput');
  if (amountInput) {
    amountInput.dispatchEvent(new Event('input'));
  }
}

// ============================================================
// COURS CRYPTO EN TEMPS RÉEL (TICKER)
// ============================================================
function initLiveTicker() {
  async function fetchRates() {
    try {
      const res = await fetch('/api/crypto-rates');
      if (!res.ok) return;
      const data = await res.json();
      AppState.cryptoRates = data.rates || [];
      if (data.currencies) AppState.currencies = data.currencies;
      renderAllTickerCards();
      updateConverterDisplay();
    } catch (e) {
      // Ignorer les erreurs réseau temporaires
    }
  }

  fetchRates();
  // Actualisation toutes les 10 secondes
  setInterval(fetchRates, 10000);
}

function formatPriceByCurrency(coin) {
  const curr = AppState.selectedCurrency;
  if (curr === 'FCFA') {
    return `${(coin.priceFcfa || Math.round(coin.priceUsd * 605)).toLocaleString()} FCFA`;
  } else if (curr === 'EUR') {
    return `€ ${(coin.priceEur || (coin.priceUsd * 0.92).toFixed(2)).toLocaleString()}`;
  } else {
    return `$ ${coin.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  }
}

function renderAllTickerCards() {
  const rates = AppState.cryptoRates;
  if (!rates || rates.length === 0) return;

  // Mini ticker de la navbar
  const btc = rates.find((r) => r.symbol === 'BTC');
  const miniTicker = document.getElementById('navMiniTicker');
  if (miniTicker && btc) {
    miniTicker.innerHTML = `
      <span class="ticker-dot"></span>
      <span class="ticker-btc-label">BTC: ${formatPriceByCurrency(btc)}</span>
      <span class="ticker-btc-change" style="color: ${btc.change24h.startsWith('+') ? '#34D399' : '#F87171'}">${btc.change24h}</span>
    `;
  }

  // Cartes de cours de la page d'accueil
  const renderCards = () =>
    rates
      .map(
        (coin) => `
      <div class="ticker-desktop-card">
        <div class="ticker-card-top">
          <div class="ticker-token-info">
            <img src="${coin.icon}" alt="${coin.symbol}">
            <div>
              <strong>${coin.name}</strong>
              <span class="token-sym">${coin.symbol}</span>
            </div>
          </div>
          <span class="ticker-change ${coin.change24h.startsWith('+') ? 'up' : 'down'}">${coin.change24h}</span>
        </div>
        <div class="ticker-card-price">${formatPriceByCurrency(coin)}</div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; display: flex; justify-content: space-between;">
          <span>H: $${coin.high24h || coin.priceUsd}</span>
          <span>B: $${coin.low24h || coin.priceUsd}</span>
        </div>
      </div>
    `
      )
      .join('');

  const landingTicker = document.getElementById('landingTickerGrid');
  if (landingTicker) landingTicker.innerHTML = renderCards();

  const dashboardTicker = document.getElementById('cryptoTickerBar');
  if (dashboardTicker) dashboardTicker.innerHTML = renderCards();
}

// ============================================================
// SERVICES MODULE
// ============================================================
async function initServices() {
  try {
    const res = await fetch('/api/services');
    if (res.ok) {
      const data = await res.json();
      AppState.services = data.services || [];
    }
  } catch (e) {
    console.warn('API services offline fallback');
  }

  // Écouteurs de clics sur les cartes de service
  document.querySelectorAll('[data-service-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const srvId = card.dataset.serviceId;
      openServiceDetail(srvId);
    });
  });

  const btnServiceInquiry = document.getElementById('btnServiceInquiry');
  if (btnServiceInquiry) {
    btnServiceInquiry.addEventListener('click', () => {
      closeModal('modalServiceDetail');
      navigateToScreen('screen-contact');
      const subjectInput = document.querySelector('#formContactMessage [name="subject"]');
      if (subjectInput && AppState.selectedService) {
        subjectInput.value = `Demande de service : ${AppState.selectedService.name}`;
      }
      showToast('Formulaire pré-rempli pour votre demande de service.');
    });
  }
}

function openServiceDetail(serviceId) {
  const service = AppState.services.find(
    (s) => s._id === serviceId || s.id === serviceId || s.slug === serviceId
  );
  if (!service) return;

  AppState.selectedService = service;

  const titleEl = document.getElementById('modalServiceTitle');
  if (titleEl) titleEl.textContent = service.name;

  const descEl = document.getElementById('modalServiceDesc');
  if (descEl) descEl.textContent = service.description;

  const benefitsEl = document.getElementById('modalServiceBenefits');
  if (benefitsEl) {
    benefitsEl.innerHTML = '';
    (service.benefits || []).forEach((b) => {
      const li = document.createElement('li');
      li.textContent = b;
      benefitsEl.appendChild(li);
    });
  }

  const stepsEl = document.getElementById('modalServiceSteps');
  if (stepsEl) {
    stepsEl.innerHTML = '';
    (service.accessSteps || []).forEach((s) => {
      const li = document.createElement('li');
      li.textContent = s;
      stepsEl.appendChild(li);
    });
  }

  openModal('modalServiceDetail');
}

// ============================================================
// ACADÉMIE & CONTENUS ÉDUCATIFS
// ============================================================
async function initEducation() {
  try {
    const res = await fetch('/api/content');
    if (res.ok) {
      const data = await res.json();
      AppState.articles = data.content || [];
    }
  } catch (e) {
    console.warn('API content offline fallback');
  }

  // Filtres par niveau de difficulté
  document.querySelectorAll('.filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      AppState.activeDifficulty = pill.dataset.difficulty;
      filterArticles();
    });
  });

  // Barre de recherche avec filtrage instantané
  const searchInput = document.getElementById('educationSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value.toLowerCase().trim();
      filterArticles();
    });
  }

  bindArticleCardClicks();
}

function bindArticleCardClicks() {
  document.querySelectorAll('[data-article-id]').forEach((card) => {
    card.addEventListener('click', () => {
      openArticleDetail(card.dataset.articleId);
    });
  });
}

function filterArticles() {
  const container = document.getElementById('educationCardsList');
  if (!container) return;

  const filtered = AppState.articles.filter((article) => {
    const matchDiff =
      AppState.activeDifficulty === 'all' ||
      article.difficultyLevel === AppState.activeDifficulty;
    const matchQuery =
      !AppState.searchQuery ||
      article.title.toLowerCase().includes(AppState.searchQuery) ||
      article.excerpt.toLowerCase().includes(AppState.searchQuery) ||
      (article.tags && article.tags.some((t) => t.toLowerCase().includes(AppState.searchQuery)));
    return matchDiff && matchQuery;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 10px; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
        <p style="font-size: 15px;">Aucun article trouvé pour cette recherche.</p>
        <button class="btn-link-subtle" onclick="document.getElementById('educationSearchInput').value=''; AppState.searchQuery=''; filterArticles();" style="color: var(--primary-gold); margin-top: 10px;">
          Réinitialiser la recherche
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map(
      (item) => `
    <article class="edu-desktop-card" data-article-id="${item._id || item.id}">
      <div class="edu-card-cover">
        <img src="${item.coverImageUrl}" alt="${item.title}">
        <span class="badge-tag ${item.difficultyLevel}">${item.difficultyLabel}</span>
      </div>
      <div class="edu-card-body">
        <div class="card-meta-line">
          <span>⏱ ${item.readingTime || '4 min'} de lecture</span>
          <span>• Guide officiel</span>
        </div>
        <h4>${item.title}</h4>
        <p>${item.excerpt}</p>
        <div class="edu-card-footer">
          <span class="read-link">Lire l'article complet →</span>
        </div>
      </div>
    </article>
  `
    )
    .join('');

  bindArticleCardClicks();
}

async function openArticleDetail(articleId) {
  const article = AppState.articles.find(
    (a) => a._id === articleId || a.id === articleId || a.slug === articleId
  );
  if (!article) return;

  AppState.selectedArticle = article;

  const heroImg = document.getElementById('articleHeroImg');
  if (heroImg) heroImg.src = article.coverImageUrl;

  const badge = document.getElementById('articleDetailBadge');
  if (badge) {
    badge.textContent = article.difficultyLabel;
    badge.className = `badge-tag ${article.difficultyLevel}`;
  }

  const titleEl = document.getElementById('articleDetailTitle');
  if (titleEl) titleEl.textContent = article.title;

  const introEl = document.getElementById('articleIntroText');
  if (introEl) introEl.textContent = article.excerpt;

  const timeEl = document.getElementById('articleReadingTime');
  if (timeEl) timeEl.textContent = `⏱ Lecture ${article.readingTime || '4 min'}`;

  const summaryList = document.getElementById('articleSummaryList');
  if (summaryList) {
    summaryList.innerHTML = '';
    (article.summaryPoints || []).forEach((point) => {
      const li = document.createElement('li');
      li.textContent = point;
      summaryList.appendChild(li);
    });
  }

  const fullText = document.getElementById('articleFullText');
  if (fullText) {
    fullText.textContent = article.body || '';
    fullText.style.display = 'block';
  }

  navigateToScreen('screen-article');

  // Enregistrer la vue auprès de l'API
  try {
    fetch(`/api/content/${article._id || article.id}`);
  } catch (e) {}
}

// ============================================================
// FORMULAIRES & SOUMISSIONS API
// ============================================================
async function executeLogin(email, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      AppState.isAuthenticated = true;
      AppState.token = data.accessToken;
      AppState.currentUser = data.user;

      localStorage.setItem('cc_token', data.accessToken);
      localStorage.setItem('cc_user', JSON.stringify(data.user));

      updateAuthUI();
      closeModal('modalLogin');
      showToast(`Connexion réussie ! Bienvenue, ${data.user.name}.`);

      if (data.user.role === 'admin' || data.user.role === 'super_admin') {
        navigateToScreen('screen-admin');
      } else {
        navigateToScreen('screen-home');
      }
      loadUserRequests();
    } else {
      showToast(data.error || 'Erreur lors de la connexion', 'error');
    }
  } catch (err) {
    showToast('Erreur serveur lors de la connexion', 'error');
  }
}

function initForms() {
  // Formulaire de connexion
  const formLogin = document.getElementById('formLogin');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(formLogin);
      await executeLogin(formData.get('email'), formData.get('password'));
    });
  }

  // Formulaire d'inscription
  const formRegister = document.getElementById('formRegister');
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(formRegister);
      const body = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password')
      };

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (res.ok && data.success) {
          AppState.isAuthenticated = true;
          AppState.token = data.accessToken;
          AppState.currentUser = data.user;

          localStorage.setItem('cc_token', data.accessToken);
          localStorage.setItem('cc_user', JSON.stringify(data.user));

          updateAuthUI();
          closeModal('modalRegister');
          showToast(`Compte créé avec succès ! Bienvenue, ${data.user.name}.`);
          navigateToScreen('screen-home');
        } else {
          showToast(data.error || 'Erreur lors de la création de compte', 'error');
        }
      } catch (err) {
        showToast('Erreur serveur lors de l\'inscription', 'error');
      }
    });
  }

  // Formulaire de contact public
  const formContact = document.getElementById('formContactMessage');
  if (formContact) {
    formContact.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(formContact);
      const body = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
      };

      try {
        const res = await apiFetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (res.ok && data.success) {
          formContact.reset();
          loadUserRequests();
          showToast(data.message || 'Votre message a bien été transmis. Réponse garantie sous 24h.');
        } else {
          showToast(data.error || 'Erreur lors de l\'envoi du message.', 'error');
        }
      } catch (err) {
        showToast('Impossible d\'envoyer le message.', 'error');
      }
    });
  }

  // Formulaire de mise à jour du profil
  const formEditProfile = document.getElementById('formEditProfile');
  if (formEditProfile) {
    formEditProfile.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(formEditProfile);
      const body = {
        name: formData.get('name'),
        phoneNumber: formData.get('phoneNumber'),
        languagePreference: formData.get('languagePreference')
      };

      try {
        const res = await apiFetch('/api/users/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (res.ok && data.success) {
          AppState.currentUser = { ...AppState.currentUser, ...data.user };
          updateProfileUI();
          showToast('Vos informations personnelles ont été mises à jour avec succès.');
        } else {
          showToast(data.error || 'Erreur de mise à jour', 'error');
        }
      } catch (err) {
        showToast('Erreur lors de la mise à jour', 'error');
      }
    });
  }

  // Formulaire de soumission KYC
  const formKyc = document.getElementById('formKyc');
  if (formKyc) {
    formKyc.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(formKyc);
      const docType = formData.get('documentType');

      try {
        const res = await apiFetch('/api/identity-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentType: docType })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          closeModal('modalKyc');
          showToast('Documents chiffrés AES-256 reçus. Examen sous 24h ouvrées.');
          const badge = document.getElementById('profileKycBadge');
          if (badge) {
            badge.className = 'kyc-status-badge pending';
            badge.textContent = 'Vérification en cours ⏳';
          }
        } else {
          showToast(data.error || 'Erreur lors de la soumission KYC', 'error');
        }
      } catch (err) {
        showToast('Erreur lors de la soumission KYC', 'error');
      }
    });
  }
}

function updateProfileUI() {
  const user = AppState.currentUser;
  if (!user) return;

  const nameEl = document.getElementById('profileUserName');
  if (nameEl) nameEl.textContent = user.name || 'Utilisateur';

  const navName = document.getElementById('navUserName');
  if (navName) navName.textContent = user.name || 'Utilisateur';

  const emailEl = document.getElementById('profileUserEmail');
  if (emailEl) emailEl.textContent = user.email || '';

  const editName = document.getElementById('editProfileName');
  if (editName) editName.value = user.name || '';

  const editPhone = document.getElementById('editProfilePhone');
  if (editPhone) editPhone.value = user.phoneNumber || '';

  const editEmail = document.getElementById('editProfileEmail');
  if (editEmail) editEmail.value = user.email || '';

  const homeGreeting = document.querySelector('.greeting-text h2');
  if (homeGreeting) {
    const firstName = user.name ? user.name.split(' ')[0] : 'Kouassi';
    homeGreeting.textContent = `Bonjour ${firstName} 👋`;
  }

  const badge = document.getElementById('profileKycBadge');
  if (badge) {
    const kyc = user.identityVerificationStatus;
    if (kyc === 'verified') {
      badge.className = 'kyc-status-badge verified';
      badge.textContent = 'Identité Vérifiée ✓';
    } else if (kyc === 'pending') {
      badge.className = 'kyc-status-badge pending';
      badge.textContent = 'Vérification en cours ⏳';
    } else {
      badge.className = 'kyc-status-badge not-started';
      badge.textContent = 'Non vérifié (Plafond standard)';
    }
  }
}

// ============================================================
// CHARGEMENT DES DEMANDES CLIENTS
// ============================================================
async function loadUserRequests() {
  const container = document.getElementById('requestsListContainer');
  if (!container) return;

  try {
    const res = await apiFetch('/api/requests');
    if (!res.ok) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 20px;">Connectez-vous pour consulter vos demandes.</p>';
      return;
    }

    const data = await res.json();
    const requests = data.requests || [];

    if (requests.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 20px;">Aucune demande enregistrée pour le moment.</p>';
      return;
    }

    container.innerHTML = requests
      .map(
        (r) => `
      <div style="background: rgba(10, 18, 32, 0.7); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11.5px; font-weight: 800; color: var(--primary-gold);">${r.requestId || r.id}</span>
          <span style="font-size: 11px; padding: 3px 10px; border-radius: 4px; background: ${
            r.status === 'completed' ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.18)'
          }; color: ${r.status === 'completed' ? '#34D399' : '#FBBF24'}; font-weight: 700;">
            ${r.statusLabel || r.status}
          </span>
        </div>
        <h4 style="font-size: 14.5px; color: #FFF; font-weight: 800;">${r.subject}</h4>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 6px; line-height: 1.5;">${r.description}</p>
        ${
          r.responseMessage
            ? `<div style="background: rgba(16, 185, 129, 0.08); border-left: 3px solid #10B981; padding: 8px 12px; border-radius: 4px; margin-top: 10px; font-size: 12.5px; color: #E2E8F0;">
                💬 <strong>Réponse de l'équipe :</strong> ${r.responseMessage}
               </div>`
            : ''
        }
        <div style="margin-top: 10px; font-size: 11.5px; color: var(--text-sub); display: flex; justify-content: space-between;">
          <span>Date : ${r.submittedAt || new Date(r.createdAt).toLocaleDateString()}</span>
          <span>Support CryptoConnect</span>
        </div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 10px;">Chargement des demandes...</p>';
  }
}

// ============================================================
// PANNEAU D'ADMINISTRATION (ROLE ADMIN & SUPER_ADMIN)
// ============================================================
function initAdminDashboard() {
  const tabsNav = document.getElementById('adminTabsNav');
  if (!tabsNav) return;

  tabsNav.querySelectorAll('.admin-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      tabsNav.querySelectorAll('.admin-tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.dataset.adminTab;
      document.querySelectorAll('.admin-tab-content').forEach((content) => {
        content.style.display = content.id === targetTab ? 'block' : 'none';
      });
    });
  });

  const searchInput = document.getElementById('adminUserSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      renderAdminUsersTable(q);
    });
  }
}

async function loadAdminDashboard() {
  if (!AppState.isAuthenticated || (AppState.currentUser?.role !== 'admin' && AppState.currentUser?.role !== 'super_admin')) {
    return;
  }

  try {
    // 1. Charger les KPIs
    const statsRes = await apiFetch('/api/admin/dashboard/stats');
    if (statsRes.ok) {
      const data = await statsRes.json();
      const stats = data.stats;
      AppState.adminData.stats = stats;

      const elTotal = document.getElementById('kpiUsersTotal');
      if (elTotal) elTotal.textContent = stats.users.total;

      const elActive = document.getElementById('kpiUsersActive');
      if (elActive) elActive.textContent = stats.users.active;

      const elKyc = document.getElementById('kpiKycPending');
      if (elKyc) elKyc.textContent = stats.kyc.pending;

      const elKycBadge = document.getElementById('adminKycBadgeCount');
      if (elKycBadge) elKycBadge.textContent = stats.kyc.pending;

      const elReq = document.getElementById('kpiRequestsPending');
      if (elReq) elReq.textContent = stats.requests.pending;
    }

    // 2. Charger les utilisateurs
    const usersRes = await apiFetch('/api/admin/users');
    if (usersRes.ok) {
      const data = await usersRes.json();
      AppState.adminData.users = data.users || [];
      renderAdminUsersTable();
    }

    // 3. Charger les dossiers KYC
    const kycRes = await apiFetch('/api/admin/kyc');
    if (kycRes.ok) {
      const data = await kycRes.json();
      AppState.adminData.kycList = data.verifications || [];
      renderAdminKycTable();
    }

    // 4. Charger les demandes clients
    const reqRes = await apiFetch('/api/admin/requests');
    if (reqRes.ok) {
      const data = await reqRes.json();
      AppState.adminData.requests = data.requests || [];
      renderAdminRequestsTable();
    }
  } catch (err) {
    console.error('Erreur chargement admin:', err);
  }
}

function renderAdminUsersTable(filter = '') {
  const tbody = document.getElementById('adminUsersTableBody');
  if (!tbody) return;

  let list = AppState.adminData.users || [];
  if (filter) {
    list = list.filter(
      (u) =>
        u.name.toLowerCase().includes(filter) ||
        u.email.toLowerCase().includes(filter)
    );
  }

  const countDisplay = document.getElementById('adminUserCountDisplay');
  if (countDisplay) countDisplay.textContent = `${list.length} utilisateur(s)`;

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px;">Aucun utilisateur trouvé.</td></tr>';
    return;
  }

  tbody.innerHTML = list
    .map(
      (u) => `
    <tr>
      <td>
        <strong style="color: #FFF;">${u.name}</strong><br>
        <span style="font-size: 11.5px; color: var(--text-muted);">${u.email}</span>
      </td>
      <td>${u.phoneNumber || '—'}</td>
      <td>
        <span style="font-weight: 700; color: ${u.role === 'super_admin' ? '#EF4444' : u.role === 'admin' ? '#F59E0B' : '#60A5FA'}">
          ${u.role || 'user'}
        </span>
      </td>
      <td>
        <span class="status-badge-pill ${u.identityVerificationStatus === 'verified' ? 'verified' : u.identityVerificationStatus === 'pending' ? 'pending' : 'not_started'}">
          ${u.identityVerificationStatus || 'non commencé'}
        </span>
      </td>
      <td>
        <span class="status-badge-pill ${u.accountStatus === 'active' ? 'active' : 'suspended'}">
          ${u.accountStatus || 'active'}
        </span>
      </td>
      <td>
        <button class="btn-action-sm ${u.accountStatus === 'active' ? 'danger' : 'success'}" onclick="toggleUserStatus('${u._id || u.id}', '${u.accountStatus === 'active' ? 'suspended' : 'active'}')">
          ${u.accountStatus === 'active' ? 'Suspendre' : 'Réactiver'}
        </button>
      </td>
    </tr>
  `
    )
    .join('');
}

async function toggleUserStatus(userId, newStatus) {
  try {
    const res = await apiFetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountStatus: newStatus })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`Statut utilisateur mis à jour vers : ${newStatus}.`);
      loadAdminDashboard();
    } else {
      showToast(data.error || 'Erreur lors du changement de statut', 'error');
    }
  } catch (err) {
    showToast('Erreur serveur admin', 'error');
  }
}

function renderAdminKycTable() {
  const tbody = document.getElementById('adminKycTableBody');
  if (!tbody) return;

  const kycs = AppState.adminData.kycList || [];
  if (kycs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px;">Aucun dossier KYC à afficher.</td></tr>';
    return;
  }

  tbody.innerHTML = kycs
    .map((k) => {
      const user = AppState.adminData.users.find((u) => (u._id || u.id) === k.user) || { name: 'Client Crypto', email: '' };
      return `
      <tr>
        <td>
          <strong style="color: #FFF;">${user.name}</strong><br>
          <span style="font-size: 11.5px; color: var(--text-muted);">${user.email}</span>
        </td>
        <td>${k.documentType === 'passport' ? 'Passeport' : 'CNI'}</td>
        <td><a href="#" style="color: var(--accent-cyan); text-decoration: underline;" onclick="showToast('Affichage du document sécurisé'); return false;">${k.documentName || 'Document.pdf'}</a></td>
        <td>${new Date(k.createdAt).toLocaleDateString()}</td>
        <td>
          <span class="status-badge-pill ${k.status === 'verified' ? 'verified' : k.status === 'pending' ? 'pending' : 'suspended'}">
            ${k.status === 'verified' ? 'Approuvé ✓' : k.status === 'pending' ? 'En attente ⏳' : 'Rejeté'}
          </span>
        </td>
        <td>
          ${
            k.status === 'pending'
              ? `
            <div style="display: flex; gap: 6px;">
              <button class="btn-action-sm success" onclick="approveKycAction('${k._id || k.id}')">Approuver ✓</button>
              <button class="btn-action-sm danger" onclick="rejectKycAction('${k._id || k.id}')">Rejeter ✕</button>
            </div>
          `
              : `<span style="font-size: 12px; color: var(--text-muted);">Dossier traité</span>`
          }
        </td>
      </tr>
    `;
    })
    .join('');
}

async function approveKycAction(kycId) {
  try {
    const res = await apiFetch(`/api/admin/kyc/${kycId}/approve`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message || 'Dossier KYC approuvé avec succès.');
      loadAdminDashboard();
    }
  } catch (e) {
    showToast('Erreur approbation KYC', 'error');
  }
}

async function rejectKycAction(kycId) {
  try {
    const res = await apiFetch(`/api/admin/kyc/${kycId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Document non lisible ou expiré.' })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message || 'Dossier KYC rejeté.');
      loadAdminDashboard();
    }
  } catch (e) {
    showToast('Erreur rejet KYC', 'error');
  }
}

function renderAdminRequestsTable() {
  const tbody = document.getElementById('adminRequestsTableBody');
  if (!tbody) return;

  const reqs = AppState.adminData.requests || [];
  if (reqs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px;">Aucune demande client trouvée.</td></tr>';
    return;
  }

  tbody.innerHTML = reqs
    .map(
      (r) => `
    <tr>
      <td><span style="font-size: 11.5px; font-weight: 800; color: var(--primary-gold);">${r.requestId || r.id}</span></td>
      <td>
        <strong style="color: #FFF;">${r.subject}</strong><br>
        <span style="font-size: 11.5px; color: var(--text-muted);">${r.description}</span>
      </td>
      <td><span style="font-size: 11.5px; color: var(--accent-cyan);">${r.serviceName || r.requestType}</span></td>
      <td>
        <span class="status-badge-pill ${r.status === 'completed' ? 'active' : 'pending'}">
          ${r.statusLabel || r.status}
        </span>
      </td>
      <td>${new Date(r.createdAt || Date.now()).toLocaleDateString()}</td>
      <td>
        ${
          r.status !== 'completed'
            ? `<button class="btn-action-sm success" onclick="completeRequestAction('${r._id || r.id}')">Marquer Traitée ✓</button>`
            : `<span style="font-size: 11.5px; color: #34D399;">✓ Clôturée</span>`
        }
      </td>
    </tr>
  `
    )
    .join('');
}

async function completeRequestAction(requestId) {
  try {
    const res = await apiFetch(`/api/admin/requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'completed',
        responseMessage: 'Demande vérifiée et traitée avec succès par l\'équipe d\'administration.'
      })
    });
    if (res.ok) {
      showToast('Demande marquée comme traitée avec succès.');
      loadAdminDashboard();
      loadUserRequests();
    }
  } catch (e) {
    showToast('Erreur mise à jour demande', 'error');
  }
}
