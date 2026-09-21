const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nmmqdbnveniyfepwghtc.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_sN7tIZnNdqOKhM17lbuRMA_w9TS4s-_";

async function getUser(request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.json();
}

export async function POST(request) {
  try {
    const user = await getUser(request);
    if (!user?.id || !user?.email) {
      return Response.json({ error: "Faça login antes de comprar o acesso." }, { status: 401 });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return Response.json({ error: "Mercado Pago ainda não foi configurado no servidor." }, { status: 503 });
    }

    const price = Number(process.env.MERCADOPAGO_LIFETIME_PRICE || "27.90");
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        items: [{
          id: "biblioteca-astral-lifetime",
          title: "Biblioteca Astral — Acesso Vitalício",
          description: "Pagamento único para acesso vitalício à Biblioteca Astral.",
          quantity: 1,
          currency_id: "BRL",
          unit_price: price
        }],
        payer: { email: user.email },
        external_reference: user.id,
        metadata: { user_id: user.id, access_type: "lifetime" },
        back_urls: {
          success: `${origin}/assinatura?checkout=success`,
          pending: `${origin}/assinatura?checkout=pending`,
          failure: `${origin}/assinatura?checkout=failure`
        },
        auto_return: "approved",
        notification_url: `${origin}/api/mercadopago/webhook`
      }),
      cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Mercado Pago preference error", data);
      return Response.json({ error: data?.message || "Não foi possível iniciar o pagamento." }, { status: 502 });
    }

    const checkoutUrl = data.init_point || data.sandbox_init_point;
    if (!checkoutUrl) {
      return Response.json({ error: "O Mercado Pago não devolveu a URL de checkout." }, { status: 502 });
    }

    return Response.json({ checkoutUrl, preferenceId: data.id });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Não foi possível iniciar o pagamento." }, { status: 500 });
  }
}
