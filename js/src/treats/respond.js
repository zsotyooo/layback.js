;(function($) {
	
	"use strict";

	var _o = window.laybackTools.objectWrapper;

	var ResponsiveTreat = function(classObject) {
		layback(classObject)
			.addInitMethod(function(obj){
				obj.layback().addNs('breakpoints');
				_o(obj.laybackBreakpoints).each(function(name, responderData){
					if (responderData['data']) {
						obj.respondTo(name, function(){
							this.laybackData = $.extend(this.laybackData, responderData['data']);
						});
					}
				});
				ResponsiveTreat.watchWindowSize();
			})
			.addMethod('respondTo', function(bpName, func){
				ResponsiveTreat.addResponder(bpName, this, func);
			})
			.addMethod('getCurrentBreakPoint', function() {
	            var currentBreakpoint = null,
	                currentBreakpointVal = 0,
	                firstBreakpoint = null,
	                firstBreakpointVal = 1000000,
	                This = this;
	            _o(this.laybackBreakpoints).each(function(name, bpData) {
	                if(firstBreakpointVal > bpData.width) {
	                    firstBreakpointVal = bpData.width;
	                    firstBreakpoint = name;
	                }
	                if (currentBreakpointVal < bpData.width
                        && (!ResponsiveTreat.isMqSupported() || matchMedia(ResponsiveTreat.getMqString(bpData.width)).matches)) {
	                    currentBreakpointVal = bpData.width;
	                    currentBreakpoint = name;
	                }
	            });
	            return currentBreakpointVal === 0 ? {name: firstBreakpoint, width: firstBreakpointVal} : {name: currentBreakpoint, width: currentBreakpointVal};
	        })
	};

	ResponsiveTreat = $.extend(ResponsiveTreat, {
		_isMqSupported: null,
		_baseFontSize: null,
		_responders: _o({}),
		_windowSizeWatched: false,
		addResponder: function(name, obj, func) {
			var width = obj.laybackBreakpoints[name].width;
			this._responders.add({
				'width': width,
				'name': name,
				'obj': obj,
				'responderFunction': func
			});
		},
		isMqSupported: function(){
			if (this._isMqSupported === null) {
				this._isMqSupported = !!matchMedia('only all').matches;
			}
			return this._isMqSupported;
		},
		getBaseFontSize: function(){
			if (this._baseFontSize === null) {
				this._baseFontSize = parseFloat($("body").css("font-size"));
			}
			return this._baseFontSize;
		},
		getMqString: function(pixels){
			return "(min-width: " + (pixels / this.getBaseFontSize()) + "em)";
		},
		respond: function(){
			this._responders.each(function(i, responderData){
				if (responderData.width == responderData.obj.getCurrentBreakPoint().width) {
					responderData.responderFunction.apply(responderData.obj);
				}
			});
		},
		watchWindowSize: function() {
			if (this._windowSizeWatched) {
				return;
			}
			this._windowSizeWatched = true;
            var This = this;
            jQuery(window).resize(function() {
                This.respond();
            }).resize();

        },
	});

	layback().treats().add(ResponsiveTreat, 'respond');

})($);