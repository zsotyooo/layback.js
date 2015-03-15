;(function($, window) {
	"use strict";
	var _o = window.laybackTools.objectWrapper,
		_s = window.laybackTools.stringWrapper;

	var Layback = function() {

		if (arguments[0] && !arguments[1]) {
			if ((typeof arguments[0]) == 'function') {
				return new Layback.Class(arguments[0]);	
			}
			if ((typeof arguments[0]) == 'object') {
				return new Layback.Object(arguments[0]);
			}
		}

		if (arguments[0] && arguments[1]) {
			return new Layback.ClassCreator(arguments[0], arguments[1])
		}

		return Layback.Factory;
	}

	Layback.Class = function(classObject) {
		var _classObject = classObject,
			_classHandler = null;

		var This = this;

		function _getClassHandler() {
			if (!_classHandler) {
				_classHandler = new Layback.ClassHandler(This, _classObject);
			}
			return _classHandler;
		}
		
		
		this.make = function() {
			_getClassHandler().make()
			return this;
		};
		this.use = function(treatName, treatData) {
			_getClassHandler().addTreat(treatName, treatData);
			return this;
		};
		this.defaults = function(data) {
			_getClassHandler().setDefaults(data);
			return this;
		};
		this.addInitMethod = function(initMethod){
			_getClassHandler().addInitMethod(initMethod);
			return this;
		};
		this.addMethod = function(methodName, method, forced) {
			_getClassHandler().addMethod(methodName, method, forced)
			return this;
		};
		this.addClassMethod = function(methodName, method, forced) {
			_getClassHandler().addClassMethod(methodName, method, forced)
			return this;
		};

		if (_classObject.__layback) {
			return _classObject.__layback.laybackObject;
		}

		_getClassHandler();
	}

	Layback.ClassHandler = function(laybackClassObj, classObject) {
		var _laybackClassObj = laybackClassObj,
			_classObject = classObject;		
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
				appliedTreats: {}
			};

			return this;
		};

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

			Layback.Factory.systemTreats().each(function(treatName, treatData){
				This.applyTreat(treatName, treatData);
			});

			_o(_classObject.__layback.treats).each(function(treatName, treatData){
				This.applyTreat(treatName, treatData);
			});

			return this;
		}

		this.addInitMethod = function(initMethod){
			_o(_classObject.__layback.initMethods).add(initMethod);
		};

		this.addTreat = function(treatName, TreatData){
			_o(_classObject.__layback.treats).add(TreatData, treatName);
		};

		this.applyTreat = function(treatName){
			var TreatClass = Layback.Treats.getTreat(treatName);
			var treatData = _classObject.__layback.treats[treatName];
			_classObject.__layback.appliedTreats[treatName] = new TreatClass(_classObject, treatData);
		};

		this.setDefaults = function(data) {
			_classObject.__layback.defaultData = data;
		};

		this.getDefaults = function() {
			return _classObject.__layback.defaultData || {};
		};
		this.addMethod = function(methodName, method, forced) {
			if (forced || !_classObject.prototype[methodName]) {
				_classObject.prototype[methodName] = method;
			}
		};
		this.addClassMethod = function(methodName, method, forced) {
			if (forced || !_classObject[methodName]) {
				_classObject[methodName] = method;
			}
		};

		if (!_classObject.__layback) {
			this.init();
		}
	}

	Layback.ClassCreator = function(methodName, method) {
		window[methodName] = method;
		return new Layback.LaybackClass(window[methodName]);
	}

	Layback.Object = function(obj, options){
		this.r = Math.random();
		var _obj = obj,
			_options = options || {},
			_objectHandler = null;
		
		var This = this;

		function _getObjectHandler() {
			if (!_objectHandler) {
				_objectHandler = new Layback.ObjectHandler(This, _obj, _options);
			}
			return _objectHandler;
		}
		
		this.setOptions = function(options){
			_getObjectHandler().setOptions(options);
			return this;
		};
		this.getOptions = function(){
			return _getObjectHandler().getOptions();
		};
		this.addNs = function(key, data, pattern) {
			_getObjectHandler().addNs(key, data, pattern);
			return this;
		};

		if (_obj.__layback) {
			return _obj.__layback.laybackObject;
		}
		_getObjectHandler();
	}

	Layback.ObjectHandler = function(laybackObjectObj, obj, options){
		var _laybackObjectObj = laybackObjectObj,
			_obj = obj,
			_options = options || {};

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
		
		this.setOptions = function(options){
			_options = options;
			return this;
		};
		this.getOptions = function(){
			return _options;
		};
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
			return this;
		};

		if (!_obj.__layback) {
			this.init();
		}
	}
	
	Layback.Treats = function(pool) {
		return Layback.Treats._pool[pool];
	};

	$.extend(Layback.Treats, {
		_pool: {
			'system': _o({}),
			'user': _o({}),
		},
		getTreats: function () {
			return $.extend({}, this._pool['system'].obj(), this._pool['user'].obj())
		},
		getTreat: function(treatName) {
			return this._pool['user'].get(treatName) || this._pool['system'].get(treatName);
		},
	});

	Layback.ObjectPool = {
		_pool: _o({}),
		getObjects: function(){
			return this._pool;
		},
		data: function() {
			return this._pool.obj();
		},
		addObject: function(obj) {
			this._pool.add(obj);
			obj.__layback.id = this._pool.size(); 
		},
		removeObject: function(obj) {
			if (!obj.__layback.id) {
				throw new Error('Object has No ID');
			} else {
				delete this._pool.del(obj.__layback.id);
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