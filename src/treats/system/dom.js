;(function($) {
	
	"use strict";

	var _o = window.laybackTools.objectWrapper;

	var DomTreat = function(classObject) {

		layback(classObject)
			.addInitMethod(function(obj) {
				
				obj.layback().addNs('dom', {}, '*Element');
			})
			.addMethod('dom', function() {
				var args = Array.prototype.slice.call(arguments);
				if (this.laybackDom[args[0]]) {
					args[0] = this.laybackDom[args[0]];
				}
				return $.apply($, args);
			})
			.addMethod('getElement', function() {
				return this.dom(this.get('element'));
			});
	};

	layback().systemTreats().add(DomTreat, 'dom');

})($);