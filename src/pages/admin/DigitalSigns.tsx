import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Headphones, Layers, BookOpen, Heart, Check } from "lucide-react";

export default function DigitalSigns() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Digital Signs / Web Info</h1>
        <p className="text-sm text-muted-foreground">Source code information and support details</p>
      </div>

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="w-full justify-start bg-muted/30 border border-border rounded-xl p-1 h-auto flex-wrap">
          <TabsTrigger value="pricing" className="gap-2"><DollarSign className="h-4 w-4" /> Pricing</TabsTrigger>
          <TabsTrigger value="support" className="gap-2"><Headphones className="h-4 w-4" /> Support</TabsTrigger>
          <TabsTrigger value="features" className="gap-2"><Layers className="h-4 w-4" /> Features</TabsTrigger>
          <TabsTrigger value="install" className="gap-2"><BookOpen className="h-4 w-4" /> Installation</TabsTrigger>
          <TabsTrigger value="about" className="gap-2"><Heart className="h-4 w-4" /> About</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Basic Package", price: "PKR 15,000", features: ["Full source code", "Basic support", "1 project license", "3 months updates"] },
              { name: "Pro Package", price: "PKR 35,000", features: ["Full source code", "Priority support", "5 project licenses", "1 year updates", "Custom branding guide"] },
              { name: "Full SaaS Package", price: "PKR 75,000", features: ["Full source code", "Dedicated support", "Unlimited licenses", "Lifetime updates", "Custom branding", "Deployment assistance", "API documentation"] },
            ].map(p => (
              <Card key={p.name} className="border-border">
                <CardHeader><CardTitle className="text-lg">{p.name}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold mb-4">{p.price}</p>
                  <ul className="space-y-2">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" /> {f}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="support" className="mt-6">
          <Card className="border-border">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Contact Channels</h3>
                  <div className="space-y-3 text-sm">
                    <p>📧 Email: support@digitalsigns.team</p>
                    <p>💬 WhatsApp: +92 XXX XXXXXXX</p>
                    <p>🕐 Response time: Within 24 hours</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Support Policy</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Bug fixes within 48 hours</li>
                    <li>• Feature requests reviewed weekly</li>
                    <li>• Priority support for Pro & SaaS packages</li>
                    <li>• Community Discord for general help</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Digital Products System", "Manual Payment Verification", "Subscription Plans", "Admin Dashboard with Analytics",
                  "User Account Management", "Order Management", "Download Access Control", "License Key System",
                  "QR Code Delivery", "Coupon System", "Blog & SEO", "Category Management",
                  "Banner Management", "Contact Form", "Wishlist System", "Google OAuth",
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
                    <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="install" className="mt-6">
          <Card className="border-border">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4">
                {[
                  { step: "1", title: "Clone Repository", desc: "Download the source code and extract it to your local machine." },
                  { step: "2", title: "Install Dependencies", desc: "Run `npm install` or `bun install` to install all required packages." },
                  { step: "3", title: "Setup Backend", desc: "Create a Supabase project and run the migration files in the supabase/migrations folder." },
                  { step: "4", title: "Configure Environment", desc: "Copy .env.example to .env and fill in your Supabase URL and anon key." },
                  { step: "5", title: "Deploy", desc: "Build with `npm run build` and deploy to Vercel, Netlify, or any static hosting." },
                ].map(s => (
                  <div key={s.step} className="flex gap-4 items-start">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">{s.step}</div>
                    <div>
                      <h4 className="font-semibold text-sm">{s.title}</h4>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <Card className="border-border">
            <CardContent className="p-6 text-center space-y-4">
              <h2 className="text-2xl font-display font-bold">Digital Signs Team</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                We build premium, production-ready SaaS templates and digital products. Our mission is to help developers and businesses launch faster with beautiful, functional codebases.
              </p>
              <p className="text-sm text-muted-foreground">Built with ❤️ by Digital Signs Team</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
