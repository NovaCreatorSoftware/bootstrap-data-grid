/*! 
 * Nova Creator Bootstrap Datagrid v1.0.0 - 07/09/2016
 * Copyright (c) 2015-2016 Nova Creator Software (https://github.com/NovaCreatorSoftware/bootstrap-data-grid)
 * Licensed under MIT http://www.opensource.org/licenses/MIT
 */
;(function ($, window, undefined)
{
    /*jshint validthis: true */
    "use strict";

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

// GRID INTERNAL FIELDS
// ====================

var namespace = ".rs.novacreator.bootstrap.datagrid";

// GRID INTERNAL FUNCTIONS
// =====================

// it only does '%s', and return '' when arguments are undefined
function sprintf(str) {
    var args = arguments;
    var flag = true;
    var i = 1;
    str = str.replace(/%s/g, function() {
        var arg = args[i++];
        if(typeof arg === 'undefined') {
            flag = false;
            return '';
        }
        return arg;
    });
    return flag ? str : '';
}

function objectKeys() {
    if(!Object.keys) {
        Object.keys = (function() {
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            var hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString');
            var dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];
            var dontEnumsLength = dontEnums.length;

            return function(obj) {
                if(typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                    throw new TypeError('Object.keys called on non-object');
                }

                var result = [];
                for(var prop in obj) {
                    if(hasOwnProperty.call(obj, prop)) {
                        result.push(prop);
                    }
                }

                if(hasDontEnumBug) {
                    for(var i = 0; i < dontEnumsLength; i++) {
                        if(hasOwnProperty.call(obj, dontEnums[i])) {
                            result.push(dontEnums[i]);
                        }
                    }
                }
                return result;
            };
        }());
    }
}

function appendRow(row) {
    var that = this;
    function exists(item) {
        return that.identifier && item[that.identifier] === row[that.identifier];
    }

    if(!this.rows.contains(exists)) {
        this.rows.push(row);
        return true;
    }

    return false;
}

function findFooterAndHeaderItems(selector) {
    return $.merge((this.footer) ? this.footer.find(selector) : $(), (this.header) ? this.header.find(selector) : $());
}

function getParams(context) {
    return (context) ? $.extend({}, this.cachedParams, { ctx: context }) : this.cachedParams;
}

function getRequest() {
    var request = {
        current: this.current,
        rowCount: this.rowCount,
        sort: this.sortDictionary,
        searchPhrase: this.searchPhrase
    };
    var post = this.options.post;
    post = ($.isFunction(post)) ? post() : post;
    return this.options.requestHandler($.extend(true, request, post));
}

function getCssSelector(css) {
    return "." + $.trim(css).replace(/\s+/gm, ".");
}

function getUrl() {
    var url = this.options.url;
    return ($.isFunction(url)) ? url() : url;
}

function highlightAppendedRows(rows) {
    if(this.options.highlightRows) {
        //TODO
    }
}

function isVisible(column) {
    return column.visible;
}

function loadColumns() {
    var that = this;
    var firstHeadRow = this.$element.find("thead > tr").first();
    var sorted = false;

    firstHeadRow.children().each(function() {
        var $this = $(this);
        var data = $this.data();
        var column = $.extend({}, data, {
            id: data.columnId,
            field: data.columnId,
            identifier: that.identifier == null && data.identifier || false,
            converter: that.options.converters[data.converter || data.type] || that.options.converters["string"],
            text: $this.text(),
            align: data.align || "left",
            headerAlign: data.headerAlign || "left",
            cssClass: data.cssClass || "",
            headerCssClass: data.headerCssClass || "",
            formatter: that.options.formatters[data.formatter] || null,
            order: (!sorted && (data.order === "asc" || data.order === "desc")) ? data.order : null,
            searchable: data.searchable !== false, // default: true
            sortable: data.sortable !== false, // default: true
            visible: data.visible !== false, // default: true
            visibleInSelection: data.visibleInSelection !== false, // default: true
            width: ($.isNumeric(data.width)) ? data.width + "px" : 
                (typeof(data.width) === "string") ? data.width : null
        });
        that.columns.push(column);
        if(column.order != null) {
            that.sortDictionary[column.id] = column.order;
        }

        // Prevents multiple identifiers
        if(column.identifier) {
            that.identifier = column.id;
            that.converter = column.converter;
        }

        // ensures that only the first order will be applied in case of multi sorting is disabled
        if(!that.options.multiSort && column.order !== null) {
            sorted = true;
        }
    });
    /*jshint +W018*/
}

function renderInfos() {
    if(this.options.navigation !== 0) {
        var selector = getCssSelector(this.options.css.infos);
        var infoItems = findFooterAndHeaderItems.call(this, selector);

        if(infoItems.length > 0) {
            var end = (this.current * this.rowCount);
            var infos = $(this.options.templates.infos.resolve(getParams.call(this, {
                end: (this.total === 0 || end === -1 || end > this.total) ? this.total : end,
                start: (this.total === 0) ? 0 : (end - this.rowCount + 1),
                total: this.total
            })));

            replacePlaceHolder.call(this, infoItems, infos);
        }
    }
}

function renderNoResultsRow() {
    var tbody = this.$element.children("tbody").first();
    var tpl = this.options.templates;
    var count = this.columns.where(isVisible).length;
    if(this.selection) {
        count++;
    }
    tbody.html(tpl.noResults.resolve(getParams.call(this, { columns: count })));
}

function setTotals(total) {
    this.total = total;
    this.totalPages = (this.rowCount === -1) ? 1 : Math.ceil(this.total / this.rowCount);
}

function renderPaginationItem(list, page, text, markerCss) {
    var that = this;
    var tpl = this.options.templates;
    var css = this.options.css;
    var values = getParams.call(this, { css: markerCss, text: text, page: page });
    var item = $(tpl.paginationItem.resolve(values)).on("click" + namespace, getCssSelector(css.paginationButton), function (e) {
        e.stopPropagation();
        e.preventDefault();
        var $this = $(this);
        var parent = $this.parent();
        if(!parent.hasClass("active") && !parent.hasClass("disabled")) {
            var commandList = {
                first: 1,
                prev: that.current - 1,
                next: that.current + 1,
                last: that.totalPages
            };
            var command = $this.data("page");
            that.current = commandList[command] || command;
            loadData.call(that);
        }
        $this.trigger("blur");
    });

    list.append(item);
    return item;
}

function renderPagination() {
    if(this.options.navigation !== 0) {
        var selector = getCssSelector(this.options.css.pagination);
        var paginationItems = findFooterAndHeaderItems.call(this, selector)._mcmShowAria(this.rowCount !== -1);

        if(this.rowCount !== -1 && paginationItems.length > 0) {
            var tpl = this.options.templates;
            var current = this.current;
            var totalPages = this.totalPages;
            var pagination = $(tpl.pagination.resolve(getParams.call(this)));
            var offsetRight = totalPages - current;
            var offsetLeft = (this.options.padding - current) * -1;
            var startWith = ((offsetRight >= this.options.padding) ?
                Math.max(offsetLeft, 1) :
                Math.max((offsetLeft - this.options.padding + offsetRight), 1));
            var maxCount = this.options.padding * 2 + 1;
            var count = (totalPages >= maxCount) ? maxCount : totalPages;

            renderPaginationItem.call(this, pagination, "first", "&laquo;", "first")._mcmEnableAria(current > 1);
            renderPaginationItem.call(this, pagination, "prev", "&lt;", "prev")._mcmEnableAria(current > 1);

            for(var i = 0; i < count; i++) {
                var pos = i + startWith;
                renderPaginationItem.call(this, pagination, pos, pos, "page-" + pos)._mcmEnableAria()._mcmSelectAria(pos === current);
            }

            if(count === 0) {
                renderPaginationItem.call(this, pagination, 1, 1, "page-" + 1)._mcmEnableAria(false)._mcmSelectAria();
            }

            renderPaginationItem.call(this, pagination, "next", "&gt;", "next")._mcmEnableAria(totalPages > current);
            renderPaginationItem.call(this, pagination, "last", "&raquo;", "last")._mcmEnableAria(totalPages > current);

            replacePlaceHolder.call(this, paginationItems, pagination);
        }
    }
}

function loadData() { // jshint ignore:line
    var that = this;
    this.$element._mcmBusyAria(true).trigger("load" + namespace);
    showLoading.call(this);

    function containsPhrase(row) {
        var searchPattern = new RegExp(that.searchPhrase, (that.options.caseSensitive) ? "g" : "gi");
        for(var i = 0; i < that.columns.length; i++) {
            var column = that.columns[i];
            var value = column.converter.to(row[column.id]);
            if(column.searchable && column.visible && value && value.search(searchPattern) > -1) {
                return true;
            }
        }
        return false;
    }

    function filterRow(row) {
        for(var i = 0; i < that.columns.length; i++) {
            var column = that.columns[i];
            var value = column.converter.to(row[column.id]);
            if(column.showFilter) {
                var filterPattern = new RegExp(column.filterValue, (that.options.caseSensitive) ? "g" : "gi");
                if(value && value.search(filterPattern) <= -1) {
                    return false;
                }
            }
        }
        return true;
    }

    function update(rows, total) {
        that.currentRows = rows;
        setTotals.call(that, total);

        if(!that.options.keepSelection) {
            that.selectedRows = [];
        }

        renderRows.call(that, rows);
        renderInfos.call(that);
        renderPagination.call(that);

        that.$element._mcmBusyAria(false).trigger("loaded" + namespace);
    }

    if(this.options.ajax) {
        var request = getRequest.call(this);
        var url = getUrl.call(this);

        if(url == null || typeof url !== "string" || url.length === 0) {
            throw new Error("Url setting must be a none empty string or a function that returns one.");
        }

        // aborts the previous ajax request if not already finished or failed
        if(this.xqr) {
            this.xqr.abort();
        }

        var settings = {
            url: url,
            data: request,
            success: function(response) {
                that.xqr = null;
                if(typeof (response) === "string") {
                    response = $.parseJSON(response);
                }

                response = that.options.responseHandler(response);
                that.current = response.current;
                update(response.rows, response.total);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                that.xqr = null;

                if(textStatus !== "abort") {
                    renderNoResultsRow.call(that); // overrides loading mask
                    that.$element._mcmBusyAria(false).trigger("loaded" + namespace);
                }
            }
        };
        settings = $.extend(this.options.ajaxSettings, settings);
        this.xqr = $.ajax(settings);
    } else {
        var rows = (this.searchPhrase.length > 0) ? this.rows.where(containsPhrase) : this.rows;
        rows = rows.where(filterRow);
        var total = rows.length;
        if(this.rowCount !== -1) {
            rows = rows.page(this.current, this.rowCount);
        }

        // todo: improve the following comment
        // setTimeout decouples the initialization so that adding event handlers happens before
        window.setTimeout(function () { update(rows, total); }, 10);
    }
}

function _sortOrder(order, value) {
    return (order === "asc") ? value : value * -1;
}
function sortRows() {
    var sortArray = [];

    function _sort(x, y, current) {
        current = current || 0;
        var next = current + 1;
        var item = sortArray[current];

        return (x[item.id] > y[item.id]) ? _sortOrder(item.order, 1) :
            (x[item.id] < y[item.id]) ? _sortOrder(item.order, -1) :
                (sortArray.length > next) ? _sort(x, y, next) : 0;
    }

    if(!this.options.ajax) {
        var that = this;
        for(var key in this.sortDictionary) {
            if(this.options.multiSort || sortArray.length === 0) {
                sortArray.push({
                    id: key,
                    order: this.sortDictionary[key]
                });
            }
        }

        if(sortArray.length > 0) {
            this.rows.sort(_sort);
        }
    }
}

function loadRows() {
    if(!this.options.ajax) {
        var that = this;
        var rows = this.$element.find("tbody > tr");
        rows.each(function () {
            var $this = $(this);
            var cells = $this.children("td");
            var row = {};
            $.each(that.columns, function (i, column) {
                row[column.id] = column.converter.from(cells.eq(i).text());
            });
            appendRow.call(that, row);
        });

        setTotals.call(this, this.rows.length);
        sortRows.call(this);
    }
}

function prepareTable() {
    var tpl = this.options.templates;
    var wrapper = (this.$element.parent().hasClass(this.options.css.responsiveTable)) ?
            this.$element.parent() : this.$element;
    this.$element.addClass(this.options.css.table);

    // checks whether there is an tbody element; otherwise creates one
    if(this.$element.children("tbody").length === 0) {
        this.$element.append(tpl.body);
    }

    if(this.options.navigation & 1) {
        this.header = $(tpl.header.resolve(getParams.call(this, { id: this.$element._mcmId() + "-header" })));
        wrapper.before(this.header);
    }

    if(this.options.navigation & 2) {
        this.footer = $(tpl.footer.resolve(getParams.call(this, { id: this.$element._mcmId() + "-footer" })));
        wrapper.after(this.footer);
    }
}

function renderColumnSelection(actions) {
    if(this.options.columnSelection && this.columns.length > 1) {
        var that = this;
        var css = this.options.css;
        var tpl = this.options.templates;
        var icon = tpl.icon.resolve(getParams.call(this, { iconCss: css.iconColumns }));
        var dropDown = $(tpl.actionDropDown.resolve(getParams.call(this, { content: icon })));
        var selector = getCssSelector(css.dropDownItem);
        var checkboxSelector = getCssSelector(css.dropDownItemCheckbox);
        var itemsSelector = getCssSelector(css.dropDownMenuItems);

        $.each(this.columns, function(i, column) {
            if(column.visibleInSelection) {
                var item = $(tpl.actionDropDownCheckboxItem.resolve(getParams.call(that,
                    { name: column.id, label: column.text, checked: column.visible }))).
                        on("click" + namespace, selector, function(e) {
                            e.stopPropagation();
                            var $this = $(this);
                            var checkbox = $this.find(checkboxSelector);
                            if(!checkbox.prop("disabled")) {
                                column.visible = checkbox.prop("checked");
                                var enable = that.columns.where(isVisible).length > 1;
                                $this.parents(itemsSelector).find(selector + ":has(" + checkboxSelector + ":checked)").
                                    _mcmEnableAria(enable).find(checkboxSelector)._mcmEnableField(enable);
    
                                that.$element.find("tbody").empty(); // Fixes an column visualization bug
                                renderTableHeader.call(that);
                                loadData.call(that);
                            }
                        });
                dropDown.find(getCssSelector(css.dropDownMenuItems)).append(item);
            }
        });
        actions.append(dropDown);
    }
}

function _getText(value, allLabels) {
    return (value === -1) ? allLabels : value;
}
function renderRowCountSelection(actions) {
    var that = this;
    var allLabels = that.options.locales.all;
    var rowCountList = this.options.rowCount;

    if($.isArray(rowCountList)) {
        var css = this.options.css;
        var tpl = this.options.templates;
        var dropDown = $(tpl.actionDropDown.resolve(getParams.call(this, { content: _getText(this.rowCount, allLabels) })));
        var menuSelector = getCssSelector(css.dropDownMenu);
        var menuTextSelector = getCssSelector(css.dropDownMenuText);
        var menuItemsSelector = getCssSelector(css.dropDownMenuItems);
        var menuItemSelector = getCssSelector(css.dropDownItemButton);

        $.each(rowCountList, function(index, value) {
            var item = $(tpl.actionDropDownItem.resolve(getParams.call(that,{ text: _getText(value, allLabels), action: value }))).
                _mcmSelectAria(value === that.rowCount).on("click" + namespace, menuItemSelector, function (e) {
                    e.preventDefault();
                    var $this = $(this);
                    var newRowCount = $this.data("action");
                    if(newRowCount !== that.rowCount) {
                        // todo: sophisticated solution needed for calculating which page is selected
                        that.current = 1; // that.rowCount === -1 ---> All
                        that.rowCount = newRowCount;
                        $this.parents(menuItemsSelector).children().each(function () {
                            var $item = $(this);
                            var currentRowCount = $item.find(menuItemSelector).data("action");
                            $item._mcmSelectAria(currentRowCount === newRowCount);
                        });
                        $this.parents(menuSelector).find(menuTextSelector).text(_getText(newRowCount, allLabels));
                        loadData.call(that);
                    }
                });
            dropDown.find(menuItemsSelector).append(item);
        });
        actions.append(dropDown);
    }
}

function renderRows(rows) { // jshint ignore:line
    if(rows.length > 0) {
        var that = this;
        var css = this.options.css;
        var tpl = this.options.templates;
        var tbody = this.$element.children("tbody").first();
        var allRowsSelected = true;
        var html = "";

        $.each(rows, function(index, row) {
            var cells = "";
            var rowAttr = " data-row-id=\"" + ((that.identifier == null) ? index : row[that.identifier]) + "\"";
            var rowCss = "";

            if(that.selection) {
                var selected = ($.inArray(row[that.identifier], that.selectedRows) !== -1);
                var selectBox = tpl.select.resolve(getParams.call(that,
                        { type: "checkbox", value: row[that.identifier], checked: selected }));
                cells += tpl.cell.resolve(getParams.call(that, { content: selectBox, css: css.selectCell, style: 'selectCellTdStyle' }));
                allRowsSelected = (allRowsSelected && selected);
                if(selected) {
                    rowCss += css.selected;
                    rowAttr += " aria-selected=\"true\"";
                }
            }

            var colorClass = row.colorIndex != null && that.options.colorMapping[row.colorIndex];
            if(colorClass) {
                rowCss += colorClass;
            }

            $.each(that.columns, function (j, column) {
                if(column.visible) {
                    var value = ($.isFunction(column.formatter)) ?
                        column.formatter.call(that, column, row) : column.converter.to(row[column.id]);
                    var cssClass = (column.cssClass.length > 0) ? " " + column.cssClass : "";
                    cells += tpl.cell.resolve(getParams.call(that, {
                        content: (value == null || value === "") ? "&nbsp;" : value,
                        css: ((column.align === "right") ? css.right : (column.align === "center") ?
                            css.center : css.left) + cssClass,
                        style: (column.width == null) ? "" : "width:" + column.width + ";" }));
                }
            });

            if(rowCss.length > 0) {
                rowAttr += " class=\"" + rowCss + "\"";
            }
            html += tpl.row.resolve(getParams.call(that, { attr: rowAttr, cells: cells }));
        });

        // sets or clears multi selectbox state
        that.$element.find("thead " + getCssSelector(that.options.css.selectBox)).prop("checked", allRowsSelected);
        tbody.html(html);
        registerRowEvents.call(this, tbody);
        this.afterRowsRendered();
    } else {
        renderNoResultsRow.call(this);
    }
}

function registerRowEvents(tbody) { // jshint ignore:line
    var that = this;
    var selectBoxSelector = getCssSelector(this.options.css.selectBox);

    if(this.selection) {
        tbody.off("click" + namespace, selectBoxSelector).on("click" + namespace, selectBoxSelector, function(e) {
            e.stopPropagation();
            var $this = $(this);
            var id = that.converter.from($this.val());

            if($this.prop("checked")) {
                that.select([id]);
            } else {
                that.deselect([id]);
            }
        });
    }

    tbody.off("click" + namespace, "> tr").on("click" + namespace, "> tr", function(e) {
        if($(e.target).is("td")) { //don't trigger on links and stuff
            e.stopPropagation();
            var $this = $(this);
            var id = (that.identifier == null) ? $this.data("row-id") : that.converter.from($this.data("row-id") + "");
            var row = (that.identifier == null) ? that.currentRows[id] :
                that.currentRows.first(function (item) { return item[that.identifier] === id; });
            if(that.selection && that.options.rowSelect) {
                if($this.hasClass(that.options.css.selected)) {
                    that.deselect([id]);
                } else {
                    that.select([id]);
                }
            }
            that.$element.trigger("click" + namespace, [that.columns, row]);
        }
    });
}

function renderActions() {
    if(this.options.navigation !== 0) {
        var css = this.options.css;
        var actionItems = findFooterAndHeaderItems.call(this, getCssSelector(css.actions));

        var tpl = this.options.templates;
        if(actionItems.length > 0) {
            var that = this;
            var actions = $(tpl.actions.resolve(getParams.call(this)));

            // Refresh Button
            if(this.options.ajax) {
                var refreshIcon = tpl.icon.resolve(getParams.call(this, { iconCss: css.iconRefresh }));
                var refresh = $(tpl.actionButton.resolve(getParams.call(this,
                    { content: refreshIcon, text: this.options.locales.refresh }))).
                        on("click" + namespace, function(e) {
                            // todo: prevent multiple fast clicks (fast click detection)
                            e.stopPropagation();
                            that.current = 1;
                            loadData.call(that);
                        });
                actions.append(refresh);
            }

            // Row count selection
            renderRowCountSelection.call(this, actions);

            // Column selection
            renderColumnSelection.call(this, actions);
            replacePlaceHolder.call(this, actionItems, actions);        
        }
        
        var extensionItems = findFooterAndHeaderItems.call(this, getCssSelector(css.extensions));
        var extensions = $(tpl.extensions.resolve(getParams.call(this)));
        replacePlaceHolder.call(this, extensionItems, extensions);
        this.initExtensionsToolbar();
    }
}

function renderSearchField() {
    if(this.options.navigation !== 0) {
        var css = this.options.css;
        var selector = getCssSelector(css.search);
        var searchItems = findFooterAndHeaderItems.call(this, selector);

        if(searchItems.length > 0) {
            var that = this;
            var tpl = this.options.templates;
            var timer = null; // fast keyup detection
            var currentValue = "";
            var searchFieldSelector = getCssSelector(css.searchField);
            var search = $(tpl.search.resolve(getParams.call(this)));
            var searchField = (search.is(searchFieldSelector)) ? search : search.find(searchFieldSelector);
            searchField.on("keyup" + namespace, function(e) {
                e.stopPropagation();
                var newValue = $(this).val();
                if(currentValue !== newValue || (e.which === 13 && newValue !== "")) {
                    currentValue = newValue;
                    if(e.which === 13 || newValue.length === 0 || newValue.length >= that.options.searchSettings.characters) {
                        window.clearTimeout(timer);
                        timer = window.setTimeout(function () {
                            executeSearch.call(that, newValue);
                        }, that.options.searchSettings.delay);
                    }
                }
            });

            replacePlaceHolder.call(this, searchItems, search);
        }
    }
}

function executeSearch(phrase) { // jshint ignore:line
    if(this.searchPhrase !== phrase) {
        this.current = 1;
        this.searchPhrase = phrase;
        loadData.call(this);
    }
}

function renderTableHeader() { // jshint ignore:line
    var that = this;
    var headerRow = this.$element.find("thead > tr");
    var css = this.options.css;
    var tpl = this.options.templates;
    var html = "";
    var sorting = this.options.sorting;
    if(this.selection) {
        var selectBox = (this.options.multiSelect) ?
            tpl.select.resolve(getParams.call(that, { type: "checkbox", value: "all" })) : "";
        html += tpl.rawHeaderCell.resolve(getParams.call(that, { content: selectBox, css: css.selectCell, style: 'selectCellThStyle' }));
    }

    $.each(this.columns, function(index, column) {
        if(column.visible) {
            var sortOrder = that.sortDictionary[column.id];
            var iconCss = ((sorting && sortOrder && sortOrder === "asc") ? css.iconUp :
                    (sorting && sortOrder && sortOrder === "desc") ? css.iconDown : "");
            var icon = tpl.icon.resolve(getParams.call(that, { iconCss: iconCss }));
            var align = column.headerAlign;
            var cssClass = (column.headerCssClass.length > 0) ? " " + column.headerCssClass : "";
            html += tpl.headerCell.resolve(getParams.call(that, {
                column: column, icon: icon, sortable: sorting && column.sortable && css.sortable || "",
                css: ((align === "right") ? css.right : (align === "center") ? css.center : css.left) + cssClass,
                style: (column.width == null) ? "" : "width:" + column.width + ";" }));
            }
    });

    headerRow.html(html);

    if(sorting) {
        var sortingSelector = getCssSelector(css.sortable);
        headerRow.off("click" + namespace, sortingSelector).on("click" + namespace, sortingSelector, function(e) {
            e.preventDefault();
            setTableHeaderSortDirection.call(that, $(this));
            sortRows.call(that);
            loadData.call(that);
        });
    }

    // todo: create a own function for that piece of code
    if(this.selection && this.options.multiSelect) {
        var selectBoxSelector = getCssSelector(css.selectBox);
        headerRow.off("click" + namespace, selectBoxSelector).on("click" + namespace, selectBoxSelector, function(e) {
            e.stopPropagation();
            if($(this).prop("checked")) {
                that.select();
            } else {
                that.deselect();
            }
        });
    }

    this.initHeader();
}

function setTableHeaderSortDirection(element) { // jshint ignore:line
    var css = this.options.css;
    var iconSelector = getCssSelector(css.icon);
    var columnId = element.data("column-id") || element.parents("th").first().data("column-id");
    var sortOrder = this.sortDictionary[columnId];
    var icon = element.find(iconSelector);
    if(!this.options.multiSort) {
        element.parents("tr").first().find(iconSelector).removeClass(css.iconDown + " " + css.iconUp);
        this.sortDictionary = {};
    }
    if(sortOrder && sortOrder === "asc") {
        this.sortDictionary[columnId] = "desc";
        icon.removeClass(css.iconUp).addClass(css.iconDown);
    } else if(sortOrder && sortOrder === "desc") {
        if(this.options.multiSort) {
            var newSort = {};
            for(var key in this.sortDictionary) {
                if(key !== columnId) {
                    newSort[key] = this.sortDictionary[key];
                }
            }
            this.sortDictionary = newSort;
            icon.removeClass(css.iconDown);
        } else {
            this.sortDictionary[columnId] = "asc";
            icon.removeClass(css.iconDown).addClass(css.iconUp);
        }
    } else {
        this.sortDictionary[columnId] = "asc";
        icon.addClass(css.iconUp);
    }
}

function replacePlaceHolder(placeholder, element) { // jshint ignore:line
    placeholder.each(function(index, item) {
        // todo: check how append is implemented. Perhaps cloning here is superfluous.
        $(item).before(element.clone(true)).remove();
    });
}

function showLoading() { // jshint ignore:line
    var that = this;
    window.setTimeout(function() {
        if(that.$element._mcmAria("busy") === "true") {
            var tpl = that.options.templates;
            var thead = that.$element.children("thead").first();
            var tbody = that.$element.children("tbody").first();
            var firstCell = tbody.find("tr > td").first();
            var padding = (that.$element.height() - thead.height()) - (firstCell.height() + 20);
            var count = that.columns.where(isVisible).length;

            if(that.selection) {
                count = count + 1;
            }
            tbody.html(tpl.loading.resolve(getParams.call(that, { columns: count })));
            if(that.rowCount !== -1 && padding > 0) {
                tbody.find("tr > td").css("padding", "20px 0 " + padding + "px");
            }
        }
    }, 250);
}

function isIEBrowser() {
    return !!(navigator.userAgent.indexOf("MSIE ") > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./));
}

