export default {
  person: {
    attributes: {
      'name': { type: 'string', },
      'email': { type: 'string', },
      'age': { type: 'number', },
    },
    relationships: {
      'pets': { type: 'animal', isMany: true },
      'company': { type: 'company', isMany: false },
    },
    filters: {
      'older-than': { attribute: 'age', operator: '>' },
      'younger-than': { attribute: 'age', operator: '<' },
    },
  },

  animal: {
    attributes: {
      species: { type: 'string' },
      age: { type: 'number' },
    },
    relationships: {
      owner: { type: 'person', isMany: false },
      habitats: { type: 'habitat', isMany: true },
    },
  },

  company: {
    attributes: {
      name: { type: 'string' },
      industry: { type: 'string' },
    },
    relationships: {
      employees: { type: 'person', isMany: true },
      office: { type: 'building', isMany: false },
    },
  },

  habitat: {
    attributes: {
      name: { type: 'string' },
    },
    relationships: {
      countries: { type: 'country', isMany: true },
    },
  },

  building: {
    attributes: {
      size: { type: 'number' },
    },
    relationships: {
      location: { type: 'country', isMany: false },
    },
  },

  country: {
    attributes: {
      name: { type: 'name' },
    },
  },
};
