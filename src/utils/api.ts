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
      const errorMsg =
        parsedData?.error ||
        parsedData?.message ||
        `Request failed with status ${response.status}`;
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
    const message =
      netErr instanceof Error
        ? netErr.message
        : 'Network connection failed. Unable to reach server terminal.';
    return {
      ok: false,
      status: 0,
      error: message,
    };
  }
}
