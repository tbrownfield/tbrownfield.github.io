CKEDITOR.plugins.add( 'email',
{
	init: function( editor )
	{
		editor.addCommand( 'email', { modes: { wysiwyg: 1, source: 1 },
		exec: function( editor ) {
			//Set mailto Link from url parameters
			var mailto = "mailto:";

			var emailaddr = document.URL.match(/&email=([^&]+)/)
			if (emailaddr) {
				mailto += emailaddr[1];
			}

			var emailsubj = document.URL.match(/&sub=([^&]+)/)
			if (!emailsubj) { var emailsubj = [0,"TurboTax Support: Response regarding recent TurboTax Support Contact"]; }
			mailto += "?subject="+emailsubj[1];
			
			var emailbcc = document.URL.match(/&bcc=([^&]+)/)
			if (emailbcc) {
				mailto += "&bcc=" + emailbcc[1];
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
				recordEmail( editor );
		},
		
		canUndo: false
	});

	function recordEmail( editor ) {
		var apptoken = "bzp4e3ubmekgnt45z6fucmmai5k"
		var error = new CKEDITOR.plugins.notification( editor, { message: 'Unable to record email in Quickbase. Please do so manually.', type: 'warning' } );
		var rid = document.URL.match(/&case=([^&]+)/);
		if (!rid) { error.show(); return; }
		
		var temp = document.URL.match(/&temp=([^&]+)/);
		if (!temp) { error.show(); return; }
		
		var editor = CKEDITOR.instances.editor;
		var body = editor.getData();
		var body = body.split(/\<td id\=\"body\"\>/);
		if (body) {
			var body = body[1].split(/<\/td\>/);
			var body = body[0];
		}
		else { error.show(); var body = "<p>Body of email not logged.</p>"; }
		var url="";
		url +="https://intuitcorp.quickbase.com/db/bgkvndp4z";
		url +="?act=API_EditRecord";

		var request="";
		request += '<qdbapi>';
		request += '<apptoken>'+apptoken+'</apptoken>';
		request += '<rid>'+rid[1]+'</rid>';
		request += "<field fid='504'><![CDATA[<h3>Template: "+decodeURI(temp[1])+"</h3>"+body+"]]></field>";
		request += '</qdbapi>';

		jQuery.ajax({
		 type: "POST",
		 contentType: "text/xml",
		 async: false,
		 url: url,
		 dataType: "xml",
		 processData: false,
		 data: request,
		 success: function(xml) {
		  console.log(xml);
		 }
		});
	}
		editor.ui.addButton( 'email',
		{
		label: 'Copy & Email',
		command: 'email',
		icon: this.path + 'icons/email.png'
		} );
	}

} );