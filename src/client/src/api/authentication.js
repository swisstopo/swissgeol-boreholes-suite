export function getBasicAuthHeaderValue(username, password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${username}:${password}`);
  const base64String = btoa(String.fromCharCode.apply(null, data));
  return `Basic ${base64String}`;
}
