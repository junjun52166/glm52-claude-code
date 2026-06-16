import { createSign } from "node:crypto";

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

function toBase64Url(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function getServiceAccountCredentials(): ServiceAccountCredentials {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON.");
  }

  const parsed = JSON.parse(raw) as Partial<ServiceAccountCredentials>;

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON.");
  }

  return {
    client_email: parsed.client_email,
    private_key: parsed.private_key,
  };
}

function createJwt(scope: string) {
  const credentials = getServiceAccountCredentials();
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: credentials.client_email,
    scope,
    aud: TOKEN_ENDPOINT,
    exp: now + 3600,
    iat: now,
  };

  const unsignedToken = `${toBase64Url(JSON.stringify(header))}.${toBase64Url(
    JSON.stringify(payload),
  )}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();

  const signature = signer
    .sign(credentials.private_key, "base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${unsignedToken}.${signature}`;
}

export async function getGoogleAccessToken(scope: string) {
  const assertion = createJwt(scope);

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Could not fetch Google access token: ${body}`);
  }

  const data = (await response.json()) as { access_token?: string };

  if (!data.access_token) {
    throw new Error("Google token response did not include access_token.");
  }

  return data.access_token;
}
