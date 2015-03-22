/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */
window.matchMedia || (window.matchMedia = function() {
    "use strict";
    var styleMedia = window.styleMedia || window.media;
    if (!styleMedia) {
        var style = document.createElement("style"), script = document.getElementsByTagName("script")[0], info = null;
        style.type = "text/css";
        style.id = "matchmediajs-test";
        script.parentNode.insertBefore(style, script);
        info = "getComputedStyle" in window && window.getComputedStyle(style, null) || style.currentStyle;
        styleMedia = {
            matchMedium: function(media) {
                var text = "@media " + media + "{ #matchmediajs-test { width: 1px; } }";
                if (style.styleSheet) {
                    style.styleSheet.cssText = text;
                } else {
                    style.textContent = text;
                }
                return info.width === "1px";
            }
        };
    }
    return function(media) {
        return {
            matches: styleMedia.matchMedium(media || "all"),
            media: media || "all"
        };
    };
}());

(function($) {
    "use strict";
    window.laybackTools = window.laybackTools || {};
    var ObjectWrapper = function(obj) {
        this.init = function(obj) {
            if (obj === undefined) {
                obj = {};
            }
            this._obj = obj;
            return this;
        };
        this.obj = function() {
            return this._obj;
        };
        this.get = function(key) {
            return this.obj()[key];
        };
        this.size = function() {
            var size = 0, key;
            for (key in this._obj) {
                if (this._obj.hasOwnProperty(key)) {
                    size++;
                }
            }
            return size;
        };
        this.add = function(value, key, overwrite) {
            overwrite = overwrite === undefined ? true : false;
            if (!key && key !== 0) {
                key = this.getNextFreeKey();
            }
            this._obj[key] = value;
            return this;
        };
        this.del = function(key) {
            delete this._obj[key];
        };
        this.getNextFreeKey = function() {
            return "_" + this.size();
        };
        this.extend = function() {
            var args = Array.prototype.slice.call(arguments);
            if (typeof args[0] === "boolean") {
                args.splice(1, 0, this.obj());
            } else {
                args.splice(0, 0, this.obj());
            }
            $.extend.apply($.extend, args);
            return this;
        };
        this.each = function() {
            var args = Array.prototype.slice.call(arguments);
            args.splice(0, 0, this.obj());
            $.each.apply($.each, args);
            return this;
        };
        this.init(obj);
    };
    window.laybackTools.objectWrapper = function(obj) {
        return new ObjectWrapper(obj);
    };
})(jQuery);

(function($) {
    "use strict";
    window.laybackTools = window.laybackTools || {};
    var StringWrapper = function(str) {
        this._str = str;
        this.dashToCamelCase = function() {
            return this._str.replace(/-(.)/g, function(match, group) {
                return group.toUpperCase();
            });
        };
    };
    window.laybackTools.stringWrapper = function(str) {
        return new StringWrapper(str);
    };
})(jQuery);

