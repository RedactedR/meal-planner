// King Soopers (Kroger) connection server for Meal Planner.
//
// Why this exists: Kroger requires a "client secret" for every sign-in
// and product search. A secret can't live inside the app (anyone could
// pull it out, and this repo is public), so this tiny server keeps it
// and talks to Kroger on the app's behalf.
//
// Runs free on Cloudflare Workers. Setup steps: server/README.md
//
// Secrets to add in Cloudflare (Settings → Variables and Secrets):
//   KROGER_CLIENT_ID      – from developer.kroger.com
//   KROGER_CLIENT_SECRET  – from developer.kroger.com
//
// Endpoints the app uses:
//   GET  /health                         – check the server is set up
//   GET  /login?return=<app url>         – start King Soopers sign-in
//   GET  /callback                       – Kroger sends the user back here
//   POST /refresh   { refresh_token }    – get a fresh sign-in token
//   GET  /locations?zip=80202            – stores near a ZIP code
//   GET  /products?term=&locationId=     – products with live prices
//   PUT  /cart      { items: [...] }     – add items to the user's cart
//                   (send the user's token as "Authorization: Bearer ...")

const KROGER = 'https://api.kroger.com';
const USER_SCOPES = 'cart.basic:write profile.compact product.compact';

// Where sign-in is allowed to send tokens back to: the Expo Go app, a
// built version of this app, Snack's browser preview, or local testing.
const ALLOWED_RETURN = [
  /^exps?:\/\//i,
  /^mealplanner:\/\//i,
  /^https:\/\/([a-z0-9-]+\.)*(expo\.dev|expo\.io|snack\.expo\.dev)(\/|$)/i,
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i,
];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function fail(message, status = 400) {
  return json({ error: message }, status);
}

// ---- small helpers ----

function b64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlText(text) {
  return b64url(new TextEncoder().encode(text));
}

function fromB64url(s) {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  return new TextDecoder().decode(Uint8Array.from(atob(pad), (c) => c.charCodeAt(0)));
}

async function hmac(secret, text) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text));
  return b64url(new Uint8Array(sig));
}

function basicAuth(env) {
  return 'Basic ' + btoa(`${env.KROGER_CLIENT_ID}:${env.KROGER_CLIENT_SECRET}`);
}

async function tokenRequest(env, params) {
  const res = await fetch(`${KROGER}/v1/connect/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuth(env),
    },
    body: new URLSearchParams(params).toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error_description || data.error || `Kroger sign-in failed (${res.status})`);
  }
  return data;
}

// App-level token for store and product lookups (no user sign-in needed).
// Cached while this server instance is warm; Kroger tokens last 30 minutes.
let appToken = null;
async function getAppToken(env) {
  if (appToken && appToken.expiresAt > Date.now() + 60_000) return appToken.value;
  const data = await tokenRequest(env, { grant_type: 'client_credentials', scope: 'product.compact' });
  appToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in || 1800) * 1000 };
  return appToken.value;
}

async function krogerGet(env, path, params) {
  const token = await getAppToken(env);
  const url = `${KROGER}${path}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.errors?.reason || data.error || `Kroger request failed (${res.status})`);
  return data;
}

// ---- endpoints ----

async function login(request, env, url) {
  const ret = url.searchParams.get('return') || '';
  if (!ALLOWED_RETURN.some((re) => re.test(ret))) return fail('That return address is not allowed.');
  const payload = b64urlText(JSON.stringify({ r: ret, t: Date.now() }));
  const state = `${payload}.${await hmac(env.KROGER_CLIENT_SECRET, payload)}`;
  const params = new URLSearchParams({
    scope: USER_SCOPES,
    response_type: 'code',
    client_id: env.KROGER_CLIENT_ID,
    redirect_uri: `${url.origin}/callback`,
    state,
  });
  return Response.redirect(`${KROGER}/v1/connect/oauth2/authorize?${params.toString()}`, 302);
}

async function callback(request, env, url) {
  const state = url.searchParams.get('state') || '';
  const [payload, sig] = state.split('.');
  if (!payload || !sig || sig !== (await hmac(env.KROGER_CLIENT_SECRET, payload))) {
    return new Response('Sign-in link was invalid or tampered with. Please try again from the app.', { status: 400 });
  }
  const { r: ret, t } = JSON.parse(fromB64url(payload));
  if (Date.now() - t > 15 * 60_000) {
    return new Response('Sign-in took too long. Please try again from the app.', { status: 400 });
  }

  const back = (fields) => {
    const sep = ret.includes('#') ? '&' : '#';
    return Response.redirect(`${ret}${sep}${new URLSearchParams(fields).toString()}`, 302);
  };

  const error = url.searchParams.get('error');
  if (error) return back({ error: url.searchParams.get('error_description') || error });

  try {
    const data = await tokenRequest(env, {
      grant_type: 'authorization_code',
      code: url.searchParams.get('code') || '',
      redirect_uri: `${url.origin}/callback`,
    });
    return back({
      access_token: data.access_token,
      refresh_token: data.refresh_token || '',
      expires_in: String(data.expires_in || 1800),
    });
  } catch (e) {
    return back({ error: e.message });
  }
}

