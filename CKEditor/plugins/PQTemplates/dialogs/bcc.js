CKEDITOR.dialog.add( 'PQBatchDialog', function(  ) {
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
							id: 'PQBCCField',
							label: '',
							rows: '10',
							style: 'width:100%;height:100%',
							onLoad: function() {
								var editor = CKEDITOR.instances.editor;
								
								var bcclist = sessionStorage.getItem('bcclist')
								if (!bcclist) {
									var bcclist = document.URL.match(/&bcc=([^&]+)/) 
									if (bcclist) {
										var bcclist = bcclist[1];
										var emailaddr = document.URL.match(/&email=([^&]+)/)
										if (emailaddr) {
											bcclist += ";"+emailaddr[1];
										}
									}
								}
								if (bcclist) {
									var dialog = this;
									dialog.setValue(bcclist);
								}
							},
							onShow: function() {
								var bcclist = sessionStorage.getItem("bcclist")
								if (bcclist) {
									var dialog = CKEDITOR.dialog.getCurrent()
									dialog.setValueOf("tab1","PQBCCField",bcclist)
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
										var doc = this.getElement().getDocument();
										doc.getById("bccinfo")["$"].innerText = "Retrieving emails from Quickbase...";
										
										var editor = CKEDITOR.instances.editor
										var settings = editor.config.emailConfig.bccQB
										var dbid = settings.dbid;
										var apptoken = settings.appToken;
										var emailfid = settings.emailFid;
										var closedfid = settings.closedFid;
										var caseFid = settings.caseFid;
										var casenum = document.URL.match(/&case=([^&]+)/)
										var query = "{'"+ caseFid +"'.EX.'"+casenum[1]+"'}AND{'"+closedfid+"'.EX.''}"
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
												var bcclist = "";
												var dupes = 0;
												$.each($("record emai_addr",xml), function(){
													var thisemail = $(this).text().toLowerCase();
													if (bcclist.indexOf(thisemail) == -1) {
														bcclist += thisemail+";"
													}
													else { dupes++ }
												})
												if (!bcclist) { doc.getById("bccinfo")["$"].innerText = "No matching records found in Quickbase."; return; }
												var dialog = CKEDITOR.dialog.getCurrent()
												dialog.setValueOf("tab1","PQBCCField",bcclist);

												//var doc = this.getElement().getDocument();
												doc.getById("bccinfo")["$"].innerText = (bcclist.split(";").length - 1)+" addresses added. "+dupes+" duplicates skipped.";
												
												var lentest = "mailto:"+sessionStorage.getItem("distros")+"&subject="+sessionStorage.getItem("emailSubj")+"&bcc="+bcclist
												if (lentest.length > 1990) {
													alert("Too many email addresses.")
												}
												
											},
											error: function() {
												doc.getById("bccinfo")["$"].innerText = "Error retrieving emails from Quickbase...";
												error.show();
											}
										});
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
										var query = "{'"+ caseFid +"'.EX.'"+casenum[1]+"'}AND{'"+closedfid+"'.EX.''}AND{'"+checkinfid+"'.CT.'YES'}"
										getEmails(query);
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
										var casenum = document.URL.match(/&case=([^&]+)/)
										var query = "{'"+ caseFid +"'.EX.'"+casenum[1]+"'}"

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
			var bcclist = this.getContentElement('tab1', 'PQBCCField').getValue();
			
			var lentest = "mailto:"+sessionStorage.getItem("distros")+"&subject="+sessionStorage.getItem("emailSubj")+"&bcc="+bcclist
			if (lentest.length > 1990) {
				alert("Too many email addresses.")
			}
			
			sessionStorage.setItem('bcclist', bcclist);
			editor.getCommand('batch').setState( 2 );
			editor.execCommand('batch', editor);
        }
    }
	function getEmails(query) {
		var doc = this.getElement().getDocument();
		doc.getById("bccinfo")["$"].innerText = "Retrieving emails from Quickbase...";

		var editor = CKEDITOR.instances.editor
		var settings = editor.config.emailConfig.bccQB
		var dbid = settings.dbid;
		var apptoken = settings.appToken;
		var emailfid = settings.emailFid;
		var casenum = document.URL.match(/&case=([^&]+)/)
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
				var bcclist = "";
				var dupes = 0;
				$.each($("record emai_addr",xml), function(){
					var thisemail = $(this).text().toLowerCase();
					if (bcclist.indexOf(thisemail) == -1) {
						bcclist += thisemail+";"
					}
					else { dupes++ }
				})
				if (!bcclist) { doc.getById("bccinfo")["$"].innerText = "No matching records found in Quickbase."; return; }
				var dialog = CKEDITOR.dialog.getCurrent()
				dialog.setValueOf("tab1","PQBCCField",bcclist);

				//var doc = this.getElement().getDocument();
				doc.getById("bccinfo")["$"].innerText = (bcclist.split(";").length - 1)+" addresses added. "+dupes+" duplicates skipped.";
				
				var lentest = "mailto:"+sessionStorage.getItem("distros")+"&subject="+sessionStorage.getItem("emailSubj")+"&bcc="+bcclist
				if (lentest.length > 1990) {
					alert("Too many email addresses.")
				}
				
			},
			error: function() {
				doc.getById("bccinfo")["$"].innerText = "Error retrieving emails from Quickbase...";
				error.show();
			}
		});
	}
});