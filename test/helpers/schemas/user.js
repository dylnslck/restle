module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true,
    },

    email: {
      type: 'string',
      required: true,
      unique: true,
    },

    password: {
      type: 'string',
      transforms: {
        in() { /* ... */ },
        out() { /* ... */ },
      },
      required: true,
    },

    age: {
      type: 'number',
    },

    'is-alive': {
      type: 'boolean',
      default: true,
    },

    picture: {
      type: 'buffer',
    },

    'last-updated': {
      type: 'date',
      trigger: Date.now,
    },

    birthday: {
      type: 'date',

      transforms: {
        in() { /* ... */ },
        out() { /* ... */ },
      },
    },
  },

  relationships: {
    blogs: { type: 'blog', multiplicity: 'many' },
    comments: { type: 'comment', multiplicity: 'many' },
  },
};
