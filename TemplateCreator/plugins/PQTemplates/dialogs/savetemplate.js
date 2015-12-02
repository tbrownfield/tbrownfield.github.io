CKEDITOR.dialog.add( 'PQSaveTemplateDialog', function(  ) {
    return {
        title: 'Save Template',
        minWidth: 300,
        minHeight: 150,
        contents: [{
			id: 'tab1',
			label: 'Only Tab',
			elements: [{
				type: 'vbox',
				widths: [ '25%', '25%', '25%', '25%' ],
				children: [
					{	
						type: 'text',
						id: 'tempname',
						label: 'Name',
						style: 'width:300px',
						onShow: function() {
							var tempname = document.URL.match(/&temp=([^&]+)/)
							if (tempname) {
								var dialog = CKEDITOR.dialog.getCurrent()
								dialog.setValueOf("tab1","tempname",decodeURIComponent(tempname[1]))
							}
						},
						validate: CKEDITOR.dialog.validate.notEmpty( "Please enter a name for this template." )
					},
					{
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
						items: [ ['Other'] ],
						onLoad: function() {
							var editor = CKEDITOR.instances.editor
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
									var options = $("field #"+subjectFid+" choices",xml);
									$.each(options, function() {
										this.add($(this).text())
									})
								},
								error: function() {
								}
							});
						}
					}
				]
			}]
		}],
        onOk: function() {
            var dialog = this;
			var editor = CKEDITOR.instances.editor;
			//var bcclist = this.getContentElement('tab1', 'PQBCCField').getValue();

			var dbid = editor.config.PQTemplates.TemplateQB.dbid
			var appToken = editor.config.PQTemplates.TemplateQB.appToken
			var nameFid = editor.config.PQTemplates.TemplateQB.nameFid
			var contentFid = editor.config.PQTemplates.TemplateQB.contentFid
			var categoryFid = editor.config.PQTemplates.TemplateQB.categoryFid
			var noReplyFid = editor.config.PQTemplates.TemplateQB.noReplyFid
			var sharedFid = editor.config.PQTemplates.TemplateQB.sharedFid
			var caseOnlyFid = editor.config.PQTemplates.TemplateQB.caseOnlyFid
			var caseFid = editor.config.PQTemplates.TemplateQB.caseFid

			var tempname = dialog.getValueOf("tab1","tempname")
			var noreply = dialog.getValueOf("tab1","noreply")

			var caseonly = dialog.getValueOf("tab1","caseonly")
			if (caseonly == true) { 
				var casenum = document.URL.match(/&case=([^&]+)/)
				if (casenum) { var casenum = casenum[1] }
				else { var casenum = 0 }
			}
			else { var casenum = 0 }
			
			var content = editor.getData();
			var content = content.split(/\<td id\=\"body\"[^\>]+>/);
			if (content) {
				var content = content[1].split(/<\/td\>/);
				var content = content[0];
			}
			else { console.log("error") }

			var shared = dialog.getValueOf("tab1","share")
			if (shared != false) { var category = "PQ Customer Responses" }
			else { var category = "Personal" }
			
			var url="";
			url +="https://intuitcorp.quickbase.com/db/"+dbid;
			url +="?act=API_AddRecord";

			var request="";
			request += '<qdbapi>';
			request += '<apptoken>'+appToken+'</apptoken>';
			request += '<field fid="'+categoryFid+'">'+category+'</field>';
			request += '<field fid="'+nameFid+'">'+tempname+'</field>';
			request += '<field fid="'+contentFid+'"><![CDATA['+content+']]></field>';
			request += '<field fid="'+noReplyFid+'">'+noreply+'</field>';
			request += '<field fid="'+sharedFid+'">'+shared+'</field>';
			request += '<field fid="'+caseOnlyFid+'">'+caseonly+'</field>';
			request += '<field fid="'+caseFid+'">'+casenum+'</field>';
			request += '</qdbapi>';

			jQuery.ajax({
				type: "POST",
				contentType: "text/xml",
				url: url,
				dataType: "xml",
				processData: false,
				data: request,
				success: function(xml) {
				},
				error: function() {
				}
			});
        }
    }
});