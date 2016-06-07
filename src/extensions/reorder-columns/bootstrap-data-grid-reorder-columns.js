/**
 * Nova Creator Boostrap Data Grid Extension: reorder-columns
 *
 */

(function ($) {
    'use strict';

    $.extend($.fn.tablear.Constructor.defaults, {
        reorderableColumns: false,
        maxMovingRows: 10,
        onReorderColumn: function (headerFields) {
            return false;
        },
        dragaccept: null
    });

    $.extend($.fn.tablear.Constructor.EVENTS, {
        'reorder-column.bs.table': 'onReorderColumn'
    });

    var _initHeader = $.fn.tablear.Constructor.prototype.initHeader;
    var _toggleColumn = $.fn.tablear.Constructor.prototype.toggleColumn;
    var _toggleView = $.fn.tablear.Constructor.prototype.toggleView;
    var _resetView = $.fn.tablear.Constructor.prototype.resetView;

    $.fn.tablear.Constructor.prototype.initHeader = function () {
        _initHeader.apply(this, Array.prototype.slice.apply(arguments));
        if(!this.options.reorderableColumns) {
            return;
        }
        this.makeColumnsReorderable();
    };

    $.fn.tablear.Constructor.prototype.toggleColumn = function () {
        _toggleColumn.apply(this, Array.prototype.slice.apply(arguments));
        if(!this.options.reorderableColumns) {
            return;
        }

        this.makeColumnsReorderable();
    };

    $.fn.tablear.Constructor.prototype.toggleView = function () {
        _toggleView.apply(this, Array.prototype.slice.apply(arguments));
        if(!this.options.reorderableColumns) {
            return;
        }

        if(this.options.cardView) {
            return;
        }

        this.makeColumnsReorderable();
    };

    $.fn.tablear.Constructor.prototype.resetView = function () {
       // _resetView.apply(this, Array.prototype.slice.apply(arguments));
        if(!this.options.reorderableColumns) {
            return;
        }

        this.makeColumnsReorderable();
    };

    $.fn.tablear.Constructor.prototype.makeColumnsReorderable = function () {
        var that = this;
        try {
            $(this.$element).dragtable('destroy');
        } catch (e) {}
        $(this.$element).dragtable({
            maxMovingRows: that.options.maxMovingRows,
            dragaccept: that.options.dragaccept,
            clickDelay:200,
            beforeStop: function() {
                var ths = [],
                    formatters = [],
                    columns = [],
                    columnsHidden = [],
                    columnIndex = -1;
                that.$header.find('th').each(function (i) {
                    ths.push($(this).data('field'));
                    formatters.push($(this).data('formatter'));
                });

                //Exist columns not shown
                if (ths.length < that.columns.length) {
                    columnsHidden = $.grep(that.columns, function (column) {
                       return !column.visible;
                    });
                    for (var i = 0; i < columnsHidden.length; i++) {
                        ths.push(columnsHidden[i].field);
                        formatters.push(columnsHidden[i].formatter);
                    }
                }

                for (var i = 0; i < ths.length; i++ ) {
                    columnIndex = getFieldIndex(that.columns, ths[i]);
                    if (columnIndex !== -1) {
                        columns.push(that.columns[columnIndex]);
                        that.columns.splice(columnIndex, 1);
                    }
                }

                that.columns = that.columns.concat(columns);
                that.header.fields = ths;
                that.header.formatters = formatters;
                that.resetView();
                //that.trigger('reorder-column', ths);
            }
        });
    };
})(jQuery);