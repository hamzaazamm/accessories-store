import './globals.css';
import { Josefin_Sans, Lato } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import { BRANDING } from '../lib/branding';

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-josefin',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
});

export const metadata = {
  title: `${BRANDING.name} — Curated Mobile Accessories`,
  description: BRANDING.description,
  keywords: [
    'mobile accessories',
    'phone cases',
    'MagSafe chargers',
    'screen protectors',
    'GaN fast charger',
    'wireless earbuds',
    'power banks',
    'Gadget District',
  ],
  openGraph: {
    title: `${BRANDING.name} — Curated Mobile Accessories`,
    description: BRANDING.description,
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${josefin.variable} ${lato.variable}`}>
      <body className="min-h-screen flex flex-col bg-white text-[#151875] font-lato antialiased text-base leading-relaxed">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <CartDrawer />
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
