/**
 * Nova Creator Boostrap Data Grid Extension: exporter
 *
 */

(function ($) {
    'use strict'; // jshint ignore:line

    var TYPE_NAME = {
        json: 'JSON',
        xml: 'XML',
        png: 'PNG',
        csv: 'CSV',
        txt: 'TXT',
        sql: 'SQL',
        doc: 'MS-Word',
        excel: 'MS-Excel',
        powerpoint: 'MS-Powerpoint',
        pdf: 'PDF'
    };

    $.extend($.fn.tablear.Constructor.defaults, {
        showExport: false,
        exportDataType: 'basic', // basic, all, selected
        // 'json', 'xml', 'png', 'csv', 'txt', 'sql', 'doc', 'excel', 'powerpoint', 'pdf'
        exportTypes: ['json', 'xml', 'csv', 'txt', 'sql', 'excel'],
        exportOptions: {}
    });
    $.extend($.fn.tablear.Constructor.defaults.css, {
        exportIcon: 'glyphicon-export icon-share'
    });

    $.extend($.fn.tablear.Constructor.locales, {
        formatExport: function () {
            return 'Export data';
        }
    });
    $.extend($.fn.tablear.Constructor.defaults.locales, $.fn.tablear.Constructor.locales);

    var _initExtensionsToolbar = $.fn.tablear.Constructor.prototype.initExtensionsToolbar;
    $.fn.tablear.Constructor.prototype.initExtensionsToolbar = function () {
        this.showToolbar = this.options.showExport;
        _initExtensionsToolbar.apply(this, Array.prototype.slice.apply(arguments));
        if(this.options.showExport) {
            var that = this;
            var $export = this.$extensionsToolbar.find('div.export');
            if(!$export.length) {
                $export = $([
                    '<div class="export btn-group">',
                        '<button class="btn btn-default' +
                            sprintf(' btn-%s', this.options.css.iconSize) +
                            ' dropdown-toggle" ' +
                            'title="' + this.options.locales.formatExport() + '" ' +
                            'data-toggle="dropdown" type="button">',
                            sprintf('<i class="%s %s"></i> ', this.options.css.icon, this.options.css.exportIcon),
                            '<span class="caret"></span>',
                        '</button>',
                        '<ul class="dropdown-menu" role="menu">',
                        '</ul>',
                    '</div>'].join('')).appendTo(this.$extensionsToolbar);

                var $menu = $export.find('.dropdown-menu');
                var exportTypes = this.options.exportTypes;

                if(typeof this.options.exportTypes === 'string') {
                    var types = this.options.exportTypes.slice(1, -1).replace(/ /g, '').split(',');
                    exportTypes = [];
                    $.each(types, function (i, value) {
                        exportTypes.push(value.slice(1, -1));
                    });
                }
                $.each(exportTypes, function (i, type) {
                    if (TYPE_NAME.hasOwnProperty(type)) {
                        $menu.append(['<li data-type="' + type + '">',
                                '<a href="javascript:void(0)">',
                                    TYPE_NAME[type],
                                '</a>',
                            '</li>'].join(''));
                    }
                });

                $menu.find('li').click(function () {
                    var type = $(this).data('type');
                    var doExport = function () {
						that.$element.tableExport($.extend({}, that.options.exportOptions, {
							type: type,
							escape: false
						}));
					};

                    if(that.options.exportDataType === 'all' && that.options.pagination) {
                        that.$element.one(that.options.sidePagination === 'server' ? 'post-body.bs.table' : 'page-change.bs.table', function() {
                            doExport();
                            that.togglePagination();
                        });
                        that.togglePagination();
                    } else if (that.options.exportDataType === 'selected') {
                        var data = that.getData();
						var selectedData = that.getAllSelections();
                        that.load(selectedData);
                        doExport();
                        that.load(data);
                    } else {
                        doExport();
                    }
                });
            }
        }
    };
})(jQuery);