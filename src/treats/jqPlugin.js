;(function($) {
	
	"use strict";

	var _o = window.laybackTools.objectWrapper;

	var JqPluginTreat = function(classObject, pluginName) {

		var _classObject = classObject,
			_pluginName = pluginName,
			This = this;
		This._lastReturnValue = null;

		layback(classObject)
			.addClassMethod('getJqueryPluginObject', function(element){
				return $(element).data(_pluginName + '-object');
			})
			.addClassMethod('getJqueryPluginObjects', function(element){
				if ($(element).length < 2) {
					return [this.getJqueryPluginObject(element)];
				}
				var objects = [];
				var This = this;
				$(element).each(function(){
					objects.push(This.getJqueryPluginObject(element));
				});
				return objects;
			});

 		if (!$.fn[pluginName]) {
			$.fn[pluginName] = function() {
				var _userArgs = $.makeArray(arguments);

				this.each(function() {
					//get the plugin from data (the element already has the plugin)
					var pluginObject = $(this).data(pluginName + '-object');

					if (!pluginObject) {
						var userOptions = _userArgs[0] || {},
						elementOptions = $(this).attr(pluginName + '-options');

						if (elementOptions){
							elementOptions = eval('(' + elementOptions + ')');
						} else {
							elementOptions = {};
						}

						pluginObject = new classObject(
							$.extend(true, {}, userOptions, elementOptions, {element: $(this)})
						);
						
						$(this).data(pluginName + '-object', pluginObject);

						return this;
					} else {
						var optionsCopy = _userArgs.slice(0),
						func = optionsCopy.shift();
						This._lastReturnValue = pluginObject[func].apply(pluginObject, optionsCopy);
					}
				});
			};	
		};
	};

	layback().treats().add(JqPluginTreat, 'jQuery-plugin');

})(jQuery);
