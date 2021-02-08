//$.noConflict(true);
(function ($) {
    $.fn.hitch = function (ev, fn, scope) {
        return this.bind(ev, function () {
            return fn.apply(scope || this, Array.prototype.slice.call(arguments));
        });
    };

})(jQuery);
jQuery.expr[':'].contains = function (a, i, m) {
    return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};
// Prototype contructor
function DropDownScript(id, divPstfx, selectPstfx, postbackFunction, useButtons, autoPost, useSelectAll) {
    // init properties from parameters
    this.id = id;
    this.divPstfx = divPstfx;
    this.selectPstfx = selectPstfx;
    this.postbackFunction = postbackFunction;
    this.useButtons = useButtons;
    this.autoPost = autoPost;
    this.useSelectAll = useSelectAll;
    //init other properties
    this.divId = this.id + this.divPstfx;
    this.selId = this.id + this.selectPstfx;
    this.selection = new Array();
    this.visible = false;
    this.preventHide = false;
    this.initialized = false;

};
DropDownScript.prototype.update = function (divPstfx, selectPstfx, postbackFunction, useButtons, autoPost, useSelectAll) {
    this.divPstfx = divPstfx;
    this.selectPstfx = selectPstfx;
    this.postbackFunction = postbackFunction;
    this.useButtons = useButtons;
    this.autoPost = autoPost;
    this.useSelectAll = useSelectAll;

    this.divId = this.id + this.divPstfx;
    this.selId = this.id + this.selectPstfx;

    this.initEvents();
};

DropDownScript.prototype.init = function () {
    var self = this;

    if (typeof Sys != "undefined")
        try {
            Sys.WebForms.PageRequestManager.getInstance().add_endRequest(
                function (sender, args) {
                    self.initEvents();
                    //self.restoreSelection();
                }
            );
        }
        catch (e) { }

    this.initEventHandlers();
    this.initEvents();
    this.initialized = true;
};

DropDownScript.prototype.initEventHandlers = function () {

    this.documentClickHandler = function () {
        if (!this.preventHide && this.visible)
            if (this.useButtons) this.clickCancel();
            else if (this.autoPost) this.clickOk();
            else this.hide();
        this.preventHide = false;
    };

    this.divClickHandler = function (e) {
        e.stopPropagation()
    };

    this.selectBoxClickHandler = function (e) {
        if (this.visible) this.hide();
        else {
            this.show();
            this.preventHide = true;
        }
    };

    this.selectAllClickHandler = function (e) {
        if (!this.useSelectAll) return;
        if (e.target.checked) this.selectAll();
        else this.deselectAll();
    };
    this.searchTextHandler = function (e) {
        this.SearchText();
    };
    this.checkBoxClickHandler = function (e) {
        this.updateSelectAll();
    };

    this.okClickHandler = function (e) {
        this.clickOk();
        e.stopPropagation();
    };

    this.cancelHandler = function (e) {
        this.clickCancel();
        e.stopPropagation();
    };
};

DropDownScript.prototype.initEvents = function () {
    if (!this.initialized)
        $(document).hitch(
            "click",
            this.documentClickHandler,
            this
        );

    var div = $("#" + this.divId);
    div.unbind("click.chk_dd");
    div.hitch(
        "click.chk_dd",
        this.divClickHandler,
        this
    );

    var sel = $("#" + this.selId);
    sel.unbind("click.chk_dd");
    sel.hitch(
        "click.chk_dd",
        this.selectBoxClickHandler,
        this
    );

    var selectAll = $("#" + this.divId + " input[type='checkbox']:first");
    selectAll.unbind("click.chk_dd");
    if (this.useSelectAll) {
        selectAll.hitch(
            "click.chk_dd",
            this.selectAllClickHandler,
            this
        );
    };

    var items = this.getItems();
    items.unbind("click.chk_dd");
    items.hitch(
        "click.chk_dd",
        this.checkBoxClickHandler,
        this
    );

    var okButton = $("#" + this.divId + " input[type='button']:first");
    okButton.unbind("click.chk_dd");
    okButton.hitch(
        "click.chk_dd",
        this.okClickHandler,
        this
    );

    var cancelButton = $("#" + this.divId + " input[type='button']:gt(0)");
    cancelButton.unbind("click.chk_dd");
    cancelButton.hitch(
        "click.chk_dd",
        this.cancelHandler,
        this
    );

    var txtSearchText = $("#" + this.divId + " input[type='text']");
    txtSearchText.unbind("keyup");
    txtSearchText.hitch(
        "keyup",
        this.searchTextHandler,
        this
    );    
};

