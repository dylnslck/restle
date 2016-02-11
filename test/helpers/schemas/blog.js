module.exports = {
  attributes: {
    title: { type: 'string', required: true },
    content: { type: 'string', required: true },
    'last-edited': { type: 'date' },
    'created-on': { type: 'date', default: Date.now },
  },
  relationships: {
    author: { type: 'user', multiplicity: 'one' },
    comments: { type: 'comment', multiplicity: 'many' },
  },
};