(function($, window) {
    "use strict";
    var _o = window.laybackTools.objectWrapper, _s = window.laybackTools.stringWrapper;
    var Layback = function() {
        if (arguments[0]) {
            if (typeof arguments[0] == "function") {
                return new Layback.Class(arguments[0]);
            }
            if (typeof arguments[0] == "object" && !arguments[1]) {
                return new Layback.Object(arguments[0]);
            }
            if (typeof arguments[0] == "object" && arguments[1]) {
                return new Layback.Object(arguments[0], arguments[1]);
            }
        }
        if (arguments[0] && arguments[1]) {
            return new Layback.ClassCreator(arguments[0], arguments[1]);
        }
        return Layback.Factory;
    };
    Layback.Class = function(classObject) {
        var _classObject = classObject, _classHandler = null;
        var This = this;
        function _getClassHandler() {
            if (!_classHandler) {
                _classHandler = new Layback.ClassHandler(This, _classObject);
            }
            return _classHandler;
        }
        this.make = function() {
            _getClassHandler().make();
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
        this.getDefaults = function(data) {
            return _getClassHandler().getDefaults(data);
        };
        this.addInitMethod = function(initMethod) {
            _getClassHandler().addInitMethod(initMethod);
            return this;
        };
        this.addMethod = function(methodName, method, forced) {
            _getClassHandler().addMethod(methodName, method, forced);
            return this;
        };
        this.addClassMethod = function(methodName, method, forced) {
            _getClassHandler().addClassMethod(methodName, method, forced);
            return this;
        };
        if (_classObject.__layback) {
            return _classObject.__layback.laybackObject;
        }
        _getClassHandler();
    };
    Layback.ClassHandler = function(laybackClassObj, classObject) {
        var _laybackClassObj = laybackClassObj, _classObject = classObject;
        this.init = function() {
            var This = this;
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
            Layback.Factory.systemTreats().each(function(treatName, treatData) {
                This.addTreat(treatName, treatData);
            });
        };
        this.make = function() {
            var This = this;
            this.addClassMethod("layback", function() {
                return this.__layback.laybackObject;
            });
            this.addMethod("layback", function(options) {
                if (!this.__layback) {
                    return new Layback.Object(this, options);
                }
                return this.__layback.laybackObject;
            });
            _o(_classObject.__layback.treats).each(function(treatName, treatData) {
                This.applyTreat(treatName, treatData);
            });
        };
        this.addInitMethod = function(initMethod) {
            _o(_classObject.__layback.initMethods).add(initMethod);
        };
        this.addTreat = function(treatName, treatData) {
            _o(_classObject.__layback.treats).add(treatData, treatName);
        };
        this.applyTreat = function(treatName) {
            var TreatClass = Layback.Treats.getTreat(treatName);
            var treatData = _classObject.__layback.treats[treatName];
            _classObject.__layback.appliedTreats[treatName] = new TreatClass(_classObject, treatData);
        };
        this.setDefaults = function(data) {
            _classObject.__layback.defaultData = data;
        };
        this.getDefaults = function() {
            return _classObject.__layback.defaultData;
        };
        this.addMethod = function(methodName, method, forced) {
            forced = !!forced;
            if (!forced && (_classObject.prototype[methodName] || _classObject.__layback.methods[methodName])) {
                throw new Error("The method already exists! Try using some other name, or use the forced parameter!");
            }
            if (forced || !(_classObject.prototype[methodName] || _classObject.__layback.methods[methodName])) {
                _classObject.__layback.methods[methodName] = method;
                _classObject.prototype[methodName] = method;
            }
        };
        this.addClassMethod = function(methodName, method, forced) {
            forced = !!forced;
            if (!forced && (_classObject[methodName] || _classObject.__layback.classMethods[methodName])) {
                throw new Error("The method already exists! Try using some other name, or use the forced parameter!");
            }
            if (forced || !(_classObject[methodName] || _classObject.__layback.classMethods[methodName])) {
                _classObject.__layback.classMethods[methodName] = method;
                _classObject[methodName] = method;
            }
        };
        if (!_classObject.__layback) {
            this.init();
        }
    };
    Layback.ClassCreator = function(methodName, method) {
        window[methodName] = method;
        return new Layback.Class(window[methodName]);
    };
    Layback.Object = function(obj, options) {
        this.r = Math.random();
        var _obj = obj, _options = options || {}, _objectHandler = null;
        var This = this;
        function _getObjectHandler() {
            if (!_objectHandler) {
                _objectHandler = new Layback.ObjectHandler(This, _obj, _options);
            }
            return _objectHandler;
        }
        this.setOptions = function(options) {
            _getObjectHandler().setOptions(options);
            return this;
        };
        this.getOptions = function() {
            return _getObjectHandler().getOptions();
        };
        this.addNs = function(key, data, pattern) {
            _getObjectHandler().addNs(key, data, pattern);
            return this;
        };
        this.getNs = function(key) {
            return _getObjectHandler().getNs(key);
        };
        if (_obj.__layback) {
            return _obj.__layback.laybackObject;
        }
        _getObjectHandler();
    };
    Layback.ObjectHandler = function(laybackObjectObj, obj, options) {
        var _laybackObjectObj = laybackObjectObj, _obj = obj, _options = options || {};
        this.init = function() {
            _obj.__layback = {
                id: 0,
                laybackObject: _laybackObjectObj
            };
            Layback.Factory.objectPool().addObject(_obj);
            _o(_obj.constructor.__layback.initMethods).each(function(i, initMethod) {
                initMethod(_obj);
            });
        };
        this.setOptions = function(options) {
            _options = options;
        };
        this.getOptions = function() {
            return _options;
        };
        this.addNs = function(key, data, pattern) {
            data = data || {};
            var defaults = _obj.constructor.__layback.defaultData[key] || {};
            var keyInObj = "layback" + key.charAt(0).toUpperCase() + key.slice(1);
            _obj[keyInObj] = _obj[keyInObj] || {};
            var argData = {};
            if (_obj.laybackData && pattern) {
                var regExp = pattern instanceof RegExp && pattern || new RegExp(pattern.replace("*", "(.*)"));
                _o(_obj.laybackData).each(function(name, element) {
                    var matches = name.match(regExp);
                    if (matches) {
                        argData[matches[1].substring(0, 1).toLowerCase() + matches[1].substring(1)] = element;
                    }
                });
            }
            _obj[keyInObj] = $.extend(true, {}, defaults, _obj[keyInObj], argData, data);
        };
        this.getNs = function(key) {
            var keyInObj = "layback" + key.charAt(0).toUpperCase() + key.slice(1);
            _obj[keyInObj] = _obj[keyInObj] || {};
            return _obj[keyInObj];
        };
        if (!_obj.__layback) {
            this.init();
        }
    };
    Layback.Treats = function(pool) {
        return Layback.Treats._pool[pool];
    };
    $.extend(Layback.Treats, {
        _pool: {
            system: _o({}),
            user: _o({})
        },
        getTreats: function() {
            return $.extend({}, this._pool["system"].obj(), this._pool["user"].obj());
        },
        getTreat: function(treatName) {
            return this._pool["user"].get(treatName) || this._pool["system"].get(treatName);
        }
    });
    Layback.ObjectPool = {
        _pool: _o({}),
        getObjects: function() {
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
                throw new Error("Object has No ID");
            } else {
                this._pool.del(obj.__layback.id);
            }
            return this;
        }
    };
    Layback.Factory = {
        _systemTreats: new Layback.Treats("system"),
        _userTreats: new Layback.Treats("user"),
        tools: function() {
            return window.laybackTools;
        },
        systemTreats: function() {
            return this._systemTreats;
        },
        treats: function() {
            return this._userTreats;
        },
        objectPool: function() {
            return Layback.ObjectPool;
        }
    };
    var layback = function() {
        function _layback(args) {
            return Layback.apply(this, args);
        }
        _layback.prototype = Layback.prototype;
        return new _layback(Array.prototype.slice.call(arguments));
    };
    window.layback = layback;
})(jQuery, window);

