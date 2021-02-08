function ValidateForm() {
    var isValid = false;
    var element;
    var getAttribute;
    var selectedCount = 0;
    for (var i = 0; i < document.forms["frmMasterForm"].elements.length; i++) {
        element = document.forms["frmMasterForm"].elements[i];
        var getAtt = document.getElementById(element.id).getAttribute("MandatoryField");
        if (getAtt == undefined || getAtt == null || getAtt == "undefined") {

        } else {

            switch (element.type) {
                case 'text':
                    if (element.value.length == 0 || element.value == "") {
                        // $("#" + element.id).css("border-color","red"); 
                        $("#" + element.id).addClass("ErrorControl");
                        selectedCount++;

                    } else {
                        // $("#" + element.id).css("border-color", "");
                        $("#" + element.id).removeClass("ErrorControl");

                    }
                    break;
                case 'select-one':
                    if (element.selectedIndex == 0) {
                        // $("#" + element.id).css("border-color", false ? "" : "red");
                        $("#" + element.id).addClass("ErrorControl");
                        selectedCount++;
                    } else {
                        //$("#" + element.id).css("border-color", false ? "" : "");
                        $("#" + element.id).removeClass("ErrorControl");
                    }
                    break;
                //etc - add cases for checkbox, radio, etc.    
            }  //End of switch
        } //End of else
    }      //End of for

//    isValid = Page_ClientValidate('Save');
//       if (isValid ) {
//        return true;
//    }
//    else
//        return false;

    if (selectedCount == 0) {
        return true;
    } else {
        return false;
    }

} //End of function

function AllowIntegers(e) {
    var val = e.keyCode;
    if ((val >= 48 && val < 58) || ((val > 96 && val < 106)) || val == 46 || val == 8 || val == 127 || val == 189 || val == 109 || val == 45 || val == 9) {
        return true;
    }
    else {
        return false;
    }
}