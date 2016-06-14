/**
 * Nova Creator Boostrap Data Grid Extension: editable
 *
 */

(function ($) {
    'use strict'; // jshint ignore:line

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

    var _initExtension = $.fn.tablear.Constructor.prototype.initExtension;
    $.fn.tablear.Constructor.prototype.initExtension = function () {
        var that = this;
        _initExtension.apply(this, Array.prototype.slice.apply(arguments));

        if(!this.options.editable) {
            return;
        }

        $.each(this.columns, function (i, column) {
            if(!column.editable) {
                return;
            }

            var editableOptions = {};
            var editableDataMarkup = [];
            var editableDataPrefix = 'editable-';

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
                //var result = _formatter ? _formatter(value, row, index) : value;
                var result = row[value.field];

                $.each(column, processDataOptions);

                $.each(editableOptions, function (key, value) {
                    editableDataMarkup.push(' ' + key + '="' + value + '"');
                });

                return ['<a href="javascript:void(0)"',
                    ' data-name="' + column.field + '"',
                    ' data-pk="' + row.id + '"',
                    ' data-value="' + result + '"',
                    editableDataMarkup.join(''),
                    '>' + '</a>'
                ].join('');
            };
        });
    };

    var _afterRowsRendered = $.fn.tablear.Constructor.prototype.afterRowsRendered;
    $.fn.tablear.Constructor.prototype.afterRowsRendered = function () {
        var that = this;
        _afterRowsRendered.apply(this, Array.prototype.slice.apply(arguments));

        if(!this.options.editable) {
            return;
        }

        $.each(this.columns, function(i, column) {
            if(!column.editable) {
                return;
            }

            that.$element.find('a[data-name="' + column.field + '"]').editable(column.editable)
                .off('save').on('save', that, function(e, params) {
                    var Grid = e.data;
                    var columnId = $(e.currentTarget).data('name');
                    var column = Grid.getColumnById(columnId);
                    var row = Grid.getRowById($(e.currentTarget).data('pk'));
                    $(this).data('value', params.submitValue);
                    row[columnId] = params.submitValue;
                });
            that.$element.find('a[data-name="' + column.field + '"]').editable(column.editable)
                .off('shown').on('shown', that, function(e, editable) {});
            that.$element.find('a[data-name="' + column.field + '"]').editable(column.editable)
                .off('hidden').on('hidden', that, function(e, reason) {});
        });
    };
})(jQuery);