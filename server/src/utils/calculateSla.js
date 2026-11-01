/**
 * Calculates due date based on priority SLA:
 * - Critical: 24 hours
 * - High: 3 days (72 hours)
 * - Medium: 7 days (168 hours)
 * - Low: 14 days (336 hours)
 */
export const calculateSlaDueDate = (priority = 'medium') => {
  const now = new Date();
  const dueDate = new Date(now);

  switch (priority.toLowerCase()) {
    case 'critical':
      dueDate.setHours(dueDate.getHours() + 24);
      break;
    case 'high':
      dueDate.setDate(dueDate.getDate() + 3);
      break;
    case 'low':
      dueDate.setDate(dueDate.getDate() + 14);
      break;
    case 'medium':
    default:
      dueDate.setDate(dueDate.getDate() + 7);
      break;
  }

  return dueDate;
};

