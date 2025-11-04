(function () {
  const API_BASE_URL = "http://localhost:8080";
  const AUTH_TOKEN_KEY = "satellite:authToken";
  const originalFetch = window.fetch.bind(window);

  const getAuthToken = () => {
    try {
      return window.localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (_) {
      return null;
    }
  };

  const normalizeToken = (value) => {
    if (!value || typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const bearerMatch = trimmed.match(/^bearer\s+(.+)$/i);
    return bearerMatch ? bearerMatch[1] : trimmed;
  };

  const formatAuthHeader = (token) => {
    if (!token) return null;
    const trimmed = token.trim();
    return trimmed.toLowerCase().startsWith("bearer ")
      ? trimmed
      : `Bearer ${trimmed}`;
  };

  const setAuthToken = (value) => {
    const normalized = normalizeToken(value);
    if (!normalized) return;
    try {
      window.localStorage.setItem(AUTH_TOKEN_KEY, normalized);
    } catch (_) {
      /* ignore storage errors */
    }
  };

  const clearAuthToken = () => {
    try {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (_) {
      /* ignore storage errors */
    }
  };

  const captureAuthFromResponse = async (response) => {
    if (!response || typeof response.headers?.get !== "function") return null;

    const header = response.headers.get("Authorization");
    if (header) {
      setAuthToken(header);
      return formatAuthHeader(header);
    }

    try {
      const clone = response.clone();
      const rawBody = await clone.text();
      if (!rawBody) return null;

      let candidate = null;

      try {
        const parsed = JSON.parse(rawBody);
        if (parsed && typeof parsed === "object") {
          candidate =
            parsed.token ||
            parsed.accessToken ||
            parsed.refreshToken ||
            parsed.jwt ||
            parsed.Authorization ||
            parsed.authorization;
        } else if (typeof parsed === "string") {
          candidate = parsed;
        }
      } catch (_) {
        const trimmed = rawBody.trim();
        if (trimmed && trimmed !== "null" && trimmed !== "undefined") {
          candidate = trimmed;
        }
      }

      if (typeof candidate === "string" && candidate) {
        setAuthToken(candidate);
        return formatAuthHeader(candidate);
      }
    } catch (_) {
      /* ignore body parsing errors */
    }

    return null;
  };

  const shouldAttachAuth = (input) => {
    let targetUrl = null;

    if (typeof input === "string") {
      targetUrl = input;
    } else if (input && typeof input.url === "string") {
      targetUrl = input.url;
    }

    if (!targetUrl) return false;

    if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://")) {
      return targetUrl.startsWith(API_BASE_URL);
    }

    if (targetUrl.startsWith("//")) return false;

    try {
      const absolute = new URL(targetUrl, window.location.href);
      return absolute.origin === API_BASE_URL;
    } catch (_) {
      return false;
    }
  };

  window.fetch = (input, init) => {
    const finalInit = { ...(init || {}) };

    if (shouldAttachAuth(input)) {
      if (finalInit.credentials === undefined) {
        finalInit.credentials = "include";
      }

      const token = formatAuthHeader(getAuthToken());
      if (token) {
        const headers = new Headers(finalInit.headers || {});
        if (!headers.has("Authorization")) {
          headers.set("Authorization", token);
        }
        finalInit.headers = headers;
      }
    }

    return originalFetch(input, finalInit);
  };

  window.auth = {
    API_BASE_URL,
    getAuthToken,
    setAuthToken,
    clearAuthToken,
    normalizeToken,
    formatAuthHeader,
    captureAuthFromResponse,
  };
})();
