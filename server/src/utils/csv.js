export const escapeCsvCell = (value) => {
  let cell = String(value ?? '');
  if (/^[\t\r ]*[=+\-@]/.test(cell)) {
    cell = `'${cell}`;
  }
  return `"${cell.replace(/"/g, '""')}"`;
};
