restle
======

Restle is a lightweight *(and unstable)* [JSON API](http://jsonapi.org) compatible with [Ember Data](http://emberjs.com/api/data/). This is alpha software and not recommended for use in
production code.

Not all features in the JSON API specification are implemented yet: fields, voluntary inclusion, and some other small things.

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
  name: { attr: 'string' },
  articles: { hasMany: 'article' },
  company: { belongsTo: 'company' },
};

restle.register('user', userSchema);

restle.on('ready', () => {
  console.log('Restle is ready!');
});
```
