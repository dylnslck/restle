restle
======

Restle is a lightweight *(and unstable)* [JSON API](http://jsonapi.org) compatible with [Ember Data](http://emberjs.com/api/data/). This is alpha software and not recommended for use in
production code.

Getting started
====


```
$ npm install restle --save
```

```javascript
// API: http://localhost:1337/api/
const restle = new Restle({
  port: 1337,
  database: 'mongodb://...',
  namespace: '/api',
});

const userSchema: {
  species: { attr: 'string' },
  bones: { hasMany: 'bone' },
  owner: { belongsTo: 'person' },
};

restle.register('user', userSchema);

restle.on('ready', () => {
  console.log('Restle is ready!');
});
```
