CKEDITOR.dialog.add( 'PQBatchDialog', function(  ) {
    return {
        title: 'Customer Response BCC recipients',
        minWidth: 300,
        minHeight: 200,
        contents: [
            {
                id: 'tab1',
                label: 'Only Tab',
                elements: [
                    {
						
						type: 'vbox',
						heights: [ '195px', null ],
						//styles: [ 'vertical-align:top'],
						children: [
							{
								type: 'textarea',
								id: 'PQBCCField',
								label: '',
								rows: '10',
								style: 'width:300px;height:185px',
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
								validate: CKEDITOR.dialog.validate.notEmpty( "No template selected." )
							}
							],
							type: 'hbox',
							widths: [ null, null ],
							//styles: [ 'vertical-align:bottom' ],
							children: [
								{
									type: 'button',
									id: 'pullemails',
									label: 'Get Emails',
									title: 'Get Emails from Quickbase',
									//style: 'width:50px;height:25px',
									onClick: function() {
										// this = CKEDITOR.ui.dialog.button
										var dbid = "9df5xdir"
										var apptoken = "d9qr25tda5rnrb69z3z9de8uy58"
										var emailfid = 6
										
										var casenum = document.URL.match(/&case=([^&]+)/)
										var query = "{'12'.EX.'"+casenum[1]+"'}"
										var clist = emailfid
										
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
												var bcclist = ""
												$.each($("record emai_addr",xml), function(){
													bcclist += $(this).text()+";"
													})
												if (!bcclist) { CKEDITOR.instances.editor.showNotification("No matching records found in Quickbase."); return; }
												var dialog = CKEDITOR.dialog.getCurrent()
												dialog.setValueOf("tab1","PQBCCField",bcclist);
											},
											error: function() {
												error.show();
											}
										});
										
										
										
									}
								},
								{
									type: 'button',
									id: 'openreport',
									label: 'Open in Quickbase',
									title: 'Open a report of these emails in the Quickbase',
									//style: 'width:50px;height:25px',
									onClick: function() {
										// this = CKEDITOR.ui.dialog.button
										var dbid = "9df5xdir"
										var apptoken = "d9qr25tda5rnrb69z3z9de8uy58"
										var emailfid = 6
										
										var casenum = document.URL.match(/&case=([^&]+)/)
										var query = "{'12'.EX.'"+casenum[1]+"'}"

										var url="";
										url +="https://intuitcorp.quickbase.com/db/"+dbid+"?a=q&query="+query;

										window.open(url,"Related Records");
									}
								}
							]
					}
				]
			}
		],
        onOk: function() {
            var dialog = this;
			var editor = CKEDITOR.instances.editor;
			var bcclist = this.getContentElement('tab1', 'PQBCCField').getValue();
			sessionStorage.setItem('bcclist', bcclist);
			editor.getCommand('batch').setState( 2 );
			editor.execCommand('batch', editor);
        }
    }
});