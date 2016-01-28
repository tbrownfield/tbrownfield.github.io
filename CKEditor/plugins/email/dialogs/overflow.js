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
                            var editor = this.getParentEditor();
                            console.log("start email");
                            copyBody(editor)
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
            for (var i = 2; i <= bccpages; i++) {
                var selbox = this.getContentElement('tab1', 'page');
                selbox.add(i);
            }
            setPage(editor, this, 1);
        }
    };

    function setPage(editor, dlg, page) {
        var bcclist = sessionStorage.getItem("bcclist");
        var bccarray = bcclist.split(";");
        var pstart = (page - 1) * 495;
        var pend = pstart + 495;
        var bcc = dlg.getContentElement('tab1', 'BCCField');
        var emaillist = bccarray.slice(pstart, pend).toString()
        var emaillist = emaillist.replace(/\,/g,";");
        bcc.setValue(emaillist);
        bcc.select();
        toggleButtons(editor,dlg,page);
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

        function copyBody(editor) {
    		//Select All
    		var editable = editor.editable();

    		if ( editable.is( 'textarea' ) ) {
    			var textarea = editable.$;

    			if ( CKEDITOR.env.ie )
    				textarea.createTextRange().execCommand( 'SelectAll' );
    			else {
    				textarea.selectionStart = 0;
    				textarea.selectionEnd = textarea.value.length;
    			}

    			textarea.focus();
    		} else {
    			if ( editable.is( 'body' ) )
    				editor.document.$.execCommand( 'SelectAll', false, null );
    			else {
    				var range = editor.createRange();
    				range.selectNodeContents( editable );
    				range.select();
    			}

    			//Force triggering selectionChange (#7008)
    			editor.forceNextSelectionCheck();
    			editor.selectionChange();
    		}

    		//Copy
    		try {
    			// Other browsers throw an error if the command is disabled.
    			editor.document.$.execCommand( 'Copy', false, null );
    		} catch ( e ) {
    			editor.showNotification("Copy failed, please use CTRL+C");
    		}
    			editor.showNotification("Email copied to clipboard. CTRL+V into Outlook.");
    	}

});