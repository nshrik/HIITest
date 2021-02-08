// JScript File

//Added By Yogesh Babu For Async Message
Sys.WebForms.PageRequestManager.getInstance().add_beginRequest(BeginRequestHandler);
Sys.WebForms.PageRequestManager.getInstance().add_endRequest(EndRequestHandler);
function BeginRequestHandler(sender, args) {
    var elem = args.get_postBackElement();

    // DivMain.style.display = 'block';
    // Adding Dark page
    DarkenPage();
    //if (DivMain != null) {
    //    DivMain.style.width = screen.width - 20;
    //    DivMain.style.height = screen.height - 150;
    //}
    //divdasrk.width = (document.body.scrollHeight) + 'px';
    //divdasrk.height = $(window).height;//screen.height + 200 + 'px';//(document.body.scrollHeight) + 'px';
    //divdasrk.style.display = '';

    //ActivateAlertDiv('visible', 'divdasrk', '');
    ActivateAlertDiv('visible', 'DivProcess', elem.value + ' processing...');

}
function EndRequestHandler(sender, args) {

    //  DivMain.style.display='none';
    // ActivateAlertDiv('hidden', 'divdasrk', '');
    ActivateAlertDiv('hidden', 'DivProcess', '');
    // Darkpage none
    LightenPage();

}

function ActivateAlertDiv(visstring, elem, msg) {


    var adiv = $get(elem);
    if (adiv != null) {
        adiv.style.visibility = visstring;
    }
    //adiv.innerHTML = msg;                     
}
function DarkenPage() {
    var page_screen = document.getElementById('page_screen');
    if (page_screen != null) {
        page_screen.style.height = (document.body.scrollHeight) + 'px';
        page_screen.style.width = (document.body.scrollWidth) + 'px';
        page_screen.style.display = 'block';
        page_screen.className = 'modalBackground';
    }
}

// this function removes the dark screen and the page is light again
function LightenPage() {
    var page_screen = document.getElementById('page_screen');
    if (page_screen != null)
        page_screen.style.display = 'none';
    //  divdasrk.style.display = 'none';
}
    //End of Add