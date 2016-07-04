/**
 * Nova Creator Boostrap Data Grid Extension: swipeable
 *
 */

(function ($) {
    'use strict';

    var initSwipeable = function(that) {
    	var options = that.options.swipeableOptions || {};
    	options['swipe'] = that.options.onSwipe;
    	that.$element.find(options.trigger).swipe(options);
    };

    $.extend($.fn.tablear.Constructor.defaults, {
        onSwipe: function(event, direction, distance, duration, fingerCount, fingerData) {
			alert('swiped'); //override to handle
		},
		swipeableOptions: {
			threshold: 100,
			fingers: 'all',
			allowPageScroll: 'auto',
			trigger: 'tbody tr',
			tap: function(event, target) {
				//known issue - on comboboxes, it will not work to select values with mouse
				if(!$(target).is("a")) {
					$(target).focus();
				}
			}			
		}
    });

    var _initHeader = $.fn.tablear.Constructor.prototype.initHeader;
    $.fn.tablear.Constructor.prototype.initHeader = function () {
        _initHeader.apply(this, Array.prototype.slice.apply(arguments));
        var that = this;
        if(this.options.swipeable) {
        	setTimeout(function() { //so that the ui is done when calling initSwipeable
        		initSwipeable(that);
        	}, 100);
            that.$element.on("load.rs.novacreator.bootstrap.datagrid", function() {
            	setTimeout(function() {
            		initSwipeable(that);
            	}, 100);
            });
        }
    };
})(jQuery);