$(function () {
    $(".DatePicker").datepicker({
        changeYear: 'true',
        changeMonth: 'true',
        yearRange: "-5:+10"
    });

    $('#' + GetControlId('ddlPayPeriod')).change(function () {
        $('#' + GetControlId('hdnSelPayPeriodId')).val($('#' + GetControlId('ddlPayPeriod') + ' option:selected').val());
    });

    $('#' + GetControlId('ddlYear')).change(function () {
        var dataValue = JSON.stringify({ "Year": $('#' + GetControlId('ddlYear') + ' option:selected').val() });
        $.ajax({
            type: "POST",
            url: "PayrollInbound.aspx/GetPayPeriods",
            data: dataValue,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log("Request: " + XMLHttpRequest.toString() + "\n\nStatus: " + textStatus + "\n\nError: " + errorThrown);
            },
            success: function (result) {
                //console.log('result:', result);
                //console.log('html',html);
                $('#' + GetControlId('hdnSelPayPeriodId')).val("0");
                var html = '<option value="0">-Select PayPeriod-</option>';
                for (var ind in result.d) {
                    html += "<option value='" + result.d[ind].Code + "'>"+result.d[ind].Description+"</option>";
                }
                $('#' + GetControlId('ddlPayPeriod')).html(html);
            }
        });
    });//
});

// Get the instance of PageRequestManager.
var prm = Sys.WebForms.PageRequestManager.getInstance();
// Add initializeRequest and endRequest
prm.add_initializeRequest(prm_InitializeRequest);
prm.add_endRequest(prm_EndRequest);

// Called when async postback begins
function prm_InitializeRequest(sender, args) {
    //console.log("Ajax call started");
    $("table[id$='gridContainer']").block({
            message: '<img src="../Content/themes/base/images/loading.gif" />',
            css: { width: '10%' }
        });
    console.log("Load Normal");
}

// Called when async postback ends
function prm_EndRequest(sender, args) {
    $("table[id$='gridContainer']").unblock();
    MessageAfterAjaxCallComplete();
}

var App = {};
App.MessageOptions = {
    GridEditSavedSuccess: "1",
    SystemError:"-1"
};
function MessageAfterAjaxCallComplete() {
    var Mode = $("#" + GetControlId('hdnMessageCode')).val();
    var divClass="";
    var Message="";
    switch(Mode)
    {
        case App.MessageOptions.GridEditSavedSuccess:
            divClass="success"
            Message="Record Updated Successfully";
            break;
        case App.MessageOptions.SystemError:
            divClass = "error"
            Message = "System Error – Please try again later";
            break;
        default:
            break;
    }
    $("#" + GetControlId('hdnMessageCode')).val("");
    if (divClass != "")
    {
        var htmlStr="<div class='"+divClass+"'>"+
            Message+
            "</div>";
        $("#MessageContainer").html(htmlStr);
    }
    else
        $("#MessageContainer").html("");
}

function PayPeriodValidation(source, arguments) {
    var PayPeriodIdSel = $('#' + GetControlId('hdnSelPayPeriodId')).val();
    if (PayPeriodIdSel=="0")
        arguments.IsValid = false;
    else
        arguments.IsValid = true;
}

function ClearShowImportStatus() {
    console.log("ClearShowImportStatus");
    $('#' + GetControlId('lnkDownloadFailure')).hide();
    $('#' + GetControlId('lblImportStatus')).html("");
}