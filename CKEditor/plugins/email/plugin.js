CKEDITOR.plugins.add( 'email', {
	icons: 'email',
	init: function( editor )
	{
		CKEDITOR.dialog.add( 'bccdialog', this.path + 'dialogs/bcc.js' );
		
		editor.addCommand( 'bcclist', new CKEDITOR.dialogCommand( 'bccdialog' ) );
		
		editor.addCommand( 'email', { modes: { wysiwyg: 1, source: 1 },
		exec: function( editor ) {
			//Set mailto Link from url parameters
			editor.widgets.destroyAll()
			var settings = editor.config.emailConfig;
			var mailto = "mailto:";

			var emailbcc = sessionStorage.getItem('bcclist')
			var emailaddr = sessionStorage.getItem('custEmail')
			var distros = sessionStorage.getItem("distros")
			if (distros) { var emailaddr = distros }

			var emailsubj = sessionStorage.getItem("emailsubj");
			if (!emailsubj) { var emailsubj = settings.defaultSubject }
			if (emailsubj) {
				var emailsubj = unescape(emailsubj)
				var emailsubj = replaceKeywords(emailsubj)
			}
			
			if (emailbcc) {
				if ((mailto.length + emailbcc.length) > 2000) {
					var error = new CKEDITOR.plugins.notification( editor, { message: 'Too many BCC addresses to auto-populate. Please paste the email, then copy/paste the BCC list.', type: 'warning' } );
					error.show()
					editor.execCommand("bcclist")
				}
				else { mailto += "?bcc=" + emailbcc; }
			}
			else {
				if (emailaddr) {
					mailto += emailaddr;
				}
			}

			if (mailto.indexOf("?") == -1) { mailto += "?" }
			else { mailto += "&"}
			
			mailto += "subject="+emailsubj;
			
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
				recordEmail( editor );
		},
		
		canUndo: false
	});

	function recordEmail( editor ) {
		var settings = editor.config.emailConfig;
		var apptoken = settings.appToken;
		var qbdbid = settings.dbid;
		var qbfid = settings.historyFid;
		var error = new CKEDITOR.plugins.notification( editor, { message: 'Unable to record email in Quickbase. Please do so manually.', type: 'warning' } );
		var rid = sessionStorage.getItem('casenum');
		if (!rid) { error.show(); return; }
		
		var template = sessionStorage.getItem('template');
		if (!template) { error.show(); return; }
		
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
		request += '<rid>'+rid+'</rid>';
		request += "<field fid='"+qbfid+"'><![CDATA[<h3>Template: "+template+"</h3>"+body+"]]></field>";
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
	
	function replaceKeywords(content) {
		//Keyword replacements
		var analystName = sessionStorage.analystName
		var analystName = unescape(analystName)
		if (analystName == "undefined") { var analystName = "" }

		var analystEmail = sessionStorage.analystEmail
		var analystEmail = unescape(analystEmail)
		if (analystEmail == "undefined") { var analystEmail = "" }

		var custName = sessionStorage.custName
		var custName = unescape(custName)
		if (custName == "undefined") { var custName = "" }
		
		var custName = sessionStorage.custEmail
		var custName = unescape(custEmail)
		if (custName == "undefined") { var custEmail = "" }

		var casenum = sessionStorage.casenum
		var casenum = unescape(casenum)
		if (casenum == "undefined") { var casenum = "" }

		var issueTitle = sessionStorage.issueTitle
		var issueTitle = unescape(issueTitle)
		if (issueTitle == "undefined") { var issueTitle = "" }

		var thisyear = new Date().getFullYear()
		var regex = new RegExp("\\[COPYRIGHT YEAR\\]","g")
		var content = content.replace(regex, thisyear);
		
		if (content.match(/\[CUSTOMER NAME\]/)) {
			if (custName) {
				var regex = new RegExp("\\[CUSTOMER NAME\\]","g")
				var content = content.replace(regex, fixCaps(custName));
			}
			else {
				var regex = new RegExp("\\[CUSTOMER NAME\\]","g")
				var content = content.replace(regex, editor.config.emailConfig.batchName);
			}
		}

		//special case to handle existing response templates that use %CUSTOMER_NAME%
		if (content.match(/\%CUSTOMER_NAME\%/)) {
			if (custName) {
				var regex = new RegExp("\\%CUSTOMER_NAME\\%","g")
				var content = content.replace(regex, fixCaps(custName));
			}
			else {
				var regex = new RegExp("\\%CUSTOMER_NAME\\%","g")
				var content = content.replace(regex, editor.config.emailConfig.batchName);
			}
		}

		if (custEmail) {
			var regex = new RegExp("\\[CUSTOMER EMAIL\\]","g");
			var content = content.replace(regex, custEmail.toLowerCase());
		}
		
		if (sessionStorage.getItem('casenum')) {
			var regex = new RegExp("\\[CASE NUMBER\\]","g")
			var content = content.replace(regex, casenum);
		}
		else {
			$("main:first").prepend("<div style='text-align: center; font-weight: bold; background:orange';>No Case number found. Email will not be logged to Quickbase. Please record it manually.</div>");
		}

		if (analystName) {
			var regex = new RegExp("\\[ANALYST NAME\\]","g");
			var content = content.replace(regex, fixCaps(analystName));
		}

		if (analystEmail) {
			var regex = new RegExp("\\[ANALYST EMAIL\\]","g");
			var content = content.replace(regex, analystEmail.toLowerCase());
		}

		if (issueTitle) {
			var regex = new RegExp("\\[ISSUE TITLE\\]","g");
			var content = content.replace(regex, issueTitle);
		}
		return(content)
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