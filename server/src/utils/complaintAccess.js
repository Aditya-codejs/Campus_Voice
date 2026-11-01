const idOf = (value) => (value && typeof value === 'object' ? value._id : value);

export const canAccessComplaint = (complaint, user) => {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (user.role === 'student') {
    return String(idOf(complaint.student)) === String(user._id);
  }

  if (user.role === 'staff') {
    if (complaint.category?.is_sensitive) {
      return String(idOf(complaint.assigned_to)) === String(user._id);
    }

    return (
      String(idOf(complaint.department)) === String(idOf(user.department)) ||
      String(idOf(complaint.assigned_to)) === String(user._id)
    );
  }

  return false;
};