function getFieldIndex(columns, field) {
    var index = -1;
    $.each(columns, function(i, column) {
        if(column.field === field) {
            index = i;
            return false;
        }
        return true;
    });
    return index;
}

function setFieldIndex(columns) {
    var i;
    var j;
    var k;
    var totalCol = 0;
    var flag = [];

    for(i = 0; i < columns[0].length; i++) {
        totalCol += columns[0][i].colspan || 1;
    }

    for(i = 0; i < columns.length; i++) {
        flag[i] = [];
        for(j = 0; j < totalCol; j++) {
            flag[i][j] = false;
        }
    }

    for(i = 0; i < columns.length; i++) {
        for(j = 0; j < columns[i].length; j++) {
            var r = columns[i][j];
            var rowspan = r.rowspan || 1;
            var colspan = r.colspan || 1;
            var index = $.inArray(false, flag[i]);

            if(colspan === 1) {
                r.fieldIndex = index;
                // when field is undefined, use index instead
                if(typeof r.field === 'undefined') {
                    r.field = index;
                }
            }

            for(k = 0; k < rowspan; k++) {
                flag[i + k][index] = true;
            }
            for(k = 0; k < colspan; k++) {
                flag[i][index + k] = true;
            }
        }
    }
}

function calculateObjectValue(self, name, args, defaultValue) {
    var func = name;
    if(typeof name === 'string') {
        // support obj.func1.func2
        var names = name.split('.');
        if(names.length > 1) {
            func = window;
            $.each(names, function (i, f) {
                func = func[f];
            });
        } else {
            func = window[name];
        }
    }
    if(typeof func === 'object') {
        return func;
    }
    if(typeof func === 'function') {
        return func.apply(self, args);
    }
    if(!func && typeof name === 'string' && sprintf.apply(this, [name].concat(args))) {
        return sprintf.apply(this, [name].concat(args));
    }
    return defaultValue;
}

