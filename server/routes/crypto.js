/**
 * CRYPTO ROUTES
 * Routes pour les taux de cryptomonnaies en temps réel et simulateur de conversion
 */

const express = require('express');
const router = express.Router();

// Taux de conversion de référence
const USD_TO_FCFA = 605;
const USD_TO_EUR = 0.92;

const baseCryptos = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    basePrice: 68450,
    change24h: '+2.84%',
    isPositive: true,
    icon: 'assets/images/bitcoin_3d.jpg',
    circulatingSupply: '19.7M BTC',
    marketCap: '$1.35T',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    basePrice: 3520,
    change24h: '+3.15%',
    isPositive: true,
    icon: 'assets/images/ethereum_3d.jpg',
    circulatingSupply: '120.2M ETH',
    marketCap: '$423B',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    basePrice: 184.5,
    change24h: '+5.72%',
    isPositive: true,
    icon: 'assets/images/ethereum_3d.jpg',
    circulatingSupply: '468M SOL',
    marketCap: '$86.3B',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    basePrice: 1.0,
    change24h: '+0.01%',
    isPositive: true,
    icon: 'assets/images/bitcoin_3d.jpg',
    circulatingSupply: '118B USDT',
    marketCap: '$118B',
  },
  {
    symbol: 'BNB',
    name: 'BNB Chain',
    basePrice: 595.2,
    change24h: '+1.45%',
    isPositive: true,
    icon: 'assets/images/bitcoin_3d.jpg',
    circulatingSupply: '147M BNB',
    marketCap: '$87.5B',
  },
];

// Générateur de variation légère temps réel
const getDynamicRates = () => {
  return baseCryptos.map((coin) => {
    // Si c'est USDT, le prix reste ancré à $1.00
    if (coin.symbol === 'USDT') {
      return {
        ...coin,
        priceUsd: 1.0,
        priceFcfa: Math.round(1.0 * USD_TO_FCFA),
        priceEur: +(1.0 * USD_TO_EUR).toFixed(2),
        high24h: 1.002,
        low24h: 0.999,
        lastUpdate: new Date().toISOString(),
      };
    }

    const variance = (Math.random() - 0.48) * 0.008; // légère fluctuation +/- 0.4%
    const currentPrice = +(coin.basePrice * (1 + variance)).toFixed(2);
    const high = +(currentPrice * 1.025).toFixed(2);
    const low = +(currentPrice * 0.978).toFixed(2);

    return {
      ...coin,
      priceUsd: currentPrice,
      priceFcfa: Math.round(currentPrice * USD_TO_FCFA),
      priceEur: +(currentPrice * USD_TO_EUR).toFixed(2),
      high24h: high,
      low24h: low,
      lastUpdate: new Date().toISOString(),
    };
  });
};

// Route principale : GET /api/crypto-rates et GET /api/crypto-rates/rates
const handleGetRates = (req, res) => {
  const rates = getDynamicRates();
  res.json({
    success: true,
    rates,
    currencies: {
      USD: 1,
      FCFA: USD_TO_FCFA,
      EUR: USD_TO_EUR,
    },
    lastUpdate: new Date().toISOString(),
  });
};

router.get('/', handleGetRates);
router.get('/rates', handleGetRates);

// Simulateur de conversion : GET /api/crypto-rates/convert?from=USDT&to=FCFA&amount=100
router.get('/convert', (req, res) => {
  const { from = 'USDT', to = 'FCFA', amount = 1 } = req.query;
  const numAmount = parseFloat(amount) || 1;
  const rates = getDynamicRates();

  let fromPriceUsd = 1;
  const foundFrom = rates.find((r) => r.symbol.toUpperCase() === from.toUpperCase());
  if (foundFrom) {
    fromPriceUsd = foundFrom.priceUsd;
  } else if (from.toUpperCase() === 'USD') {
    fromPriceUsd = 1;
  } else if (from.toUpperCase() === 'EUR') {
    fromPriceUsd = 1 / USD_TO_EUR;
  } else if (from.toUpperCase() === 'FCFA' || from.toUpperCase() === 'XOF') {
    fromPriceUsd = 1 / USD_TO_FCFA;
  }

  const totalUsd = numAmount * fromPriceUsd;

  let result = totalUsd;
  let targetCurrency = to.toUpperCase();

  if (targetCurrency === 'FCFA' || targetCurrency === 'XOF') {
    result = Math.round(totalUsd * USD_TO_FCFA);
  } else if (targetCurrency === 'EUR') {
    result = +(totalUsd * USD_TO_EUR).toFixed(2);
  } else if (targetCurrency === 'USD') {
    result = +totalUsd.toFixed(2);
  } else {
    const foundTo = rates.find((r) => r.symbol.toUpperCase() === targetCurrency);
    if (foundTo) {
      result = +(totalUsd / foundTo.priceUsd).toFixed(6);
    }
  }

  res.json({
    success: true,
    from: from.toUpperCase(),
    to: targetCurrency,
    amount: numAmount,
    result,
    estimatedFee: '0%',
    rateGuaranteed: true,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
