const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nmmqdbnveniyfepwghtc.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_sN7tIZnNdqOKhM17lbuRMA_w9TS4s-_";

async function getUserAndToken(request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return {};
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return {};
  return { user: await response.json(), token };
}

export async function POST(request) {
  try {
    const { user, token } = await getUserAndToken(request);
    if (!user?.id) return Response.json({ error: "Faça login." }, { status: 401 });

    const list = await fetch(
      `${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${encodeURIComponent(user.id)}&provider=eq.mercadopago&status=eq.active&select=provider_subscription_id&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );
    const rows = list.ok ? await list.json() : [];
    const subscriptionId = rows?.[0]?.provider_subscription_id;
    if (!subscriptionId) {
      return Response.json({ error: "Nenhuma assinatura ativa foi encontrada." }, { status: 404 });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return Response.json({ error: "Mercado Pago ainda não foi configurado no servidor." }, { status: 503 });
    }

    const response = await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(subscriptionId)}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ status: "cancelled" }),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) {
      return Response.json({ error: data?.message || "Não foi possível cancelar a assinatura." }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Não foi possível cancelar a assinatura." }, { status: 500 });
  }
}