(function($) {
    "use strict";
    var _o = window.laybackTools.objectWrapper;
    var DataTreat = function(classObject) {
        layback(classObject).addMethod("set", function(key, value) {
            _o(this.laybackData).add(value, key);
            return this;
        }).addMethod("get", function(key, defaultValue) {
            return this.laybackData[key] !== undefined ? this.laybackData[key] : defaultValue;
        }).addInitMethod(function(obj) {
            var options = obj.layback().getOptions();
            obj.layback().addNs("data", options);
        });
    };
    layback().systemTreats().add(DataTreat, "data");
})($);

(function($) {
    "use strict";
    var _o = window.laybackTools.objectWrapper;
    var DomTreat = function(classObject) {
        layback(classObject).addInitMethod(function(obj) {
            obj.layback().addNs("dom", {}, "*Element");
        }).addMethod("dom", function() {
            var args = Array.prototype.slice.call(arguments);
            if (this.laybackDom[args[0]]) {
                args[0] = this.laybackDom[args[0]];
            }
            return $.apply($, args);
        }).addMethod("getElement", function() {
            return this.dom(this.get("element"));
        });
    };
    layback().systemTreats().add(DomTreat, "dom");
})($);

(function($) {
    "use strict";
    var _o = window.laybackTools.objectWrapper;
    var _s = window.laybackTools.stringWrapper;
    var EventTreat = function(classObject) {
        layback(classObject).addInitMethod(function(obj) {
            obj.layback().addNs("eventListeners").addNs("callbacks", {}, /on([A-Z].*)/);
            _o(obj.laybackCallbacks).each(function(evt, callback) {
                obj.observe(evt, callback);
            });
        }).addMethod("observe", function(evt, callback) {
            evt = _s(evt).dashToCamelCase();
            if (!this.laybackEventListeners[evt]) {
                this.laybackEventListeners[evt] = {};
            }
            _o(this.laybackEventListeners[evt]).add(callback);
            return this;
        }).addMethod("dispatch", function(evt, evtData) {
            evt = _s(evt).dashToCamelCase();
            if (this.laybackEventListeners[evt]) {
                var This = this;
                _o(this.laybackEventListeners[evt]).each(function(i, callback) {
                    var args = [ This, evtData, evt ];
                    callback.apply(callback, args);
                });
            }
            return this;
        });
    };
    layback().systemTreats().add(EventTreat, "event");
})($);

