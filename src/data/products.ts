export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  categorySlug: string;
  image: string;
  tags: string[];
  rating: number;
  reviews: number;
  slug: string;
}

export interface Category {
  name: string;
  slug: string;
  icon: string; // lucide icon name
  count: number;
}

export const categories: Category[] = [
  { name: "UI Kits", slug: "ui-kits", icon: "Palette", count: 24 },
  { name: "Templates", slug: "templates", icon: "FileText", count: 38 },
  { name: "Icons", slug: "icons", icon: "Sparkles", count: 156 },
  { name: "Fonts", slug: "fonts", icon: "Type", count: 42 },
  { name: "Illustrations", slug: "illustrations", icon: "Image", count: 67 },
  { name: "3D Assets", slug: "3d-assets", icon: "Box", count: 31 },
  { name: "Mockups", slug: "mockups", icon: "Smartphone", count: 53 },
  { name: "Courses", slug: "courses", icon: "GraduationCap", count: 12 },
];

export const products: Product[] = [
  {
    id: "1",
    title: "Nebula UI Kit",
    description: "A comprehensive dark-themed UI kit with 200+ components for modern web applications. Includes Figma and Sketch files.",
    price: 49,
    originalPrice: 89,
    category: "UI Kits",
    categorySlug: "ui-kits",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
    tags: ["Premium", "Trending"],
    rating: 4.9,
    reviews: 124,
    slug: "nebula-ui-kit",
  },
  {
    id: "2",
    title: "Cosmic Dashboard Template",
    description: "A fully responsive admin dashboard template with charts, tables, and dark mode. Built with React & Tailwind.",
    price: 39,
    originalPrice: 69,
    category: "Templates",
    categorySlug: "templates",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
    tags: ["Hot"],
    rating: 4.7,
    reviews: 89,
    slug: "cosmic-dashboard",
  },
  {
    id: "3",
    title: "Stellar Icon Pack",
    description: "1200+ hand-crafted icons in multiple formats. Perfect for apps, websites, and presentations.",
    price: 29,
    category: "Icons",
    categorySlug: "icons",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
    tags: ["Best Seller"],
    rating: 4.8,
    reviews: 312,
    slug: "stellar-icon-pack",
  },
  {
    id: "4",
    title: "Orbit Sans Pro",
    description: "A modern geometric sans-serif typeface family with 12 weights. Ideal for UI and branding.",
    price: 59,
    originalPrice: 99,
    category: "Fonts",
    categorySlug: "fonts",
    image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&q=80",
    tags: ["Premium"],
    rating: 4.6,
    reviews: 67,
    slug: "orbit-sans-pro",
  },
  {
    id: "5",
    title: "Galaxy Illustration Set",
    description: "50 stunning space-themed vector illustrations. SVG and PNG formats included.",
    price: 35,
    category: "Illustrations",
    categorySlug: "illustrations",
    image: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&q=80",
    tags: ["New"],
    rating: 4.5,
    reviews: 43,
    slug: "galaxy-illustration-set",
  },
  {
    id: "6",
    title: "3D Planet Collection",
    description: "25 hyper-realistic 3D planet models with textures. Blender and OBJ formats.",
    price: 79,
    originalPrice: 129,
    category: "3D Assets",
    categorySlug: "3d-assets",
    image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=600&q=80",
    tags: ["Premium", "Trending"],
    rating: 4.9,
    reviews: 56,
    slug: "3d-planet-collection",
  },
  {
    id: "7",
    title: "App Mockup Bundle",
    description: "Professional device mockups for showcasing your designs. iPhone, iPad, MacBook included.",
    price: 25,
    category: "Mockups",
    categorySlug: "mockups",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80",
    tags: ["Popular"],
    rating: 4.4,
    reviews: 198,
    slug: "app-mockup-bundle",
  },
  {
    id: "8",
    title: "Advanced React Masterclass",
    description: "Complete video course covering hooks, context, performance optimization, and more. 40+ hours.",
    price: 99,
    originalPrice: 199,
    category: "Courses",
    categorySlug: "courses",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80",
    tags: ["Premium", "Best Seller"],
    rating: 4.9,
    reviews: 421,
    slug: "advanced-react-masterclass",
  },
];
