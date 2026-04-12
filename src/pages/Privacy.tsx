import { motion } from "framer-motion";

export default function Privacy() {
  return (
    <div className="container pt-24 pb-16 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-display font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
          <p>Last updated: April 2026</p>
          <h2 className="text-foreground font-display">1. Information We Collect</h2>
          <p>We collect information you provide when creating an account, making purchases, or contacting support. This includes name, email, and payment information.</p>
          <h2 className="text-foreground font-display">2. How We Use Your Information</h2>
          <p>Your information is used to process transactions, deliver products, and improve our services. We never sell personal data to third parties.</p>
          <h2 className="text-foreground font-display">3. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data, including encryption and secure payment processing.</p>
          <h2 className="text-foreground font-display">4. Cookies</h2>
          <p>We use cookies to enhance your browsing experience and analyze site traffic. You can manage cookie preferences in your browser settings.</p>
          <h2 className="text-foreground font-display">5. Contact</h2>
          <p>For privacy-related inquiries, contact us at privacy@orbitassets.com.</p>
        </div>
      </motion.div>
    </div>
  );
}
