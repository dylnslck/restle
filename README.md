Restle
======

[![Join the chat at https://gitter.im/dcslack/restle](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dcslack/restle?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/dcslack/restle.svg)](https://travis-ci.org/dcslack/restle)
[![npm version](https://badge.fury.io/js/restle.svg)](http://badge.fury.io/js/restle)

Restle is a lightweight *(and unstable)* [JSON API](http://jsonapi.org) engine compatible with [Ember Data](http://emberjs.com/api/data/). This library wraps Express and Mongoose. This is alpha software and not recommended for use in
production code.

Not all features in the JSON API specification are implemented yet: fields, voluntary inclusion, and some other small things.
I'm trying to match the test suite as close as possible with the JSON API spec. Reach out on GitHub for feature requests and
any bugs you encounter, thanks!

Getting started
====

```sh
$ npm install restle --save
```

```js
// API: http://localhost:1337/api/
import Restle from 'restle';

const restle = new Restle({
  port: 1337,
  database: 'mongodb://...',
  namespace: '/api',
  cors: ['http://localhost:4200', 'https://example.com']
});

// define schemas
const userSchema = {
  name: { attr: 'string' },
  birthday: { attr: 'date' },
  isMarried: { attr: 'boolean' },
  articles: { hasMany: 'article' },
  company: { belongsTo: 'company' },
};

const articleSchema = {
  title: { attr: 'string' },
  body: { attr: 'string' },
  createdOn: { attr: 'date' },
};

const companySchema = {
  name: { attr: 'string' },
  employees: { hasMany: 'user' },
};

// register schemas
restle.register('user', userSchema);
restle.register('article', articleSchema);
restle.register('company', companySchema);

// check out some events
restle.on('ready', () => {
  console.log('Database has connected!');
});

// verify the user with a JSON Web Token
// all events except ready have express `req`, `res`, and `next` arguments
import jwt from 'jsonwebtoken';

restle.on('before', (req, res, next) => {
  console.log('Intercept all requests to your API.');
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

// add a company to a user if there isn't one
restle.on('user.create', (req, res, next) => {
  console.log('Fires before creating a user.');

  // Mongoose object
  const company = restle.model('company');

  if (!req.body.data.relationships.company) {
    company.find({}, (err, companies) => {
      if (err) {
        return res.sendStatus(500);
      }

      req.body.data.relationships.company = {
        type: 'company',
        id: companies[0]._id;
      };

      next();
    });  
  }
});
```

Complete list of events for the user model:
* user.find
* user.create
* user.findOne
* user.update
* user.delete
* user.findRelationship
* user.appendRelationship
* user.updateRelationship
* user.deleteRelationship

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
