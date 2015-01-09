restle
======

Restle is an incredibly lightweight *(and unstable)* RESTful API engine.

Restle currently supports properly sideloading data for [Ember-Data](http://emberjs.com/api/data/).
This framework is currently a side-project of mine, but I plan on extensively developing
and testing it eventually, maybe. As of now, the framework should not be used for any serious applications. However, 
Restle has a near-zero learning curve, making it great for rapidly prototyping APIs.

Getting started.
====

```
npm install restle --save
npm install express --save
npm install mongoose --save
```

```javascript
var mongoose = require('mongoose');
var express = require('express');
var app = express();

// Initialize Restle with modelsRootPath,
// i.e. the path where your models are defined.
var restle = require('restle')(app, {
  modelsRootPath: __dirname + '/models'
});

// Connect to the database.
var url = 'mongodb://....';
mongoose.connect(url, options);

// Listen on some port.
app.listen(3000);
```

Restle expects models to be defined via proper folders:

```
/models/post/schema.js
/models/comment/schema.js
/models/user/schema.js
```

A schema is a simple exported object:

```javascript
// /models/post/schema.js
module.exports.v1 = {
  title: String,
  comments: [{
    ref: 'Comment'
  }]
};
```

**Note** The above `v1` is used to denote that this model is 'version one.' Multiple
verions currently **do not** work. Versioning will work eventually, but for now, you
must specify `v1` when exporting the schema.

Schemas are identical to Mongoose Schemas except there is no need to specify
`type: Schema.Types.ObjectId` when a `ref: Model` syntax is found. The directory
structure above automatically routes:

```
GET     /api/v1/posts
GET     /api/v1/posts/:post_id
POST    /api/v1/posts
PUT     /api/v1/posts/:post_id
DELETE  /api/v1/posts/:post_id

...
```

You cannot configure the API namespace yet, the default is `/api/v1/`. I built this to work with Ember Data, so as of now, in order to `POST` or `PUT` something,
you must use the following syntax:

```
POST /api/v1/comments

{
  "comment": {
    "text": "I don't like you.",
    "post": 164,
    "user": 1451
  }
}

PUT /api/v1/comments/213

{
  "comment": {
    "text": "Just kidding!"
  }
}
```

My goals are to incorporate authentication, tasks, query overloading, and a lot more.