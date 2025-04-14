interface Config {
  apiUrl: string;
  environment: string;
  appName: string;
  version: string;
}

const config: Config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  environment: process.env.REACT_APP_ENV || 'development',
  appName: process.env.REACT_APP_APP_NAME || 'Shashi HRM',
  version: process.env.REACT_APP_VERSION || '1.0.0',
};

// Validate required environment variables
const requiredEnvVars = ['REACT_APP_API_URL'];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(`Warning: ${envVar} is not set in environment variables`);
  }
});

export default config;

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 