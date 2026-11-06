// Turns the body of a PATCH request into a MongoDB update.
// A field sent as null means "remove it": it is deleted from the document ($unset), not stored as null.
//   { name: 'Ann', photo: null }  ->  { $set: { name: 'Ann' }, $unset: { photo: 1 } }
export function toUpdateOps(data) {
  const changes = {};
  const removals = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === null) removals[key] = 1;
    else changes[key] = value;
  }
  const update = {};
  if (Object.keys(changes).length) update.$set = changes;
  if (Object.keys(removals).length) update.$unset = removals;
  return update;
}
