;(function($) {
	
	"use strict";

	var _o = window.laybackTools.objectWrapper;
	var _s = window.laybackTools.stringWrapper;

	var EventTreat = function(classObject) {

		layback(classObject)
			.addInitMethod(function(obj) {
				obj.layback()
					.addNs('eventListeners')
					.addNs('callbacks', {}, /on([A-Z].*)/);

				_o(obj.laybackCallbacks).each(function(evt, callback){
					obj.observe(evt, callback);
				});
			})
			.addMethod('observe', function(evt, callback) {
				evt = _s(evt).dashToCamelCase();
				if (!this.laybackEventListeners[evt]) {
					this.laybackEventListeners[evt] = {};
				}
				_o(this.laybackEventListeners[evt]).add(callback);
				return this;
			})
			.addMethod('dispatch', function(evt, evtData) {
				evt = _s(evt).dashToCamelCase();
				if (this.laybackEventListeners[evt]) {
					var This = this;
					_o(this.laybackEventListeners[evt]).each(function(i, callback){
						var args = [This, evtData, evt];
						callback.apply(callback, args);
					});
				}
				return this;
			});
	};

	layback().systemTreats().add(EventTreat, 'event');

})($);