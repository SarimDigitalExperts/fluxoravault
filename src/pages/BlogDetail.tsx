import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface BlogFull {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  tags: string[] | null;
  created_at: string;
}

// Lightweight markdown -> HTML (handles #, ##, ###, **bold**, lists, paragraphs)
function renderMarkdown(md: string): string {
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = md.split(/\r?\n/);
  const html: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^### /.test(line)) { if (inList) { html.push("</ul>"); inList = false; } html.push(`<h3 class="text-xl font-display font-bold mt-6 mb-3">${escape(line.slice(4))}</h3>`); continue; }
    if (/^## /.test(line)) { if (inList) { html.push("</ul>"); inList = false; } html.push(`<h2 class="text-2xl font-display font-bold mt-8 mb-3">${escape(line.slice(3))}</h2>`); continue; }
    if (/^# /.test(line)) { if (inList) { html.push("</ul>"); inList = false; } html.push(`<h1 class="text-3xl font-display font-bold mt-8 mb-4">${escape(line.slice(2))}</h1>`); continue; }
    if (/^[-*] /.test(line)) {
      if (!inList) { html.push('<ul class="list-disc pl-6 my-3 space-y-1 text-muted-foreground">'); inList = true; }
      html.push(`<li>${escape(line.slice(2)).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`);
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      if (!inList) { html.push('<ol class="list-decimal pl-6 my-3 space-y-1 text-muted-foreground">'); inList = true; }
      html.push(`<li>${escape(line.replace(/^\d+\.\s/, "")).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`);
      continue;
    }
    if (inList) { html.push("</ul>"); inList = false; }
    if (line.trim() === "") { html.push(""); continue; }
    html.push(`<p class="text-base text-muted-foreground leading-relaxed my-3">${escape(line).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`);
  }
  if (inList) html.push("</ul>");
  return html.join("\n");
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<BlogFull | null>(null);
  const [related, setRelated] = useState<BlogFull[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase.from("blogs").select("*").eq("slug", slug).eq("is_published", true).maybeSingle()
      .then(async ({ data }) => {
        setBlog(data as BlogFull | null);
        if (data) {
          document.title = `${data.title} | Fluxora Mart`;
          const { data: rel } = await supabase.from("blogs").select("*")
            .eq("is_published", true).neq("id", data.id).order("created_at", { ascending: false }).limit(3);
          setRelated(rel as BlogFull[] || []);
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="container pt-24 pb-16 text-center text-muted-foreground">Loading...</div>;
  if (!blog) return (
    <div className="container pt-24 pb-16 text-center">
      <p className="text-muted-foreground">Article not found.</p>
      <Button asChild className="mt-4"><Link to="/blog">Back to Blog</Link></Button>
    </div>
  );

  return (
    <article className="container pt-24 pb-16 max-w-4xl">
      <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Blog
      </Link>

      <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{blog.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />
            {new Date(blog.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </span>
          <span>·</span>
          <span>By Fluxora Mart Team</span>
          {(blog.tags || []).length > 0 && (
            <span className="inline-flex items-center gap-2">
              <Tag className="h-3.5 w-3.5" />
              {(blog.tags || []).map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted">{t}</span>)}
            </span>
          )}
        </div>
      </motion.header>

      {blog.cover_image && (
        <div className="rounded-2xl overflow-hidden mb-8 aspect-[16/8] bg-muted">
          <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="prose prose-neutral max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content) }} />

      {related.length > 0 && (
        <section className="mt-16 pt-10 border-t border-border">
          <h2 className="text-2xl font-display font-bold mb-6">Keep Reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map(r => (
              <Link key={r.id} to={`/blog/${r.slug}`} className="group block rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img src={r.cover_image || "/placeholder.svg"} alt={r.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{r.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
