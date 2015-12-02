CKEDITOR.plugins.add( 'email', {
	icons: 'email',
	init: function( editor )
	{
		
		editor.addCommand( 'bcclist', new CKEDITOR.dialogCommand( 'PQBatchDialog' ) );
		
		editor.addCommand( 'email', { modes: { wysiwyg: 1, source: 1 },
		exec: function( editor ) {
			//Set mailto Link from url parameters
			editor.widgets.destroyAll()
			var settings = editor.config.emailConfig;
			var mailto = "mailto:";

			var emailbcc = sessionStorage.getItem('bcclist')
			if (!emailbcc) {
				var emailbcc = document.URL.match(/&bcc=([^&]+)/) 
				if (emailbcc) {
					var emailbcc = emailbcc[1];
				}
			}
			
			var emailaddr = document.URL.match(/&email=([^&]+)/)
			if (emailaddr) {var emailaddr = emailaddr[1]}
			//else { var emailaddr = mailto: }
			var distros = sessionStorage.getItem("distros")
			if (distros) {emailaddr += ";" + distros}

			var emailsubj = document.URL.match(/&sub=([^&]+)/);
			if (!emailsubj) {
				var emailsubj = sessionStorage.getItem("emailsubj");
				if (!emailsubj) {
					var emailsubj = [0,settings.defaultSubject];
				}
			}
			else emailsubj = emailsubj[1];
			
			mailto += "?subject="+emailsubj;
			
			if (emailbcc) {
				if ((mailto.length + emailbcc.length) > 2000) {
					var error = new CKEDITOR.plugins.notification( editor, { message: 'Too many BCC addresses to auto-populate. Please copy/paste the list manually.', type: 'warning' } );
					error.show()
					editor.execCommand("bcclist")
				}
				else { mailto += "&bcc=" + emailbcc; }
			}
			else {
				if (emailaddr) {
					//mailto += emailaddr;
				}
			}
			
			document.location.href=mailto;
			
			
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

				// Force triggering selectionChange (#7008)
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
				//recordEmail( editor );
		},
		
		canUndo: false
	});

	function recordEmail( editor ) {
		var settings = editor.config.emailConfig;
		var apptoken = settings.appToken;
		var qbdbid = settings.dbid;
		var qbfid = settings.historyFid;
		var error = new CKEDITOR.plugins.notification( editor, { message: 'Unable to record email in Quickbase. Please do so manually.', type: 'warning' } );
		var rid = document.URL.match(/&case=([^&]+)/);
		if (!rid) { error.show(); return; }
		
		var temp = document.URL.match(/&temp=([^&]+)/);
		if (!temp) { error.show(); return; }
		
		var editor = CKEDITOR.instances.editor;
		var body = editor.getData();
		var body = body.split(/\<td id\=\"body\"[^\>]+>/);
		if (body) {
			var body = body[1].split(/<\/td\>/);
			var body = body[0];
		}
		else { error.show(); var body = "<p>Body of email not logged.</p>"; }
		var url="";
		url +="https://intuitcorp.quickbase.com/db/"+qbdbid;
		url +="?act=API_EditRecord";

		var request="";
		request += '<qdbapi>';
		request += '<apptoken>'+apptoken+'</apptoken>';
		request += '<rid>'+rid[1]+'</rid>';
		request += "<field fid='"+qbfid+"'><![CDATA[<h3>Template: "+decodeURI(temp[1])+"</h3>"+body+"]]></field>";
		request += '</qdbapi>';

		jQuery.ajax({
			type: "POST",
			contentType: "text/xml",
			url: url,
			dataType: "xml",
			processData: false,
			data: request,
			success: function(xml) {
				if ($(xml).find("errcode").text() == 0) { editor.showNotification("Successfully recorded to Quickbase."); }
				else { error.show(); }
			},
			error: function() {
				error.show();
			}
		});
	}
		editor.ui.addButton( 'bcclist', {
			label: 'BCC List',
			command: 'bcclist',
			toolbar: 'finalize,0'
		});
		editor.ui.addButton( 'email', {
			label: 'Copy & Email',
			command: 'email',
			toolbar: 'finalize,1'
		});
	}

} );