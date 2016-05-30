// GRID PLUGIN DEFINITION
// =====================
var old = $.fn.novagrid;

$.fn.novagrid = function(option) {
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

$.fn.novagrid.Constructor = Grid;

// GRID NO CONFLICT
// ===============
$.fn.novagrid.noConflict = function () {
    $.fn.novagrid = old;
    return this;
};

// GRID DATA-API
// ============
$("[data-toggle=\"novagrid\"]").novagrid();