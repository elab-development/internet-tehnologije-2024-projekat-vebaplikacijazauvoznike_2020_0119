import { API_BASE_URL } from '../config';

const getAuthToken = () => localStorage.getItem('token');

const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  // Do not set Content-Type for FormData
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  } else {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });

  if (options.method === 'DELETE' && response.status === 204) {
      return true; // No content to parse
  }

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(responseData.message || 'An API error occurred');
  }

  return responseData;
};

const buildQuery = (params) => {
    const cleanedParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== '')
    );
    return new URLSearchParams(cleanedParams).toString();
}

export const search = (type, params) => {
  const queryString = buildQuery(params);
  return fetchWithAuth(`${API_BASE_URL}/${type}?${queryString}`);
};

export const getProducts = (params = {}) => {
  const query = buildQuery(params);
  return fetchWithAuth(`${API_BASE_URL}/products${query ? `?${query}` : ''}`);
};

export const getProduct = (id) => {
  return fetchWithAuth(`${API_BASE_URL}/products/${id}`);
};

export const createProduct = (formData) => {
  return fetchWithAuth(`${API_BASE_URL}/products`, {
    method: 'POST',
    body: formData,
  });
};

export const updateProduct = (id, formData) => {
  formData.append('_method', 'PUT');
  return fetchWithAuth(`${API_BASE_URL}/products/${id}`, {
    method: 'POST',
    body: formData,
  });
};

export const getSuppliers = (params = {}) => {
  const query = buildQuery(params);
  return fetchWithAuth(`${API_BASE_URL}/suppliers${query ? `?${query}` : ''}`);
};

export const getImporters = (params = {}) => {
    const query = buildQuery(params);
    return fetchWithAuth(`${API_BASE_URL}/importers${query ? `?${query}` : ''}`);
};

export const addItemToContainer = (productId, quantity) => {
  return fetchWithAuth(`${API_BASE_URL}/item-logs`, {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity }),
  });
};

export const getCurrentContainer = () => {
  return fetchWithAuth(`${API_BASE_URL}/containers/current`);
};

export const getContainerHistory = (params = {}) => {
    const query = buildQuery(params);
    return fetchWithAuth(`${API_BASE_URL}/containers${query ? `?${query}` : ''}`);
};

export const shipContainer = (containerId) => {
  return fetchWithAuth(`${API_BASE_URL}/containers/${containerId}/ship`, { method: 'POST' });
};

export const acceptShipment = (containerId) => {
  return fetchWithAuth(`${API_BASE_URL}/containers/${containerId}/accept`, { method: 'POST' });
};

export const getPartnerships = () => {
  return fetchWithAuth(`${API_BASE_URL}/partnerships`);
};

export const getPendingItems = () => {
  return fetchWithAuth(`${API_BASE_URL}/item-logs/pending`);
};

export const confirmShipment = (itemLogId) => {
  return fetchWithAuth(`${API_BASE_URL}/item-logs/${itemLogId}/confirm`, { method: 'POST' });
};

export const getShipmentHistory = () => {
  return fetchWithAuth(`${API_BASE_URL}/history/shipments`);
};

export const deleteProduct = (productId) => {
  return fetchWithAuth(`${API_BASE_URL}/products/${productId}`, { method: 'DELETE' });
};

export const getSupplier = (id) => {
  return fetchWithAuth(`${API_BASE_URL}/suppliers/${id}`);
};

export const updateSupplier = (id, formData) => {
  formData.append('_method', 'PUT');
  return fetchWithAuth(`${API_BASE_URL}/suppliers/${id}`, {
    method: 'POST',
    body: formData,
  });
};

export const deleteSupplier = (supplierId) => {
  return fetchWithAuth(`${API_BASE_URL}/suppliers/${supplierId}`, { method: 'DELETE' });
};

export const getImporter = (id) => {
  return fetchWithAuth(`${API_BASE_URL}/importers/${id}`);
};

export const updateImporter = (id, formData) => {
  formData.append('_method', 'PUT');
  return fetchWithAuth(`${API_BASE_URL}/importers/${id}`, {
    method: 'POST',
    body: formData,
  });
};

export const deleteImporter = (importerId) => {
  return fetchWithAuth(`${API_BASE_URL}/importers/${importerId}`, { method: 'DELETE' });
};

export const getAnalyticsSummary = () => {
  return fetchWithAuth(`${API_BASE_URL}/analytics/summary`);
};

export const deleteItemLog = (itemLogId) => {
  return fetchWithAuth(`${API_BASE_URL}/item-logs/${itemLogId}`, { method: 'DELETE' });
};

export const deleteProfile = () => {
    return fetchWithAuth(`${API_BASE_URL}/profile`, { method: 'DELETE' });
};

export const deleteContainer = (containerId) => {
  return fetchWithAuth(`${API_BASE_URL}/containers/${containerId}`, { method: 'DELETE' });
};

export const getShipments = (page = 1) => {
  return fetchWithAuth(`${API_BASE_URL}/shipments?page=${page}`);
};