import api from './api';

export const resolveFileUrl = (fileUrl) => {
  if (!fileUrl) return '';

  const apiOrigin = new URL(api.defaults.baseURL, window.location.origin).origin;
  return new URL(fileUrl, apiOrigin).toString();
};
