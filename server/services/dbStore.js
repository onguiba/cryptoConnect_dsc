/**
 * CRYPTOCONNECT - AUTONOMOUS IN-MEMORY & PERSISTENT DATA STORE
 * Assure un fonctionnement à 100% de toutes les fonctionnalités et API
 * avec persistance locale, que MongoDB soit disponible ou non.
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Générateur d'ID type MongoDB
function generateId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + random;
}

// Données initiales de démonstration (Seed complet)
function getDefaultData() {
  const adminPasswordHash = bcrypt.hashSync('Admin@123456', 10);
  const userPasswordHash = bcrypt.hashSync('Password123', 10);

  const adminId = '654321000000000000000001';
  const userId1 = '654321000000000000000002';
  const userId2 = '654321000000000000000003';

  return {
    users: [
      {
        _id: adminId,
        id: adminId,
        name: 'Super Admin',
        email: 'admin@cryptoconnect.app',
        password: adminPasswordHash,
        phoneNumber: '+225 07 00 00 00 00',
        languagePreference: 'fr',
        emailVerified: true,
        identityVerificationStatus: 'verified',
        accountStatus: 'active',
        authProvider: 'local',
        role: 'super_admin',
        refreshTokens: [],
        createdAt: new Date('2026-01-01T08:00:00Z').toISOString(),
      },
      {
        _id: userId1,
        id: userId1,
        name: 'Kouassi Alain',
        email: 'kouassi@email.com',
        password: userPasswordHash,
        phoneNumber: '+225 07 12 34 56 78',
        languagePreference: 'fr',
        emailVerified: true,
        identityVerificationStatus: 'verified',
        accountStatus: 'active',
        authProvider: 'local',
        role: 'user',
        refreshTokens: [],
        createdAt: new Date('2026-01-15T10:30:00Z').toISOString(),
      },
      {
        _id: userId2,
        id: userId2,
        name: 'Marie Dupont',
        email: 'marie@email.com',
        password: userPasswordHash,
        phoneNumber: '+225 07 23 45 67 89',
        languagePreference: 'fr',
        emailVerified: true,
        identityVerificationStatus: 'pending',
        accountStatus: 'active',
        authProvider: 'local',
        role: 'user',
        refreshTokens: [],
        createdAt: new Date('2026-02-01T14:20:00Z').toISOString(),
      },
    ],
    services: [
      {
        _id: 'srv_001',
        id: 'srv_001',
        slug: 'achat-vente',
        name: 'Achat & Vente de cryptomonnaies',
        summary: 'Achetez et vendez vos cryptos en toute sécurité et simplicité.',
        description: 'Accédez à une plateforme d\'échange fluide et sécurisée. Achetez du Bitcoin, Ethereum, USDT et plus de 50 autres actifs avec vos moyens de paiement favoris : Mobile Money (Wave, Orange, MTN, Moov) et Carte Bancaire.',
        benefits: [
          'Taux compétitifs et transparents en temps réel',
          'Compatibilité Mobile Money (Orange, Wave, MTN, Moov) & Carte Bancaire',
          'Transactions instantanées sans frais cachés',
          'Sécurisation des transferts via cold storage',
        ],
        accessSteps: [
          'Créez et validez votre compte CryptoConnect',
          'Sélectionnez la cryptomonnaie et le montant souhaité',
          'Choisissez votre mode de paiement instantané',
          'Recevez vos cryptos directement sur votre portefeuille sécurisé',
        ],
        icon: 'swap',
        color: '#3B82F6',
        requiresIdentityVerification: true,
        isActive: true,
        displayOrder: 1,
      },
      {
        _id: 'srv_002',
        id: 'srv_002',
        slug: 'investissement',
        name: 'Investissement & placements',
        summary: 'Faites fructifier votre capital avec des solutions adaptées.',
        description: 'Découvrez nos solutions de staking institutionnel, de plans d\'épargne automatique (DCA) et de gestion de portefeuille clé en main gérés par des analystes professionnels.',
        benefits: [
          'Plans d\'épargne programmée (DCA) dès 10 000 FCFA / 15 €',
          'Rendements d\'épargne crypto (Staking & Yield) jusqu\'à 8.5% APY',
          'Rapports d\'analyse et de performance hebdomadaires',
          'Protection du capital avec gestion active des risques',
        ],
        accessSteps: [
          'Définissez vos objectifs d\'épargne et votre profil de risque',
          'Sélectionnez le plan d\'investissement recommandé',
          'Programmez vos dépôts périodiques automatiques',
          'Suivez l\'évolution de vos rendements en direct sur l\'application',
        ],
        icon: 'trending-up',
        color: '#10B981',
        requiresIdentityVerification: true,
        isActive: true,
        displayOrder: 2,
      },
      {
        _id: 'srv_003',
        id: 'srv_003',
        slug: 'formation',
        name: 'Formation & accompagnement',
        summary: 'Apprenez à votre rythme, du débutant à l\'expert.',
        description: 'Maîtrisez la finance décentralisée, l\'analyse de marché et la sécurisation d\'actifs. Nos programmes certifiants vous guident pas à pas pour devenir un investisseur autonome et serein.',
        benefits: [
          'Parcours pédagogiques interactifs certifiés',
          'Ateliers live hebdomadaires et webinaires exclusifs',
          'Mentorat individuel 1-on-1 avec des traders expérimentés',
          'Accès à notre canal privé d\'analyses de marché',
        ],
        accessSteps: [
          'Évaluez votre niveau avec notre test initial rapide',
          'Choisissez votre parcours (Débutant, Intermédiaire, Trader Pro)',
          'Suivez les cours vidéo et validez vos acquis',
          'Obtenez votre certificat officiel CryptoConnect',
        ],
        icon: 'academic',
        color: '#8B5CF6',
        requiresIdentityVerification: false,
        isActive: true,
        displayOrder: 3,
      },
      {
        _id: 'srv_004',
        id: 'srv_004',
        slug: 'conseil-support',
        name: 'Conseil & support personnalisé',
        summary: 'Une équipe à votre écoute pour répondre à toutes vos questions.',
        description: 'Bénéficiez d\'un conseiller dédié pour auditer la sécurité de vos portefeuilles, résoudre vos incidents techniques et vous orienter lors de vos décisions d\'investissement importantes.',
        benefits: [
          'Conseiller dédié joignable 7j/7 via WhatsApp, téléphone ou visio',
          'Audit de sécurité complet de vos portefeuilles personnels',
          'Assistance immédiate lors de transferts importants',
          'Conseils personnalisés conformes aux régulations en vigueur',
        ],
        accessSteps: [
          'Réservez un créneau d\'échange avec un expert',
          'Exposez votre projet ou votre demande spécifique',
          'Recevez une feuille de route claire et actionnable',
        ],
        icon: 'headphones',
        color: '#F59E0B',
        requiresIdentityVerification: false,
        isActive: true,
        displayOrder: 4,
      },
    ],
    contents: [
      {
        _id: 'cnt_001',
        id: 'cnt_001',
        title: "Qu'est-ce que le Bitcoin ?",
        slug: 'qu-est-ce-que-le-bitcoin',
        contentType: 'article',
        difficultyLevel: 'beginner',
        difficultyLabel: 'Débutant',
        excerpt: 'Découvrez les bases indispensables de la première monnaie décentralisée au monde.',
        coverImageUrl: 'assets/images/bitcoin_3d.jpg',
        readingTime: '4 min',
        tags: ['bitcoin', 'débutant', 'crypto', 'blockchain'],
        summaryPoints: [
          'Une monnaie numérique peer-to-peer créée en 2009 par Satoshi Nakamoto',
          'Décentralisée : fonctionne sans intermédiaire bancaire ni banque centrale',
          'Sécurisée par la cryptographie et un réseau de nœuds inviolable',
          'Offre limitée mathématiquement à 21 millions d\'unités maximales',
        ],
        body: `Le Bitcoin (BTC) est la première monnaie numérique décentralisée au monde. Conçu en 2008 et lancé en janvier 2009 sous le pseudonyme de Satoshi Nakamoto, il introduit une rupture technologique majeure : la possibilité de transférer de la valeur de pair-à-pair à travers Internet, sans dépendre d'une banque centrale, d'un gouvernement ou d'une institution financière.

Le réseau Bitcoin s'appuie sur une base de données distribuée appelée blockchain, où chaque transaction est vérifiée par des nœuds indépendants et scellée par la preuve de travail (Proof-of-Work). La rareté mathématique garantie à 21 millions d'unités en fait souvent une réserve de valeur numérique, surnommée « l'or digital ».`,
        isPublished: true,
        publishedAt: new Date('2026-01-10T09:00:00Z').toISOString(),
        views: 1420,
      },
      {
        _id: 'cnt_002',
        id: 'cnt_002',
        title: 'Comprendre Ethereum & les Smart Contracts',
        slug: 'comprendre-ethereum-smart-contracts',
        contentType: 'article',
        difficultyLevel: 'intermediate',
        difficultyLabel: 'Intermédiaire',
        excerpt: 'Explorez la plateforme programmable qui propulse la finance décentralisée (DeFi) et les NFTs.',
        coverImageUrl: 'assets/images/ethereum_3d.jpg',
        readingTime: '6 min',
        tags: ['ethereum', 'smart contracts', 'defi', 'intermédiaire'],
        summaryPoints: [
          'Ethereum est un ordinateur mondial décentralisé permettant d\'exécuter du code autonome',
          'Les Smart Contracts (contrats intelligents) s\'exécutent automatiquement sans intermédiaire',
          'Propulse l\'écosystème de la DeFi : prêts, échanges décentralisés et rendements automatisés',
          'Transition réussie vers le Proof-of-Stake réduisant la consommation énergétique de 99.9%',
        ],
        body: `Lancé en 2015 par Vitalik Buterin, Ethereum dépasse la simple fonction monétaire en devenant une véritable plateforme de calcul décentralisée. Grâce à sa machine virtuelle (EVM), Ethereum permet aux développeurs de déployer des applications décentralisées (dApps) régies par des contrats intelligents (smart contracts).

Ces contrats s'exécutent de manière infalsifiable dès que les conditions prédéfinies sont remplies, ouvrant la voie à des systèmes financiers ouverts, transparents et accessibles 24h/24 sans nécessiter de banques traditionnelles.`,
        isPublished: true,
        publishedAt: new Date('2026-01-18T14:00:00Z').toISOString(),
        views: 980,
      },
      {
        _id: 'cnt_003',
        id: 'cnt_003',
        title: 'Sécuriser vos cryptomonnaies : Wallets & Bonnes Pratiques',
        slug: 'securiser-vos-cryptos-wallets-bonnes-pratiques',
        contentType: 'guide',
        difficultyLevel: 'advanced',
        difficultyLabel: 'Avancé',
        excerpt: 'Guide complet pour stocker vos actifs en toute sécurité avec les cold wallets et éviter les arnaques.',
        coverImageUrl: 'assets/images/bitcoin_3d.jpg',
        readingTime: '8 min',
        tags: ['sécurité', 'wallets', 'ledger', 'clés privées', 'avancé'],
        summaryPoints: [
          'La phrase de récupération (Seed Phrase de 12 ou 24 mots) est l\'unique clé de vos fonds',
          'Différence fondamentale entre Hot Wallet (connecté) et Cold Wallet (portefeuille physique hors-ligne)',
          'Ne partagez jamais vos clés privées, même avec un support se prétendant officiel',
          'Activez systématiquement la double authentification (2FA) par application (Google Authenticator)',
        ],
        body: `« Not your keys, not your coins » est l'adage fondamental du monde crypto. Posséder des cryptomonnaies implique une responsabilité directe sur la sécurisation de vos clés privées.

Pour une sécurité maximale, l'usage d'un portefeuille matériel (Hardware Wallet comme Ledger ou Trezor) est fortement recommandé pour toute somme significative. Ce guide vous détaille la gestion sécurisée des sauvegardes physiques sur plaque métallique, les précautions contre le phishing et la configuration optimale d'un portefeuille multi-signatures.`,
        isPublished: true,
        publishedAt: new Date('2026-02-05T11:00:00Z').toISOString(),
        views: 750,
      },
    ],
    requests: [
      {
        _id: '654321000000000000000010',
        id: 'REQ-2026-001429',
        requestId: 'REQ-2026-001429',
        user: userId1,
        requestType: 'service_inquiry',
        serviceName: 'Achat & Vente de cryptomonnaies',
        subject: 'Demande de conversion 500 USDT vers Mobile Money Wave',
        description: 'Bonjour, je souhaite convertir 500 USDT vers mon compte Wave en Côte d\'Ivoire (+225 07 12 34 56 78). Quel est le taux actuel appliqué ?',
        status: 'completed',
        statusLabel: 'Traitée',
        responseMessage: 'Transaction exécutée avec succès au taux garanti de 655 FCFA / USDT. Fonds crédités sur votre numéro Wave.',
        priority: 'high',
        submittedAt: 'Hier à 14h30',
        createdAt: new Date('2026-02-14T14:30:00Z').toISOString(),
      },
      {
        _id: '654321000000000000000011',
        id: 'REQ-2026-002891',
        requestId: 'REQ-2026-002891',
        user: userId1,
        requestType: 'service_inquiry',
        serviceName: 'Investissement & placements',
        subject: 'Mise en place d\'un plan DCA mensuel de 50 000 FCFA',
        description: 'Je souhaite activer un plan d\'épargne programmé de 50 000 FCFA par mois, réparti 60% Bitcoin et 40% Ethereum.',
        status: 'in_progress',
        statusLabel: 'En cours',
        responseMessage: 'Un conseiller dédié est en train de configurer votre plan de prélèvement automatique.',
        priority: 'medium',
        submittedAt: 'Aujourd\'hui à 09h15',
        createdAt: new Date('2026-02-15T09:15:00Z').toISOString(),
      },
      {
        _id: '654321000000000000000012',
        id: 'REQ-2026-003104',
        requestId: 'REQ-2026-003104',
        user: userId2,
        requestType: 'support',
        serviceName: 'Formation & accompagnement',
        subject: 'Inscription au webinaire d\'analyse technique',
        description: 'Je souhaite m\'inscrire à la prochaine session live de formation du samedi.',
        status: 'pending',
        statusLabel: 'En attente',
        responseMessage: 'Votre demande est en cours d\'examen par l\'équipe pédagogique.',
        priority: 'low',
        submittedAt: 'Aujourd\'hui à 11h45',
        createdAt: new Date('2026-02-15T11:45:00Z').toISOString(),
      },
    ],
    kycs: [
      {
        _id: '654321000000000000000020',
        id: '654321000000000000000020',
        user: userId1,
        documentType: 'national_id',
        documentName: 'CNI_Kouassi_Alain.pdf',
        documentUrl: 'https://cdn.cryptoconnect.app/docs/cni_kouassi.pdf',
        status: 'verified',
        reviewedBy: adminId,
        reviewedAt: new Date('2026-01-16T12:00:00Z').toISOString(),
        notes: 'Document conforme et valide jusqu\'en 2030.',
        createdAt: new Date('2026-01-15T11:00:00Z').toISOString(),
      },
      {
        _id: '654321000000000000000021',
        id: '654321000000000000000021',
        user: userId2,
        documentType: 'passport',
        documentName: 'Passeport_Marie_Dupont.pdf',
        documentUrl: 'https://cdn.cryptoconnect.app/docs/passport_marie.pdf',
        status: 'pending',
        notes: 'Document reçu, en attente de vérification par un opérateur.',
        createdAt: new Date('2026-02-01T15:00:00Z').toISOString(),
      },
    ],
  };
}

class DbStore {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.data = getDefaultData();
        this.save();
      }
    } catch (err) {
      console.warn('⚠️ Impossible de charger store.json, utilisation des données en mémoire:', err.message);
      this.data = getDefaultData();
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('❌ Erreur écriture store.json:', err.message);
    }
  }

  // Méthode de création d'objet avec méthodes Mongoose compatibles
  _wrapUser(user) {
    if (!user) return null;
    const clone = { ...user };
    clone.comparePassword = async function (candidatePassword) {
      if (!clone.password) return false;
      return bcrypt.compare(candidatePassword, clone.password);
    };
    clone.isLocked = function () {
      return !!(clone.lockUntil && new Date(clone.lockUntil) > new Date());
    };
    clone.incLoginAttempts = async () => {};
    clone.resetLoginAttempts = async () => {};
    clone.save = async () => {
      DbStoreInstance.save();
      return clone;
    };
    return clone;
  }

  // Collection Users
  getUsers() {
    return this.data.users.map((u) => this._wrapUser(u));
  }

  findUser(predicate) {
    const user = this.data.users.find(predicate);
    return this._wrapUser(user);
  }

  findUserById(id) {
    return this.findUser((u) => u._id === String(id) || u.id === String(id));
  }

  findUserByEmail(email) {
    return this.findUser((u) => u.email.toLowerCase() === String(email).toLowerCase());
  }

  async createUser(userData) {
    const _id = generateId();
    let hashedPassword = userData.password;
    if (hashedPassword && !hashedPassword.startsWith('$2')) {
      hashedPassword = await bcrypt.hash(hashedPassword, 10);
    }

    const newUser = {
      _id,
      id: _id,
      name: userData.name || '',
      email: (userData.email || '').toLowerCase(),
      password: hashedPassword,
      phoneNumber: userData.phoneNumber || userData.phone || '',
      languagePreference: userData.languagePreference || 'fr',
      emailVerified: userData.emailVerified || false,
      identityVerificationStatus: userData.identityVerificationStatus || 'not_started',
      accountStatus: userData.accountStatus || 'active',
      authProvider: userData.authProvider || 'local',
      role: userData.role || 'user',
      avatarUrl: userData.avatarUrl || null,
      refreshTokens: [],
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.save();
    return this._wrapUser(newUser);
  }

  updateUser(id, updates) {
    const index = this.data.users.findIndex((u) => u._id === String(id) || u.id === String(id));
    if (index === -1) return null;

    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this._wrapUser(this.data.users[index]);
  }

  // Collection Services
  getServices(filter = {}) {
    let list = this.data.services;
    if (filter.isActive !== undefined) {
      list = list.filter((s) => s.isActive === filter.isActive);
    }
    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  findService(idOrSlug) {
    return this.data.services.find(
      (s) => s._id === idOrSlug || s.id === idOrSlug || s.slug === idOrSlug
    );
  }

  createService(serviceData) {
    const _id = 'srv_' + Date.now().toString(36);
    const newService = {
      _id,
      id: _id,
      slug: serviceData.slug || serviceData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: serviceData.name,
      summary: serviceData.summary || '',
      description: serviceData.description || '',
      benefits: serviceData.benefits || [],
      accessSteps: serviceData.accessSteps || [],
      icon: serviceData.icon || 'service',
      color: serviceData.color || '#3B82F6',
      requiresIdentityVerification: !!serviceData.requiresIdentityVerification,
      isActive: serviceData.isActive !== false,
      displayOrder: serviceData.displayOrder || this.data.services.length + 1,
      createdAt: new Date().toISOString(),
    };
    this.data.services.push(newService);
    this.save();
    return newService;
  }

  updateService(id, updates) {
    const idx = this.data.services.findIndex((s) => s._id === id || s.id === id || s.slug === id);
    if (idx === -1) return null;
    this.data.services[idx] = { ...this.data.services[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.services[idx];
  }

  deleteService(id) {
    const idx = this.data.services.findIndex((s) => s._id === id || s.id === id || s.slug === id);
    if (idx === -1) return false;
    this.data.services.splice(idx, 1);
    this.save();
    return true;
  }

  // Collection Content
  getContents(filter = {}) {
    let list = this.data.contents;
    if (filter.isPublished !== undefined) {
      list = list.filter((c) => c.isPublished === filter.isPublished);
    }
    if (filter.difficultyLevel && filter.difficultyLevel !== 'all') {
      list = list.filter((c) => c.difficultyLevel === filter.difficultyLevel.toLowerCase());
    }
    return list;
  }

  findContent(idOrSlug) {
    const content = this.data.contents.find(
      (c) => c._id === idOrSlug || c.id === idOrSlug || c.slug === idOrSlug
    );
    if (content) {
      content.save = async () => {
        DbStoreInstance.save();
        return content;
      };
    }
    return content;
  }

  createContent(contentData) {
    const _id = 'cnt_' + Date.now().toString(36);
    const newContent = {
      _id,
      id: _id,
      title: contentData.title,
      slug: contentData.slug || contentData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      contentType: contentData.contentType || 'article',
      difficultyLevel: contentData.difficultyLevel || 'beginner',
      difficultyLabel: contentData.difficultyLabel || 'Débutant',
      excerpt: contentData.excerpt || '',
      body: contentData.body || '',
      coverImageUrl: contentData.coverImageUrl || 'assets/images/bitcoin_3d.jpg',
      readingTime: contentData.readingTime || '4 min',
      tags: contentData.tags || ['crypto'],
      summaryPoints: contentData.summaryPoints || [],
      isPublished: contentData.isPublished !== false,
      publishedAt: new Date().toISOString(),
      views: 0,
      createdAt: new Date().toISOString(),
    };
    this.data.contents.unshift(newContent);
    this.save();
    return newContent;
  }

  updateContent(id, updates) {
    const idx = this.data.contents.findIndex((c) => c._id === id || c.id === id || c.slug === id);
    if (idx === -1) return null;
    this.data.contents[idx] = { ...this.data.contents[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.contents[idx];
  }

  deleteContent(id) {
    const idx = this.data.contents.findIndex((c) => c._id === id || c.id === id || c.slug === id);
    if (idx === -1) return false;
    this.data.contents.splice(idx, 1);
    this.save();
    return true;
  }

  // Collection Requests
  getRequests(filter = {}) {
    let list = this.data.requests;
    if (filter.user) {
      list = list.filter((r) => String(r.user) === String(filter.user));
    }
    if (filter.status) {
      list = list.filter((r) => r.status === filter.status);
    }
    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  findRequestById(id) {
    return this.data.requests.find((r) => r._id === id || r.id === id || r.requestId === id);
  }

  createRequest(requestData) {
    const _id = generateId();
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    const requestId = `REQ-${year}-${random}`;

    const newRequest = {
      _id,
      id: requestId,
      requestId,
      user: requestData.user || null,
      guestName: requestData.guestName || requestData.name || null,
      guestEmail: requestData.guestEmail || requestData.email || null,
      requestType: requestData.requestType || 'service_inquiry',
      serviceName: requestData.serviceName || 'Demande générale',
      subject: requestData.subject,
      description: requestData.description,
      status: requestData.status || 'pending',
      statusLabel: requestData.status === 'completed' ? 'Traitée' : 'En attente',
      responseMessage: requestData.responseMessage || 'Votre message a bien été reçu. Notre équipe vous répondra sous 24 heures.',
      priority: requestData.priority || 'medium',
      submittedAt: 'Aujourd\'hui',
      createdAt: new Date().toISOString(),
    };

    this.data.requests.unshift(newRequest);
    this.save();
    return newRequest;
  }

  updateRequest(id, updates) {
    const idx = this.data.requests.findIndex((r) => r._id === id || r.id === id || r.requestId === id);
    if (idx === -1) return null;
    this.data.requests[idx] = { ...this.data.requests[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.requests[idx];
  }

  // Collection KYCs
  getKycs(filter = {}) {
    let list = this.data.kycs;
    if (filter.user) {
      list = list.filter((k) => String(k.user) === String(filter.user));
    }
    if (filter.status) {
      list = list.filter((k) => k.status === filter.status);
    }
    return list;
  }

  findKycByUserId(userId) {
    return this.data.kycs.find((k) => String(k.user) === String(userId));
  }

  createOrUpdateKyc(userId, kycData) {
    let existing = this.findKycByUserId(userId);
    if (existing) {
      existing.documentType = kycData.documentType || existing.documentType;
      existing.documentName = kycData.documentName || existing.documentName;
      existing.status = kycData.status || 'pending';
      existing.updatedAt = new Date().toISOString();
    } else {
      const _id = generateId();
      existing = {
        _id,
        id: _id,
        user: userId,
        documentType: kycData.documentType || 'national_id',
        documentName: kycData.documentName || 'Document_KYC.pdf',
        documentUrl: kycData.documentUrl || '',
        status: 'pending',
        notes: 'Document transmis par le client. Vérification en cours.',
        createdAt: new Date().toISOString(),
      };
      this.data.kycs.unshift(existing);
    }

    // Mettre à jour aussi le statut dans l'utilisateur
    this.updateUser(userId, { identityVerificationStatus: existing.status });
    this.save();
    return existing;
  }
}

const DbStoreInstance = new DbStore();
module.exports = DbStoreInstance;
