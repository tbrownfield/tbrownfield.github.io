CKEDITOR.dialog.add( 'bccdialog', function(  ) {
    return {
        title: 'Customer Response BCC recipients',
        minWidth: 300,
        minHeight: 200,
        contents: [
            {
                id: 'tab1',
                label: 'Only Tab',
                elements: [{
					type: 'vbox',
					heights: [ null, null, null ],
					children: [{
							type: 'textarea',
							id: 'BCCField',
							label: '',
							rows: '10',
							style: 'width:100%;height:100%',
							onLoad: function() {
								var editor = CKEDITOR.instances.editor;
								
								var bcclist = sessionStorage.getItem('bcclist')

								if (bcclist) {
									var dialog = this;
									dialog.setValue(bcclist);
								}
							},
							onShow: function() {
								var bcclist = sessionStorage.getItem('bcclist')
								if (bcclist) {
									var dialog = CKEDITOR.dialog.getCurrent()
									dialog.setValueOf('tab1','BCCField',bcclist)
								}
							},
							validate: CKEDITOR.dialog.validate.notEmpty( "BCC list is blank." ),
						},
						{
							type: 'html',
							html: '<div id="bccinfo"></div>',
						},
						{
							type: 'hbox',
							widths: [ null, null, null ],
							height: [ '20px' ],
							styles: [ 'vertical-align:bottom' ],
							children: [
								{
									type: 'button',
									id: 'pullallemails',
									label: 'Get All Emails',
									title: 'Get All Emails from Quickbase',
									onClick: function() {
										var editor = CKEDITOR.instances.editor
										var settings = editor.config.emailConfig.bccQB
										var caseFid = settings.caseFid;
										var closedfid = settings.closedFid;
										var checkinfid = settings.checkinFid;
										var casenum = sessionStorage.getItem('casenum')
										var query = "{'"+ caseFid +"'.EX.'"+casenum+"'}AND{'"+closedfid+"'.EX.''}"
										getEmails(this,query)
									}
								},
								{
									type: 'button',
									id: 'pullcheckinemails',
									label: 'Get Check-In Emails',
									title: 'Get Check-In Emails from Quickbase',
									onClick: function() {
										var editor = CKEDITOR.instances.editor
										var settings = editor.config.emailConfig.bccQB
										var caseFid = settings.caseFid;
										var closedfid = settings.closedFid;
										var checkinfid = settings.checkinFid;
										var casenum = sessionStorage.getItem('casenum')
										var query = "{'"+ caseFid +"'.EX.'"+casenum+"'}AND{'"+closedfid+"'.EX.''}AND{'"+checkinfid+"'.CT.'YES'}"
										getEmails(this, query);
									}
								},
								{
									type: 'button',
									id: 'openreport',
									label: 'Open in Quickbase',
									title: 'Open a report of these emails in the Quickbase',
									onClick: function() {
										var editor = CKEDITOR.instances.editor
										var settings = editor.config.emailConfig.bccQB
										var dbid = settings.dbid;
										var apptoken = settings.appToken;
										var emailfid = settings.emailFid;
										var caseFid = settings.caseFid;
										var casenum = sessionStorage.getItem('casenum')
										var query = "{'"+ caseFid +"'.EX.'"+casenum+"'}"

										var url="";
										url +="https://intuitcorp.quickbase.com/db/"+dbid+"?a=q&query="+query;

										window.open(url,"Related Records");
									}
								}
							]
						}
						],
					}
				]
			}
		],
        onOk: function() {
            var dialog = this;
			var editor = CKEDITOR.instances.editor;
			var bcclist = this.getContentElement('tab1', 'BCCField').getValue();
			
			var lentest = "mailto:"+sessionStorage.getItem("distros")+"&subject="+sessionStorage.getItem("emailSubj")+"&bcc="+bcclist
			if (lentest.length > 2000) {
				editor.showNotification("Too many email addresses to autopopulate. You will be prompted to copy/paste them manually.")
			}

			var custName = sessionStorage.getItem("custName")
			if (custName) {
				var content = editor.getData()
				var batchName = editor.config.emailConfig.batchName
				
				var regex = new RegExp(fixCaps(custName))
				var content = content.replace(regex,batchName)
				
				editor.setData(content)
			}
			sessionStorage.setItem('bcclist', bcclist);
        }
    }
	function fixCaps(str) {
		return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	}
	
	function getEmails(dlg, query) {
		var doc = dlg.getElement().getDocument();
		doc.getById("bccinfo")["$"].innerHTML = "Retrieving emails from Quickbase...";

		var editor = CKEDITOR.instances.editor
		var settings = editor.config.emailConfig.bccQB
		var dbid = settings.dbid;
		var apptoken = settings.appToken;
		var emailfid = settings.emailFid;
		var clist = emailfid;

		var url="";
		url +="https://intuitcorp.quickbase.com/db/"+dbid;
		url +="?act=API_DoQuery";

		var request="";
		request += '<qdbapi>';
		request += '<apptoken>'+apptoken+'</apptoken>';
		request += '<query>'+query+'</query>';
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
				if ($("errcode",xml).text() != 0) { doc.getById("bccinfo")["$"].innerHTML = "Error: "+$("errtext",xml).text(); return; }
				var bcclist = "";
				var dupes = 0;
				$.each($("record emai_addr",xml), function(){
					var thisemail = $(this).text().toLowerCase();
					if (bcclist.indexOf(thisemail) == -1) {
						bcclist += thisemail+";"
					}
					else { dupes++ }
				})
				if (!bcclist) { doc.getById("bccinfo")["$"].innerHTML = "No matching records found in Quickbase."; return; }
				var dialog = CKEDITOR.dialog.getCurrent()
				dialog.setValueOf("tab1","BCCField",bcclist);

				//var doc = this.getElement().getDocument();
				doc.getById("bccinfo")["$"].innerHTML = (bcclist.split(";").length - 1)+" addresses added. "+dupes+" duplicates skipped.";
				
				var lentest = "mailto:"+sessionStorage.getItem("distros")+"&subject="+sessionStorage.getItem("emailSubj")+"&bcc="+bcclist
				if (lentest.length > 1990) {
					alert("Too many email addresses.")
				}
				
			},
			error: function() {
				doc.getById("bccinfo")["$"].innerHTML = "Error retrieving emails from Quickbase...";
				error.show();
			}
		});
	}
});