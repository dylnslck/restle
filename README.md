Restle
======

[![Join the chat at https://gitter.im/dcslack/restle](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dcslack/restle?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/dcslack/restle.svg)](https://travis-ci.org/dcslack/restle)
[![npm version](https://badge.fury.io/js/restle.svg)](http://badge.fury.io/js/restle)

Restle is a powerful database-agnostic [JSON API](http://jsonapi.org) engine and ORM that exposes data via RESTful routes. Restle manages your data objects and the relationships between them while being backed by a persistence layer of your choice. Restle ships with an in-memory adapter and finely tuned before/after data events.

Restle is compatible with [Ember Data](http://emberjs.com/api/data/) right out of the box.

This software is still very new and buggy, please report bugs on GitHub.

Getting started
====

```sh
$ npm install restle --save
$ npm install restle-mongodb --save
```

```js
const Restle = require('restle');
const port = process.env.PORT || 5000;
const namespace = 'api';

// lets use the in-memory adapter for development
const Adapter = require('restle-mongodb');
const adapter = process.env.NODE_ENV === 'production'
  ? new Adapter({ url: 'mongodb://...' });
  : null;

// API: http://localhost:1337/api/
const app = new Restle({ port, adapter, namespace });

// define schemas
const userSchema = {
  attributes: {
    name: { type: 'string' },
    birthday: { type: 'date' },
    isMarried: { type: 'boolean' },  
  },
  relationships: {
    articles: { type: 'article', isMany: true },
    company: { type: 'company', isMany: false },
  },
};

const articleSchema = {
  attributes: {
    title: { type: 'string' },
    body: { type: 'string' },
    createdOn: { type: 'date' },  
  },
};

const companySchema = {
  attributes: {
    name: { type: 'string' },
  },
  relationships: {
    employees: { type: 'user', isMany: true }
  },
};

// register schemas
app.register({
  user: userSchema,
  article: articleSchema,
  company: companySchema,
});

// check out some events
app.on('ready', () => console.log(`App is running on ${app.port}!`);

// verify the user with a JSON Web Token
// all events except ready have express `req`, `res`, and `next` arguments
const jwt = require('jsonwebtoken');

app.before(function(req, res, next) {
  const token = req.get('authorization');
  const secret = new Buffer(process.env.SECRET_KEY, 'base64');

  jwt.verify(token, secret, (err, decoded) => {
    // life ain't so good
    if (err) {
      return res.status(403).json({
        isVerified: false,
        error: err
      });
    }

    // life is good
    next();
  });
});

// hash a users password before creating
const bcrypt = require('bcrypt');

app.before('user.create', function(req, res, next) {
  const numRounds = 10;
  const password = req.body.data.attributes.password;

  bcrypt.hash(password, numRounds, (err, hash) => {
    if (err) {
      return res.status(500).json(err);
    }

    req.body.data.attributes.password = hash;
    return next();
  });
});
```
```js
// Complete list of events for the user model:
app.before('user.find', function(req, res, next) { ... })
app.after('user.find', function(users, req, res, next) { ... })

app.before('user.create', function(req, res, next) { ... })
app.after('user.create', function(user, req, res, next) { ... })

app.before('user.update', function(req, res, next) { ... })
app.after('user.update', function(user, req, res, next) { ... })
```

```js
// request
GET /api/users HTTP/1.1
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
      "self": "http://localhost:1337/api/users/1"
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
