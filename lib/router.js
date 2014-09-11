/*!
 * Module dependencies.
 */

var express = require('express'),
		fs = require('fs'),
		inflect = require('i')(),
		_ = require('lodash');

function Router() {
	
	/*!
	 * Instantiate express router.
	 */

	var router = express.Router();	
	this.router = router;
}

/*!
 * Define methods
 */

Router.prototype = {

	/**
	 * Creates RESTful routes, `create, read, update, delete.`
	 *
	 * @api private
	 */

	createRoute: function(modelName) {
		var router = this.router;


	};

	/**
	 * Handles `get` routes.
	 *
	 * @api internal
	 */

	_get: function(modelName, router) {
		var plural = inflect.pluralize(modelName),
				single = inflect.singularize(modelName),
				
				// i.e. /posts
				many = '/' + plural,

				// i.e. /posts/:post_id
				one = many + '/:' + single + '_id'; 

		/*!
		 * Find many
		 */

		router.route.get(many, function(req, res) {
			var query = req.query;

		});		

		/*!
		 * Find one
		 */

		router.route.get(one, function(req, res) {
			var query = req.query;

		});

	}

};