;(function($) {

	"use strict";

	var _o = window.laybackTools.objectWrapper;

	var DataTreat = function(classObject) {
		layback(classObject)
			.addMethod('set', function(key, value) {
				_o(this.laybackData).add(value, key);
				return this;
			})
			.addMethod('get', function(key, defaultValue) {
				return this.laybackData[key] !== undefined ? this.laybackData[key] : defaultValue;
			})
			.addInitMethod(function(obj) {
				var options = obj.layback().getOptions();
				obj.layback()
					.addNs('data', options);
			});
	};

	layback().systemTreats().add(DataTreat, 'data');

})(jQuery);
