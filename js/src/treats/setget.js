;(function($) {

	"use strict";

	var _o = window.laybackTools.objectWrapper,
		_s = window.laybackTools.stringWrapper;

	var SetGetTreat = function(classObject) {
		this._class = classObject;

		var This = this;
		
		this.createSetterMethod = function(obj, key) {
            var methodName = _s('set-'+key).dashToCamelCase();
            layback(This._class)
            	.addMethod(methodName, function(value){
            		return this.set(key, value);
            	});
        };

        this.createGetterMethod = function(obj, key) {
            var methodName = _s('get-'+key).dashToCamelCase();
            layback(This._class)
            	.addMethod(methodName, function(def){
            		return this.get(key, def);
            	});
        };


		layback(classObject)
			.addInitMethod(function(obj) {
				$.each(obj.laybackData, function(key, value) {
					This.createGetterMethod(obj, key);
					This.createSetterMethod(obj, key);
				});
			}
		);
	};

	layback().treats().add(SetGetTreat, 'setget');

})($);