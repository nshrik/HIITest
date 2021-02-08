function AllowNonZeroIntegers(e) {
    var val = e.keyCode;
    if ((val >= 48 && val < 58) || ((val >= 96 && val < 106)) || val == 46 || val == 8 || val == 127 || val == 189 || val == 109 || val == 45 || val == 9) {
        return true;
    }
    else {
        return false;
    }
}
//function onlyNumbers(event) {
//    var charCode = (event.which) ? event.which : event.keyCode
//    if (charCode > 31 && (charCode < 48 || charCode > 57))
//        return false;

//    return true;
//}
// Numeric values validation
function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}