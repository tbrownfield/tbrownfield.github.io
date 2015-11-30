CKEDITOR.dialog.add( 'PQSaveTemplateDialog', function(  ) {
    return {
        title: 'Save Template',
        minWidth: 300,
        minHeight: 150,
        contents: [
            {
                id: 'tab1',
                label: 'Only Tab',
                elements: [
                    {
						
						type: 'vbox',
						widths: [ '25%', '25%', '25%' ],
						children: [
							{	
								type: 'text',
								id: 'tempname',
								label: 'Name',
								style: 'width:300px',
								validate: CKEDITOR.dialog.validate.notEmpty( "Please enter a name for this template." )
							},
							{
								type: 'checkbox',
								id: 'noreply',
								label: 'No Reply',
								title: 'Use the \"No Reply\" footer',
							},
							{
								type: 'checkbox',
								id: 'share',
								label: 'Share Template',
								title: 'Make this template available to other users',
							},
							{
								type: 'checkbox',
								id: 'caseonly',
								label: 'This Case Only',
								title: 'If checked, this template will only show up for the current case',
							}
						]
					}
				]
			}
		],
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