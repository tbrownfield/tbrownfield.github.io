CKEDITOR.dialog.add('bccdialog', function(editor) {
    return {
        title: 'Customer Response BCC recipients',
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
                            var pageobj = dialog.getContentElement('tab1','page');
                            var page = pageobj.getValueOf('tab1','page');
                            if (page > 1) { 
                                page--;
                                setPage(editor,dialog,page);
                                pageobj.setValue(page);
                            }
                            toggleButtons(editor,dialog,page);
                            
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
                        onChange: function (editor) {
                            var page = this.getValue();
                            var dialog = this.getDialog();
                            setPage(editor, dialog, page);
                            toggleButtons(editor,dialog,page);
                        }
                    }, {
                        type: 'button',
                        id: 'email',
                        label: 'Start Email',
                        title: 'Start new Email in Outlook',
                        onClick: function(editor) {

                        }
                        
                    }, {
                        type: 'button',
                        id: 'next',
                        label: '>>',
                        title: 'Next Page',
                        onClick: function(editor) {
                            var dialog = this.getDialog();
                            var pageobj = dialog.getContentElement('tab1','page');
                            var page = pageobj.getValueOf('tab1','page');
                            if (page < getPages()) {
                                page++;
                                setPage(editor,dialog,page);
                                pageobj.setValue(page);
                            }
                            toggleButtons(editor,dialog,page);
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
            var bccpages = getPages()
            var dialog = this.getDialog();
            for (var i = 1; i <= bccpages; i++) {
                var selbox = dialog.getContentElement( 'tab1', 'page' );
				selbox.add("i");
            }
            setPage(editor,dialog,1)
            }
        };

    function setPage(editor, dlg, page) {
        var bcclist = sessionStorage.getItem("bcclist");
        var bccarray = bcclist.split(";");
        var pstart = (page - 1) * 495;
        var pend = pstart + 495;
        var bcc = dlg.getContentElement('tab1','BCCField');
        bcc.setValue(bccarray.slice(pstart,pend).toString());
        bcc.select()
    }
    
    function getPages() {
        var bcclist = sessionStorage.getItem("bcclist");
        var bccarray = bcclist.split(";");
        return Math.ceil(bccarray.length / 495);
    }
    
    function toggleButtons(editor, dialog, page) {
        var maxpage = getPages();
        var next = dialog.getContentElement("tab1","next");
        var prev = dialog.getContentElement("tab1","next");
        
        if (page < 2) {
            var btn = document.getElementById(prev);
            btn.style.visibility = "hidden";
        }
        if (page > 1) {
            var btn = document.getElementById(prev);
            btn.style.visibility = "visible";
        }
        if (page >= maxpage) {
            var btn = document.getElementById(next);
            btn.style.visibility = "hidden";
        }
        if (page < maxpage) {
            var btn = document.getElementById(next);
            btn.style.visibility = "visible";
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