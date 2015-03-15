;(function($) {
	
	"use strict";

	var _o = window.laybackTools.objectWrapper;

	var CollectionTreat = function(classObject) {

		var setItemCollectionPosition = function(item, pos) {
			item.__laybackCollectionPosition = pos;
		}

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
		}


		layback(classObject)
			.addInitMethod(function(obj) {
				
				obj.layback().addNs('collection', {items: []});

				reIndexItems(obj);
			})
			.addMethod('addCollectionItem', function(item) {
				var This = this;
				this.dispatch('collection-additem-before', item);
		        if(item.constructor == Array || item instanceof jQuery) {
		            $.each(item, function(k, val){
		               This.addCollectionItem(val); 
		            });
		        } else {
		        	setItemCollectionPosition(item, this.laybackCollection.items.length);
		            this.laybackCollection.items.push(item);
		        }
		        this.dispatch('collection-additem-after', item);
				return this;
			})
			.addMethod('getCollectionItems', function() {
				return this.laybackCollection.items;
			})
			.addMethod('getCollectionItemPosition', function (item) {
				return getItemCollectionPosition(item);
			})
			.addMethod('getCollectionItem', function (index) {
				var itemarr = this.sliceCollectionItems(index, index+1);
	            if (itemarr.length) {
	                return itemarr[0];
	            }
	            return false;
			})
			.addMethod('removeCollectionItem', function (item) {
				this.dispatch('collection-removeitem-before', item);

				if ((typeof item) == 'number') {
					this.laybackCollection.items.splice(item, 1);					
				}

	            this.laybackCollection.items.splice(getItemCollectionPosition(item), 1);
	            reIndexItems(this);

	            this.dispatch('collection-removeitem-after', item);
	            return this;
			})
			.addMethod('getCollectionSize', function () {
				return this.getCollectionItems().length;
			})
			.addMethod('setPagerLimit', function (limit) {
				this.set('pagerLimit', limit);
				return this;
			})
			.addMethod('getPageItems', function (page, func) {
				var limit = this.get('pagerLimit');
            	return this.sliceCollectionItems(page*limit, (page+1)*limit, func);
			})
			.addMethod('eachCollectionItems', function () {
				var args = Array.prototype.slice.call(arguments);
				args.splice(0, 0, this.getItems());
				
				$.each.apply($.each, args);
				return this;
			})
			.addMethod('grepCollectionItems', function () {
				var args = Array.prototype.slice.call(arguments);
				args.splice(0, 0, this.getCollectionItems());
				
				return $.grep.apply($.grep, args);
			})
			.addMethod('sliceCollectionItems', function (start, end, func) {
				var items = this.getCollectionItems().slice(0),
	            	slice = items.slice(start, end);
	            if (func && (typeof func) === 'function') {
	                $.each(slice, func);
	            }
	            return slice;
			});
			
	};

	layback().treats().add(CollectionTreat, 'collection');

})($);