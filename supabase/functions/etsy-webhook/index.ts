import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const encoder = new TextEncoder();

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function verifyEtsyWebhook(
  request: Request,
  rawBody: string
) {
  const secret = Deno.env.get('ETSY_WEBHOOK_SECRET');
  if (!secret) return false;

  const webhookId = request.headers.get('webhook-id');
  const timestamp = request.headers.get('webhook-timestamp');
  const signatureHeader = request.headers.get('webhook-signature');

  if (!webhookId || !timestamp || !signatureHeader) return false;

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber)) return false;

  // Reject old/replayed webhook deliveries.
  if (Math.abs(Date.now() / 1000 - timestampNumber) > 300) {
    return false;
  }

  const secretBytes = base64ToBytes(
    secret.replace(/^whsec_/, '')
  );

  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signedContent = `${webhookId}.${timestamp}.${rawBody}`;
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signedContent)
  );

  const expected = btoa(
    String.fromCharCode(...new Uint8Array(signature))
  );

  // Etsy may send more than one signature version.
  return signatureHeader
    .split(' ')
    .some(value => value.split(',').pop() === expected);
}

Deno.serve(async request => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const rawBody = await request.text();

  if (!(await verifyEtsyWebhook(request, rawBody))) {
    return new Response('Invalid webhook signature', { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  if (payload.event_type !== 'order.paid') {
    return Response.json({ received: true, ignored: true });
  }

  const apiKey = Deno.env.get('ETSY_API_KEY');
  const oauthToken = Deno.env.get('ETSY_OAUTH_TOKEN');
  const resourceUrl = payload.resource_url;

  if (!apiKey || !oauthToken || !resourceUrl) {
    return new Response('Etsy integration is not configured', {
      status: 503
    });
  }

  const receiptResponse = await fetch(resourceUrl, {
    headers: {
      'x-api-key': apiKey,
      Authorization: `Bearer ${oauthToken}`
    }
  });

  if (!receiptResponse.ok) {
    return new Response('Unable to read Etsy receipt', {
      status: 502
    });
  }

  const receipt = await receiptResponse.json();
  const buyerEmail = receipt.buyer_email || receipt.payment_email || null;
  const transactions = receipt.transactions || [];

  for (const transaction of transactions) {
    await supabase.from('purchases').upsert(
      {
        product_name: transaction.title || 'Etsy digital product',
        description: transaction.description || '',
        download_url: null,
        source: 'etsy',
        external_order_id: String(receipt.receipt_id),
        external_product_id: String(transaction.listing_id || ''),
        buyer_email: buyerEmail,
        verified: receipt.status === 'paid' || receipt.status === 'completed'
      },
      {
        onConflict: 'source,external_order_id'
      }
    );
  }

  return Response.json({
    received: true,
    order: receipt.receipt_id,
    products: transactions.length
  });
});
