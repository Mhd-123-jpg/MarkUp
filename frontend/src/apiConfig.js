export const getBackendBaseUrl = () => {
  const custom = localStorage.getItem('markup_backend_url');
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/$/, '');
  }
  // Check if running inside Capacitor Android native app or https://localhost
  if (typeof window !== 'undefined') {
    const origin = window.location.origin || '';
    const isCapacitorNative = window.Capacitor || origin.startsWith('https://localhost') || origin.startsWith('capacitor://');
    if (isCapacitorNative) {
      return 'http://192.168.137.202:8001';
    }
  }
  return '';
};

export const getApiUrl = (endpoint) => {
  const base = getBackendBaseUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return base ? `${base}${path}` : path;
};

export const safeFetchJson = async (url, options = {}) => {
  let res;
  try {
    res = await fetch(url, options);
  } catch (netErr) {
    throw new Error("Unable to connect to backend server. Please verify network connection or server IP in settings.");
  }

  const rawText = await res.text();
  const trimmed = rawText.trim();

  // Check if response is HTML (e.g. 404/500/SPA fallback page or incorrect server IP)
  if (trimmed.toLowerCase().startsWith('<!doctype') || trimmed.toLowerCase().startsWith('<html') || trimmed.toLowerCase().startsWith('<div')) {
    throw new Error(`Cannot reach backend endpoint (${res.status}). Please check backend URL in server settings.`);
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (parseErr) {
    throw new Error(`Invalid server response (${res.status}): ${trimmed.slice(0, 120)}`);
  }

  if (!res.ok) {
    const errorMsg = data?.detail || data?.message || `Server Error (${res.status})`;
    throw new Error(errorMsg);
  }

  return data;
};
