/**
 * Safe API communication utility that handles Content-Type checking,
 * non-JSON responses (HTML error pages, text, 404s, 500s), and network errors gracefully.
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

/**
 * Safely extracts a readable string error message from any error value
 * (Error instances, plain objects, strings, nested API response objects, or Axios-like errors).
 * Prevents raw "[object Object]" strings from leaking to the UI.
 */
export function formatErrorMessage(err: unknown, fallback = 'An unexpected error occurred.'): string {
  if (err === null || err === undefined) return fallback;

  if (typeof err === 'string') {
    const trimmed = err.trim();
    if (!trimmed || trimmed === '[object Object]' || trimmed.includes('[object Object]')) {
      return fallback;
    }
    return trimmed;
  }

  if (err instanceof Error) {
    const msg = err.message?.trim();
    if (msg && msg !== '[object Object]' && !msg.includes('[object Object]')) {
      return msg;
    }
  }

  if (typeof err === 'object') {
    const obj = err as Record<string, any>;

    // Check common nested error fields recursively or via candidates
    const candidates = [
      obj.error?.message,
      obj.error?.error,
      obj.error?.detail,
      obj.error?.description,
      typeof obj.error === 'string' ? obj.error : undefined,
      obj.response?.data?.error?.message,
      obj.response?.data?.error,
      obj.response?.data?.message,
      obj.data?.error?.message,
      obj.data?.error,
      obj.data?.message,
      obj.message,
      obj.msg,
      obj.statusText,
      obj.detail,
    ];

    for (const cand of candidates) {
      if (typeof cand === 'string' && cand.trim().length > 0 && !cand.includes('[object Object]')) {
        return cand.trim();
      }
      if (typeof cand === 'object' && cand !== null) {
        const nested = formatErrorMessage(cand, '');
        if (nested && nested !== fallback) {
          return nested;
        }
      }
    }

    // Try JSON serialization if candidate not found
    try {
      const jsonStr = JSON.stringify(err);
      if (jsonStr && jsonStr !== '{}' && jsonStr !== '[]' && jsonStr.length < 300) {
        return jsonStr;
      }
    } catch {
      // Fallback below
    }
  }

  return fallback;
}

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options?.headers || {}),
      },
    });

    const contentType = response.headers.get('content-type') || '';
    let parsedData: any = null;

    if (contentType.includes('application/json')) {
      try {
        parsedData = await response.json();
      } catch {
        return {
          ok: false,
          status: response.status,
          error: `Failed to parse JSON response from ${url}`,
        };
      }
    } else {
      // Non-JSON response (e.g. HTML error page or plain text)
      const rawText = await response.text();
      
      // Try to see if it's actually JSON with missing Content-Type header
      try {
        parsedData = JSON.parse(rawText);
      } catch {
        // It's not JSON
        if (!response.ok) {
          const cleanText = rawText.replace(/<[^>]*>?/gm, '').trim();
          const shortError = cleanText.length > 0 && cleanText.length < 150 
            ? cleanText 
            : `Server returned HTTP ${response.status} (${response.statusText || 'Error'})`;
          
          return {
            ok: false,
            status: response.status,
            error: shortError,
          };
        }

        return {
          ok: false,
          status: response.status,
          error: 'Received non-JSON response from server endpoint.',
        };
      }
    }

    if (!response.ok) {
      const errorMsg = formatErrorMessage(
        parsedData,
        `Request failed with status ${response.status}`
      );
      return {
        ok: false,
        status: response.status,
        data: parsedData,
        error: errorMsg,
      };
    }

    return {
      ok: true,
      status: response.status,
      data: parsedData,
    };
  } catch (netErr: unknown) {
    const message = formatErrorMessage(
      netErr,
      'Network connection failed. Unable to reach server terminal.'
    );
    return {
      ok: false,
      status: 0,
      error: message,
    };
  }
}
