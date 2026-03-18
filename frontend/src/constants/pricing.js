/**
 * Centralised subscription plan pricing.
 * Update here and all pages that import these constants will stay in sync.
 */
export const PLANS = {
  monthly: {
    id: 'monthly',
    label: 'Mensual',
    price: 9.99,
    priceLabel: '9,99',
    period: 'mes',
    savings: null,
  },
  quarterly: {
    id: 'quarterly',
    label: 'Trimestral',
    price: 24.99,
    priceLabel: '24,99',
    period: '3 meses',
    savings: '17%',
  },
  annual: {
    id: 'annual',
    label: 'Anual',
    price: 79.99,
    priceLabel: '79,99',
    period: 'año',
    savings: '33%',
  },
};

/** Convenience: price string for schema.org / useSEO structured data */
export const PLAN_PRICES = {
  monthly:   '9.99',
  quarterly: '24.99',
  annual:    '79.99',
};
