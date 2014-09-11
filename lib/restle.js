/*!
 * Module dependencies.
 */

var express = require('express'),
		fs = require('fs'),
		_ = require('lodash'),
		Model = require('./model'),
		Response = require('./response');

/*!
 * Available adapters.
 */

var adapters = [
	'mongo',
	'mysql'
];

/**
 * Restle constructor.
 *
 * Restle exports an instance of this class.
 *
 * @app {app} express application
 * @api public
 */

function Restle(app) {
	this.adapters = [];
}

/*!
 * Define instance methods
 */

Restle.prototype = {

	/**
	 * Restle `configure`.
	 *
	 * @options {object} options hash
	 * @api public
	 */

	configure = function(options) {
		this.adapter = options.adapter;
		this.version = options.version;
		this.namespace = options.namespace;
	};

	/**
	 * Register a model.
	 *
	 * If a valid directory is given, `Restle.register`
	 * will traverse a directory and register all valid models.
	 *
	 * If a valid directory is not given, `Restle.register`
	 * will register a single model.
	 *
	 * @model {string|object} directory name or model object.
	 * @api public
	 */

	register = function(model) {

	};

};

/*!
 * Expose Restle object.
 *
 * @api public
 */

var restle = module.exports = exports = new Restle;