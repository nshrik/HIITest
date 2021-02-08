$(document).ready(function () {    
    $("input[name$='btnFirst']").click(function () {
        $("select[name$='ddlTotalNoofPages']").val("1");
        try {
            $("select[name$='ddlTotalNoofPages']").trigger('change.select2');
        }
        catch(err){}
        $(this).PageNoDisplayCaliculatedText();
        return false;
    });
    $("input[name$='btnPrevious']").click(function () {
        $("select[name$='ddlTotalNoofPages']").val(parseInt($("select[name$='ddlTotalNoofPages']").val()) - 1);
        try {
            $("select[name$='ddlTotalNoofPages']").trigger('change.select2');
        }
        catch (err) { }
        $(this).PageNoDisplayCaliculatedText();
        return false;
    });
    $("input[name$='btnNext']").click(function () {
        $("select[name$='ddlTotalNoofPages']").val(parseInt($("select[name$='ddlTotalNoofPages']").val()) + 1);
        try {
            $("select[name$='ddlTotalNoofPages']").trigger('change.select2');
        }
        catch (err) { }
        $(this).PageNoDisplayCaliculatedText();
        return false;
    });
    $("input[name$='btnLast']").click(function () {
        $("select[name$='ddlTotalNoofPages']").val($($("select[name$='ddlTotalNoofPages'] option")[$("select[name$='ddlTotalNoofPages'] option").length - 1]).val());
        try {
            $("select[name$='ddlTotalNoofPages']").trigger('change.select2');
        }
        catch (err) { }
        $(this).PageNoDisplayCaliculatedText();
        return false;
    });
    $("select[name$='ddlTotalNoofPages']").change(function () {
        $(this).PageNoDisplayCaliculatedText();
        return false;
    });
    $("select[name$='ddlPageSize']").change(function () {
        $(this).PaginationBindNoOfPages();
        return false;
    });
});
jQuery.fn.extend({
    PageNoDisplayCaliculatedText: function () {       
        $(this).PaginationButtonEnableAndDisableCaliculation();
        var PageNoDispalyText = "";
        PageNoDispalyText = (((parseInt($("select[name$='ddlTotalNoofPages']").val()) - 1) * parseInt($("select[name$='ddlPageSize']").val())) + 1).toString();
        PageNoDispalyText += " - ";
        if ($($("select[name$='ddlTotalNoofPages'] option")[$("select[name$='ddlTotalNoofPages'] option").length - 1]).val() == $("select[name$='ddlTotalNoofPages']").val())
            PageNoDispalyText += $("span[id$='lblTotalNoofRecords']").html();
        else
            PageNoDispalyText += (parseInt($("select[name$='ddlTotalNoofPages']").val()) * parseInt($("select[name$='ddlPageSize']").val())).toString();
        $("span[id$='lblPresentShowingRecords']").html(PageNoDispalyText);       
        if ($("input[id$='HdTxtClientClickFunction']").val())
            eval($("input[id$='HdTxtClientClickFunction']").val() + "()");

        //$.unblockUI();
    },
    PaginationButtonEnableAndDisableCaliculation: function () {
        if ($("select[name$='ddlTotalNoofPages']").val() == "1" && $($("select[name$='ddlTotalNoofPages'] option")[$("select[name$='ddlTotalNoofPages'] option").length - 1]).val() == $("select[name$='ddlTotalNoofPages']").val()) {
            $("input[name$='btnFirst']").attr("disabled", "disabled");
            $("input[name$='btnPrevious']").attr("disabled", "disabled");
            $("input[name$='btnLast']").attr("disabled", "disabled");
            $("input[name$='btnNext']").attr("disabled", "disabled");
        }
        else if ($("select[name$='ddlTotalNoofPages']").val() == "1") {
            $("input[name$='btnFirst']").attr("disabled", "disabled");
            $("input[name$='btnPrevious']").attr("disabled", "disabled");
            $("input[name$='btnLast']").removeAttr("disabled");
            $("input[name$='btnNext']").removeAttr("disabled");
        }
        else if ($($("select[name$='ddlTotalNoofPages'] option")[$("select[name$='ddlTotalNoofPages'] option").length - 1]).val() == $("select[name$='ddlTotalNoofPages']").val()) {
            $("input[name$='btnFirst']").removeAttr("disabled");
            $("input[name$='btnPrevious']").removeAttr("disabled");
            $("input[name$='btnLast']").attr("disabled", "disabled");
            $("input[name$='btnNext']").attr("disabled", "disabled");
        }
        else {
            $("input[name$='btnFirst']").removeAttr("disabled");
            $("input[name$='btnPrevious']").removeAttr("disabled");
            $("input[name$='btnLast']").removeAttr("disabled");
            $("input[name$='btnNext']").removeAttr("disabled");
        }
    },
    PaginationAssignTotalNoOfRecords: function (options) {
        $("span[id$='lblTotalNoofRecords']").html(options.totalNoOFRecords);
        var PageChangeEventMenthod = $("input[id$='HdTxtClientClickFunction']").val();
        $("input[id$='HdTxtClientClickFunction']").val("");
        $(this).PaginationBindNoOfPages();
        if (options.totalNoOFRecords == "0")
            $("table[id$='tblPagination']").attr("style", "display:none");
        else
            $("table[id$='tblPagination']").attr("style", "display:inline");
        $("input[id$='HdTxtClientClickFunction']").val(PageChangeEventMenthod);
    },
    PaginationBindNoOfPages: function () {
        var NoOfPages = Math.ceil(parseFloat($("span[id$='lblTotalNoofRecords']").html()) / parseFloat($("select[name$='ddlPageSize']").val()));
        $("select[name$='ddlTotalNoofPages']").html("");
        for (var i = 1; i <= NoOfPages; i++) {
            $("<option />", {
                val: i,
                text: i
            }).appendTo($("select[name$='ddlTotalNoofPages']"));
        }
        $("input[name$='btnFirst']").trigger("click");
    },
    PaginationReturnValues: function () {       
        return {
            PageSize: $("select[name$='ddlPageSize']").val(),
            PageNo: $("select[name$='ddlTotalNoofPages']").val() == null ? "1" : $("select[name$='ddlTotalNoofPages']").val()
        };
    }
});

