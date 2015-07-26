restle
======

Restle is a lightweight *(and unstable)* [JSON API](http://jsonapi.org) engine compatible with [Ember Data](http://emberjs.com/api/data/). This is alpha software and not recommended for use in
production code.

Not all features in the JSON API specification are implemented yet: fields, voluntary inclusion, and some other small things.

Getting started
====

```
$ npm install restle --save
```

```js
// API: http://localhost:1337/api/
const restle = new Restle({
  port: 1337,
  database: 'mongodb://...',
  namespace: '/api',
});

const userSchema = {
  name: { attr: 'string' },
  articles: { hasMany: 'article' },
  company: { belongsTo: 'company' },
};

const articleSchema = {
  title: { attr: 'string' },
  body: { attr: 'string' },
};

const companySchema = {
  name: { attr: 'string' },
  employees: { hasMany: 'user' },
};

restle.register('user', userSchema);
restle.register('article', articleSchema);
restle.register('company', companySchema);

restle.on('ready', () => {
  console.log('Restle is ready!');
});
```

```js
// request
GET /users HTTP/1.1
Accept: application/vnd.api+json

// response
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "data": [{
    "type": "user",
    "id": "1",
    "attributes": {
      "name": "Bob"
    },
    "links": {
      "self": "http://localhost:1337/api/articles/1"
    },
    "relationships": {
      "company": {
        "links": {
          "self": "http://localhost:1337/api/articles/1/relationships/company",
          "related": "http://localhost:1337/api/articles/1/company"
        },
        "data": { "type": "company", "id": "9" }
      },
      "articles": {
        "links": {
          "self": "http://localhost:1337/api/users/1/relationships/articles",
          "related": "http://localhost:1337/api/users/1/articles"
        },
        "data": [
          { "type": "article", "id": "5" },
          { "type": "article", "id": "12" }
        ]
      }
    }
  }],
  "included": [{
    "type": "company",
    "id": "9",
    "attributes": {
      "name:" "Apple"
    },
    "links": {
      "self": "http://localhost:1337/api/companies/9"
    }
  }, {
    "type": "article",
    "id": "5",
    "attributes": {
      "title": "Awesome title",
      "body": "Awesome text"
    },
    "links": {
      "self": "http://localhost:1337/api/articles/5"
    }
  }, {
    "type": "article",
    "id": "12",
    "attributes": {
      "title": "Another title",
      "body": "Another text"
    },
    "links": {
      "self": "http://localhost:1337/api/articles/12"
    }
  }]
}

```
