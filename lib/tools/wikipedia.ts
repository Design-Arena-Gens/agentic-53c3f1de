export async function toolWikipedia(topic: string): Promise<string> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'agentic-app' } });
  if (!res.ok) return `Wikipedia lookup failed (${res.status})`;
  const data = await res.json();
  const title = data.title || topic;
  const extract = data.extract || 'No summary available.';
  const link = data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
  return `${title}\n\n${extract}\n\n${link}`;
}