async function refresh(request, env) {
  const body = await request.json().catch(() => ({}));
  if (!body.refresh_token) return fail('Missing refresh_token');
  try {
    const data = await tokenRequest(env, { grant_type: 'refresh_token', refresh_token: body.refresh_token });
    return json({
      access_token: data.access_token,
      refresh_token: data.refresh_token || body.refresh_token,
      expires_in: data.expires_in || 1800,
    });
  } catch (e) {
    return fail(e.message, 401);
  }
}

async function locations(request, env, url) {
  const zip = (url.searchParams.get('zip') || '').trim();
  if (!/^\d{5}$/.test(zip)) return fail('Enter a 5-digit ZIP code');
  const data = await krogerGet(env, '/v1/locations', {
    'filter.zipCode.near': zip,
    'filter.radiusInMiles': '15',
    'filter.limit': '15',
  });
  return json({
    stores: (data.data || []).map((l) => ({
      locationId: l.locationId,
      name: l.name,
      chain: l.chain,
      address: [l.address?.addressLine1, l.address?.city].filter(Boolean).join(', '),
    })),
  });
}

function pickImage(images) {
  const front = (images || []).find((i) => i.perspective === 'front') || (images || [])[0];
  const size = front?.sizes?.find((s) => s.size === 'thumbnail') || front?.sizes?.find((s) => s.size === 'small') || front?.sizes?.[0];
  return size?.url || null;
}

async function products(request, env, url) {
  const term = (url.searchParams.get('term') || '').trim();
  const locationId = url.searchParams.get('locationId') || '';
  if (!term) return fail('Missing search term');
  if (!locationId) return fail('Pick a store first');
  const limit = Math.min(10, Math.max(1, Number(url.searchParams.get('limit') || 5)));
  const data = await krogerGet(env, '/v1/products', {
    'filter.term': term.slice(0, 60),
    'filter.locationId': locationId,
    'filter.limit': String(limit),
  });
  return json({
    products: (data.data || []).map((p) => {
      const item = (p.items || [])[0] || {};
      return {
        productId: p.productId,
        upc: p.upc,
        description: p.description,
        brand: p.brand,
        size: item.size || '',
        price: item.price?.regular ?? null,
        promo: item.price?.promo || null,
        soldBy: item.soldBy || null,
        inStock: item.inventory?.stockLevel ? item.inventory.stockLevel !== 'TEMPORARILY_OUT_OF_STOCK' : null,
        image: pickImage(p.images),
        aisle: p.aisleLocations?.[0]?.description || null,
      };
    }),
  });
}

async function cart(request, env) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return fail('Sign in to King Soopers first', 401);
  const body = await request.json().catch(() => ({}));
  const items = (body.items || [])
    .filter((i) => i && i.upc && i.quantity > 0)
    .map((i) => ({
      upc: String(i.upc),
      quantity: Math.min(50, Math.round(i.quantity)),
      ...(i.modality ? { modality: i.modality } : {}),
    }));
  if (items.length === 0) return fail('No items to add');
  const res = await fetch(`${KROGER}/v1/cart/add`, {
    method: 'PUT',
    headers: { Authorization: auth, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (res.status === 401) return fail('Your King Soopers sign-in expired', 401);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return fail(`King Soopers didn't accept the cart (${res.status}). ${text.slice(0, 200)}`, res.status);
  }
  return json({ added: items.length });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (!env.KROGER_CLIENT_ID || !env.KROGER_CLIENT_SECRET) {
      return fail('Server is missing KROGER_CLIENT_ID or KROGER_CLIENT_SECRET. Add them in Cloudflare settings.', 500);
    }
    try {
      switch (`${request.method} ${url.pathname}`) {
        case 'GET /':
        case 'GET /health':
          return json({ ok: true, service: 'meal-planner-kroger', callback: `${url.origin}/callback` });
        case 'GET /login':
          return await login(request, env, url);
        case 'GET /callback':
          return await callback(request, env, url);
        case 'POST /refresh':
          return await refresh(request, env);
        case 'GET /locations':
          return await locations(request, env, url);
        case 'GET /products':
          return await products(request, env, url);
        case 'PUT /cart':
        case 'POST /cart':
          return await cart(request, env);
        default:
          return fail('Not found', 404);
      }
    } catch (e) {
      return fail(e.message || 'Something went wrong', 502);
    }
  },
};
