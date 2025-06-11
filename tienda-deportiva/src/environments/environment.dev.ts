import { Env } from '@core/types/env';

export const environment: Env = {
  appVersion: `${require('../../package.json').version}-dev`,
  production: false,
  apiBaseUrl: 'http://localhost:3000',
  stripePublishableKey:
    'pk_test_51RM46mPxQCqzxtgYuyD7XbDpnYke3Xm8QAaITWQhXxm8Kx9cv3e6UUsrE7McWU8fJJ7HMXsogHBGvH8y80kPcY1D00DtzPOL8q'
};
