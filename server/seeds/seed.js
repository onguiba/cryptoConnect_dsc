/**
 * ============================================================
 * SEED DATABASE
 * Script pour peupler la base de données avec des données initiales
 * ============================================================
 * 
 * Usage: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
const Content = require('../models/Content');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion MongoDB établie');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  console.log('\n📥 Insertion des utilisateurs...');
  
  await User.deleteMany({});

  const users = [
    {
      name: 'Super Admin',
      email: 'admin@cryptoconnect.app',
      password: 'Admin@123456',
      phoneNumber: '+225 07 00 00 00 00',
      languagePreference: 'fr',
      emailVerified: true,
      identityVerificationStatus: 'verified',
      accountStatus: 'active',
      authProvider: 'local',
      role: 'super_admin',
    },
    {
      name: 'Kouassi Alain',
      email: 'kouassi@email.com',
      password: 'Password123',
      phoneNumber: '+225 07 12 34 56 78',
      languagePreference: 'fr',
      emailVerified: true,
      identityVerificationStatus: 'verified',
      accountStatus: 'active',
      authProvider: 'local',
      role: 'user',
    },
    {
      name: 'Marie Dupont',
      email: 'marie@email.com',
      password: 'Password123',
      phoneNumber: '+225 07 23 45 67 89',
      emailVerified: true,
      identityVerificationStatus: 'pending',
      accountStatus: 'active',
      authProvider: 'local',
      role: 'user',
    },
  ];

  await User.insertMany(users);
  console.log(`✅ ${users.length} utilisateurs créés`);
};

const seedServices = async () => {
  console.log('\n📥 Insertion des services...');
  
  await Service.deleteMany({});

  const services = [
    {
      slug: 'achat-vente',
      name: 'Achat & Vente de cryptomonnaies',
      summary: 'Achetez et vendez vos cryptos en toute sécurité et simplicité.',
      description: 'Accédez à une plateforme d\'échange fluide et sécurisée. Achetez du Bitcoin, Ethereum, USDT et plus de 50 autres actifs avec vos moyens de paiement favoris locaux et internationaux.',
      benefits: [
        'Taux compétitifs et transparents en temps réel',
        'Compatibilité Mobile Money (Orange, Wave, MTN, Moov) & Carte Bancaire',
        'Transactions instantanées sans frais cachés',
        'Sécurisation des transactions via cold storage',
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
      slug: 'conseil-support',
      name: 'Conseil & support personnalisé',
      summary: 'Une équipe à votre écoute pour répondre à toutes vos questions.',
      description: 'Bénéficiez d\'un conseiller dédié pour auditer la sécurité de vos portefeuilles, résoudre vos incidents techniques et vous orienter lors de vos décisions d\'investissement importantes.',
      benefits: [
        'Conseiller dédié joignable 7j/7 via WhatsApp, téléphone ou visio',
        'Audit de sécurité complet de vos wallets personnels',
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
  ];

  await Service.insertMany(services);
  console.log(`✅ ${services.length} services créés`);
};

const seedContent = async () => {
  console.log('\n📥 Insertion des contenus éducatifs...');
  
  await Content.deleteMany({});

  const content = [
    {
      title: "Qu'est-ce que le Bitcoin ?",
      slug: 'qu-est-ce-que-le-bitcoin',
      contentType: 'article',
      difficultyLevel: 'beginner',
      difficultyLabel: 'Débutant',
      excerpt: 'Découvrez les bases de la première cryptomonnaie.',
      coverImageUrl: 'assets/images/bitcoin_3d.jpg',
      readingTime: '4 min',
      tags: ['bitcoin', 'débutant', 'crypto', 'blockchain'],
      summaryPoints: [
        'Une monnaie numérique peer-to-peer créée en 2009 par Satoshi Nakamoto',
        'Décentralisée : fonctionne sans intermédiaire bancaire ni banque centrale',
        'Sécurisée par la cryptographie et le réseau blockchain inviolable',
        'Offre limitée mathématiquement à 21 millions de bitcoins au total',
      ],
      body: `### Introduction au Bitcoin

Le Bitcoin (BTC) est la première monnaie numérique décentralisée au monde. Conçu en 2008 et lancé en janvier 2009 sous le pseudonyme de Satoshi Nakamoto, il introduit une rupture technologique majeure : la possibilité de transférer de la valeur de pair-à-pair à travers Internet, sans dépendre d'une banque centrale, d'un gouvernement ou d'une institution financière.

### Pourquoi le Bitcoin est-il unique ?

1. **Rareté programmée :** Contrairement aux monnaies fiduciaires (Euro, Dollar, FCFA) qui peuvent être imprimées sans limite, il n'existera jamais plus de **21 millions de Bitcoins**.
2. **Décentralisation totale :** Le réseau est maintenu par des milliers de nœuds répartis sur toute la planète.
3. **Transparence et sécurité :** Chaque transaction est enregistrée de façon permanente et publiquement vérifiable sur la Blockchain.`,
      isPublished: true,
      publishedAt: new Date('2026-02-01'),
    },
    {
      title: 'Comment fonctionne la blockchain ?',
      slug: 'comment-fonctionne-la-blockchain',
      contentType: 'article',
      difficultyLevel: 'beginner',
      difficultyLabel: 'Débutant',
      excerpt: 'Une technologie qui change tout.',
      coverImageUrl: 'assets/images/ethereum_3d.jpg',
      readingTime: '5 min',
      tags: ['blockchain', 'technologie', 'sécurité', 'débutant'],
      summaryPoints: [
        'Un grand registre distribué, public et transparent',
        'Chaque bloc de données est relié au précédent de manière cryptographique',
        'Impossibilité de modifier ou falsifier une transaction passée',
        'Base technologique des smart contracts et de la DeFi',
      ],
      body: `### Qu'est-ce que la Blockchain ?

Imaginez un grand livre de comptes partagé entre des milliers d'ordinateurs simultanément. C'est le principe fondamental de la **Blockchain**.

### Les 3 piliers de la technologie

1. **La distribution :** Aucune base de données centrale
2. **L'immutabilité :** Une fois inscrite, une transaction ne peut être ni altérée ni supprimée
3. **Le consensus :** Les participants s'accordent sur la validité de l'état du réseau`,
      isPublished: true,
      publishedAt: new Date('2026-02-05'),
    },
    {
      title: "Stratégies d'investissement en cryptomonnaies",
      slug: 'strategies-investissement-crypto',
      contentType: 'tutorial',
      difficultyLevel: 'advanced',
      difficultyLabel: 'Avancé',
      excerpt: 'Conseils pour mieux gérer vos actifs.',
      coverImageUrl: 'assets/images/chart_3d.jpg',
      readingTime: '7 min',
      tags: ['investissement', 'dca', 'trading', 'gestion du risque', 'avancé'],
      summaryPoints: [
        'Le Dollar Cost Averaging (DCA) pour lisser la volatilité',
        'La règle d\'or de la diversification',
        'La gestion stricte du ratio risque/rendement',
        'L\'importance de la conservation personnelle (Cold Storage)',
      ],
      body: `### Maîtriser l'investissement crypto

Le marché des cryptomonnaies est réputé pour sa volatilité. Pour réussir sur le long terme, les investisseurs chevronnés appliquent des règles méthodiques éprouvées.

### 1. La stratégie du DCA (Dollar Cost Averaging)

Le DCA consiste à investir une somme fixe à intervalles réguliers. Vous lissez le prix d'achat moyen et éliminez le stress émotionnel.

### 2. Allocation stratégique de portefeuille

- **Actifs majeurs (60-70%) :** Bitcoin et Ethereum
- **Projets alternatifs (20-25%) :** Layer 1/2 majeurs
- **Réserve liquide (10-15%) :** Stablecoins`,
      isPublished: true,
      publishedAt: new Date('2026-02-12'),
    },
  ];

  await Content.insertMany(content);
  console.log(`✅ ${content.length} contenus créés`);
};

const runSeed = async () => {
  try {
    console.log('\n🌱 DÉBUT DU SEEDING');
    console.log('='.repeat(70));

    await connectDB();
    await seedUsers();
    await seedServices();
    await seedContent();

    console.log('\n' + '='.repeat(70));
    console.log('✅ SEEDING TERMINÉ AVEC SUCCÈS');
    console.log('='.repeat(70) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
};

runSeed();