(function($) {
    "use strict";
    var _o = window.laybackTools.objectWrapper;
    var CollectionTreat = function(classObject) {
        var setItemCollectionPosition = function(item, pos) {
            item.__laybackCollectionPosition = pos;
        };
        var getItemCollectionPosition = function(item) {
            if (item instanceof jQuery) {
                return item[0].__laybackCollectionPosition;
            }
            return item.__laybackCollectionPosition;
        };
        var reIndexItems = function(obj) {
            var i = 0;
            _o(obj.laybackCollection.items).each(function(key, item) {
                setItemCollectionPosition(item, i);
                i++;
            });
        };
        layback(classObject).addInitMethod(function(obj) {
            obj.layback().addNs("collection", {
                items: []
            });
            reIndexItems(obj);
        }).addMethod("addCollectionItem", function(item) {
            var This = this;
            this.dispatch("collection-additem-before", item);
            if (item.constructor == Array || item instanceof jQuery) {
                $.each(item, function(k, val) {
                    This.addCollectionItem(val);
                });
            } else {
                setItemCollectionPosition(item, this.laybackCollection.items.length);
                this.laybackCollection.items.push(item);
            }
            this.dispatch("collection-additem-after", item);
            return this;
        }).addMethod("getCollectionItems", function() {
            return this.laybackCollection.items;
        }).addMethod("getCollectionItemPosition", function(item) {
            return getItemCollectionPosition(item);
        }).addMethod("getCollectionItem", function(index) {
            var itemarr = this.sliceCollectionItems(index, index + 1);
            if (itemarr.length) {
                return itemarr[0];
            }
            return false;
        }).addMethod("removeCollectionItem", function(item) {
            this.dispatch("collection-removeitem-before", item);
            if (typeof item == "number") {
                this.laybackCollection.items.splice(item, 1);
            }
            this.laybackCollection.items.splice(getItemCollectionPosition(item), 1);
            reIndexItems(this);
            this.dispatch("collection-removeitem-after", item);
            return this;
        }).addMethod("getCollectionSize", function() {
            return this.getCollectionItems().length;
        }).addMethod("setPagerLimit", function(limit) {
            this.set("pagerLimit", limit);
            return this;
        }).addMethod("getPageItems", function(page, func) {
            var limit = this.get("pagerLimit");
            return this.sliceCollectionItems(page * limit, (page + 1) * limit, func);
        }).addMethod("eachCollectionItems", function() {
            var args = Array.prototype.slice.call(arguments);
            args.splice(0, 0, this.getItems());
            $.each.apply($.each, args);
            return this;
        }).addMethod("grepCollectionItems", function() {
            var args = Array.prototype.slice.call(arguments);
            args.splice(0, 0, this.getCollectionItems());
            return $.grep.apply($.grep, args);
        }).addMethod("sliceCollectionItems", function(start, end, func) {
            var items = this.getCollectionItems().slice(0), slice = items.slice(start, end);
            if (func && typeof func === "function") {
                $.each(slice, func);
            }
            return slice;
        });
    };
    layback().treats().add(CollectionTreat, "collection");
})($);

(function($) {
    "use strict";
    var _o = window.laybackTools.objectWrapper;
    var JqPluginTreat = function(classObject, pluginName) {
        var _classObject = classObject, _pluginName = pluginName, This = this;
        This._lastReturnValue = null;
        layback(classObject).addClassMethod("getJqueryPluginObject", function(element) {
            return $(element).data(_pluginName + "-object");
        }).addClassMethod("getJqueryPluginObjects", function(element) {
            if ($(element).length < 2) {
                return [ this.getJqueryPluginObject(element) ];
            }
            var objects = [];
            var This = this;
            $(element).each(function() {
                objects.push(This.getJqueryPluginObject(element));
            });
            return objects;
        });
        if (!$.fn[pluginName]) {
            $.fn[pluginName] = function() {
                var _userArgs = $.makeArray(arguments);
                this.each(function() {
                    var pluginObject = $(this).data(pluginName + "-object");
                    if (!pluginObject) {
                        var userOptions = _userArgs[0] || {}, elementOptions = $(this).attr(pluginName + "-options");
                        if (elementOptions) {
                            elementOptions = eval("(" + elementOptions + ")");
                        } else {
                            elementOptions = {};
                        }
                        pluginObject = new classObject($.extend(true, {}, userOptions, elementOptions, {
                            element: $(this)
                        }));
                        $(this).data(pluginName + "-object", pluginObject);
                        return this;
                    } else {
                        var optionsCopy = _userArgs.slice(0), func = optionsCopy.shift();
                        This._lastReturnValue = pluginObject[func].apply(pluginObject, optionsCopy);
                    }
                });
            };
        }
    };
    layback().treats().add(JqPluginTreat, "jQuery-plugin");
})($);

