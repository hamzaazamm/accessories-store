/**
 * Centralized Store Branding Configuration (Client)
 * Theme: Hekto E-Commerce UI Kit (by Saber Ali - Behance)
 * Colors: #FB2E86 (Pink), #7E33E0 (Purple), #151875 (Navy), #8A8FB9 (Subtext)
 * Currency: Pakistani Rupees (Rs.)
 */

export const BRANDING = {
  name: 'Gadget District',
  tagline: 'Curated Mobile Accessories for Modern Life',
  subtagline: 'Engineered Protection & Elevated Tech Style',
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
    id: 'hekto-ui-kit',
    name: 'Hekto E-Commerce UI Kit',
    palette: {
      primary: '#FB2E86',
      secondary: '#7E33E0',
      navy: '#151875',
      subtext: '#8A8FB9',
      surface: '#F2F0FF',
      card: '#F6F5FF',
      footer: '#EEEFFB',
      footerBottom: '#E7E4F8',
      border: '#E8E6F1',
    },
    typography: {
      headingFont: 'Josefin Sans',
      bodyFont: 'Lato',
    },
  },
  navigation: [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Cases & Covers', href: '/shop?category=mobile-cases-and-covers' },
    { name: 'Chargers', href: '/shop?category=chargers-and-adapters' },
    { name: 'Audio', href: '/shop?category=wireless-earbuds-and-headphones' },
    { name: 'Power Banks', href: '/shop?category=power-banks' },
    { name: 'Order Tracking', href: '/track-order' },
  ],
  policies: {
    freeShippingThreshold: 2000,
    shippingFee: 199,
    returnPeriodDays: 30,
    warrantyMonths: 12,
  },
};
