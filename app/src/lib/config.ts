// Central config for values that may change or come from a DB/env later
import { APP_LOGO_SRC } from './brand';

const STORAGE_KEYS = {
  payments: 'galaxy_payments',
};

const config = {
  logoUrl: APP_LOGO_SRC,
  storageKeys: STORAGE_KEYS,
};

export default config;
