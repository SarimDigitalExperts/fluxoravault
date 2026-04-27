import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider } from "@/hooks/useWishlist";
import { AuthProvider } from "@/hooks/useAuth";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoPopup from "@/components/PromoPopup";
import AnnouncementBar from "@/components/AnnouncementBar";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Wishlist from "@/pages/Wishlist";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Checkout from "@/pages/Checkout";
import Auth from "@/pages/Auth";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Blogs from "@/pages/Blogs";
import BlogDetail from "@/pages/BlogDetail";
import WhatsAppButton from "@/components/WhatsAppButton";
import Pricing from "@/pages/Pricing";
import SubscriptionCheckout from "@/pages/SubscriptionCheckout";
import AccountLayout from "@/pages/account/AccountLayout";
import AccountDashboard from "@/pages/account/AccountDashboard";
import AccountOrders from "@/pages/account/AccountOrders";
import AccountWishlist from "@/pages/account/AccountWishlist";
import AccountDownloads from "@/pages/account/AccountDownloads";
import AccountBilling from "@/pages/account/AccountBilling";
import AccountSettings from "@/pages/account/AccountSettings";
import AccountSubscriptions from "@/pages/account/AccountSubscriptions";
import AccountSupport from "@/pages/account/AccountSupport";
import AdminLayout from "@/pages/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/Products";
import AdminOrders from "@/pages/admin/Orders";
import AdminCategories from "@/pages/admin/Categories";
import AdminCoupons from "@/pages/admin/Coupons";
import AdminBanners from "@/pages/admin/Banners";
import AdminBlogs from "@/pages/admin/Blogs";
import AdminPaymentMethods from "@/pages/admin/PaymentMethods";
import AdminPricingPlans from "@/pages/admin/PricingPlans";
import AdminContactMessages from "@/pages/admin/ContactMessages";
import AdminAnalytics from "@/pages/admin/Analytics";
import AdminUsers from "@/pages/admin/Users";
import AdminDigitalSigns from "@/pages/admin/DigitalSigns";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <PromoPopup />
              <Routes>
                {/* Admin routes - no navbar/footer */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="banners" element={<AdminBanners />} />
                  <Route path="blogs" element={<AdminBlogs />} />
                  <Route path="payment-methods" element={<AdminPaymentMethods />} />
                  <Route path="pricing-plans" element={<AdminPricingPlans />} />
                  <Route path="messages" element={<AdminContactMessages />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="digital-signs" element={<AdminDigitalSigns />} />
                </Route>

                {/* Public routes with navbar/footer */}
                <Route path="*" element={
                  <>
                    <AnnouncementBar />
                    <Navbar />
                    <main className="relative pt-[88px]">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/product/:slug" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/blog" element={<Blogs />} />
                        <Route path="/blog/:slug" element={<BlogDetail />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/subscribe/:plan" element={<SubscriptionCheckout />} />
                        <Route path="/account" element={<AccountLayout />}>
                          <Route index element={<AccountDashboard />} />
                          <Route path="orders" element={<AccountOrders />} />
                          <Route path="wishlist" element={<AccountWishlist />} />
                          <Route path="downloads" element={<AccountDownloads />} />
                          <Route path="billing" element={<AccountBilling />} />
                          <Route path="settings" element={<AccountSettings />} />
                          <Route path="subscriptions" element={<AccountSubscriptions />} />
                          <Route path="support" element={<AccountSupport />} />
                        </Route>
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                    <WhatsAppButton />
                  </>
                } />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
