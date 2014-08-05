/*!
 * Module dependencies.
 */

var express = require('express'),
		fs = require('fs'),
		_ = require('lodash');

/*!
 * Restle objects.
 */



/*!
 * Instantiate express router.
 */

var router = express.Router();

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
};

/**
 * Restle `configure`.
 *
 * @options {object} options hash
 * @api public
 */

Restle.prototype.configure = function(options) {
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
 * @directory {string} name of a directory
 * @model {Restle.Model} instance of a Restle model
 * @api public
 */

Restle.prototype.register = function(directory, model) {

};

/*!
 * Expose Restle object.
 *
 * @api public
 */

var restle = module.exports = exports = new Restle;