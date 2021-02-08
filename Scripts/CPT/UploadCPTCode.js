$(document).ready(function () {
    //$("input[name$='rdbLookUps']").change(function () {
    //    $("input[name$='btnSearch']").trigger("click");
    //});
   // RegisteringGridForFixedHeader();
$("input[name$='btnSearch']").click(function () {
    $("input[name$='hdtxtSortExpression']").val($("input[name$='hdtxtSortExpressionDefaultValue']").val());
    $("input[name$='hdtxtSortOrder']").val("ASC");
    //CallingServerMethod("Search");
    //return false;
});
$("input[name$='hdtxtSortExpressionDefaultValue']").val("CPTCode1");
$("input[name$='hdtxtSortExpression']").val("CPTCode1");
//attachingEventsForSort();
$("input[name$='txtSearch']").autocomplete({
    source: function (request, response) {

        var SearchAndReturnObject = new Object();

        SearchAndReturnObject.TypeOfEventRaisedFor = "AutoComplete";
        SearchAndReturnObject.PaginationElements = new Object();
        SearchAndReturnObject.PaginationElements.PageNo = "1";
        SearchAndReturnObject.PaginationElements.PageSize = "0";
        SearchAndReturnObject.PaginationElements.SortExpression = $("input[name$='hdtxtSortExpressionDefaultValue']").val();
        SearchAndReturnObject.PaginationElements.SortOrder = "ASC";
        SearchAndReturnObject.SearchFields = new Array();
        SearchAndReturnObject.SearchFields.push({ Key: "txtSearch", Value: $("input[name$='txtSearch']").val() });
        SearchAndReturnObject.SearchFields.push({ Key: "ddlYear", Value: $("select[name$='ddlYear']").val() });
        SearchAndReturnObject.SearchFields.push({ Key: "rdbLookUps", Value: $("input[name$='rdbLookUps']:checked").val() });
        SearchAndReturnObject.SearchFields.push({ Key: "txtModifier", Value: $("input[name$='txtModifier']").val() });
        SearchAndReturnObject.SearchFields.push({ Key: "txtUniversalSearch", Value: $("input[name$='txtUniversalSearch']").val() });
        $.ajax({
            contentType: "application/json; charset=utf-8",
            url: "../Services/CPT/UploadCPTCodeService.asmx/AutoCompleteCptCode",
            data: JSON.stringify({
                _CallBackObjects: SearchAndReturnObject
            }),
            dataType: "json",
            type: "POST",
            success: function (data) {
                response($.map(data.d, function (item) {
                    return {
                        key:item.Key,
                        value: item.Value
                    }
                }))
            },
            error: function (result) {
                //alert("Error");
            }
        });
    },
    select: function (e, i) {
        $(this).val(i.item.value);
        $("input[name$='btnSearch']").trigger("click");
    },
    minLength: 1
});
});
function ClearControls() {
    var curYear = new Date().getFullYear();
    $("input[name$='txtSearch']").val("");
    $("input[name$='txtModifier']").val("");
    $('select[name$="ddlYear"]').val(curYear);
    $("input[name$='txtUniversalSearch']").val("");
}
//function RegisteringGridForFixedHeader()
//{
//    if ($("table[id$='grdCptCode'] thead").length == 0) {        
//        $("table[id$='grdCptCode']").prepend('<thead></thead>');
//        $("table[id$='grdCptCode'] tbody").find("tr:has(th)").clone().appendTo($("table[id$='grdCptCode']").find('thead'));
//        //$("table[id$='grdCptCode']").find('thead').append(obj);             
//        $("table[id$='grdCptCode'] tbody").find("tr:has(th)").remove();
//        //$("table[id$='grdCptCode'] tr").each(function () {
//        //    if($(this).find("th").length>0)
//        //    {

//        //    }
//        //});
//    }
//    //$("table[id$='grdCptCode']").Scrollable();
//    $("table[id$='grdCptCode']").fixedHeaderTable();
//}
//function attachingEventsForSort() {
//    $("td[id$='tdgrdCptCode'] th a").each(function () {

