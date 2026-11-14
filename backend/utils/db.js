const mongoose = require('mongoose');

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

function isValidId(id) {
  return typeof id === 'string' && OBJECT_ID_PATTERN.test(id);
}

// Converts a lean MongoDB document into the API shape: `_id` -> `id`,
// ObjectId references -> strings, `__v` removed.
function serialize(doc) {
  if (!doc) return doc;
  if (Array.isArray(doc)) return doc.map(serialize);

  const out = {};
  for (const [key, value] of Object.entries(doc)) {
    if (key === '__v') continue;
    if (key === '_id') out.id = String(value);
    else if (value instanceof mongoose.Types.ObjectId) out[key] = String(value);
    else out[key] = value;
  }
  return out;
}

function parsePagination(query = {}, defaultLimit = 5) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

async function paginate(Model, filter, sort, query, defaultLimit = 5) {
  const { page, limit, skip } = parsePagination(query, defaultLimit);
  const [docs, total] = await Promise.all([
    Model.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Model.countDocuments(filter)
  ]);
  return {
    data: serialize(docs),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1
  };
}

module.exports = { isValidId, serialize, parsePagination, paginate };
