import { Env } from '@core/types/env';

export const environment: Env = {
  appVersion: `${require('../../package.json').version}-pre`,
  production: false,
  apiBaseUrl: '',
  stripePublishableKey: ''
};