function init() {
    this.$element.trigger("initialize" + namespace);
    loadColumns.call(this); // Loads columns from HTML thead tag
    this.selection = this.options.selection && this.identifier != null;
    loadRows.call(this); // Loads rows from HTML tbody tag if ajax is false
    prepareTable.call(this);
    renderTableHeader.call(this);
    renderSearchField.call(this);
    renderActions.call(this);
    loadData.call(this);
    this.initExtension();
    this.$element.trigger("initialized" + namespace);
    }

// GRID PUBLIC CLASS DEFINITION
// ====================

/**
 * Represents the Tablear Grid plugin.
 *
 * @class Grid
 * @constructor
 * @param element {Object} The corresponding DOM element.
 * @param options {Object} The options to override default settings.
 * @chainable
 **/
var Grid = function(element, options) {
    this.$element = $(element);
    this.origin = this.$element.clone();
    this.options = $.extend(true, {}, Grid.defaults, this.$element.data(), options);
    // overrides rowCount explicitly because deep copy ($.extend) leads to strange behaviour
    this.options.rowCount = this.$element.data().rowCount || options.rowCount || this.options.rowCount;
    this.columns = [];
    this.rowCount = ($.isArray(this.options.rowCount)) ? this.options.rowCount[0] : this.options.rowCount;
    this.rows = [];
    this.current = 1;
    this.currentRows = [];
    this.identifier = null; // The first column ID that is marked as identifier
    this.selection = false;
    this.converter = null; // The converter for the column that is marked as identifier
    this.searchPhrase = "";
    this.selectedRows = [];
    this.sortDictionary = {};
    this.total = 0;
    this.totalPages = 0;
    this.cachedParams = {
        lbl: this.options.locales,
        css: this.options.css,
        ctx: {}
    };
    this.header = null;
    this.footer = null;
    this.xqr = null;

    this.initLocale();
};

/**
 * An object that represents the default settings.
 *
 * @static
 * @class defaults
 * @for Grid
 * @example
 *   // Global approach
 *   $.tablear.defaults.selection = true;
 * @example
 *   // Initialization approach
 *   $("#tablear").tablear({ selection = true });
 **/
