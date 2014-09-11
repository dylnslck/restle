// what an example of using restle should look like

var express = require('express'),
		app = express(),
		restle = require('restle')(app);

/**
 * Configure restle instance.
 *
 * Response options:
 *	`basic, ember, json`
 *
 * Adapter options:
 * 	`mongo, redis, relational`
 *	-- maybe have nosql and sql options instead?
 */

restle.configure({
	version: 1,
	response: 'ember',
	adapter: 'mongo'
});

/**
 * Register a model;
 *
 * Exposes:
 *	`GET http://www.example.com/api/v1/posts`
 *	`GET http://www.example.com/api/v1/posts/:post_id`
 *	`POST http://www.example.com/api/v1/posts`
 *	`PUT http://www.example.com/api/v1/posts/:post_id`
 *	`DELETE http://www.example.com/api/v1/posts/:post_id`
 *
 * TODO: search queries, authentication for certain models?
 *
 */

restle.register('post', {
	title: String,
	content: String,
	date: Date,
	account: restle.belongsTo('account'),
	comments: restle.hasMany('comment')
});

restle.find('post').then(function(err, posts) {
	if(err) throw err;

	// else do something with posts
});