import api from './api';

export const downloadComplaintCsv = async () => {
  const response = await api.get('/admin/export-csv', { responseType: 'blob' });
  const objectUrl = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `campusvoice-complaints-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};
