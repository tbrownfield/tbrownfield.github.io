CKEDITOR.dialog.add('overflow', function(editor) {
    return {
        title: 'Recipients',
        minWidth: 300,
        minHeight: 200,
        contents: [{
            id: 'tab1',
            label: 'Only Tab',
            elements: [{
                type: 'vbox',
                heights: [null, null, null],
                children: [{
                    type: 'html',
                    html: '<div id="info">Because there are more than 500 email addresses, multiple emails must be sent.<br>Paste the body into the email, then copy and paste the address list below.<br>Then click >>, then Start Email and repeat.</div>',
                }, {
                    type: 'hbox',
                    widths: [null, null, null],
                    height: ['20px'],
                    styles: ['vertical-align:bottom'],
                    children: [{
                        type: 'button',
                        id: 'prev',
                        label: '<<',
                        title: 'Previous Page',
                        onClick: function(editor) {
                            var dialog = this.getDialog();
                            var pageobj = dialog.getContentElement('tab1', 'page');
                            var page = pageobj.getValue();
                            if (page > 1) {
                                page--;
                                setPage(editor, dialog, page);
                                pageobj.setValue(page);
                            }
                            toggleButtons(editor, dialog, page);

                        }
                    }, {
                        type: 'select',
                        id: 'page',
                        label: '',
                        title: 'Page',
                        items: [
                            ['1']
                        ],
                        'default': '1',
                        onChange: function(editor) {
                            var page = this.getValue();
                            var dialog = this.getDialog();
                            setPage(editor, dialog, page);
                            toggleButtons(editor, dialog, page);
                        }
                    }, {
                        type: 'button',
                        id: 'email',
                        label: 'Start Email',
                        title: 'Start new Email in Outlook',
                        onClick: function() {
                            var dialog = this.getDialog();
                            editor.execCommand("email");
                            var bcc = dialog.getContentElement('tab1', 'BCCField');
                            bcc.select();
                        }

                    }, {
                        type: 'button',
                        id: 'next',
                        label: '>>',
                        title: 'Next Page',
                        onClick: function(editor) {
                            var dialog = this.getDialog();
                            var pageobj = dialog.getContentElement('tab1', 'page');
                            var page = pageobj.getValue();
                            if (page < getPages()) {
                                page++;
                                setPage(editor, dialog, page);
                                pageobj.setValue(page);
                            }
                            toggleButtons(editor, dialog, page);
                        }
                    }]
                }, {
                    type: 'textarea',
                    id: 'BCCField',
                    label: '',
                    rows: '10',
                    style: 'width:100%;height:100%',
                }]
            }]
        }],
        //onOk: function(editor) {},
        onShow: function(editor) {
            var bccpages = getPages();
            var selbox = this.getContentElement('tab1', 'page');
            selbox.clear();
            for (var i = 1; i <= bccpages; i++) {
                selbox.add(i);
            }
            setPage(editor, this, 1);
            var cbtn = this.getButton("cancel");
            cbtn = cbtn.domId;
            document.getElementById(cbtn).style.display = "none";
        }
    };

    function setPage(editor, dlg, page) {
        var bcclist = sessionStorage.getItem("bcclist");
        var bccarray = bcclist.split(";");
        var pstart = (page - 1) * 495;
        var pend = pstart + 495;
        var bcc = dlg.getContentElement('tab1', 'BCCField');
        var emaillist = bccarray.slice(pstart, pend).toString();
        emaillist = emaillist.replace(/\,/g, ";");
        bcc.setValue(emaillist);
        bcc.select();
        toggleButtons(editor, dlg, page);
    }

    function getPages() {
        var bcclist = sessionStorage.getItem("bcclist");
        var bccarray = bcclist.split(";");
        return Math.ceil(bccarray.length / 495);
    }

    function toggleButtons(editor, dialog, page) {
        var maxpage = getPages();
        var next = dialog.getContentElement("tab1", "next");
        var prev = dialog.getContentElement("tab1", "prev");

        if (page < maxpage) {
            var btn = document.getElementById(next.domId);
            btn.style.visibility = "visible";
        }
        if (page < 2) {
            var btn = document.getElementById(prev.domId);
            btn.style.visibility = "hidden";
        }
        if (page > 1) {
            var btn = document.getElementById(prev.domId);
            btn.style.visibility = "visible";
        }
        if (page >= maxpage) {
            var btn = document.getElementById(next.domId);
            btn.style.visibility = "hidden";
        }
    }

});