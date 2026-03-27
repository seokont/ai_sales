module.exports = {
  apps: [
    {
      name: 'ai-seller-backend',
      cwd: './apps/backend',
      script: 'node',
      args: 'dist/main.js',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
      watch: false,
    },
    {
      name: 'ai-seller-frontend',
      cwd: './apps/frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
};
