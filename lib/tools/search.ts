export async function toolSearch(query: string): Promise<string> {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'agentic-app' } });
  if (!res.ok) return `Search failed (${res.status})`;
  const data = await res.json();
  const related: string[] = Array.isArray(data.RelatedTopics)
    ? data.RelatedTopics.slice(0, 5).map((t: any) => (t.Text || t.Result || '').toString())
    : [];
  const abstract = [data.Heading, data.AbstractText].filter(Boolean).join(' \u2014 ');
  const lines = [] as string[];
  if (abstract) lines.push(abstract);
  if (related.length) lines.push('', 'Related:', ...related.map((r) => `- ${r}`));
  return lines.join('\n');
}
