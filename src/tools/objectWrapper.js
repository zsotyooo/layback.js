;(function($) {
	"use strict";

	window.laybackTools = window.laybackTools || {};
	/**
	 * Wrapper for an Object
	 * @param {Object} obj
	 */
	var ObjectWrapper = function(obj) {

		/**
		 * initialize object with predefined value or empty Object ({})
		 * 
		 * @param  {Object} obj
		 * @chainable
		 */
		this.init = function(obj) {
			if (obj === undefined) {
				obj = {};
			}
			this._obj = obj;
			return this;
		}

		/**
		 * get the original object
		 * 
		 * @return {Object}
		 */
		this.obj = function() {
			return this._obj;
		}

		this.get = function(key) {
			return this.obj()[key];
		}
		
		/**
		 * get the length of the original object
		 * 
		 * @return {Number}
		 */
		this.size = function() {
			var size = 0, key;
			for (key in this._obj) {
				if (this._obj.hasOwnProperty(key)) {
					size++;
				}
			}
			return size;
		};

		/**
		 * add object to the pool
		 * 
		 * @param {Mixed} value
		 * @param {Mixed} key If not provided, a generated key will be added
		 * @param {boolean} overwrite = true
		 * @chainable
		 */
		this.add = function(value, key, overwrite) {
			overwrite = overwrite === undefined ? true : false;
			if (!key && key !== 0) {
				key = this.getNextFreeKey();
			}
			this._obj[key] = value;
			return this;
		};

		/**
		 * removes a value from the object at the given key
		 * 
		 * @param {Mixed} key
		 * @chainable
		 */
		this.del = function(key) {
            delete this._obj[key];
        };

        /**
         * get the next generated key
         * @return {String}
         */
		this.getNextFreeKey = function() {
            return '_' + this.size();
		};

		/**
		 * @see jQuery.extend()
		 * 
		 * @chainable
		 */
		this.extend = function(){
			var args = Array.prototype.slice.call(arguments);
			if ((typeof args[0]) === 'boolean') {
				args.splice(1, 0, this.obj());
			} else {
				args.splice(0, 0, this.obj());
			}
			$.extend.apply($.extend, args);
			return this;
		};

		/**
		 * @see jQuery.each()
		 * 
		 * @chainable
		 */
		this.each = function(){
			var args = Array.prototype.slice.call(arguments);
			
			args.splice(0, 0, this.obj());
			
			$.each.apply($.each, args);
			return this;
		};

		this.init(obj);
	}

	window.laybackTools.objectWrapper = function(obj) {
		return new ObjectWrapper(obj);
	};
})(jQuery);