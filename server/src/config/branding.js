/**
 * Centralized Store Branding Configuration (Server)
 * Theme: Theme 3 - Minimal Premium
 * Currency: Rupees (Rs.)
 */

const BRANDING = {
  name: 'Gadget District',
  tagline: 'Curated Mobile Accessories for Modern Life',
  subtagline: 'Engineered Protection & Minimal Elegance',
  description: 'Premium phone cases, chargers, cables, audio gear, and tech accessories designed with minimalist aesthetics and uncompromising durability.',
  currency: 'Rs.',
  currencySymbol: 'Rs. ',
  contact: {
    email: 'support@gadgetdistrict.com',
    phone: '+92 (300) 123-4567',
    address: 'Gadget District, Main Boulevard, Gulberg, Lahore, Pakistan',
    workingHours: 'Mon - Sat: 9:00 AM - 8:00 PM PKT',
  },
  theme: {
    id: 'theme-3',
    name: 'Minimal Premium',
    palette: {
      background: '#FFFFFF',
      surface: '#F9FAFB',
      surfaceAlt: '#F3F4F6',
      border: '#E5E7EB',
      borderLight: '#F3F4F6',
      textPrimary: '#111111',
      textSecondary: '#6B7280',
      textMuted: '#9CA3AF',
      accent: '#111111',
    },
    typography: {
      headlineWeight: '200',
      bodyFont: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
    },
  },
  socials: {
    instagram: 'https://instagram.com/gadgetdistrict',
    twitter: 'https://twitter.com/gadgetdistrict',
    youtube: 'https://youtube.com/@gadgetdistrict',
  },
  policies: {
    freeShippingThreshold: 2000,
    shippingFee: 199,
    returnPeriodDays: 30,
    warrantyMonths: 12,
  },
};

module.exports = BRANDING;