Grid.defaults = {
    navigation: 3, // it's a flag: 0 = none, 1 = top, 2 = bottom, 3 = both (top and bottom)
    padding: 2, // page padding (pagination)
    columnSelection: true,
    rowCount: [ 10, 25, 50, -1 ], // rows per page int or array of int (-1 represents "All")

    /**
     * Enables row selection (to enable multi selection see also `multiSelect`). Default value is `false`.
     *
     * @property selection
     * @type Boolean
     * @default false
     * @for defaults
     * @since 1.0.0
     **/
    selection: false,

    /**
     * Enables multi selection (`selection` must be set to `true` as well). Default value is `false`.
     *
     * @property multiSelect
     * @type Boolean
     * @default false
     * @for defaults
     * @since 1.0.0
     **/
    multiSelect: false,

    /**
     * Enables entire row click selection (`selection` must be set to `true` as well). Default value is `false`.
     *
     * @property rowSelect
     * @type Boolean
     * @default false
     * @for defaults
     * @since 1.0.0
     **/
    rowSelect: false,

    /**
     * Defines whether the row selection is saved internally on filtering, paging and sorting
     * (even if the selected rows are not visible).
     *
     * @property keepSelection
     * @type Boolean
     * @default false
     * @for defaults
     * @since 1.0.0
     **/
    keepSelection: false,

    highlightRows: false, // highlights new rows (find the page of the first new row)
    sorting: true,
    multiSort: false,

    /**
     * General search settings to configure the search field behaviour.
     *
     * @property searchSettings
     * @type Object
     * @for defaults
     * @since 1.0.0
     **/
    searchSettings: {
        /**
         * The time in milliseconds to wait before search gets executed.
         *
         * @property delay
         * @type Number
         * @default 250
         * @for searchSettings
         **/
        delay: 250,
        
        /**
         * The characters to type before the search gets executed.
         *
         * @property characters
         * @type Number
         * @default 1
         * @for searchSettings
         **/
        characters: 1
    },

    /**
     * Defines whether the data shall be loaded via an asynchronous HTTP (Ajax) request.
     *
     * @property ajax
     * @type Boolean
     * @default false
     * @for defaults
     **/
    ajax: false,

    /**
     * Ajax request settings that shall be used for server-side communication.
     * All setting except data, error, success and url can be overridden.
     * For the full list of settings go to http://api.jquery.com/jQuery.ajax/.
     *
     * @property ajaxSettings
     * @type Object
     * @for defaults
     * @since 1.0.0
     **/
    ajaxSettings: {
        /**
         * Specifies the HTTP method which shall be used when sending data to the server.
         * Go to http://api.jquery.com/jQuery.ajax/ for more details.
         * This setting is overriden for backward compatibility.
         *
         * @property method
         * @type String
         * @default "POST"
         * @for ajaxSettings
         **/
        method: "POST"
    },

    /**
     * Enriches the request object with additional properties. Either a `PlainObject` or a `Function`
     * that returns a `PlainObject` can be passed. Default value is `{}`.
     *
     * @property post
     * @type Object|Function
     * @default function (request) { return request; }
     * @for defaults
     * @deprecated Use instead `requestHandler`
     **/
    post: {}, // or use function () { return {}; } (reserved properties are "current", "rowCount", "sort" and "searchPhrase")

    /**
     * Sets the data URL to a data service (e.g. a REST service). Either a `String` or a `Function`
     * that returns a `String` can be passed. Default value is `""`.
     *
     * @property url
     * @type String|Function
     * @default ""
     * @for defaults
     **/
    url: "", // or use function () { return ""; }

    /**
     * Defines whether the search is case sensitive or insensitive.
     *
     * @property caseSensitive
     * @type Boolean
     * @default true
     * @for defaults
     * @since 1.0.0
     **/
    caseSensitive: true,

    // note: The following properties should not be used via data-api attributes

    /**
     * Transforms the JSON request object in whatever is needed on the server-side implementation.
     *
     * @property requestHandler
     * @type Function
     * @default function (request) { return request; }
     * @for defaults
     * @since 1.0.0
     **/
    requestHandler: function(request) { return request; },

    /**
     * Transforms the response object into the expected JSON response object.
     *
     * @property responseHandler
     * @type Function
     * @default function (response) { return response; }
     * @for defaults
     * @since 1.0.0
     **/
    responseHandler: function(response) { return response; },

    /**
     * A list of converters.
     *
     * @property converters
     * @type Object
     * @for defaults
     * @since 1.0.0
     **/
    converters: {
        numeric: {
            from: function (value) { return +value; }, // converts from string to numeric
            to: function (value) { return value + ""; } // converts from numeric to string
        },
        string: {
            // default converter
            from: function (value) { return value; },
            to: function (value) { return value; }
        }
    },

    /**
     * Contains all css classes.
     *
     * @property css
     * @type Object
     * @for defaults
     **/
    css: {
        actions: "actions btn-group", // must be a unique class name or constellation of class names within the header and footer
        extensions: "extensions btn-group", 
        center: "text-center",
        columnHeaderAnchor: "column-header-anchor", // must be a unique class name or constellation of class names within the column header cell
        columnHeaderText: "text",
        dropDownItem: "dropdown-item", // must be a unique class name or constellation of class names within the actionDropDown,
        dropDownItemButton: "dropdown-item-button", // must be a unique class name or constellation of class names within the actionDropDown
        dropDownItemCheckbox: "dropdown-item-checkbox", // must be a unique class name or constellation of class names within the actionDropDown
        dropDownMenu: "dropdown btn-group", // must be a unique class name or constellation of class names within the actionDropDown
        dropDownMenuItems: "dropdown-menu pull-right", // must be a unique class name or constellation of class names within the actionDropDown
        dropDownMenuText: "dropdown-text", // must be a unique class name or constellation of class names within the actionDropDown
        footer: "tablear-footer container-fluid",
        header: "tablear-header container-fluid",
        icon: "icon glyphicon",
        iconColumns: "glyphicon-th-list",
        iconDown: "glyphicon-chevron-down",
        iconRefresh: "glyphicon-refresh",
        iconSearch: "glyphicon-search",
        iconUp: "glyphicon-chevron-up",
        infos: "infos", // must be a unique class name or constellation of class names within the header and footer,
        left: "text-left",
        pagination: "pagination", // must be a unique class name or constellation of class names within the header and footer
        paginationButton: "button", // must be a unique class name or constellation of class names within the pagination
        iconToggle: 'glyphicon-list-alt icon-list-alt',
        iconDetailOpen: 'glyphicon-plus icon-plus',
        iconDetailClose: 'glyphicon-minus icon-minus',
        iconSize: undefined,
        
        /**
         * CSS class to select the parent div which activates responsive mode.
         *
         * @property responsiveTable
         * @type String
         * @default "table-responsive"
         * @for css
         * @since 1.0.0
         **/
        responsiveTable: "table-responsive",

        right: "text-right",
        search: "search form-group", // must be a unique class name or constellation of class names within the header and footer
        searchField: "search-field form-control",
        selectBox: "select-box", // must be a unique class name or constellation of class names within the entire table
        selectCell: "select-cell", // must be a unique class name or constellation of class names within the entire table

        /**
         * CSS class to highlight selected rows.
         *
         * @property selected
         * @type String
         * @default "active"
         * @for css
         * @since 1.0.0
         **/
        selected: "active",

        sortable: "sortable",
        table: "tablear-table table"
    },

    /**
     * A dictionary of formatters.
     *
     * @property formatters
     * @type Object
     * @for defaults
     * @since 1.0.0
     **/
    formatters: {},

    /**
     * Specifies the mapping between colorIndex (row.colorIndex) and contextual classes to color rows.
     *
     * @property colorMapping
     * @type Object
     * @for defaults
     * @since 1.0.0
     **/
    colorMapping: {
        /**
         * Specifies a successful or positive action.
         *
         * @property 0
         * @type String
         * @for colorMapping
         **/
        0: "success",

        /**
         * Specifies a neutral informative change or action.
         *
         * @property 1
         * @type String
         * @for colorMapping
         **/
        1: "info",

        /**
         * Specifies a warning that might need attention.
         *
         * @property 2
         * @type String
         * @for colorMapping
         **/
        2: "warning",
        
        /**
         * Specifies a dangerous or potentially negative action.
         *
         * @property 3
         * @type String
         * @for colorMapping
         **/
        3: "danger",
        
        4: "rowColorClass4",
        5: "rowColorClass5",
        6: "rowColorClass6",
        7: "rowColorClass7",
        8: "rowColorClass8",
        9: "rowColorClass9",
        10: "rowColorClass10",
        11: "rowColorClass11",
        12: "rowColorClass12",
        13: "rowColorClass13",
        14: "rowColorClass14",
        15: "rowColorClass15",
        16: "rowColorClass16",
        17: "rowColorClass17",
        18: "rowColorClass18",
        19: "rowColorClass19",
        20: "rowColorClass20",
        21: "rowColorClass21",
        22: "rowColorClass22",
        23: "rowColorClass23",
        24: "rowColorClass24",
        25: "rowColorClass25",
        26: "rowColorClass26",
        27: "rowColorClass27",
        28: "rowColorClass28",
        29: "rowColorClass29",
        30: "rowColorClass30",
        31: "rowColorClass31",
        32: "rowColorClass32",
        33: "rowColorClass33",
        34: "rowColorClass34",
        35: "rowColorClass35",
        36: "rowColorClass36",
        37: "rowColorClass37",
        38: "rowColorClass38",
        39: "rowColorClass39",
        40: "rowColorClass40",
        41: "rowColorClass41",
        42: "rowColorClass42"
    },

    locales: {},

    /**
     * Contains all templates.
     *
     * @property templates
     * @type Object
     * @for defaults
     **/
    templates: {
        actionButton: "<button class=\"btn btn-default\" type=\"button\" title=\"{{ctx.text}}\">{{ctx.content}}</button>",
        actionDropDown: "<div class=\"{{css.dropDownMenu}}\"><button class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\"><span class=\"{{css.dropDownMenuText}}\">{{ctx.content}}</span> <span class=\"caret\"></span></button><ul class=\"{{css.dropDownMenuItems}}\" role=\"menu\"></ul></div>",
        actionDropDownItem: "<li><a data-action=\"{{ctx.action}}\" class=\"{{css.dropDownItem}} {{css.dropDownItemButton}}\">{{ctx.text}}</a></li>",
        actionDropDownCheckboxItem: "<li><label class=\"{{css.dropDownItem}}\"><input name=\"{{ctx.name}}\" type=\"checkbox\" value=\"1\" class=\"{{css.dropDownItemCheckbox}}\" {{ctx.checked}} /> {{ctx.label}}</label></li>",
        actions: "<div class=\"{{css.actions}}\"></div>",
        extensions: "<div class=\"{{css.extensions}}\"></div>",
        body: "<tbody></tbody>",
        cell: "<td class=\"{{ctx.css}}\" style=\"{{ctx.style}}\">{{ctx.content}}</td>",
        footer: "<div id=\"{{ctx.id}}\" class=\"{{css.footer}}\"><div class=\"row\"><div class=\"col-sm-6\"><p class=\"{{css.pagination}}\"></p></div><div class=\"col-sm-6 infoBar\"><p class=\"{{css.infos}}\"></p></div></div></div>",
        header: "<div id=\"{{ctx.id}}\" class=\"{{css.header}}\"><div class=\"row\"><div class=\"col-sm-12 actionBar\"><p class=\"{{css.search}}\"></p><p class=\"{{css.actions}}\"></p><p class=\"{{css.extensions}}\"></p></div></div></div>",
        headerCell: "<th data-column-id=\"{{ctx.column.id}}\" class=\"{{ctx.css}}\" style=\"{{ctx.style}}\"><a href=\"javascript:void(0);\" class=\"{{css.columnHeaderAnchor}} {{ctx.sortable}}\"><span class=\"{{css.columnHeaderText}}\">{{ctx.column.text}}</span>{{ctx.icon}}</a></th>",
        icon: "<span class=\"{{css.icon}} {{ctx.iconCss}}\"></span>",
        infos: "<div class=\"{{css.infos}}\">{{lbl.infos}}</div>",
        loading: "<tr><td colspan=\"{{ctx.columns}}\" class=\"loading\">{{lbl.loading}}</td></tr>",
        noResults: "<tr><td colspan=\"{{ctx.columns}}\" class=\"no-results\">{{lbl.noResults}}</td></tr>",
        pagination: "<ul class=\"{{css.pagination}}\"></ul>",
        paginationItem: "<li class=\"{{ctx.css}}\"><a data-page=\"{{ctx.page}}\" class=\"{{css.paginationButton}}\">{{ctx.text}}</a></li>",
        rawHeaderCell: "<th class=\"{{ctx.css}}\">{{ctx.content}}</th>", // Used for the multi select box
        row: "<tr{{ctx.attr}}>{{ctx.cells}}</tr>",
        search: "<div class=\"{{css.search}}\"><div class=\"input-group\"><span class=\"{{css.icon}} input-group-addon {{css.iconSearch}}\"></span> <input type=\"text\" class=\"{{css.searchField}}\" placeholder=\"{{lbl.search}}\" /></div></div>",
        select: "<input name=\"select\" type=\"{{ctx.type}}\" class=\"{{css.selectBox}}\" value=\"{{ctx.value}}\" {{ctx.checked}} />"
    }
};

