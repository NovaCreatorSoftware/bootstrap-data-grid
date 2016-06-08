/**
 * Nova Creator Boostrap Data Grid Extension: editable
 *
 */

(function ($) {
    'use strict';

    $.extend($.fn.tablear.Constructor.defaults, {
        editable: true,
        onEditableInit: function () {
            return false;
        },
        onEditableSave: function (field, row, oldValue, $el) {
            return false;
        },
        onEditableShown: function (field, row, $el, editable) {
            return false;
        },
        onEditableHidden: function (field, row, $el, reason) {
            return false;
        }
    });

    $.extend($.fn.tablear.Constructor.EVENTS, {
        'editable-init.bs.table': 'onEditableInit',
        'editable-save.bs.table': 'onEditableSave',
        'editable-shown.bs.table': 'onEditableShown',
        'editable-hidden.bs.table': 'onEditableHidden'
    });

    var _initHeader = $.fn.tablear.Constructor.prototype.initHeader;
    $.fn.tablear.Constructor.prototype.initHeader = function () {
        var that = this;
        _initHeader.apply(this, Array.prototype.slice.apply(arguments));

        if(!this.options.editable) {
            return;
        }

        $.each(this.columns, function (i, column) {
            if(!column.editable) {
                return;
            }

            var editableOptions = {}, editableDataMarkup = [], editableDataPrefix = 'editable-';

            var processDataOptions = function(key, value) {
              // Replace camel case with dashes.
              var dashKey = key.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
              if (dashKey.slice(0, editableDataPrefix.length) == editableDataPrefix) {
                var dataKey = dashKey.replace(editableDataPrefix, 'data-');
                editableOptions[dataKey] = value;
              }
            };

            $.each(that.options, processDataOptions);

            var _formatter = column.formatter;
            column.formatter = function (value, row, index) {
                var result = _formatter ? _formatter(value, row, index) : value;

                $.each(column, processDataOptions);

                $.each(editableOptions, function (key, value) {
                    editableDataMarkup.push(' ' + key + '="' + value + '"');
                });

                return ['<a href="javascript:void(0)"',
                    ' data-name="' + column.field + '"',
                    ' data-pk="' + row.id + '"',
                    ' data-value="' + /*result +*/ 'caca"',
                    editableDataMarkup.join(''),
                    '>' + '</a>'
                ].join('');
            };
        });

        setTimeout(function() {
            that.initSecond();            
        }, 1000); //TODO mcm pune-l dupa ce a terminat de desenat tot
    };

    $.fn.tablear.Constructor.prototype.initSecond = function () {
        var that = this;
        _initHeader.apply(this, Array.prototype.slice.apply(arguments));

        if(!this.options.editable) {
            return;
        }

        $.each(this.columns, function (i, column) {
            if(!column.editable) {
                return;
            }

            that.$element.find('a[data-name="' + column.field + '"]').editable(column.editable)
                .off('save').on('save', function (e, params) {
                    //var data = that.getData();
                    //var data = that.columns;
                    //var index = $(this).parents('tr[data-index]').data('index');
                    //var row = data[index];
                    //var oldValue = row[column.field];

                    $(this).data('value', params.submitValue);
                    //row[column.field] = params.submitValue;
                    //that.trigger('editable-save', column.field, row, oldValue, $(this));
                });
            that.$element.find('a[data-name="' + column.field + '"]').editable(column.editable)
                .off('shown').on('shown', function (e, editable) {
                    //var data = that.getData();
                    //var data = that.columns;
                    //var index = $(this).parents('tr[data-index]').data('index');
                    //var row = data[index];
                    
                    //that.trigger('editable-shown', column.field, row, $(this), editable);
                });
            that.$element.find('a[data-name="' + column.field + '"]').editable(column.editable)
                .off('hidden').on('hidden', function (e, reason) {
                    //var data = that.getData();
                    //var data = that.columns;
                    //var index = $(this).parents('tr[data-index]').data('index');
                    //var row = data[index];
                    
                    //that.trigger('editable-hidden', column.field, row, $(this), reason); //TODO 
                });
        });
        //this.trigger('editable-init');
    };
})(jQuery);