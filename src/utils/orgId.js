/** Normalize organization id from ObjectId, populated doc, or string */
export const normalizeOrgId = (value) => {
  if (!value) return null;
  if (typeof value === 'object' && value._id) return value._id;
  return value;
};
