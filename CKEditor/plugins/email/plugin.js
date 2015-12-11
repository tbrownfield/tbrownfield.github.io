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
			if (emailsubj.length > 255) {
				var error = new CKEDITOR.plugins.notification( editor, { message: 'Email Subject is too long and will be truncated. Review it before sending the email.', type: 'warning' } );
				error.show()
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
				var dateFid = ""
				var bulkType = sessionStorage.getItem('bulkType')
				if (bulkType == 'Response') { var dateFid = editor.config.emailConfig.bccQB.closedFid }
				if (bulkType == 'Check-In') { var dateFid = editor.config.emailConfig.bccQB.checkinFid }
				if (!sessionStorage.getItem("bcclist")) { var dateFid = "" }
				if (dateFid) { updateResponses(dateFid) }
		},
		
		canUndo: false
	});

	function recordEmail( editor ) {
		var settings = editor.config.emailConfig;
		var apptoken = settings.appToken;
		var qbdbid = settings.dbid;
		var qbfid = settings.historyFid;
		var error = new CKEDITOR.plugins.notification( editor, { message: 'Unable to record email contents in CSI QuickBase record. Please do so manually.', type: 'warning' } );
		var rid = sessionStorage.getItem('casenum');
		if (!rid) { error.show(); return; }
		
		var template = sessionStorage.getItem('template');
		if (!template) { var template = "No Template Used" }
		
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
				if ($(xml).find("errcode").text() == 0) { editor.showNotification("Successfully recorded email to CSI QuickBase."); }
				else { error.show(); }
			},
			error: function() {
				error.show();
			}
		});
	}
	
	function updateResponsesSafeMode(dateFid) {

		var editor = CKEDITOR.instances.editor
		var error = new CKEDITOR.plugins.notification( editor, { message: 'Failed to update one or more records in CSI Email Tracker Quickbase. Please do so manually.', type: 'warning' } );

		if (!dateFid) { error.show; return false }

		var editor = CKEDITOR.instances.editor;
		var settings = editor.config.emailConfig.bccQB;
		var apptoken = settings.appToken;
		var qbdbid = settings.dbid;
		
		//var bulkType = sessionStorage.getItem('bulkType');
		var ridlist = sessionStorage.getItem("ridlist").split(",")
		if (!ridlist) { error.show(); return; }

		var url="";
		url +="https://intuitcorp.quickbase.com/db/"+qbdbid;
		url +="?act=API_EditRecord";

		var ridlist = sessionStorage.getItem("ridlist").toString().split(',')

		var curDate = new Date().toJSON().slice(0,10).split('-')
		var curDate = curDate[1]+"/"+curDate[2]+"/"+curDate[0]
		var goodupdate = 0;
		var badupdate = 0;
		$.each(ridlist, function() {		
			var request="";
			request += '<qdbapi>';
			request += '<apptoken>'+apptoken+'</apptoken>';
			request += '<rid>'+this+'</rid>';
			request += "<field fid='"+dateFid+"'>"+curDate+"</field>";
			request += '</qdbapi>';

			jQuery.ajax({
				type: "POST",
				contentType: "text/xml",
				url: url,
				dataType: "xml",
				processData: false,
				data: request,
				success: function(xml) {
					if ($(xml).find("errcode").text() == 0) { 
						goodupdate++
					}
					else { error.show(); badupdate++ }
				},
				error: function() {
					error.show();
					badupdate++
				}
			});
		})
	}
	
	//takes FID of field to update as parameter. Pass checkin or workaround fid to update checkin or close.
	function updateResponses(dateFid) {
		var editor = CKEDITOR.instances.editor
		if (editor.config.emailConfig.bccQB.safeMode == 1) { updateResponsesSafeMode(dateFid); }
		var error = new CKEDITOR.plugins.notification( editor, { message: 'Unable to update CSI Email Tracker Quickbase. Please do so manually.', type: 'warning' });

		if (!dateFid) { error.show; return false }

		var editor = CKEDITOR.instances.editor;
		var settings = editor.config.emailConfig.bccQB;
		var apptoken = settings.appToken;
		var qbdbid = settings.dbid;
		
		//var bulkType = sessionStorage.getItem('bulkType');
		var ridlist = sessionStorage.getItem("ridlist")
		if (!ridlist) { error.show(); return; }
		var ridlist = ridlist.split(",")

		var url="";
		url +="https://intuitcorp.quickbase.com/db/"+qbdbid;
		url +="?act=API_ImportFromCSV";

		var ridlist = sessionStorage.getItem("ridlist").toString()
		var regex = new RegExp("\,","g")

		var curDate = new Date().toJSON().slice(0,10).split('-')
		var curDate = curDate[1]+"/"+curDate[2]+"/"+curDate[0]
		
		var batchcsv = ridlist.replace(regex,","+curDate+"\n")+","+curDate
		var clist = "3."+dateFid
		
		var request="";
		request += '<qdbapi>';
		request += '<apptoken>'+apptoken+'</apptoken>';
		request += '<records_csv><![CDATA['+batchcsv+']]></records_csv>';
		request += '<clist>'+clist+'</clist>';
		request += '</qdbapi>';

		jQuery.ajax({
			type: "POST",
			contentType: "text/xml",
			url: url,
			dataType: "xml",
			processData: false,
			data: request,
			success: function(xml) {
				if ($(xml).find("errcode").text() == 0) { 
					var error = new CKEDITOR.plugins.notification( editor, { message: 'WARNING: CSI Email Tracker QuickBase did not return the expected response! Please verify record updates and notify the QuickBase\'s administrator.', type: 'warning' } );
					var toupdate = sessionStorage.ridlist.split(',').length
					var input = $("num_recs_input", xml).text()
					var updated = $("num_recs_updated", xml).text()
					var added = $("num_recs_added", xml).text()
					var unchanged = $("num_recs_unchanged", xml).text()
					if (toupdate != input) { error.show; return }
					if (added != 0) {
						var error = new CKEDITOR.plugins.notification( editor, { message: 'WARNING: CSI Email Tracker QuickBase did not return the expected response! Unwanted records were created! Please verify record updates and notify the QuickBase\'s administrator.', type: 'warning' } );
						error.show;
						return;
					}
					if (toupdate != updated) { error.show; return }
					else { editor.showNotification("Successfully updated "+updated+" Quickbase records."); }
				}
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