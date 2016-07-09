/**
 * Nova Creator Boostrap Data Grid Extension: reorder-rows
 *
 */

(function($) {
    'use strict'; // jshint ignore:line

    var isSearch = false;

    var rowAttr = function(row, index) {
        return {
            id: 'customId_' + index
        };
    };

    $.extend($.fn.tablear.Constructor.defaults, {
        reorderableRows: false,
        onDragStyle: null,
        onDropStyle: null,
        onDragClass: "reorder_rows_onDragClass",
        dragHandle: null,
        useRowAttrFunc: false,
        onReorderRowsDrag: function(table, row) {
            return false;
        },
        onReorderRowsDrop: function(table, row, newOrder) {
            return false;
        }
    });

    var _initHeader = $.fn.tablear.Constructor.prototype.initHeader;
    var _initSearch = $.fn.tablear.Constructor.prototype.initSearch;
    $.fn.tablear.Constructor.prototype.initHeader = function() {
        _initHeader.apply(this, Array.prototype.slice.apply(arguments));
        if(!this.options.reorderableRows) {
            return;
        }
        var that = this;
        if(this.options.useRowAttrFunc) {
            this.options.rowAttributes = rowAttr;
        }
        setTimeout(function() {
           that.makeRowsReorderable();
        }, 100);
        that.$element.on("load.rs.novacreator.bootstrap.datagrid", function() {
        	setTimeout(function() {
        		that.makeRowsReorderable();
        	}, 100);
        });
    };

    $.fn.tablear.Constructor.prototype.initSearch = function() {
        _initSearch.apply(this, Array.prototype.slice.apply(arguments));
        if(!this.options.reorderableRows) {
            return;
        }

        //Known issue after search if you reorder the rows the data is not display properly
        //isSearch = true;
    };

    $.fn.tablear.Constructor.prototype.onDrop = function(table, droppedRow) {
        //Call the user defined function
    	var newOrder = $.map($(table).find("tbody tr"), function (val) {
            //MCM commented return ($(val).data('level') + val.id).replace(/\s/g, '');
        	return +$(val).data('row-id');
        });
        $(table).data(".rs.novacreator.bootstrap.datagrid").options.onReorderRowsDrop.apply(table, [table, droppedRow, newOrder]);
    };
    
    $.fn.tablear.Constructor.prototype.makeRowsReorderable = function() {
        var that = this;
        this.$element.tableDnD({
            onDragStyle: that.options.onDragStyle,
            onDropStyle: that.options.onDropStyle,
            onDragClass: that.options.onDragClass,
            onDrop: that.onDrop,
            onDragStart: that.options.onReorderRowsDrag,
            dragHandle: that.options.dragHandle
        });
    };
})(jQuery);