Grid.locales = [];
Grid.locales['en-US'] = Grid.locales['en'] = {
    all: "All",
    infos: "Showing {{ctx.start}} to {{ctx.end}} of {{ctx.total}} entries",
    loading: "Loading...",
    noResults: "No results found!",
    refresh: "Refresh",
    search: "Search" 
};
$.extend(Grid.defaults.locales, Grid.locales['en-US']);
Grid.prototype.initLocale = function() {
    if(this.options.locale) {
        var parts = this.options.locale.split(/-|_/);
        parts[0] = parts[0].toLowerCase();
        parts[1] = parts[1] && parts[1].toUpperCase();
        if(this.locales[this.options.locale]) {
            // locale as requested
            $.extend(this.options, this.locales[this.options.locale]);
        } else if(this.locales[parts.join('-')]) {
            // locale with sep set to - (in case original was specified with _)
            $.extend(this.options, this.locales[parts.join('-')]);
        } else if(this.locales[parts[0]]) {
            // short locale language code (i.e. 'en')
            $.extend(this.options, this.locales[parts[0]]);
        }
    }
};

//to be extended by the extension
Grid.prototype.initExtension = function() {};
Grid.prototype.afterRowsRendered = function() {};

Grid.prototype.initExtensionsToolbar = function() {
    this.$extensionsToolbar = $('.extensions.btn-group');
};

Grid.prototype.initHeader = function() {
    this.$actionBar = $('.actionBar');
    this.$header = $('thead');
};

/**
 * Appends rows.
 *
 * @method append
 * @param rows {Array} An array of rows to append
 * @chainable
 **/
Grid.prototype.append = function(rows) {
    if(this.options.ajax) {
        //TODO implement ajax PUT
    } else {
        var appendedRows = [];
        for(var i = 0; i < rows.length; i++) {
            if(appendRow.call(this, rows[i])) { // jshint ignore:line
                appendedRows.push(rows[i]); // jshint ignore:line
            }
        }
        sortRows.call(this); // jshint ignore:line
        highlightAppendedRows.call(this, appendedRows); // jshint ignore:line
        loadData.call(this); // jshint ignore:line
        this.$element.trigger("appended" + namespace, [ appendedRows ]); // jshint ignore:line
    }
    return this;
};

/**
 * Removes all rows.
 *
 * @method clear
 * @chainable
 **/
Grid.prototype.clear = function() {
    if(this.options.ajax) {
        //TODO implement ajax POST
    } else {
        var removedRows = $.extend([], this.rows);
        this.rows = [];
        this.current = 1;
        this.total = 0;
        loadData.call(this); // jshint ignore:line
        this.$element.trigger("cleared" + namespace, [ removedRows ]); // jshint ignore:line
    }

    return this;
};

/**
 * Removes the control functionality completely and transforms the current state to the initial HTML structure.
 *
 * @method destroy
 * @chainable
 **/
Grid.prototype.destroy = function() {
    $(window).off(namespace); // jshint ignore:line
    if(this.options.navigation & 1) {
        this.header.remove();
    }
    if(this.options.navigation & 2) {
        this.footer.remove();
    }
    this.$element.before(this.origin).remove();
    return this;
};

/**
 * Resets the state and reloads rows.
 *
 * @method reload
 * @chainable
 **/
Grid.prototype.reload = function() {
    this.current = 1; // reset
    loadData.call(this); // jshint ignore:line
    return this;
};

/**
 * Removes rows by ids. Removes selected rows if no ids are provided.
 *
 * @method remove
 * @param [rowsIds] {Array} An array of rows ids to remove
 * @chainable
 **/
Grid.prototype.remove = function(rowIds) {
    if(this.identifier != null) {
        var that = this;
        if(this.options.ajax) {
            //TODO implement ajax DELETE
        } else {
            rowIds = rowIds || this.selectedRows;
            var id;
            var removedRows = [];
            for(var i = 0; i < rowIds.length; i++) {
                id = rowIds[i];
                for(var j = 0; j < this.rows.length; j++){
                    if(this.rows[j][this.identifier] === id) {
                        removedRows.push(this.rows[j]);
                        this.rows.splice(j, 1);
                        break;
                    }
                }
            }
            this.current = 1; // reset
            loadData.call(this); // jshint ignore:line
            this.$element.trigger("removed" + namespace, [removedRows]); // jshint ignore:line
        }
    }
    return this;
};

/**
 * Searches in all rows for a specific phrase (but only in visible cells). 
 * The search filter will be reset if no argument is provided.
 *
 * @method search
 * @param [phrase] {String} The phrase to search for
 * @chainable
 **/
Grid.prototype.search = function(phrase) {
    phrase = phrase || "";
    if(this.searchPhrase !== phrase) {
        var selector = getCssSelector(this.options.css.searchField); // jshint ignore:line
        var searchFields = findFooterAndHeaderItems.call(this, selector); // jshint ignore:line
        searchFields.val(phrase);
    }
    executeSearch.call(this, phrase); // jshint ignore:line
    return this;
};

/**
 * Selects rows by ids. Selects all visible rows if no ids are provided.
 * In server-side scenarios only visible rows are selectable.
 *
 * @method select
 * @param [rowsIds] {Array} An array of rows ids to select
 * @chainable
 **/
Grid.prototype.select = function(rowIds) {
    if(this.selection) {
        rowIds = rowIds || this.currentRows.propValues(this.identifier);
        var i;
        var id;
        var selectedRows = [];
        while(rowIds.length > 0 && !(!this.options.multiSelect && selectedRows.length === 1)) {
            id = rowIds.pop();
            if($.inArray(id, this.selectedRows) === -1) {
                for(i = 0; i < this.currentRows.length; i++) {
                    if(this.currentRows[i][this.identifier] === id) {
                        selectedRows.push(this.currentRows[i]);
                        this.selectedRows.push(id);
                        break;
                    }
                }
            }
        }

        if(selectedRows.length > 0) {
            var selectBoxSelector = getCssSelector(this.options.css.selectBox); // jshint ignore:line
            var selectMultiSelectBox = this.selectedRows.length >= this.currentRows.length;
            i = 0;
            while(!this.options.keepSelection && selectMultiSelectBox && i < this.currentRows.length) {
                selectMultiSelectBox = ($.inArray(this.currentRows[i++][this.identifier], this.selectedRows) !== -1);
            }
            this.$element.find("thead " + selectBoxSelector).prop("checked", selectMultiSelectBox);

            if(!this.options.multiSelect) {
                this.$element.find("tbody > tr " + selectBoxSelector + ":checked").trigger("click" + namespace); // jshint ignore:line
            }

            for(i = 0; i < this.selectedRows.length; i++) {
                this.$element.find("tbody > tr[data-row-id=\"" + this.selectedRows[i] + "\"]").
                    addClass(this.options.css.selected)._mcmAria("selected", "true").
                    find(selectBoxSelector).prop("checked", true);
            }

            this.$element.trigger("selected" + namespace, [selectedRows]); // jshint ignore:line
        }
    }

    return this;
};

/**
 * Deselects rows by ids. Deselects all visible rows if no ids are provided.
 * In server-side scenarios only visible rows are deselectable.
 *
 * @method deselect
 * @param [rowsIds] {Array} An array of rows ids to deselect
 * @chainable
 **/
Grid.prototype.deselect = function(rowIds) {
    if(this.selection) {
        rowIds = rowIds || this.currentRows.propValues(this.identifier);
        var id;
        var i;
        var pos;
        var deselectedRows = [];
        while(rowIds.length > 0) {
            id = rowIds.pop();
            pos = $.inArray(id, this.selectedRows);
            if(pos !== -1) {
                for(i = 0; i < this.currentRows.length; i++) {
                    if(this.currentRows[i][this.identifier] === id) {
                        deselectedRows.push(this.currentRows[i]);
                        this.selectedRows.splice(pos, 1);
                        break;
                    }
                }
            }
        }

        if(deselectedRows.length > 0) {
            var selectBoxSelector = getCssSelector(this.options.css.selectBox); // jshint ignore:line
            this.$element.find("thead " + selectBoxSelector).prop("checked", false);
            for(i = 0; i < deselectedRows.length; i++) {
                this.$element.find("tbody > tr[data-row-id=\"" + deselectedRows[i][this.identifier] + "\"]").
                    removeClass(this.options.css.selected)._mcmAria("selected", "false").
                    find(selectBoxSelector).prop("checked", false);
            }
            this.$element.trigger("deselected" + namespace, [deselectedRows]); // jshint ignore:line
        }
    }

    return this;
};

