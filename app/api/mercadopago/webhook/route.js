const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nmmqdbnveniyfepwghtc.supabase.co";

function normalizeStatus(status) {
  if (status === "authorized") return "active";
  if (status === "paused") return "paused";
  if (status === "cancelled" || status === "canceled") return "canceled";
  return status || "pending";
}

async function upsertSubscription(subscription) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY ausente");
  const userId = subscription.external_reference;
  if (!userId) return;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?on_conflict=provider_subscription_id`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      user_id: userId,
      provider: "mercadopago",
      provider_subscription_id: subscription.id,
      plan: "biblioteca",
      status: normalizeStatus(subscription.status),
      current_period_end: subscription.next_payment_date || null,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!response.ok) throw new Error(await response.text());
}

export async function POST(request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) return Response.json({ ok: false }, { status: 503 });

    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const id = body?.data?.id || body?.id || url.searchParams.get("data.id") || url.searchParams.get("id");
    const type = body?.type || url.searchParams.get("type") || "";

    if (!id) return Response.json({ ok: true });

    if (type && !String(type).includes("subscription") && type !== "preapproval") {
      return Response.json({ ok: true });
    }

    const response = await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(id)}`, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return Response.json({ ok: true });

    const subscription = await response.json();
    await upsertSubscription(subscription);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Mercado Pago webhook error", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
