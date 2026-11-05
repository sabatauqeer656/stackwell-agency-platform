// Makes user-typed search text safe to use inside a MongoDB $regex (so "c++" is just text).
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
