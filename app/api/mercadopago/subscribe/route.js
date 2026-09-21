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
      return Response.json({ error: "Faça login antes de assinar." }, { status: 401 });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const planId = process.env.MERCADOPAGO_PLAN_ID;
    if (!accessToken || !planId) {
      return Response.json({ error: "Mercado Pago ainda não foi configurado no servidor." }, { status: 503 });
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        preapproval_plan_id: planId,
        reason: "Portal Cósmico Premium",
        external_reference: user.id,
        payer_email: user.email,
        back_url: `${origin}/assinatura?checkout=success`,
        notification_url: `${origin}/api/mercadopago/webhook`,
      }),
      cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Mercado Pago subscription error", data);
      return Response.json({ error: data?.message || "Não foi possível iniciar a assinatura." }, { status: 502 });
    }

    const checkoutUrl = data.init_point || data.sandbox_init_point;
    if (!checkoutUrl) {
      return Response.json({ error: "O Mercado Pago não devolveu a URL de checkout." }, { status: 502 });
    }

    return Response.json({ checkoutUrl, subscriptionId: data.id, status: data.status });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Não foi possível iniciar a assinatura." }, { status: 500 });
  }
}
