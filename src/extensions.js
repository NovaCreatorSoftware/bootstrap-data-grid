// GRID COMMON TYPE EXTENSIONS
// ============

$.fn.extend({
    _mcmAria: function (name, value) {
        return (value) ? this.attr("aria-" + name, value) : this.attr("aria-" + name);
    },

    _mcmBusyAria: function(busy) {
        return (busy == null || busy) ? 
            this._mcmAria("busy", "true") : 
            this._mcmAria("busy", "false");
    },

    _mcmRemoveAria: function(name) {
        return this.removeAttr("aria-" + name);
    },

    _mcmEnableAria: function(enable) {
        return (enable == null || enable) ? 
            this.removeClass("disabled")._mcmAria("disabled", "false") : 
            this.addClass("disabled")._mcmAria("disabled", "true");
    },

    _mcmEnableField: function(enable) {
        return (enable == null || enable) ? 
            this.removeAttr("disabled") : 
            this.attr("disabled", "disable");
    },

    _mcmShowAria: function(show) {
        return (show == null || show) ? 
            this.show()._mcmAria("hidden", "false") :
            this.hide()._mcmAria("hidden", "true");
    },

    _mcmSelectAria: function(select) {
        return (select == null || select) ? 
            this.addClass("active")._mcmAria("selected", "true") : 
            this.removeClass("active")._mcmAria("selected", "false");
    },

    _mcmId: function(id) {
        return (id) ? this.attr("id", id) : this.attr("id");
    }
});

if(!String.prototype.resolve) {
    var formatter = {
        "checked": function(value) {
            if(typeof value === "boolean") {
                return (value) ? "checked=\"checked\"" : "";
            }
            return value;
        }
    };

    String.prototype.resolve = function(substitutes, prefixes) {
        var result = this;
        $.each(substitutes, function(key, value) {
            if(value != null && typeof value !== "function") {
                if(typeof value === "object") {
                    var keys = (prefixes) ? $.extend([], prefixes) : [];
                    keys.push(key);
                    result = result.resolve(value, keys) + "";
                } else {
                    if(formatter && formatter[key] && typeof formatter[key] === "function") {
                        value = formatter[key](value);
                    }
                    key = (prefixes) ? prefixes.join(".") + "." + key : key;
                    var pattern = new RegExp("\\{\\{" + key + "\\}\\}", "gm");
                    result = result.replace(pattern, (value.replace) ? value.replace(/\$/gi, "&#36;") : value);
                }
            }
        });
        return result;
    };
}

if(!Array.prototype.first) {
    Array.prototype.first = function(condition) {
        for(var i = 0; i < this.length; i++) {
            var item = this[i];
            if(condition(item)) {
                return item;
            }
        }
        return null;
    };
}

if(!Array.prototype.contains) {
    Array.prototype.contains = function(condition) {
        for(var i = 0; i < this.length; i++) {
            var item = this[i];
            if(condition(item)) {
                return true;
            }
        }
        return false;
    };
}

if(!Array.prototype.page) {
    Array.prototype.page = function(page, size) {
        var skip = (page - 1) * size;
        var end = skip + size;
        return (this.length > skip) ? 
            (this.length > end) ? this.slice(skip, end) : 
                this.slice(skip) : [];
    };
}

if(!Array.prototype.where) {
    Array.prototype.where = function(condition) {
        var result = [];
        for(var i = 0; i < this.length; i++) {
            var item = this[i];
            if(condition(item)) {
                result.push(item);
            }
        }
        return result;
    };
}

if(!Array.prototype.propValues){
    Array.prototype.propValues = function(propName) {
        var result = [];
        for (var i = 0; i < this.length; i++) {
            result.push(this[i][propName]);
        }
        return result;
    };
}