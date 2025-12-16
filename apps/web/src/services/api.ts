import keycloak from './keycloak';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const buildHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (keycloak.authenticated) {
    try {
      await keycloak.updateToken(30);
    } catch (err) {
      console.warn('No se pudo refrescar el token de Keycloak', err);
    }

    if (keycloak.token) {
      headers.Authorization = `Bearer ${keycloak.token}`;
    }
  }

  return headers;
};

export const apiPost = async <TResponse = unknown>(
  path: string,
  body: unknown
): Promise<TResponse> => {
  const headers = await buildHeaders();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Error ${response.status} al llamar ${path}`);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as TResponse) : (undefined as TResponse);
};

export { API_BASE_URL };