DropDownScript.prototype.clickOk = function () {
    this.hide();
    this.saveSelection();
    this.doPostBack();
};

DropDownScript.prototype.clickCancel = function () {
    this.hide();
    this.restoreSelection();
};

DropDownScript.prototype.getItems = function () {
    return $("#" + this.id + " input[type='checkbox']");
};
DropDownScript.prototype.SearchText = function () {
    var txtSearchTextForSearch = $("#" + this.divId + " input[type='text']");
    var spanName = $(txtSearchTextForSearch).attr("for");
    var selectAllSpan = $(txtSearchTextForSearch).parent().parent().find("span[id$='" + $(txtSearchTextForSearch).attr("for") + "']").prev();
    var selectAllLabelFor = $(selectAllSpan).find("label").attr("for");
    $(selectAllSpan).find("label").show();
    $(selectAllSpan).find("input[name$='" + selectAllLabelFor + "']").show();
    $(selectAllSpan).find("input[name$='" + selectAllLabelFor + "']").prev().show();

    if ($(txtSearchTextForSearch).val() != "") {
        $(selectAllSpan).find("label").hide();
        $(selectAllSpan).find("input[name$='" + selectAllLabelFor + "']").hide();
        $(selectAllSpan).find("input[name$='" + selectAllLabelFor + "']").prev().hide();
    }

    $(txtSearchTextForSearch).parent().parent().find("span[id$='" + spanName + "'] label").show();
    $(txtSearchTextForSearch).parent().parent().find("span[id$='" + spanName + "'] input").show();
    $(txtSearchTextForSearch).parent().parent().find("span[id$='" + spanName + "'] br").show();
    if ($(txtSearchTextForSearch).val() != "") {
        $(txtSearchTextForSearch).parent().parent().find("span[id$='" + spanName + "'] label:not(:contains('" + $(txtSearchTextForSearch).val() + "'))").each(function () {
            var labelFor = $(this).attr("for");
            $("input[id$='" + labelFor + "']").hide();
            $(this).next().hide();
            $(this).hide();
        });
    }
};
DropDownScript.prototype.show = function () {
    $("#" + this.divId).show();
    this.visible = true;
    this.saveSelection();
    this.updateSelectAll();
};

DropDownScript.prototype.hide = function () {
    $("#" + this.divId).hide();
    this.visible = false;
};

DropDownScript.prototype.updateSelectAll = function () {
    if (!this.useSelectAll) return;

    var allSelected = true;
    var items = this.getItems();

    for (var i = 0; i < items.length; i++)
        if (items[i].checked == false) {
            allSelected = false;
            break;
        };

    $("#" + this.divId + " input[type='checkbox']:first").prop("checked", allSelected);
};

DropDownScript.prototype.selectAll = function () {
    this.getItems().prop("checked", true);
};

DropDownScript.prototype.deselectAll = function () {
    this.getItems().prop("checked", false);
};

DropDownScript.prototype.saveSelection = function () {
    var items = this.getItems();
    for (var i = 0; i < items.length; i++)
        this.selection[i] = items[i].checked ? true : false;
};

DropDownScript.prototype.restoreSelection = function () {
    var items = this.getItems();
    if (this.selection.length > 0)
        for (var i = 0; i < items.length; i++)
            items[i].checked = this.selection[i];
};

DropDownScript.prototype.doPostBack = function () {
    if (this.postbackFunction)
        this.postbackFunction.call();
};