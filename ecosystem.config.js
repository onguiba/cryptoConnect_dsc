/**
 * ============================================================
 * CRYPTOCONNECT PRO - CONFIGURATION PM2 (HOSTINGER VPS & SERVEURS)
 * ============================================================
 * 
 * Utilisation sur VPS Hostinger :
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    {
      name: 'cryptoconnect-pro',
      script: 'app.js',
      instances: 'max', // Utilise tous les cœurs CPU du VPS
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