/**
 * Sorts the rows by a given sort descriptor dictionary. 
 * The sort filter will be reseted, if no argument is provided.
 *
 * @method sort
 * @param [dictionary] {Object} A sort descriptor dictionary that contains the sort information
 * @chainable
 **/
Grid.prototype.sort = function(dictionary) {
    var values = (dictionary) ? $.extend({}, dictionary) : {};
    if(values === this.sortDictionary) {
        return this;
    }

    this.sortDictionary = values;
    renderTableHeader.call(this); // jshint ignore:line
    sortRows.call(this); // jshint ignore:line
    loadData.call(this); // jshint ignore:line

    return this;
};

/**
 * Gets a list of the column settings.
 * This method returns only for the first grid instance a value.
 * Therefore be sure that only one grid instance is retrieved by your selector.
 *
 * @method getColumnSettings
 * @return {Array} Returns a list of the column settings.
 * @since 1.0.0
 **/
Grid.prototype.getColumnSettings = function() {
    return $.merge([], this.columns);
};

/**
 * Gets the column settings for the columnId
 * This method returns only for the first grid instance a value.
 * Therefore be sure that only one grid instance is retrieved by your selector.
 *
 * @method getColumnSettings
 * @return {Array} Returns a list of the column settings.
 * @since 1.0.0
 **/
Grid.prototype.getColumnSettingsById = function(columnId) {
	for(var i = 0; i < this.columns.length; i++) {
		var column = this.columns[i];
		if(column.columnId === columnId) {
			return column;
		}
	}
	return null;
};

/**
 * Gets the current page index.
 * This method returns only for the first grid instance a value.
 * Therefore be sure that only one grid instance is retrieved by your selector.
 *
 * @method getCurrentPage
 * @return {Number} Returns the current page index.
 * @since 1.0.0
 **/
Grid.prototype.getCurrentPage = function() {
    return this.current;
};

/**
 * Gets the current rows.
 * This method returns only for the first grid instance a value.
 * Therefore be sure that only one grid instance is retrieved by your selector.
 *
 * @method getCurrentPage
 * @return {Array} Returns the current rows.
 * @since 1.0.0
 **/
Grid.prototype.getCurrentRows = function() {
    return $.merge([], this.currentRows);
};

/**
 * Gets a number represents the row count per page.
 * This method returns only for the first grid instance a value.
 * Therefore be sure that only one grid instance is retrieved by your selector.
 *
 * @method getRowCount
 * @return {Number} Returns the row count per page.
 * @since 1.0.0
 **/
Grid.prototype.getRowCount = function() {
    return this.rowCount;
};

/**
 * Gets the actual search phrase.
 * This method returns only for the first grid instance a value.
 * Therefore be sure that only one grid instance is retrieved by your selector.
 *
 * @method getSearchPhrase
 * @return {String} Returns the actual search phrase.
 * @since 1.0.0
 **/
Grid.prototype.getSearchPhrase = function() {
    return this.searchPhrase;
};

/**
 * Gets the complete list of currently selected rows.
 * This method returns only for the first grid instance a value.
 * Therefore be sure that only one grid instance is retrieved by your selector.
 *
 * @method getSelectedRows
 * @return {Array} Returns all selected rows.
 * @since 1.0.0
 **/
Grid.prototype.getSelectedRows = function() {
    return $.merge([], this.selectedRows);
};

/**
 * Gets the sort dictionary which represents the state of column sorting.
 * This method returns only for the first grid instance a value.
 * Therefore be sure that only one grid instance is retrieved by your selector.
 *
 * @method getSortDictionary
 * @return {Object} Returns the sort dictionary.
 * @since 1.0.0
 **/
Grid.prototype.getSortDictionary = function() {
    return $.extend({}, this.sortDictionary);
};

/**
 * Gets a number represents the total page count.
 * This method returns only for the first grid instance a value.
 * Therefore be sure that only one grid instance is retrieved by your selector.
 *
 * @method getTotalPageCount
 * @return {Number} Returns the total page count.
 * @since 1.0.0
 **/
Grid.prototype.getTotalPageCount = function() {
    return this.totalPages;
};

Grid.prototype.getColumnById = function(columnId) {
    var that = this;
    var foundColumn;
    $.each(that.columns, function (i, column) {
        if(column.id === columnId) {
            foundColumn = column;
            return false;
        }
    });
    return foundColumn;
};
Grid.prototype.getRowById = function(rowId) {
    var that = this;
    var foundRow;
    $.each(that.rows, function (i, row) {
        if(row.id === rowId) {
            foundRow = row;
            return false;
        }
    });
    return foundRow;
};

/**
 * Gets a number represents the total row count.
 * This method returns only for the first grid instance a value.
 * Therefore be sure that only one grid instance is retrieved by your selector.
 *
 * @method getTotalRowCount
 * @return {Number} Returns the total row count.
 * @since 1.0.0
 **/
Grid.prototype.getTotalRowCount = function() {
    return this.total;
    };

// GRID PLUGIN DEFINITION
// =====================
var old = $.fn.tablear;

