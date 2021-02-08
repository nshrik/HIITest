$(function () {
    var limit = 50;
    var tb = $('textarea[id$=txtMultiLine');
    $(tb).keyup(function () {
        var len = $(this).val().length;
        if (len > limit) {
            //this.value = this.value.substring(0, 50);
            $(this).addClass('exceeded');
            $('#Spn').text("Max Limit Exceeded");
            $('#Spn').css({ 'color': 'red' });
        }
        else {
            $(this).removeClass('exceeded');
            $('#Spn').text(limit - len + " characters left");
            $('#Spn').css({ 'color': 'grey' });
        }
    });

    $('input[id$=btnSave]').click(function (e) {
        var len = $(tb).val().length;
        if (len > limit) {
            e.preventDefault();
        }
    });
});

$(function () {
    var limit = 50;
    var tb = $('textarea[id$=txtMultiLine1');
    $(tb).keyup(function () {
        var len = $(this).val().length;
        if (len > limit) {
            //this.value = this.value.substring(0, 50);
            $(this).addClass('exceeded');
            $('#Spn1').text("Max Limit Exceeded");
            $('#Spn1').css({ 'color': 'red' });
        }
        else {
            $(this).removeClass('exceeded');
            $('#Spn1').text(limit - len + " characters left");
            $('#Spn1').css({ 'color': 'grey' });
        }
    });

    $('input[id$=btnSave]').click(function (e) {
        var len = $(tb).val().length;
        if (len > limit) {
            e.preventDefault();
        }
    });
});