(function($) {
    "use strict";
    var _o = window.laybackTools.objectWrapper;
    var ResponsiveTreat = function(classObject) {
        layback(classObject).addInitMethod(function(obj) {
            obj.layback().addNs("breakpoints");
            _o(obj.laybackBreakpoints).each(function(name, responderData) {
                if (responderData["data"]) {
                    obj.respondTo(name, function() {
                        this.laybackData = $.extend(this.laybackData, responderData["data"]);
                    });
                }
            });
            ResponsiveTreat.watchWindowSize();
        }).addMethod("respondTo", function(bpName, func) {
            ResponsiveTreat.addResponder(bpName, this, func);
        }).addMethod("getCurrentBreakPoint", function() {
            var currentBreakpoint = null, currentBreakpointVal = 0, firstBreakpoint = null, firstBreakpointVal = 1e6, This = this;
            _o(this.laybackBreakpoints).each(function(name, bpData) {
                if (firstBreakpointVal > bpData.width) {
                    firstBreakpointVal = bpData.width;
                    firstBreakpoint = name;
                }
                if (currentBreakpointVal < bpData.width && (!ResponsiveTreat.isMqSupported() || matchMedia(ResponsiveTreat.getMqString(bpData.width)).matches)) {
                    currentBreakpointVal = bpData.width;
                    currentBreakpoint = name;
                }
            });
            return currentBreakpointVal === 0 ? {
                name: firstBreakpoint,
                width: firstBreakpointVal
            } : {
                name: currentBreakpoint,
                width: currentBreakpointVal
            };
        });
    };
    ResponsiveTreat = $.extend(ResponsiveTreat, {
        _isMqSupported: null,
        _baseFontSize: null,
        _responders: _o({}),
        _windowSizeWatched: false,
        addResponder: function(name, obj, func) {
            var width = obj.laybackBreakpoints[name].width;
            this._responders.add({
                width: width,
                name: name,
                obj: obj,
                responderFunction: func
            });
        },
        isMqSupported: function() {
            if (this._isMqSupported === null) {
                this._isMqSupported = !!matchMedia("only all").matches;
            }
            return this._isMqSupported;
        },
        getBaseFontSize: function() {
            if (this._baseFontSize === null) {
                this._baseFontSize = parseFloat($("body").css("font-size"));
            }
            return this._baseFontSize;
        },
        getMqString: function(pixels) {
            return "(min-width: " + pixels / this.getBaseFontSize() + "em)";
        },
        respond: function() {
            this._responders.each(function(i, responderData) {
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
        }
    });
    layback().treats().add(ResponsiveTreat, "respond");
})($);

(function($) {
    "use strict";
    var _o = window.laybackTools.objectWrapper, _s = window.laybackTools.stringWrapper;
    var SetGetTreat = function(classObject) {
        this._class = classObject;
        var This = this;
        this.createSetterMethod = function(obj, key) {
            var methodName = _s("set-" + key).dashToCamelCase();
            layback(This._class).addMethod(methodName, function(value) {
                return this.set(key, value);
            });
        };
        this.createGetterMethod = function(obj, key) {
            var methodName = _s("get-" + key).dashToCamelCase();
            layback(This._class).addMethod(methodName, function(def) {
                return this.get(key, def);
            });
        };
        layback(classObject).addInitMethod(function(obj) {
            $.each(obj.laybackData, function(key, value) {
                This.createGetterMethod(obj, key);
                This.createSetterMethod(obj, key);
            });
        });
    };
    layback().treats().add(SetGetTreat, "setget");
})($);