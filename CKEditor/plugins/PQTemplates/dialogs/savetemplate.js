CKEDITOR.dialog.add( 'PQSaveTemplateDialog', function(  ) {
    return {
        title: 'Save Template',
        minWidth: 300,
        minHeight: 75,
        contents: [{
			id: 'tab1',
			label: 'Only Tab',
			elements: [{
				type: 'vbox',
				widths: [ null ],
				children: [
					{	
						type: 'text',
						id: 'tempname',
						label: 'Name',
						style: 'width:300px',
						onShow: function() {
							var template = sessionStorage.getItem('template')
							if (template) {
								var dialog = CKEDITOR.dialog.getCurrent()
								dialog.setValueOf("tab1","tempname",template)
							}
						},
						validate: CKEDITOR.dialog.validate.notEmpty( "Please enter a name for this template." )
					}
					/*{
						type: 'checkbox',
						id: 'noreply',
						label: 'No Reply',
						title: 'Use the \"No Reply\" footer'
					},
					{
						type: 'text',
						id: 'distros',
						label: 'Default Distros',
						title: 'Email addresses to populate to the To field for every email using this template.'
					},
					{
						type: 'select',
						id: 'subject',
						label: 'Subject',
						title: 'Default subject line for emails using this template.',
						items: [ [] ],
						onLoad: function() {
							var editor = CKEDITOR.instances.editor
							
							selbox = this;
							
							var dbid = editor.config.PQTemplates.TemplateQB.dbid
							var appToken = editor.config.PQTemplates.TemplateQB.appToken
							var subjectFid = editor.config.PQTemplates.TemplateQB.subjectFid
							
							var url="";
							url +="https://intuitcorp.quickbase.com/db/"+dbid;
							url +="?act=API_GetSchema";

							var request="";
							request += '<qdbapi>';
							request += '<apptoken>'+appToken+'</apptoken>';
							request += '</qdbapi>';

							jQuery.ajax({
								type: "POST",
								contentType: "text/xml",
								url: url,
								dataType: "xml",
								processData: false,
								data: request,
								success: function(xml) {
									var options = $("#"+subjectFid+" choice",xml);
									$.each(options, function() {
										selbox.add($(this).text())
									})
									selbox.add("other")
								},
								error: function() {
								}
							});
						}
					}*/
				]
			}]
		}],
        onOk: function() {
            var dialog = this;
			var editor = CKEDITOR.instances.editor;
			var settings = editor.config.PQTemplates.TemplateQB
			
			
			var batchName = editor.config.emailConfig.batchName
			var dbid = settings.dbid
			var appToken = settings.appToken
			var nameFid = settings.nameFid
			var contentFid = settings.contentFid
			var noReplyFid = settings.noReplyFid

			var savename = dialog.getValueOf("tab1","tempname")

			var loadname = sessionStorage.getItem('template')

			var content = editor.getData();
			var content = content.split(/\<td id\=\"body\"[^\>]+>/);
			if (content) {
				var content = content[1].split(/<\/td\>/);
				var content = content[0]
			}
			else { console.log("error") }

			if (content.indexOf(batchName) == -1) {
				if (confirm('Your template does not contain the keyphrase "'+batchName+'". Without this phrase, the customer\'s name will not be inserted into the message when appropriate. Do you wish to continue?') == false) {
					return false;
				}
			}

			var request="";
			request += '<qdbapi>';
			request += '<apptoken>'+appToken+'</apptoken>';

			var url="";
			url +="https://intuitcorp.quickbase.com/db/"+dbid;
			
			if (loadname == savename) {
				var casenum = sessionStorage.getItem('casenum')
				if (!casenum) { console.log("No record ID, unable to update record.") }
				
				url +="?act=API_EditRecord";
				request += '<rid>'+casenum+'</rid>';
			}
			else {
				url +="?act=API_AddRecord";
			}
			
			if (editor.getCommand('noreply').state == 1) {
				request += '<field fid="'+noReplyFid+'">true</field>';	
			}
			else { request += '<field fid="'+noReplyFid+'">false</field>'; }
			
			request += '<field fid="'+nameFid+'">'+savename+'</field>';
			request += '<field fid="'+contentFid+'"><![CDATA['+content+']]></field>';
			request += '</qdbapi>';

			jQuery.ajax({
				type: "POST",
				contentType: "text/xml",
				url: url,
				dataType: "xml",
				processData: false,
				data: request,
				success: function(xml) {
					if ($("errcode",xml).text() != 0) { editor.showNotification("Failed to save template. "+$("errtext",xml).text()); }
					else { editor.showNotification("Template saved."); }
				},
				error: function() {
					editor.showNotification("Failed to save template.");
				}
			});
        }
    }
});