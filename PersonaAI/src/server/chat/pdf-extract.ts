import { PDFParse } from 'pdf-parse';

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  opts?: { signal?: AbortSignal },
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error('PDF_EXTRACT_TIMEOUT')),
      timeoutMs,
    );
  });

  const signalPromise = new Promise<T>((_, reject) => {
    if (!opts?.signal) return;
    if (opts.signal.aborted) {
      const err = new Error('Request aborted');
      err.name = 'AbortError';
      reject(err);
      return;
    }

    const onAbort = () => {
      const err = new Error('Request aborted');
      err.name = 'AbortError';
      reject(err);
    };

    opts.signal.addEventListener('abort', onAbort, { once: true });
  });

  try {
    return await Promise.race([promise, timeoutPromise, signalPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function extractPdfTextFromDataUrl(opts: {
  fileName: string;
  dataUrl: string;
  maxChars?: number;
  signal?: AbortSignal;
}): Promise<{ fileName: string; text: string } | null> {
  const maxChars = opts.maxChars ?? 6000;
  if (opts.signal?.aborted) {
    const err = new Error('Request aborted');
    err.name = 'AbortError';
    throw err;
  }
  if (!opts.dataUrl.includes(',')) return null;
  const [, base64] = opts.dataUrl.split(',', 2);
  if (!base64) return null;

  try {
    const buffer = Buffer.from(base64, 'base64');
    const parser = new PDFParse({ data: buffer, verbosity: 0 });
    const parsed = await withTimeout(parser.getText(), 12_000, {
      signal: opts.signal,
    });
    await parser.destroy().catch(() => {});
    const text = (parsed.text ?? '').replace(/\s+/g, ' ').trim();
    if (!text) return null;

    return {
      fileName: opts.fileName,
      text: text.slice(0, maxChars),
    };
  } catch {
    return null;
  }
}

export async function extractPdfPageImagesFromDataUrl(opts: {
  fileName: string;
  dataUrl: string;
  maxPages?: number;
  scale?: number;
  desiredWidth?: number;
  signal?: AbortSignal;
}): Promise<Array<{ fileName: string; pageNumber: number; dataUrl: string }>> {
  const maxPages = opts.maxPages ?? 2;
  const scale = opts.scale ?? 1;
  const desiredWidth = opts.desiredWidth ?? 900;
  if (opts.signal?.aborted) {
    const err = new Error('Request aborted');
    err.name = 'AbortError';
    throw err;
  }

  if (!opts.dataUrl.includes(',')) return [];
  const [, base64] = opts.dataUrl.split(',', 2);
  if (!base64) return [];

  try {
    const buffer = Buffer.from(base64, 'base64');
    const parser = new PDFParse({ data: buffer, verbosity: 0 });
    const screenshotResult = await withTimeout(
      parser.getScreenshot({
        first: maxPages,
        scale,
        desiredWidth,
        imageDataUrl: true,
        imageBuffer: false,
      }),
      15_000,
      { signal: opts.signal },
    );
    await parser.destroy().catch(() => {});

    return screenshotResult.pages.slice(0, maxPages).map((page) => ({
      fileName: opts.fileName,
      pageNumber: page.pageNumber,
      dataUrl: page.dataUrl,
    }));
  } catch {
    return [];
  }
}
