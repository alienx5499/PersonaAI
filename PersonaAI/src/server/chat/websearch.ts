export type SearchSnippet = {
  title: string;
  url: string;
  snippet: string;
};

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  opts?: { signal?: AbortSignal },
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let abortListener: (() => void) | null = null;

  if (opts?.signal) {
    if (opts.signal.aborted) controller.abort();
    abortListener = () => controller.abort();
    opts.signal.addEventListener('abort', abortListener, { once: true });
  }

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeout);
    if (abortListener)
      opts?.signal?.removeEventListener('abort', abortListener);
  }
}

export async function fetchWebSearchSnippets(
  query: string,
  opts?: { timeoutMs?: number; maxSnippets?: number; signal?: AbortSignal },
): Promise<SearchSnippet[]> {
  const timeoutMs = opts?.timeoutMs ?? 3500;
  const maxSnippets = opts?.maxSnippets ?? 3;

  if (!query.trim()) return [];

  try {
    const url = new URL('https://api.duckduckgo.com/');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('no_html', '1');
    url.searchParams.set('skip_disambig', '1');

    const response = await fetchWithTimeout(url.toString(), timeoutMs, {
      signal: opts?.signal,
    });
    if (!response.ok) return [];

    const data = (await response.json()) as {
      AbstractText?: string;
      AbstractURL?: string;
      Heading?: string;
      RelatedTopics?: Array<{ Text?: string; FirstURL?: string }>;
    };

    const snippets: SearchSnippet[] = [];
    if (data.AbstractText) {
      snippets.push({
        title: data.Heading ?? 'DuckDuckGo summary',
        url: data.AbstractURL ?? '',
        snippet: data.AbstractText,
      });
    }

    for (const topic of data.RelatedTopics ?? []) {
      if (!topic.Text || !topic.FirstURL) continue;
      snippets.push({
        title: 'Related topic',
        url: topic.FirstURL,
        snippet: topic.Text,
      });
      if (snippets.length >= maxSnippets) break;
    }

    return snippets.slice(0, maxSnippets);
  } catch {
    return [];
  }
}
