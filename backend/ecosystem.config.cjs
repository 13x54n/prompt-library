/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: 'auth-service',
      cwd: './services/auth-service',
      script: 'src/server.js',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      env: { NODE_ENV: 'development' },
      env_production: { NODE_ENV: 'production' },
    },
    {
      name: 'prompt-service',
      cwd: './services/prompt-service',
      script: 'src/server.js',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      env: { NODE_ENV: 'development' },
      env_production: { NODE_ENV: 'production' },
    },
    {
      name: 'notification-service',
      cwd: './services/notification-service',
      script: 'src/server.js',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      env: { NODE_ENV: 'development' },
      env_production: { NODE_ENV: 'production' },
    },
  ],
};
