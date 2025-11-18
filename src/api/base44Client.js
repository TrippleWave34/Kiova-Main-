// src/api/base44Client.js

const BASE44_BASE_URL = "https://app.base44.com/api/apps/690018f6927e32d11b8ea50f";
const API_KEY = "29b99eb0844d4b07850397b0c757e7ce";

export async function base44Fetch(endpoint, options = {}) {
  const response = await fetch(`${BASE44_BASE_URL}/${endpoint}`, {
    ...options,
    headers: {
      "api_key": API_KEY,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();
  return data;
}
