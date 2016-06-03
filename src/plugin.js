// GRID PLUGIN DEFINITION
// =====================
var old = $.fn.tablear;

$.fn.tablear = function(option) {
    var args = Array.prototype.slice.call(arguments, 1);
    var returnValue = null;
    var elements = this.each(function (index) {
            var $this = $(this);
            var instance = $this.data(namespace);
            var options = typeof option === "object" && option;
            if(!instance && option === "destroy") {
                return;
            }
            if(!instance) {
                $this.data(namespace, (instance = new Grid(this, options)));
                init.call(instance);
            }
            if(typeof option === "string") {
                if(option.indexOf("get") === 0 && index === 0) {
                    returnValue = instance[option].apply(instance, args);
                } else if(option.indexOf("get") !== 0) {
                    return instance[option].apply(instance, args);
                }
            }
        });
    return (typeof option === "string" && option.indexOf("get") === 0) ? returnValue : elements;
};

//to easily access the Grid object. It's a convention
$.fn.tablear.Constructor = Grid; 
$.fn.tablear.defaults = Grid.defaults;
$.fn.tablear.locales = Grid.locales;

// GRID NO CONFLICT
// ===============
$.fn.tablear.noConflict = function() {
    $.fn.tablear = old;
    return this;
};

// GRID DATA-API
// ============
$("[data-toggle=\"tablear\"]").tablear();