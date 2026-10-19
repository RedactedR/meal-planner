# Connect Meal Planner to King Soopers

This sets up the connection that lets the app show live King Soopers prices and add your grocery list straight to your King Soopers cart. King Soopers is part of Kroger, so it uses Kroger's official developer API.

It takes about 15 minutes, once. Everything here is free.

## Why there's a small server

Kroger gives every app a **client secret**, a password the app must send when you sign in or search products. A secret can't be stored inside the app, because anyone could dig it out (and this code is public on GitHub). So a tiny server holds the secret and talks to Kroger for the app. You'll run it on Cloudflare's free plan; it stores nothing about you.

You'll do three things:

1. Create the server on Cloudflare (so you know its web address)
2. Register the app with Kroger (using that address)
3. Give the server your Kroger keys

---

## Step 1: Create the server on Cloudflare

1. Go to **[dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)** and create a free account.
2. In the left menu, open **Workers & Pages**, then click **Create** → **Create Worker** (pick the "Hello World" starter if asked).
3. Name it `meal-planner-kroger` and click **Deploy**.
4. Click **Edit code**. Delete everything in the editor.
5. Open **[kroger-worker.js](https://raw.githubusercontent.com/RedactedR/meal-planner/main/server/kroger-worker.js)**, select all the text, copy it, and paste it into the Cloudflare editor.
6. Click **Deploy**.
7. Copy your server's address from the top of the page. It looks like:
   `https://meal-planner-kroger.YOUR-NAME.workers.dev`

Keep this address handy for the next two steps.

## Step 2: Register the app with Kroger

1. Go to **[developer.kroger.com](https://developer.kroger.com)** and create a free developer account (this is separate from your King Soopers shopping account).
2. Go to **Manage → Apps** and click **Create App** / **Register App**.
3. Fill it in:
   - **Name:** Meal Planner
   - **Environment:** Production. (The "certification" environment only works with test accounts, not your real King Soopers account.)
   - **APIs / scopes:** turn on **Products**, **Cart** and **Identity** (Profile). These match the scopes `product.compact`, `cart.basic:write` and `profile.compact`.
   - **Redirect URI:** your server address from Step 1 followed by `/callback`, for example
     `https://meal-planner-kroger.YOUR-NAME.workers.dev/callback`
4. Save the app, then copy its **Client ID** and **Client Secret**.

Kroger's site changes from time to time, so button names may differ slightly. The important parts are the Production environment, the three scopes, and the exact redirect address.

## Step 3: Give the server your Kroger keys

1. Back in Cloudflare, open your `meal-planner-kroger` worker.
2. Go to **Settings → Variables and Secrets** and click **Add**.
3. Add two **Secrets** (choose type "Secret", not plain text):
   - `KROGER_CLIENT_ID` = your Client ID
   - `KROGER_CLIENT_SECRET` = your Client Secret
4. Click **Deploy** (or **Save and deploy**).
5. Check it: open `https://meal-planner-kroger.YOUR-NAME.workers.dev/health` in your browser. You should see `"ok":true`.

## Step 4: Connect the app

Use the app in **Expo Go on your phone** for this. Sign-in needs to jump back into the app, which the browser preview can't do.

1. Open **Settings** in the app. At the top is a **King Soopers** card.
2. Paste your server address and tap **Save**.
3. Tap **Sign in to King Soopers** and sign in with your normal King Soopers shopping account. Approve access.
4. Enter your ZIP code, tap **Find**, and tap your store.
5. Choose **Pickup** or **Delivery**.

Now plan your week, go to **Groceries**, and tap **Add items to King Soopers cart**. The app matches each item to a real product at your store with live prices; you can change products and quantities, then add everything to your cart in one tap. Finish checking out on the King Soopers site or app.

---

## Sharing with friends

Friends can use the same server. They paste your server address into their app and sign in with **their own** King Soopers account, so items go to their own cart.

## Privacy

- Your King Soopers sign-in token is saved only on your phone.
- The server doesn't store anything. It passes requests to Kroger and returns the answers.
- Anyone who has your server address could use it to search products (not to touch anyone's cart), so only share it with people you trust.

## Troubleshooting

| What you see | What to do |
| --- | --- |
| `/health` says the server is missing keys | Check both secret names are spelled exactly `KROGER_CLIENT_ID` and `KROGER_CLIENT_SECRET`, then deploy again. |
| Kroger says the redirect URI doesn't match | The redirect URI in your Kroger app must be your server address plus `/callback`, exactly, with `https://`. |
| `invalid_client` or "Kroger sign-in failed (401)" | The Client ID or Secret has a typo. Copy them again from developer.kroger.com. |
| Sign-in opens but never returns to the app | Use Expo Go on your phone rather than the browser preview. |
| "Your King Soopers sign-in expired" | Tap **Sign in to King Soopers** again in Settings. |
| A product shows "No match at your store" | Your store may not carry it. Untick it, or try a different product from "Other options". |
