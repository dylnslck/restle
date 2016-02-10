module.exports = {
  attributes: {
    'text': { type: 'string', required },
    'last-edited': { type: 'date' },
    'created-on': { type: 'date', default: Date.now },
  },
  relationships: {
    'author': { type: 'user', multiplicity: 'one' },
    'blog': { type: 'blog', multiplicity: 'one' },
    'comment': { type: 'comment', multiplicity: 'one' },
    'replies': { type: 'comment', multiplicity: 'many' },
  },
};
