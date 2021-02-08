﻿(function ($) {

    $.showprogress = function () {
        
        $.hideprogress(); $("BODY").append('<div id="processing_overlay"></div>');
        $("BODY").append('<div id="processing_container">' + '<div id="processing_content" >' + '<table><tr align="center"><td valign="top"><img src="../Content/themes/base/images/loading.gif" alt="..." style="vertical-align: middle;" /><span>Loading...</span></td></tr></table>' + '</div>' + '</div>');
        //var pos = ($.browser.msie && parseInt($.browser.version) <= 9) ? 'absolute' : 'fixed';        
        var pos = 'fixed';
        $("#processing_container").css({ position: pos, zIndex: 99999, padding: 0, margin: 0 });
        $("#processing_container").css({ minWidth: $("#processing_container").outerWidth(), maxWidth: $("#processing_container").outerWidth() });
        var top = (($(window).height() / 2) - ($("#processing_container").outerHeight() / 2)) + (-75);
        var left = (($(window).width() / 2) - ($("#processing_container").outerWidth() / 2)) + 0; if (top < 0) top = 0;
        if (left < 0) left = 0;
        //if ($.browser.msie && parseInt($.browser.version) <= 9) top = top + $(window).scrollTop();

        $("#processing_container").css({ top: top + 'px', left: left + 'px' });

        $("#processing_overlay").height($(document).height());
    },
    $.hideprogress = function () {
        $("#processing_container").remove(); $("#processing_overlay").remove();
    }, $.showmsg = function (msgEle, msgText, msgClass, msgIcon, msgHideIcon, autoHide) { var tblMsg; tblMsg = '<table width="100%" cellpadding="1" cellspacing="0" border="0" class="' + msgClass + '"><tr><td style="width:30px;" align="center" valign="middle">' + msgIcon + '</td><td>' + msgText + '</td><td style="width:30px;" align="center" valign="middle"><a href="javascript:void(0);" onclick="$(\'#' + msgEle + '\').toggle(400);">' + msgHideIcon + '</a></td></tr></table>'; $("#" + msgEle).html(tblMsg); $("#" + msgEle).show(); if (autoHide) { setTimeout(function () { $('#' + msgEle).fadeOut('normal') }, 10000); } }
})(jQuery);