$.fn.tablear = function(option) {
    var args = Array.prototype.slice.call(arguments, 1);
    var returnValue = null;
    var elements = this.each(function (index) {
            var $this = $(this);
            var instance = $this.data(namespace); // jshint ignore:line
            var options = typeof option === "object" && option;
            if(!instance && option === "destroy") {
                return;
            }
            if(!instance) {
                $this.data(namespace, (instance = new Grid(this, options))); // jshint ignore:line
                init.call(instance); // jshint ignore:line
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
$.fn.tablear.Constructor = Grid; // jshint ignore:line
$.fn.tablear.defaults = Grid.defaults; // jshint ignore:line
$.fn.tablear.locales = Grid.locales; // jshint ignore:line

// GRID NO CONFLICT
// ===============
$.fn.tablear.noConflict = function() {
    $.fn.tablear = old;
    return this;
};

// GRID DATA-API
// ============
$("[data-toggle=\"tablear\"]").tablear();

/**
 * Nova Creator Boostrap Data Grid Extension: editable
 *
 */

(function ($) {
    'use strict'; // jshint ignore:line

    $.extend($.fn.tablear.Constructor.defaults, {
        editable: true,
        onEditableInit: function (){
            return false;
        },
        onEditableSave: function(field, row, oldValue, $el) {
            return false;
        },
        onEditableShown: function(field, row, $el, editable) {
            return false;
        },
        onEditableHidden: function(field, row, $el, reason) {
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
            	var dashKey = key.replace(/([A-Z])/g, function($1) { 
            		return "-" + $1.toLowerCase();
            	});
            	if(dashKey.slice(0, editableDataPrefix.length) == editableDataPrefix) {
            		var dataKey = dashKey.replace(editableDataPrefix, 'data-');
            		editableOptions[dataKey] = value;
            	}
            };

            $.each(that.options, processDataOptions);

            var _formatter = column.formatter;
            column.formatter = function(value, row, index) {
                //var result = _formatter ? _formatter(value, row, index) : value;
                var result = row[value.field];

                $.each(column, processDataOptions);

                $.each(editableOptions, function(key, value) {
                    editableDataMarkup.push(' ' + key + '="' + value + '"');
                });

                return ['<a href="javascript:void(0)"',
                    ' data-name="' + column.field + '"',
                    ' data-pk="' + row.id + '"',
                    ' data-value="' + result + '"',
                    editableDataMarkup.join(''),
                    ' data-max-year="2016" ',
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

        var numberOfColumns = this.columns.length;
        var lastVisibleColumn = -1;
        for(var index = numberOfColumns - 1; index >= 0; index--) {
        	if(this.columns[index].visible) {
        		lastVisibleColumn = index;
        		break;
        	}
        }
        $.each(this.columns, function(columnIndex, column) {
            if(!column.editable) {
                return;
            }
            
            //there's a bug that prevents transmitting the minYear, maxYear parameters directly through data- tags
            // so a bit of help is needed            
            var aElements = that.$element.find('a[data-name="' + column.field + '"]');
            aElements.each(function() {
            	var comboDate = {};
            	var maxYear = $(this).data("maxYear");
            	var minYear = $(this).data("minYear");
            	maxYear && (comboDate["maxYear"] = maxYear);
            	minYear && (comboDate["minYear"] = minYear);
            	var placement = 'top';
            	if(columnIndex == lastVisibleColumn) {
            		placement = 'left';
            	}
            	$(this).editable({ combodate: comboDate, placement: placement });
            });
            aElements.off('save').on('save', that, function(e, params) {
            	var Grid = e.data;
            	var columnId = $(e.currentTarget).data('name');
            	var column = Grid.getColumnById(columnId);
            	var row = Grid.getRowById($(e.currentTarget).data('pk'));
            	if(!row) {
            		row = Grid.getRowById(0);
            	}
            	$(this).data('value', params.submitValue);
            	row[columnId] = params.submitValue;
            	Grid.options.onEditableSave(columnId, row, row[columnId], $(this));
            });
            aElements.off('shown').on('shown', that, function(e, editable) {
            	var Grid = e.data;
            	var columnId = $(e.currentTarget).data('name');
            	var row = Grid.getRowById($(e.currentTarget).data('pk'));
            	if(!row) {
            		row = Grid.getRowById(0);
            	}
            	Grid.options.onEditableShown(columnId, row, $(this), editable);
            });
            aElements.off('hidden').on('hidden', that, function(e, reason) {
            	var Grid = e.data;
            	var columnId = $(e.currentTarget).data('name');
            	var row = Grid.getRowById($(e.currentTarget).data('pk'));
            	if(!row) {
            		row = Grid.getRowById(0);
            	}
            	Grid.options.onEditableHidden(columnId, row, $(this), reason);            	
            });
        });
    };
})(jQuery);

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

/**
 * Nova Creator Boostrap Data Grid Extension: filters
 *
 */

(function ($) {
    'use strict'; // jshint ignore:line

    var addOptionToSelectControl = function(selectControl, value, text) {
        value = $.trim(value);
        selectControl = $(selectControl.get(selectControl.length - 1));
        if(!existOptionInSelectControl(selectControl, value)) {
            selectControl.append($("<option></option>")
                .attr("value", value)
                .text($('<div />').html(text).text()));
        }
    };

    var sortSelectControl = function(selectControl) {
        var $opts = selectControl.find('option:gt(0)');
        $opts.sort(function (a, b) {
            a = $(a).text().toLowerCase();
            b = $(b).text().toLowerCase();
            if($.isNumeric(a) && $.isNumeric(b)) {
                // Convert numerical values from string to float.
                a = parseFloat(a);
                b = parseFloat(b);
            }
            return a > b ? 1 : a < b ? -1 : 0;
        });

        selectControl.find('option:gt(0)').remove();
        selectControl.append($opts);
    };

    var existOptionInSelectControl = function(selectControl, value) {
        var options = selectControl.get(selectControl.length - 1).options;
        for(var i = 0; i < options.length; i++) {
            if(options[i].value === value.toString()) {
                //The value is not valid to add
                return true;
            }
        }
        //If we get here, the value is valid to add
        return false;
    };

    var fixHeaderCSS = function(that) {
        that.$tableHeader.css('height', '77px');
    };

    var getCurrentHeader = function(that) {
        var header = that.$header;
        if(that.options.height) {
            header = that.$tableHeader;
        }
        return header;
    };

    var getCurrentSearchControls = function(that) {
        var searchControls = 'select, input';
        if(that.options.height) {
            searchControls = 'table select, table input';
        }
        return searchControls;
    };

    var getCursorPosition = function(el) {
        if(isIEBrowser()) {
            if($(el).is('input')) {
                var pos = 0;
                if('selectionStart' in el) {
                    pos = el.selectionStart;
                } else if('selection' in document) {
                    el.focus();
                    var sel = document.selection.createRange();
                    var selLength = document.selection.createRange().text.length;
                    sel.moveStart('character', -el.value.length);
                    pos = sel.text.length - selLength;
                }
                return pos;
            } else {
                return -1;
            }
        } else {
            return -1;
        }
    };

    var setCursorPosition = function(el, index) {
        if(isIEBrowser()) {
            if(el.setSelectionRange !== undefined) {
                el.setSelectionRange(index, index);
            } else {
                $(el).val(el.value);
            }
        }
    };

    var copyValues = function(that) {
        var header = getCurrentHeader(that);
        var searchControls = getCurrentSearchControls(that);

        that.options.valuesShowFilter = [];

        header.find(searchControls).each(function () {
            that.options.valuesShowFilter.push({
                field: $(this).closest('[data-field]').data('field'),
                value: $(this).val(),
                position: getCursorPosition($(this).get(0))
            });
        });
    };

    var setValues = function(that) {
        var field = null;
        var result = [];
        var header = getCurrentHeader(that);
        var searchControls = getCurrentSearchControls(that);

        if(that.options.valuesShowFilter.length > 0) {
            header.find(searchControls).each(function (index, ele) {
                field = $(this).closest('[data-field]').data('field');
                result = $.grep(that.options.valuesShowFilter, function(valueObj) {
                    return valueObj.field === field;
                });

                if(result.length > 0) {
                    $(this).val(result[0].value);
                    setCursorPosition($(this).get(0), result[0].position);
                }
            });
        }
    };

    var collectBootstrapCookies = function cookiesRegex() {
        var cookies = [];
        var foundCookies = document.cookie.match(/(?:bs.table.)(\w*)/g);

        if(foundCookies) {
            $.each(foundCookies, function (i, cookie) {
                if(/./.test(cookie)) {
                    cookie = cookie.split(".").pop();
                }

                if($.inArray(cookie, cookies) === -1) {
                    cookies.push(cookie);
                }
            });
            return cookies;
        }
    };

    var initFilterSelectControls = function(that) {
        //var data = that.options.data;
        var data = that.columns;
        //var itemsPerPage = that.pageTo < that.options.data.length ? that.options.data.length : that.pageTo;

        var isColumnSearchableViaSelect = function(column) {
            return column.showFilter && column.showFilter.toLowerCase() === 'select' && column.searchable;
        };

        var isFilterDataNotGiven = function(column) {
            return column.filterData === undefined || column.filterData.toLowerCase() === 'column';
        };

        var hasSelectControlElement = function(selectControl) {
            return selectControl && selectControl.length > 0;
        };

        var z = that.options.pagination ? (that.options.sidePagination === 'server' ? that.pageTo : that.options.totalRows) : that.pageTo;

        if(that.header) {
            //$.each(that.header.fields, function(j, field) {
            $.each(that.columns, function(j, column) {                
                var selectControl = $('.tablear-filter-control-' + escapeID(column.field));

                if(isColumnSearchableViaSelect(column) && isFilterDataNotGiven(column) && hasSelectControlElement(selectControl)) {
                	selectControl.html(""); //clear
                    if(selectControl.get(selectControl.length - 1).options.length === 0) {
                        //Added the default option
                        addOptionToSelectControl(selectControl, '', '');
                    }
                    var uniqueValues = {};
                    for(var i = 0; i < that.rows.length; i++) {
                        //Added a new value
                        var fieldValue = that.rows[i][column.field];
                        //var formattedValue = calculateObjectValue(that.header, that.header.formatters[j], 
                          //  [ fieldValue, that.rows[i], i ], fieldValue);
                        //uniqueValues[formattedValue] = fieldValue;
                        uniqueValues[fieldValue] = fieldValue;
                    }
                    for(var key in uniqueValues) {
                        addOptionToSelectControl(selectControl, uniqueValues[key], key);
                    }
                    sortSelectControl(selectControl);
                }
            });
        }
    };

    var escapeID = function(id) {
        return String(id).replace( /(:|\.|\[|\]|,)/g, "\\$1" );
    };

    var createControls = function(that, header) {
        var addedShowFilter = false;
        var isVisible;
        var html;
        var timeoutId = 0;

        $.each(that.columns, function(i, column) {
            isVisible = 'hidden';
            html = [];

            if(!column.visible) {
                return;
            }

            if(!column.showFilter) {
                html.push('<div style="height: 34px;"></div>'); //just space
            } else {
                html.push('<div style="margin: 0 2px 2px 2px;" class="showFilter">');
                var nameControl = column.showFilter.toLowerCase();
                if(column.searchable && that.options.filterTemplate[nameControl]) {
                    addedShowFilter = true;
                    isVisible = 'visible';
                    html.push(that.options.filterTemplate[nameControl](that, column.field, isVisible));
                }
            }

            $.each(header.children().children(), function(i, tr) {
                tr = $(tr);
                if(tr.data('columnId') === column.id) {
                    tr.append(html.join(''));
                    return false;
                }
            });

            if(column.filterData !== undefined && column.filterData.toLowerCase() !== 'column') {
                var filterDataType = getFilterDataMethod(filterDataMethods, column.filterData.substring(0, column.filterData.indexOf(':')));
                var filterDataSource;
                var selectControl;

                if(filterDataType !== null) {
                    filterDataSource = column.filterData.substring(column.filterData.indexOf(':') + 1, column.filterData.length);
                    selectControl = $('.tablear-filter-control-' + escapeID(column.field));
                    addOptionToSelectControl(selectControl, '', '');
                    filterDataType(filterDataSource, selectControl);
                } else {
                    throw new SyntaxError('Error. You should use any of these allowed filter data methods: var, json, url.' + ' Use like this: var: {key: "value"}');
                }

                var variableValues;
                var key;
                switch(filterDataType) {
                    case 'url':
                        $.ajax({
                            url: filterDataSource,
                            dataType: 'json',
                            success: function(data) {
                                for(var key in data) {
                                    addOptionToSelectControl(selectControl, key, data[key]);
                                }
                                sortSelectControl(selectControl);
                            }
                        });
                        break;
                    case 'var':
                        variableValues = window[filterDataSource];
                        for(key in variableValues) {
                            addOptionToSelectControl(selectControl, key, variableValues[key]);
                        }
                        sortSelectControl(selectControl);
                        break;
                    case 'json':
                        variableValues = JSON.parse(filterDataSource);
                        for(key in variableValues) {
                            addOptionToSelectControl(selectControl, key, variableValues[key]);
                        }
                        sortSelectControl(selectControl);
                        break;
                }
            }
        });

        if(addedShowFilter) {
            header.off('keyup', 'input').on('keyup', 'input', function(event) {
            clearTimeout(timeoutId);
                timeoutId = setTimeout(function() {
                    that.onColumnSearch(event);
                }, that.options.searchTimeOut);
            });

            header.off('change', 'select').on('change', 'select', function(event) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(function() {
                    that.onColumnSearch(event);
                }, that.options.searchTimeOut);
            });

            header.off('mouseup', 'input').on('mouseup', 'input', function(event) {
                var $input = $(this),
                oldValue = $input.val();

                if(oldValue === "") {
                    return;
                }

                setTimeout(function() {
                    var newValue = $input.val();
                    if(newValue === ""){
                        clearTimeout(timeoutId);
                        timeoutId = setTimeout(function() {
                            that.onColumnSearch(event);
                        }, that.options.searchTimeOut);
                    }
                }, 1);
            });

            if(header.find('.date-filter-control').length > 0) {
                $.each(that.columns, function(i, column) {
                    if(column.showFilter !== undefined && column.showFilter.toLowerCase() === 'datepicker') {
                        header.find('.date-filter-control.tablear-filter-control-' + 
                            column.field).datepicker(column.filterDatepickerOptions).on('changeDate', function (e) {
                                //Fired the keyup event
                                $(e.currentTarget).keyup();
                            });
                    }
                });
            }
        } else {
            header.find('.showFilter').hide();
        }
    };

    var getDirectionOfSelectOptions = function(alignment) {
        alignment = alignment === undefined ? 'left' : alignment.toLowerCase();
        switch (alignment) {
            case 'left':
                return 'ltr';
            case 'right':
                return 'rtl';
            case 'auto':
                return 'auto';
            default:
                return 'ltr';
        }
    };

    var filterDataMethods = {
        'var': function(filterDataSource, selectControl) {
            var variableValues = window[filterDataSource];
            for(var key in variableValues) {
                addOptionToSelectControl(selectControl, key, variableValues[key]);
            }
            sortSelectControl(selectControl);
        },
        'url': function(filterDataSource, selectControl) {
            $.ajax({
                url: filterDataSource,
                dataType: 'json',
                success: function (data) {
                    for(var key in data) {
                        addOptionToSelectControl(selectControl, key, data[key]);
                    }
                    sortSelectControl(selectControl);
                }
            });
        },
        'json': function(filterDataSource, selectControl) {
            var variableValues = JSON.parse(filterDataSource);
            for(var key in variableValues) {
                addOptionToSelectControl(selectControl, key, variableValues[key]);
            }
            sortSelectControl(selectControl);
        }
    };

    var getFilterDataMethod = function(objFilterDataMethod, searchTerm) {
        var keys = Object.keys(objFilterDataMethod);
        for(var i = 0; i < keys.length; i++) {
            if(keys[i] === searchTerm) {
                return objFilterDataMethod[searchTerm];
            }
        }
        return null;
    };

    $.extend($.fn.tablear.Constructor.defaults, {
        showFilter: false,
        onColumnSearch: function(field, text) {
            return false;
        },
        filterShowClear: false,
        alignmentSelectControlOptions: undefined,
        filterTemplate: {
            input: function(that, field, isVisible) {
                return sprintf('<input type="text" class="form-control tablear-filter-control tablear-filter-control-%s" style="width: 100%; visibility: %s">', field, isVisible);
            },
            select: function(that, field, isVisible) {
                return sprintf('<select class="form-control tablear-filter-control-%s" style="width: 100%; visibility: %s" dir="%s"></select>',
                    field, isVisible, getDirectionOfSelectOptions(that.options.alignmentSelectControlOptions));
            },
            datepicker: function(that, field, isVisible) {
                return sprintf('<input type="text" class="form-control date-filter-control tablear-filter-control-%s" style="width: 100%; visibility: %s">', field, isVisible);
            }
        },
        //internal variables
        valuesShowFilter: []
    });

    $.extend($.fn.tablear.Constructor.columnDefaults, {
        showFilter: undefined,
        filterData: undefined,
        filterDatepickerOptions: undefined,
        filterStrictSearch: false,
        filterStartsWithSearch: false
    });

    $.extend($.fn.tablear.Constructor.EVENTS, {
        'column-search.bs.table': 'onColumnSearch'
    });

    $.extend($.fn.tablear.Constructor.defaults.css, {
        clearFilter: 'glyphicon-trash icon-clear'
    });

    $.extend($.fn.tablear.Constructor.locales, {
        formatClearFilters: function () {
            return 'Clear Filters';
        }
    });
    $.extend($.fn.tablear.Constructor.defaults, $.fn.tablear.Constructor.locales);

    var _init = $.fn.tablear.Constructor.prototype.init;
    $.fn.tablear.Constructor.prototype.init = function () {
        //Make sure that the showFilter option is set
        if(this.options.showFilter) {
            var that = this;

            // Compatibility: IE < 9 and old browsers
            if(!Object.keys) {
                objectKeys();
            }

            //Make sure that the internal variables are set correctly
            this.options.valuesShowFilter = [];

            this.$element.on('reset-view.bs.table', function () {
                //Create controls on $tableHeader if the height is set
                if(!that.options.height) {
                    return;
                }
                //Avoid recreate the controls
                if(that.$tableHeader.find('select').length > 0 || that.$tableHeader.find('input').length > 0) {
                    return;
                }
                createControls(that, that.$tableHeader);
            }).on('post-header.bs.table', function () {
                setValues(that);
            }).on('post-body.bs.table', function () {
                if(that.options.height) {
                    fixHeaderCSS(that);
                }
            }).on('column-switch.bs.table', function() {
                setValues(that);
            });
        }
        _init.apply(this, Array.prototype.slice.apply(arguments));
    };

    var _initExtensionsToolbar = $.fn.tablear.Constructor.prototype.initExtensionsToolbar;
    $.fn.tablear.Constructor.prototype.initExtensionsToolbar = function () {
        this.showToolbar = this.options.showFilter;
        _initExtensionsToolbar.apply(this, Array.prototype.slice.apply(arguments));
        if(this.options.showFilter) {
            var $btnGroup = this.$extensionsToolbar;
            var $btnClear = $btnGroup.find('.filter-show-clear');

            if(!$btnClear.length) {
                $btnClear = $([
                    '<div class="filter btn-group">',
                    '<button class="btn btn-default filter-show-clear" ',
                    sprintf('type="button" title="%s">', this.options.formatClearFilters()),
                    sprintf('<i class="%s %s"></i> ', this.options.css.icon, this.options.css.clearFilter),
                    '</button>',
                    '</div>'                    
                ].join('')).appendTo($btnGroup);

                $btnClear.off('click').on('click', $.proxy(this.clearShowFilter, this));
            }
        }
    };

    var _initHeader = $.fn.tablear.Constructor.prototype.initHeader;
    $.fn.tablear.Constructor.prototype.initHeader = function() {
        _initHeader.apply(this, Array.prototype.slice.apply(arguments));
        if(!this.options.showFilter) {
            return;
        }
        createControls(this, this.$header);
        initFilterSelectControls(this);
    };
    
    //call this on tablear("initFilterSelectControls") if you need to reset filtering manually
    $.fn.tablear.Constructor.prototype.initFilterSelectControls = function() {
    	initFilterSelectControls(this);
    }
    
    //override
    var _append = $.fn.tablear.Constructor.prototype.append;
    $.fn.tablear.Constructor.prototype.append = function() {
        _append.apply(this, Array.prototype.slice.apply(arguments));
        initFilterSelectControls(this);    	
    };
    var _clear = $.fn.tablear.Constructor.prototype.clear;
    $.fn.tablear.Constructor.prototype.clear = function() {
    	_clear.apply(this, Array.prototype.slice.apply(arguments));
    	initFilterSelectControls(this);
    };
    var _reload = $.fn.tablear.Constructor.prototype.reload;
    $.fn.tablear.Constructor.prototype.reload = function() {
    	_reload.apply(this, Array.prototype.slice.apply(arguments));
    	initFilterSelectControls(this);
    };
    var _remove = $.fn.tablear.Constructor.prototype.remove;
    $.fn.tablear.Constructor.prototype.remove = function() {
    	_remove.apply(this, Array.prototype.slice.apply(arguments));
    	initFilterSelectControls(this);
    };
    
    $.fn.tablear.Constructor.prototype.onColumnSearch = function(event) {
        var that = this;
        if($.inArray(event.keyCode, [37, 38, 39, 40]) > -1) {
            return;
        }
        copyValues(this);
        this.options.pageNumber = 1;
        this.current = 1;
        //executeSearch.call(this, $.trim($(event.currentTarget).val()));
        var column = this.getColumnById($(event.currentTarget).parents("th").data("columnId"));
        if(column) {
            column.filterValue = $.trim($(event.currentTarget).val());
        }
        loadData.call(this);
    };

    $.fn.tablear.Constructor.prototype.clearShowFilter = function() {
        if(this.options.showFilter) {
            var that = this;
            var cookies = collectBootstrapCookies();
            var header = getCurrentHeader(that);
            var table = header.closest('table');
            var controls = header.find(getCurrentSearchControls(that));
            var timeoutId = 0;

            $.each(that.options.valuesShowFilter, function(i, item) {
                item.value = '';
            });
            setValues(that);
            $.each(that.columns, function (i, column) {
                if(column.showFilter) {
                    column.filterValue = '';
                }
            });
 
            if(controls.length > 0) {
                $(controls[0]).trigger(controls[0].tagName === 'INPUT' ? 'keyup' : 'change');
            } else {
                return;
            }

            that.$actionBar.find('.search-field').val("");

            // use the default sort order if it exists. do nothing if it does not
            if(that.options.sortName !== table.data('sortName') || that.options.sortOrder !== table.data('sortOrder')) {
                var sorter = header.find(sprintf('[data-field="%s"]', $(controls[0]).closest('table').data('sortName')));
                if(sorter.length > 0) {
                    that.onSort(table.data('sortName'), table.data('sortName'));
                    $(sorter).find('.sortable').trigger('click');
                }
            }

            // clear cookies once the filters are clean
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function () {
                if(cookies && cookies.length > 0) {
                    $.each(cookies, function (i, item) {
                        if(that.deleteCookie !== undefined) {
                            that.deleteCookie(item);
                        }
                    });
                }
            }, that.options.searchTimeOut);
        }
    };
})(jQuery);

/**
 * Nova Creator Boostrap Data Grid Extension: reorder-columns
 *
 */

(function ($) {
    'use strict'; // jshint ignore:line

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
        } catch(e) {}
        $(this.$element).dragtable({
            maxMovingRows: that.options.maxMovingRows,
            dragaccept: that.options.dragaccept,
            clickDelay: 1000,
            beforeStop: function() {
                var ths = [];
                var formatters = [];
                var columns = [];
                var columnsHidden = [];
                var columnIndex = -1;
                that.$header.find('th').each(function (i) {
                    ths.push($(this).data('field'));
                    formatters.push($(this).data('formatter'));
                });

                //Exist columns not shown
                if(ths.length < that.columns.length) {
                    columnsHidden = $.grep(that.columns, function (column) {
                       return !column.visible;
                    });
                    for (var i = 0; i < columnsHidden.length; i++) {
                        ths.push(columnsHidden[i].field);
                        formatters.push(columnsHidden[i].formatter);
                    }
                }

                for(var i = 0; i < ths.length; i++ ) {
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

/**
 * Nova Creator Boostrap Data Grid Extension: resizable
 *
 */

(function ($) {
    'use strict';

    var initResizable = function(that) {
        //Deletes the plugin to re-create it
        that.$element.colResizable({disable: true});

        //Creates the plugin
        that.$element.colResizable({
            liveDrag: that.options.liveDrag,
            fixed: that.options.fixed,
            headerOnly: that.options.headerOnly || true,
            minWidth: that.options.minWidth,
            hoverCursor: that.options.hoverCursor,
            dragCursor: that.options.dragCursor,
            onResize: that.onResize,
            onDrag: that.options.onResizableDrag
        });
    };

    $.extend($.fn.tablear.Constructor.defaults, {
        resizable: false,
        liveDrag: false,
        fixed: true,
        headerOnly: false,
        minWidth: 15,
        hoverCursor: 'e-resize',
        dragCursor: 'e-resize',
        onResizableResize: function (e) {
            return false;
        },
        onResizableDrag: function (e) {
            return false;
        }
    });

    var _initHeader = $.fn.tablear.Constructor.prototype.initHeader;
    $.fn.tablear.Constructor.prototype.initHeader = function () {
        _initHeader.apply(this, Array.prototype.slice.apply(arguments));
        var that = this;
        if(this.options.resizable) { //for rendering to be done
            setTimeout(function () {
                initResizable(that);
            }, 100);
            this.$element.on("load.rs.novacreator.bootstrap.datagrid", function() {
            	setTimeout(function() {
            		initResizable(that);
            	}, 100);
            });
        }
    };
})(jQuery);

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
})(jQuery, window);