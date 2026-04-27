import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Calendar, ArrowRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface BlogRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  tags: string[] | null;
  created_at: string;
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string>("all");

  useEffect(() => {
    document.title = "Blog | Fluxora Vault";
    supabase.from("blogs").select("id,title,slug,excerpt,cover_image,tags,created_at")
      .eq("is_published", true).order("created_at", { ascending: false })
      .then(({ data }) => { setBlogs(data || []); setLoading(false); });
  }, []);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    blogs.forEach(b => (b.tags || []).forEach(t => s.add(t)));
    return Array.from(s).sort();
  }, [blogs]);

  const filtered = blogs.filter(b => {
    const matchQ = !query || b.title.toLowerCase().includes(query.toLowerCase()) || (b.excerpt || "").toLowerCase().includes(query.toLowerCase());
    const matchT = tag === "all" || (b.tags || []).includes(tag);
    return matchQ && matchT;
  });

  return (
    <div className="container pt-24 pb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
          <BookOpen className="h-4 w-4" /> Fluxora Vault Blog
        </span>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">Insights, Guides & Trends</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">Articles for creators, freelancers, and founders building with digital assets.</p>
      </motion.div>

      <div className="max-w-2xl mx-auto mb-10 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search articles..." className="pl-11 h-12 rounded-full" />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            <button onClick={() => setTag("all")} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${tag === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>All</button>
            {allTags.map(t => (
              <button key={t} onClick={() => setTag(t)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${tag === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>{t}</button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
              <div className="aspect-[16/10] bg-muted" />
              <div className="p-5 space-y-3"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-3 bg-muted rounded w-full" /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No articles match your search.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link to={`/blog/${b.slug}`} className="group block rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow h-full">
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img src={b.cover_image || "/placeholder.svg"} alt={b.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" /> {new Date(b.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                  <h2 className="font-display font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">{b.title}</h2>
                  {b.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{b.excerpt}</p>}
                  <div className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-medium">
                    Read More <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
