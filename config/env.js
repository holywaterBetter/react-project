const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function loadEnv(mode) {
  const root = path.resolve(__dirname, '..');
  const files = [`.env.${mode}.local`, `.env.${mode}`, '.env.local', '.env'];

  files.forEach((file) => {
    const envPath = path.join(root, file);
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
    }
  });

  const appBasePath = process.env.APP_BASE_PATH || '/';

  return {
    NODE_ENV: mode,
    APP_NAME: process.env.APP_NAME || 'Enterprise React Starter',
    API_BASE_URL: process.env.API_BASE_URL || 'https://api.example.com',
    APP_BASE_PATH: appBasePath.startsWith('/') ? appBasePath : `/${appBasePath}`
  };
}

module.exports = { loadEnv };
