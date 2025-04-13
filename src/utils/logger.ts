const logLevels = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLogLevel = process.env.NODE_ENV === 'production' ? logLevels.INFO : logLevels.DEBUG;

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const getColor = (level: string) => {
  switch (level) {
    case 'DEBUG':
      return colors.blue;
    case 'INFO':
      return colors.green;
    case 'WARN':
      return colors.yellow;
    case 'ERROR':
      return colors.red;
    default:
      return colors.reset;
  }
};

const formatMessage = (level: string, message: string, ...args: any[]) => {
  const timestamp = new Date().toISOString();
  const color = getColor(level);
  const formattedArgs = args.length ? JSON.stringify(args, null, 2) : '';
  return `${colors.dim}[${timestamp}]${colors.reset} ${color}[${level}]${colors.reset} ${message} ${formattedArgs}`;
};

const logToConsole = (level: string, message: string, ...args: any[]) => {
  const formattedMessage = formatMessage(level, message, ...args);
  switch (level) {
    case 'DEBUG':
      console.debug(formattedMessage);
      break;
    case 'INFO':
      console.info(formattedMessage);
      break;
    case 'WARN':
      console.warn(formattedMessage);
      break;
    case 'ERROR':
      console.error(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }
};

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (currentLogLevel <= logLevels.DEBUG) {
      logToConsole('DEBUG', message, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (currentLogLevel <= logLevels.INFO) {
      logToConsole('INFO', message, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (currentLogLevel <= logLevels.WARN) {
      logToConsole('WARN', message, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    if (currentLogLevel <= logLevels.ERROR) {
      logToConsole('ERROR', message, ...args);
    }
  },
  // New methods for specific contexts
  api: {
    request: (method: string, url: string, data?: any) => {
      logger.debug(`API Request: ${method} ${url}`, data);
    },
    response: (method: string, url: string, status: number, data?: any) => {
      logger.debug(`API Response: ${method} ${url} ${status}`, data);
    },
    error: (method: string, url: string, error: any) => {
      logger.error(`API Error: ${method} ${url}`, error);
    },
  },
  auth: {
    login: (email: string) => {
      logger.info(`User login attempt: ${email}`);
    },
    logout: (email: string) => {
      logger.info(`User logout: ${email}`);
    },
    sessionExpired: (email: string) => {
      logger.warn(`Session expired for user: ${email}`);
    },
  },
  // Performance logging
  performance: {
    start: (operation: string) => {
      const startTime = performance.now();
      logger.debug(`Performance: Starting ${operation}`);
      return startTime;
    },
    end: (operation: string, startTime: number) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      logger.debug(`Performance: ${operation} completed in ${duration.toFixed(2)}ms`);
    },
  },
}; 