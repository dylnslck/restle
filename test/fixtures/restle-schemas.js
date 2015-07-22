export default {
  person: {
    name: { attr: 'string' },
    pets: { hasMany: 'animal' },
  },

  animal: {
    species: { attr: 'string' },
    bones: { hasMany: 'bone' },
    owner: { belongsTo: 'person' },
  },

  bone: {
    isDinosaurBone: { attr: 'boolean' },
    body: { belongsTo: 'animal' },
  },
};
