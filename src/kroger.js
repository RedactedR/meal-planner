import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { catalogItem } from './data/ingredients';

// Talks to your King Soopers connection server (server/kroger-worker.js),
// which talks to Kroger. King Soopers is a Kroger store, so it uses
// Kroger's official API.

export const KING_SOOPERS_CART_URL = 'https://www.kingsoopers.com/cart';

function base(serverUrl) {
  return (serverUrl || '').trim().replace(/\/+$/, '');
}

async function call(serverUrl, path, options = {}) {
  if (!base(serverUrl)) throw new Error('Add your connection server address in Settings first.');
  let res;
  try {
    res = await fetch(`${base(serverUrl)}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
  } catch {
    throw new Error("Couldn't reach your connection server. Check the address in Settings.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Server error (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function checkServer(serverUrl) {
  return call(serverUrl, '/health');
}

// Opens King Soopers sign-in. Resolves to tokens, or null if cancelled.
export async function signIn(serverUrl) {
  const returnUrl = Linking.createURL('kroger-auth');
  const loginUrl = `${base(serverUrl)}/login?return=${encodeURIComponent(returnUrl)}`;
  const result = await WebBrowser.openAuthSessionAsync(loginUrl, returnUrl);
  if (result.type !== 'success' || !result.url) return null;
  const fragment = result.url.split('#')[1] || '';
  const params = Object.fromEntries(
    fragment.split('&').filter(Boolean).map((p) => p.split('=').map((s) => decodeURIComponent(s.replace(/\+/g, ' '))))
  );
  if (params.error) throw new Error(params.error);
  if (!params.access_token) throw new Error('Sign-in did not finish. Please try again.');
  return toTokens(params);
}

function toTokens(data) {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
    expiresAt: Date.now() + Number(data.expires_in || 1800) * 1000,
  };
}

// Returns a valid access token, refreshing it if it's about to expire.
// onTokens is called with new tokens so the app can save them.
export async function freshToken(serverUrl, tokens, onTokens) {
  if (!tokens?.accessToken) throw new Error('Sign in to King Soopers in Settings first.');
  if (tokens.expiresAt > Date.now() + 60_000) return tokens.accessToken;
  if (!tokens.refreshToken) throw new Error('Your King Soopers sign-in expired. Sign in again in Settings.');
  try {
    const data = await call(serverUrl, '/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: tokens.refreshToken }),
    });
    const next = toTokens(data);
    onTokens(next);
    return next.accessToken;
  } catch {
    onTokens(null);
    throw new Error('Your King Soopers sign-in expired. Sign in again in Settings.');
  }
}

export async function findStores(serverUrl, zip) {
  const data = await call(serverUrl, `/locations?zip=${encodeURIComponent(zip)}`);
  return data.stores || [];
}

export async function searchProducts(serverUrl, locationId, term, limit = 5) {
  const q = new URLSearchParams({ term, locationId, limit: String(limit) }).toString();
  const data = await call(serverUrl, `/products?${q}`);
  return data.products || [];
}

export async function addToCart(serverUrl, accessToken, items, modality) {
  return call(serverUrl, '/cart', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ items: items.map((i) => ({ upc: i.upc, quantity: i.quantity, modality })) }),
  });
}

export function priceOf(product) {
  if (!product) return null;
  return product.promo && product.promo > 0 ? product.promo : product.price;
}

// Turns an ingredient name into a better store search, e.g.
// "Naan or flatbread" -> "naan", "Kosher salt" -> "kosher salt".
export function searchTerm(name) {
  return name
    .toLowerCase()
    .split(/\bor\b|,|\(/)[0]
    .replace(/\b(fresh|large|medium|small|chopped|diced|minced|sliced|grated)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// How many of a product to add for a shopping-list item.
// Items counted by the piece (3 limes, 2 bell peppers) use the count,
// packs are rounded up (2 eggs -> 1 dozen), and everything else starts
// at 1 package. The user can adjust before adding.
export function suggestedQuantity(item) {
  if (item.unpriced) return 1;
  if (item.unit === '' || item.unit === 'can') {
    // Things sold in packs (a dozen eggs, a bag of tortillas) count packs.
    const pack = catalogItem(item.name)?.pack || 1;
    return Math.max(1, Math.ceil(item.qty / pack - 0.01));
  }
  return 1;
}
