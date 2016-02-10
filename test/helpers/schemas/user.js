module.exports = {
  attributes: {
    'name': {
      type: 'string',
      required,
    },

    'email': {
      type: 'string',
      required,
      unique,
    },

    'password': {
      type: 'string',
      transforms: {
        in() { /*...*/ },
        out() { /*...*/ },
      },
      required,
    }

    'age': {
      type: 'number',
    },

    'is-alive': {
      type: 'boolean',
      default: true,
    },

    'picture': {
      type: 'buffer',
    },

    'last-updated': {
      type: 'date',
      trigger: Date.now,
    }

    'birthday': {
      type: 'date',

      transforms: {
        in() { /*...*/ },
        out() { /*...*/ },
      },
    },
  },

  relationships: {
    'blogs': { type: 'blog', multiplicity: 'many' },
    'comments': { type: 'comment', multiplicity: 'many' },
  },
};
