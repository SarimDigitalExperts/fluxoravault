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
import AdminLayout from "@/pages/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/Products";
import AdminOrders from "@/pages/admin/Orders";
import AdminAnalytics from "@/pages/admin/Analytics";
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
              <div className="stars-bg" />
              <PromoPopup />
              <Navbar />
              <main className="relative z-10 pt-6">
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
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
