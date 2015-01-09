/**
 * Module dependencies.
 */

var inflect = require('i')();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');
var fs = require('fs');
var util = require('util');
var express = require('express');
var bodyParser = require('body-parser')

// TODO: determine way to register tasks
// TODO: determine way to override query params
// TODO: method for registering single model
// TODO: authenticationType property per model

/**
 * The Restle class.
 *
 * @class api
 * @constructor
 */

function Restle(app, options) {
  this._init(app, options);
}

Restle.prototype = {

	/**
	 * Default options for Restle.
	 */

	_defaults: {
		modelsRootPath: __dirname + '/models',
		verbose: false
	},

  /**
   * Initialization.
   *
   * @param {Object} app
   * @method _init
   */

  _init: function(app, options) {

    this.options = options;

    // Initialize express router object.
    this.router = express.Router();
 		
    // Initialize internal models hash.
 		this._models = {};

 		// Register models in the models root path folder.
	  this.registerModels();
 		
 		// Create all routes.
    this.route();
    
    app.use(bodyParser.json());
    app.use('/api', this.router);
  },

  /**
   * Registers models based on their paths.
   *
   * @method registerModels
   */

  registerModels: function() {
    var self = this;

    if(this.options.verbose) {
      console.log('Registering models.');
    }

    var modelsRootPath = this.options.modelsRootPath;
    var name, schemas, schema;

    // synchronous directory traversal is vital
    fs.readdirSync(modelsRootPath).forEach(function(model) {

      // only consider directories
      if(!fs.lstatSync(modelsRootPath + '/' + model).isDirectory())
        return;

      // capitalizes the model name
      name = inflect.titleize(model);

      // pull in schema
      schemas = require(modelsRootPath + '/' + model + '/schema');

      for(var version in schemas) {
        schema = schemas[version];

        // TODO: versioning currently breaks the system
        // because it overwrites a mongoose model multiple times
        // process schema
        self.parseSchema(schema, function(schema) {
          // register model
          self.registerModel({
            version: version,
            name: name,
            schema: schema
          });
        });
      }
    });
  },

  /**
   * Parses a Restle schema and returns a valid
   * Mongoose schema.
   *
   * TODO: put into separate file (i.e.
   * model.js or schema.js)
   *
   * Example:
   *  module.exports.v1 = {
   *    text: String,
   *    user: {
   *      ref: 'User'
   *    }
   *  };
   *
   * @param {Object} schema
   * @method parseSchema
   */

   parseSchema: function(schema, callback) {

    _.forIn(schema, function(value, attribute) {

      // TODO: Sloppy code.
      if(_.isArray(value) && _.has(value[0], 'ref')) {
        schema[attribute][0].type = Schema.Types.ObjectId;
      } else {
        if(_.has(value, 'ref'))
          schema[attribute].type = Schema.Types.ObjectId;
      }
      
    });

    callback(schema);
   },

  /**
   * Registers a single model with Restle.
   *
   * @param {Object} options
   * @method registerModel
   */

  // TODO: Better error handling for invalid name, etc.
  registerModel: function(options) {
    
    if(!options.name) {
      throw new Error('A model must have a valid name.');
    }

    if(!options.version) {
      throw new Error('A model must have a valid version.');
    }

    if(!options.schema) {
      throw new Error('A model must have a valid schema.');
    }

    this._models[options.name] = {
      version: options.version,
      model: mongoose.model(
        options.name, 
        Schema(options.schema)
      )
    };
  },

  /**
   * Returns a Mongoose Model object.
   *
   * @param {String} modelName
   * @method model
   */

  model: function(name) {
    // Normalize name param before indexing.
    name = inflect.titleize(name.toLowerCase());
  	return this._models[name].model;
  },


  /**  
   * Routes models.
   *
   * @method route
   */

  route: function() {
    var models = this._models,
        model;

    if(!_.keys(models).length)
      return;

    var pluralUrl,
        singularUrl,
        version;

    var router = this.router,
        self = this;

    for(var name in models) {
      // route required methods
      model = models[name];
      version = model.version;
        
      // TODO: add versioning support
      // build a plural url,
      // i.e. /api/v1/objects
      pluralUrl = util.format('/v%d/%s', 
        1, 
        inflect.pluralize(name.toLowerCase())
      );

      // TODO: better/cleaner formatting structure
      // build a singular url,
      // i.e. /api/v1/objects/:object_id
      singularUrl = util.format('/v%d/%s/:%s_id', 
        1, 
        inflect.pluralize(name.toLowerCase()),
        name.toLowerCase()
      );

      if(this.options.verbose) {
        console.log('GET ' + pluralUrl);
        console.log('POST ' + pluralUrl);
        console.log('GET ' + singularUrl);
        console.log('PUT ' + singularUrl);
        console.log('DELETE ' + singularUrl);
      }

      // route plural urls
      (function(model, pluralUrl) {
        
        router.route(pluralUrl)
        
          .get(function(req, res) {
            self.find(req, res, model);
          })

          .post(function(req, res) {
            self.create(req, res, model);
          })

          .put(function(req, res) {
            res.send(404);
          })

          .delete(function(req, res) {
            res.send(404);
          }); 

      })(model, pluralUrl);

      // route singular urls
      (function(model, singularUrl) {
        
        router.route(singularUrl)
        
          .get(function(req, res) {
            self.findOne(req, res, model);
          })

          .post(function(req, res) {
            res.send(404);
          })

          .put(function(req, res) {
            self.update(req, res, model);
          })

          .delete(function(req, res) {
            self.remove(req, res, model);
          });

      })(model, singularUrl);

      // route extra methods
    }
  },

  /**
   * Processes `GET` routes for many models.
   * Also handles pagination and sorting.
   *
   * @param {Object} req 
   * @param {Object} res
   * @param {Object} model
   * @method find
   */

  find: function(req, res, model) {
    var router = this.router,
        Model = model.model,
        self = this;

    var query = req.query,
        population = self.modelPopulate(Model),
        pagination = {};
    
    // build pagination object
    // i.e. /api/v1/objects?offset=100&limit=20
    if(query.offset) {
      pagination.skip = query.offset;
      delete query.offset;
    }

    if(query.limit) {
      pagination.limit = query.limit;
      delete query.limit;
    }

    // TODO: sorting, querying, tasks
    Model.count(query, function(err, count) {
      if(err) throw err;

      Model.find(query, {}, pagination).sort().populate(population).exec(function(err, results) { 

        res.json(self.sideloadResponse(
          inflect.pluralize(Model.modelName.toLowerCase()), 
          true, 
          population, 
          results,
          count
        ));
      });   
    }); 
  },

  /**
   * Processes `GET` routes for a single
   * model.
   *
   * @param {Object} req
   * @param {Object} res
   * @param {Object} model
   * @method fineOne
   */

  findOne: function(req, res, model) {
    var router = this.router,
        Model = model.model,
        self = this;

    var params = req.params,
        query = req.query,
        population = self.modelPopulate(Model);
    
    // TODO: clean code
    query._id = params[Model.modelName.toLowerCase() + '_id'];

    Model.findOne(query).populate(population).exec(function(err, result) {
      if(err) return res.json(err);

      res.json(self.sideloadResponse(
        Model.modelName.toLowerCase(), 
        false, 
        population, 
        result
      )); 
    });          
  },

  /**
   * Processes `POST` routes.
   *
   * @param {Object} req
   * @param {Object} res
   * @param {Object} model
   * @method create
   */

  create: function(req, res, model) {
    var router = this.router,
        // TODO: model.model is weird
        Model = model.model,
        self = this;

    var body = req.body,
        population = self.modelPopulate(Model);

    body = body[Model.modelName.toLowerCase()];

    Model.create(body, function(err, result) {
      if(err)
        return res.json(err); 
      
      Model.findOne(result).populate(population).exec(function(err, result) {
        if(err)
          return res.json(err);
        
        res.json(self.sideloadResponse(
          Model.modelName.toLowerCase(), 
          false, 
          population, 
          result
        ));
      });
    });
  },

  /**
   * Processes `PUT` routes.
   *
   * @param {Object} req
   * @param {Object} res
   * @param {Object} model
   * @method update
   */

  update: function(req, res, model) {
    var router = this.router,
        Model = model.model,
        self = this;
 
    var params = req.params,
        body = req.body,
        query = {},
        population = self.modelPopulate(Model);

    body = body[Model.modelName.toLowerCase()];
    query._id = params[Model.modelName.toLowerCase() + '_id'];

    Model.findOneAndUpdate(query, body).populate(population).exec(function(err, result) {
      if(err) return res.json(err);

      res.json(self.sideloadResponse(
        Model.modelName.toLowerCase(), 
        false, 
        population, 
        result
      ));
    });
  },

  /**
   * Processes `DELETE` routes.
   *
   * @param {Object} req
   * @param {Object} res
   * @param {Object} model
   * @method remove
   */

  remove: function(req, res, model) {
    var router = this.router,
        Model = model.model,
        self = this;

    var query = {};
    query._id = req.params[Model.modelName.toLowerCase() + '_id'];
    
    Model.findOneAndRemove(query, function(err, o){
      if(err) return res.json(err);

      res.sendStatus(204);
    });
  },

  /**
   * Properly side loads a response object
   * for Ember Data compatibility.
   *
   * @param {Object} router
   * @method sideloadResponse
   */

  sideloadResponse: function(name, isPlural, population, doc, count) {
    var docs = _.isArray(doc) ? doc : [doc],
        response = {},
        models;

    // initialize root
    if(isPlural){
      response[name] = [];
    }else{
      response[name] = {};
    }

    // load models
    if(population){
      models = population.split(' ');
      models.forEach(function(model) {
        response[inflect.pluralize(model)] = [];
      });
    }else{
      models = [];
    }

    // loop through doc, extract keys
    docs.forEach(function(doc) {
      var root = {};
      
      if(!doc) return;

      doc = doc.toObject();

      // extract models and root properties
      _.keys(doc).forEach(function(key) {
        
        // if key is a model, find the id and push it
        // to the root array, then push contents to
        // model array
        if(_.contains(models,key)){
          doc[key] = doc[key] || [];
          root[key] = root[key] || [];
          
          var id = doc[key]._id;

          // individual record
          if(typeof id !== 'undefined'){
            var pluralKey = inflect.pluralize(key);
            root[key] = id;

            if(!_.find(response[pluralKey], {id: id})){
              var content = doc[key];

              content.id = content._id;
              delete content._id;
              delete content.__v;

              response[pluralKey].push(content);
            }
          }else{
            // extract arrays and push to root
            var ids = _.map(doc[key], function(item) {
              return item._id;
            });

            // extract content to push to response keys
            var content = _.map(doc[key], function(item) {
              item.id = item._id;
              delete item._id;
              delete item.__v;

              return item;
            });

            // if ids is empty, don't add it,
            // delete it, else create root array
            if(_.isEmpty(ids)){
              delete root[key];
            }else{

              root[key] = ids;
              
              // append response key if the id is not found
              content.forEach(function(item) {
                if(!_.find(response[key], {id: item.id})){
                  response[key].push(item);
                }
              });
            }
          }
        }else{
          if(key == '_id') 
            root['id'] = doc[key]
          else if(key != '__v')
            root[key] = doc[key];
        }
      });

      if(isPlural) {
        response[name].push(root);
      } else {
        response[name] = root;
      }
    });

    if(arguments.length == 5) {
      response.meta = {
        total: count
      };
    }

    return response;
  },

  /**
   * Creates a Mongoose population string 
   * based on on the Model's schema paths.
   *
   * @param {Object} Model
   * @method modelPopulate
   * @return {String}
  */

  modelPopulate: function(Model) {
    var pop = '';

    Model.schema.eachPath(function(p) {
      var options = Model.schema.paths[p].options,
          type    = options.type;

      if(options.ref) {
        pop += pop ? ' ' + p : p;
      } else {
        if('object' === typeof type) {
          if(type[0].ref) {
            pop += pop ? ' ' + p : p;
          }
        }
      }
    });

    return pop;
  }
};
  
/**
 * Create instance of Restle.
 *
 * @param {Object} app
 */

function create(app, options) {
  return new Restle(app, options);
}

// expose create method
exports = module.exports = create;