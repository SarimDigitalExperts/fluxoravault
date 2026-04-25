import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Verify caller is admin
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: isAdminData } = await admin.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (!isAdminData) return json({ error: "Forbidden: admin only" }, 403);

  let body: any = {};
  try { body = await req.json(); } catch { /* allow empty */ }
  const action = body.action || "list";

  try {
    if (action === "list") {
      // List auth users (paginated; first 1000)
      const { data: list, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) throw error;
      const ids = list.users.map((u) => u.id);
      const [profilesRes, rolesRes, subsRes] = await Promise.all([
        admin.from("profiles").select("user_id, display_name, avatar_url").in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]),
        admin.from("user_roles").select("user_id, role"),
        admin.from("subscriptions").select("user_id, plan, status, expires_at").eq("status", "active"),
      ]);
      const profiles = profilesRes.data || [];
      const roles = rolesRes.data || [];
      const subs = subsRes.data || [];
      const users = list.users.map((u) => {
        const p = profiles.find((x: any) => x.user_id === u.id);
        const r = roles.find((x: any) => x.user_id === u.id);
        const s = subs.find((x: any) => x.user_id === u.id);
        return {
          id: u.id,
          email: u.email,
          display_name: p?.display_name || u.user_metadata?.display_name || null,
          avatar_url: p?.avatar_url || null,
          role: r?.role || "user",
          plan: s?.plan || "free",
          plan_expires_at: s?.expires_at || null,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          email_confirmed: !!u.email_confirmed_at,
          provider: u.app_metadata?.provider || "email",
        };
      });
      return json({ users });
    }

    if (action === "create") {
      const { email, password, display_name, role } = body;
      if (!email || !password) return json({ error: "email and password required" }, 400);
      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: display_name || email },
      });
      if (error) throw error;
      const newId = created.user!.id;
      // Profile auto-created via trigger; ensure role
      const finalRole = ["admin", "moderator", "user"].includes(role) ? role : "user";
      await admin.from("user_roles").upsert({ user_id: newId, role: finalRole }, { onConflict: "user_id,role" });
      return json({ ok: true, user_id: newId });
    }

    if (action === "update_role") {
      const { user_id, role } = body;
      if (!user_id || !["admin", "moderator", "user"].includes(role))
        return json({ error: "user_id and valid role required" }, 400);
      // Replace existing roles with the new one (single role per user model)
      await admin.from("user_roles").delete().eq("user_id", user_id);
      const { error } = await admin.from("user_roles").insert({ user_id, role });
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "update_profile") {
      const { user_id, display_name } = body;
      if (!user_id) return json({ error: "user_id required" }, 400);
      const { error } = await admin.from("profiles").update({ display_name }).eq("user_id", user_id);
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "delete") {
      const { user_id } = body;
      if (!user_id) return json({ error: "user_id required" }, 400);
      if (user_id === userData.user.id) return json({ error: "You cannot delete yourself" }, 400);
      // Cleanup app rows (profiles, roles) — auth.admin.deleteUser cascades on auth side only
      await admin.from("user_roles").delete().eq("user_id", user_id);
      await admin.from("profiles").delete().eq("user_id", user_id);
      const { error } = await admin.auth.admin.deleteUser(user_id);
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e: any) {
    console.error("admin-users error:", e);
    return json({ error: e?.message || "Server error" }, 500);
  }
});