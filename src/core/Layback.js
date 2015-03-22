;(function($, window) {
	"use strict";
	var _o = window.laybackTools.objectWrapper,
		_s = window.laybackTools.stringWrapper;

	/**
	 * Create class / create or get layback object / create or get layback class / get layback features
	 *
	 * @return {Layback.Class | Layback.Object | Layback.Factory}
	 */
	var Layback = function() {

		if (arguments[0]) {
			if ((typeof arguments[0]) == 'function') {
				return new Layback.Class(arguments[0]);	
			}
			if ((typeof arguments[0]) == 'object' && !arguments[1]) {
				return new Layback.Object(arguments[0]);
			}
			if ((typeof arguments[0]) == 'object' && arguments[1]) {
				return new Layback.Object(arguments[0], arguments[1]);
			}
		}

		if (arguments[0] && arguments[1]) {
			return new Layback.ClassCreator(arguments[0], arguments[1])
		}

		return Layback.Factory;
	}

	/**
	 * Layback class features
	 * 
	 * @param {Function} classObject
	 */
	Layback.Class = function(classObject) {
		var _classObject = classObject,
			_classHandler = null;

		var This = this;

		/**
		 * get the class handler object
		 * 
		 * @return {Layback.ClassHandler}
		 */
		function _getClassHandler() {
			if (!_classHandler) {
				_classHandler = new Layback.ClassHandler(This, _classObject);
			}
			return _classHandler;
		}
		
		/**
		 * @see Layback.Classhandler.make
		 * 
		 * @return {Layback.Class}
		 */
		this.make = function() {
			_getClassHandler().make()
			return this;
		};

		/**
		 * @see Layback.Classhandler.addTreat
		 * 
		 * @return {Layback.Class}
		 */
		this.use = function(treatName, treatData) {
			_getClassHandler().addTreat(treatName, treatData);
			return this;
		};

		/**
		 * @see Layback.Classhandler.setDefaults
		 * 
		 * @return {Layback.Class}
		 */
		this.defaults = function(data) {
			_getClassHandler().setDefaults(data);
			return this;
		};

		/**
		 * @see Layback.Classhandler.getDefaults
		 * 
		 * @return {Layback.Class}
		 */
		this.getDefaults = function(data) {
			return _getClassHandler().getDefaults(data);
		};

		/**
		 * @see Layback.Classhandler.addInitMethod
		 * 
		 * @return {Layback.Class}
		 */
		this.addInitMethod = function(initMethod){
			_getClassHandler().addInitMethod(initMethod);
			return this;
		};

		/**
		 * @see Layback.Classhandler.addMethod
		 * 
		 * @return {Layback.Class}
		 */
		this.addMethod = function(methodName, method, forced) {
			_getClassHandler().addMethod(methodName, method, forced)
			return this;
		};

		/**
		 * @see Layback.Classhandler.addClassMethod
		 * 
		 * @return {Layback.Class}
		 */
		this.addClassMethod = function(methodName, method, forced) {
			_getClassHandler().addClassMethod(methodName, method, forced)
			return this;
		};

		if (_classObject.__layback) {
			return _classObject.__layback.laybackObject;
		}

		_getClassHandler();
	}

	/**
	 * Add layback features to Function objects
	 * 
	 * @param {Layback.Class} laybackClassObj
	 * @param {Function} classObject
	 */
	Layback.ClassHandler = function(laybackClassObj, classObject) {
		var _laybackClassObj = laybackClassObj,
			_classObject = classObject;

		/**
		 * init some data on the Function which will be used by layback
		 */
		this.init = function() {
			var	This = this;

			if (_classObject.__layback) {
				return this;
			}

			_classObject.__layback = {
				laybackObject: _laybackClassObj,
				defaultData: {},
				treats: {},
				initMethods: {},
				appliedTreats: {},
				methods: {},
				classMethods: {}
			};

			Layback.Factory.systemTreats().each(function(treatName, treatData){
				This.addTreat(treatName, treatData);
			});
		};

		/**
		 * prepare the Function with layback method, and apply treats
		 */
		this.make = function() {
			var This = this;

			this.addClassMethod('layback', function(){
				return this.__layback.laybackObject;
			});

			this.addMethod('layback', function(options){
				if (!this.__layback) {
					return new Layback.Object(this, options);
				}
				return this.__layback.laybackObject;
			});

			_o(_classObject.__layback.treats).each(function(treatName, treatData){
				This.applyTreat(treatName, treatData);
			});
		}

		/**
		 * Add a method which will be called when calling this.layback()
		 * 
		 * @param {Function} initMethod
		 */
		this.addInitMethod = function(initMethod){
			_o(_classObject.__layback.initMethods).add(initMethod);
		};

		/**
		 * Add a treat to the Function
		 * 
		 * @param {String} treatName - registered name of the treat
		 * @param {String} treatData - additional treat data
		 */
		this.addTreat = function(treatName, treatData){
			_o(_classObject.__layback.treats).add(treatData, treatName);
		};

		/**
		 * apply the added treat on the Function
		 * 
		 * @param  {String} treatName
		 */
		this.applyTreat = function(treatName){
			var TreatClass = Layback.Treats.getTreat(treatName);
			var treatData = _classObject.__layback.treats[treatName];
			_classObject.__layback.appliedTreats[treatName] = new TreatClass(_classObject, treatData);
		};

		/**
		 * set default data (namespaces)
		 * 
		 * @param {Object} data
		 */
		this.setDefaults = function(data) {
			_classObject.__layback.defaultData = data;
		};

		/**
		 * get default data (namespaces)
		 * 
		 * @param {Object} data
		 */
		this.getDefaults = function() {
			return _classObject.__layback.defaultData;
		};

		/**
		 * add method the Function's prototype
		 * 
		 * @param {String} methodName
		 * @param {Function} method
		 * @param {Boolean} forced - if true it overwrites the existing method
		 */
		this.addMethod = function(methodName, method, forced) {
			forced = !!forced;
			if (!forced && (_classObject.prototype[methodName] || _classObject.__layback.methods[methodName])) {
				throw new Error('The method already exists! Try using some other name, or use the forced parameter!');
			}
			if (forced || !(_classObject.prototype[methodName] || _classObject.__layback.methods[methodName])) {
				_classObject.__layback.methods[methodName] = method;
				_classObject.prototype[methodName] = method;
			}
		};

		/**
		 * add method the Function
		 * 
		 * @param {String} methodName
		 * @param {Function} method
		 * @param {Boolean} forced - if true it overwrites the existing method
		 */
		this.addClassMethod = function(methodName, method, forced) {
			forced = !!forced;
			if (!forced && (_classObject[methodName] || _classObject.__layback.classMethods[methodName])) {
				throw new Error('The method already exists! Try using some other name, or use the forced parameter!');
			}
			if (forced || !(_classObject[methodName] || _classObject.__layback.classMethods[methodName])) {
				_classObject.__layback.classMethods[methodName] = method;
				_classObject[methodName] = method;
			}
		};

		if (!_classObject.__layback) {
			this.init();
		}
	}

	/**
	 * Creates a Function and applies layback on it
	 * 
	 * @param {String} methodName
	 * @param {Function} method
	 * @return {Layback.Class}
	 */
	Layback.ClassCreator = function(methodName, method) {
		window[methodName] = method;
		return new Layback.Class(window[methodName]);
	}

	/**
	 * Layback features on the object
	 * 
	 * @param {Object}
	 * @param {Object} - user provided data
	 */
	Layback.Object = function(obj, options){
		this.r = Math.random();
		var _obj = obj,
			_options = options || {},
			_objectHandler = null;
		
		var This = this;

		/**
		 * get the object handler
		 * 
		 * @return {Layback.ObjectHandler}
		 */
		function _getObjectHandler() {
			if (!_objectHandler) {
				_objectHandler = new Layback.ObjectHandler(This, _obj, _options);
			}
			return _objectHandler;
		}
		
		/**
		 * @see Layback.Objecthandler.setOptions
		 * 
		 * @param {Layback.Object}
		 */
		this.setOptions = function(options){
			_getObjectHandler().setOptions(options);
			return this;
		};

		/**
		 * @see Layback.Objecthandler.getOptions
		 * 
		 * @param {Layback.Object}
		 */
		this.getOptions = function(){
			return _getObjectHandler().getOptions();
		};

		/**
		 * @see Layback.Objecthandler.addNs
		 * 
		 * @param {Layback.Object}
		 */
		this.addNs = function(key, data, pattern) {
			_getObjectHandler().addNs(key, data, pattern);
			return this;
		};

		/**
		 * @see Layback.Objecthandler.addNs
		 * 
		 * @param {Layback.Object}
		 */
		this.getNs = function(key) {
			return _getObjectHandler().getNs(key);
		};

		if (_obj.__layback) {
			return _obj.__layback.laybackObject;
		}
		_getObjectHandler();
	}

	/**
	 * layback features can be used on an object
	 * 
	 * @param {Layback.Object} laybackObjectObj
	 * @param {Object} obj
	 * @param {Object} options
	 */
	Layback.ObjectHandler = function(laybackObjectObj, obj, options){
		var _laybackObjectObj = laybackObjectObj,
			_obj = obj,
			_options = options || {};

		/**
		 * init data on the object
		 */
		this.init = function() {
			_obj.__layback = {
				id: 0,
				laybackObject: _laybackObjectObj
			};

			Layback.Factory.objectPool().addObject(_obj);

			_o(_obj.constructor.__layback.initMethods).each(function(i, initMethod){
				initMethod(_obj);
			});
		}
		
		/**
		 * set user defined data
		 * 
		 * @param {Object} options
		 */
		this.setOptions = function(options){
			_options = options;
		};

		/**
		 * get user defined data
		 * 
		 * @return {Object}
		 */
		this.getOptions = function(){
			return _options;
		};

		/**
		 * add namespace, create the data fallback
		 * 
		 * @param {String} key
		 * @param {Object} data - additional data to overwirite any existing data within the ns
		 * @param {RegExp | String} - If the key matches this than the data is copied to the new ns with the name of the 2nd match, You can use wildcard * here.
		 */
		this.addNs = function(key, data, pattern) {
			data = data || {};
			var defaults = _obj.constructor.__layback.defaultData[key] || {};
			
			var keyInObj = 'layback' + key.charAt(0).toUpperCase() + key.slice(1);
			_obj[keyInObj] = _obj[keyInObj] || {};
			
			var argData = {};

			if (_obj.laybackData && pattern) {

				var regExp = (pattern instanceof RegExp)
					&& pattern
					|| new RegExp(pattern.replace('*', '(.*)'));

				_o(_obj.laybackData).each(function(name, element) {
					var matches = name.match(regExp);
					if (matches) {
						argData[matches[1].substring(0, 1).toLowerCase() + matches[1].substring(1)] = element;
					}
				});
			}

			_obj[keyInObj] = $.extend(
				true,
				{},
				defaults,
				_obj[keyInObj],
				argData,
				data
			);
		};

		/**
		 * get namespace data
		 * 
		 * @param {String} key
		 * @return {Object}
		 */
		this.getNs = function(key) {
			var keyInObj = 'layback' + key.charAt(0).toUpperCase() + key.slice(1);
			_obj[keyInObj] = _obj[keyInObj] || {};
			return _obj[keyInObj];
		};

		if (!_obj.__layback) {
			this.init();
		}
	}
	
	/**
	 * container for the treats
	 * 
	 * @param {String} pool - user / system
	 */
	Layback.Treats = function(pool) {
		return Layback.Treats._pool[pool];
	};

	$.extend(Layback.Treats, {
		_pool: {
			'system': _o({}),
			'user': _o({}),
		},

		/**
		 * get treats
		 * 
		 * @return {Object}
		 */
		getTreats: function () {
			return $.extend({}, this._pool['system'].obj(), this._pool['user'].obj())
		},

		/**
		 * get a treat by its name
		 * 
		 * @param  {String} treatName
		 * @return {Function}
		 */
		getTreat: function(treatName) {
			return this._pool['user'].get(treatName) || this._pool['system'].get(treatName);
		},
	});

	/**
	 * Holds all the laybackized objects
	 * 
	 * @type {Object}
	 */
	Layback.ObjectPool = {
		_pool: _o({}),

		/**
		 * get all laybackized objects
		 * 
		 * @return {ObjectWrapper}
		 */
		getObjects: function(){
			return this._pool;
		},

		/**
		 * get laybackized objects as Object
		 * 
		 * @return {Object}
		 */
		data: function() {
			return this._pool.obj();
		},

		/**
		 * Add object to the pool / give unique id to it
		 * 
		 * @param {Object} obj
		 */
		addObject: function(obj) {
			this._pool.add(obj);
			obj.__layback.id = this._pool.size(); 
		},

		/**
		 * remove object from the pool
		 * 
		 * @param {Object} obj
		 * @return {Layback.ObjectPool}
		 */
		removeObject: function(obj) {
			if (!obj.__layback.id) {
				throw new Error('Object has No ID');
			} else {
				this._pool.del(obj.__layback.id);
			}
			return this;
		}
	}

	Layback.Factory = {
		_systemTreats: new Layback.Treats('system'),
		_userTreats: new Layback.Treats('user'),
		tools: function() {
			return window.laybackTools;
		},
		systemTreats: function() {
			return this._systemTreats;
		},
		treats: function () {
			return this._userTreats;
		},
		objectPool: function () {
			return Layback.ObjectPool;
		}
	}
	
	var layback = function() {
		function _layback(args) {
			return Layback.apply(this, args);
		}
		_layback.prototype = Layback.prototype;

		return new _layback(Array.prototype.slice.call(arguments));
	};

	window.layback = layback;

})(jQuery, window);