//        var SortExpression = "";
//        var SortExpressionArray = $(this).attr("href").replace("javascript:__doPostBack(", "").replace(")", "").replace("'", "").split(",");
//        $(SortExpressionArray).each(function () {
//            var sortExpressionSortArray = this.split("Sort$");
//            if (sortExpressionSortArray.length > 1) {
//                SortExpression = sortExpressionSortArray[1].replace("'", "").split(",")[0];
//            }
//        });
//        $(this).attr("href", "javascript:void(0);");
//        $(this).attr("sortexpression", SortExpression);
//        $(this).click(function () {            
//            funSortExpression($(this).attr("sortexpression"));
//        });
//    });

//}
//function funSortExpression(objSortExpression) {

//    if ($("input[name$='hdtxtSortExpression']").val() == objSortExpression) {
//        if ($("input[name$='hdtxtSortOrder']").val() == "ASC")
//            $("input[name$='hdtxtSortOrder']").val("DESC");
//        else
//            $("input[name$='hdtxtSortOrder']").val("ASC");
//    }
//    else {
//        $("input[name$='hdtxtSortExpression']").val(objSortExpression);
//        $("input[name$='hdtxtSortOrder']").val("ASC");
//    }
//    CallingServerMethod("Sorting");
//    return false;
//}
//function fungrdCptCodePaginationChange() {

//    CallingServerMethod("PaginationChange");
//}
//function CallingServerMethod(typeofEventRaised) {    
//    $("div[id$='ResultPanel']").block({
//        message: '<img src="../Content/themes/base/images/loading.gif" />',
//        css: { width: '10%' }
//    });
//    var SearchAndReturnObject = new Object();
//    var objPagination = $("#grdCptCodePagination").PaginationReturnValues();
//    SearchAndReturnObject.TotalNoOfRecords = $("span[id$='lblTotalNoofRecords']").html();
//    SearchAndReturnObject.TypeOfEventRaisedFor = typeofEventRaised;
//    SearchAndReturnObject.PaginationElements = new Object();
//    SearchAndReturnObject.PaginationElements.PageNo = objPagination.PageNo;
//    SearchAndReturnObject.PaginationElements.PageSize = objPagination.PageSize;
//    SearchAndReturnObject.PaginationElements.SortExpression = $("input[name$='hdtxtSortExpression']").val();
//    SearchAndReturnObject.PaginationElements.SortOrder = $("input[name$='hdtxtSortOrder']").val();
//    SearchAndReturnObject.SearchFields = new Array();
//    SearchAndReturnObject.SearchFields.push({ Key: "txtSearch", Value: $("input[name$='txtSearch']").val() });
//    SearchAndReturnObject.SearchFields.push({ Key: "ddlYear", Value: $("select[name$='ddlYear']").val() });
//    SearchAndReturnObject.SearchFields.push({ Key: "rdbLookUps", Value: $("input[name$='rdbLookUps']:checked").val() });
//    SearchAndReturnObject.SearchFields.push({ Key: "txtModifier", Value: $("input[name$='txtModifier']").val() });
//    CallRaiseCallbackServerEvent(JSON.stringify(SearchAndReturnObject));
//}
//function ReturnCallBackResultHandling(returnCallBackResultHandling) {
//    var resultValue = JSON.parse(returnCallBackResultHandling);
//    for (var i = 0; i < resultValue.ReturnFieldBinding.length; i++) {
//        var Element = resultValue.ReturnFieldBinding[i];
//        $(Element.ElementType + "[" + Element.FindFieldBy + "$='" + Element.FilterElementNameOrId + "']").html(Element.Value);
//    }
//    if (resultValue.TypeOfEventRaisedFor != "PaginationChange" && resultValue.TypeOfEventRaisedFor != "Sorting") {
//        $("#grdCptCodePagination").PaginationAssignTotalNoOfRecords({ "totalNoOFRecords": resultValue.TotalNoOfRecords });
//    }
//    //$("table[id$='grdCptCode']").Scrollable();
//    //RegisteringGridForFixedHeader();
//    attachingEventsForSort();
   
//    $("div[id$='ResultPanel']").unblock();
//}