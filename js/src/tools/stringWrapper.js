;(function($) {
	"use strict";

	window.laybackTools = window.laybackTools || {};

	/**
	 * Wrapper for a String
	 * @param {Object} obj
	 */
	var StringWrapper = function(str) {
		this._str = str;
		
		this.dashToCamelCase = function(){
	        return this._str.replace(/-(.)/g, function(match, group) {
	            return group.toUpperCase();
	        });
	    }
	}

	window.laybackTools.stringWrapper = function(str) {
		return new StringWrapper(str);
	};
})(jQuery);