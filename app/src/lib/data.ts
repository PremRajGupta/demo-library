import config from './config';
import type { PaymentReceipt } from './receipt';

// Small data access layer. Right now it uses localStorage, but later
// you can replace these implementations with API calls to a database.

export const getPayments = (): PaymentReceipt[] => {
  const raw = localStorage.getItem(config.storageKeys.payments);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PaymentReceipt[];
  } catch {
    return [];
  }
};

export const savePayments = (payments: PaymentReceipt[]) => {
  localStorage.setItem(config.storageKeys.payments, JSON.stringify(payments));
};

export const addPayment = (payment: PaymentReceipt): PaymentReceipt[] => {
  const current = getPayments();
  const updated = [payment, ...current];
  savePayments(updated);
  return updated;
};

export default {
  getPayments,
  savePayments,
  addPayment,
};
