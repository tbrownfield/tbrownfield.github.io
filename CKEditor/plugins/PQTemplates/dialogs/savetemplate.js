CKEDITOR.dialog.add( 'PQSaveTemplateDialog', function(  ) {
    return {
        title: 'Save Template',
        minWidth: 300,
        minHeight: 200,
        contents: [
            {
                id: 'tab1',
                label: 'Only Tab',
                elements: [
                    {
						
						type: 'vbox',
						widths: [ '25%', '75%' ],
						children: [
							{	
								type: 'text',
								id: 'tempname',
								label: 'Name',
								style: 'width:300px;height:185px',
								validate: CKEDITOR.dialog.validate.notEmpty( "No template selected." )
							},
							{
								type: 'checkbox',
								id: 'noreply',
								label: 'No Reply',
								title: 'Use the "No Reply" footer',
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

			var dbid = editor.config.PQTemplates.dbid
			var appToken = editor.config.PQTemplates.appToken
			var nameFid = editor.config.PQTemplates.nameFid
			var contentFid = editor.config.PQTemplates.contentFid
			var categoryFid = editor.config.PQTemplates.categoryFid
			var noReplyFid = editor.config.PQTemplates.noReplyFid
			var sharedFid = editor.config.PQTemplates.sharedFid
			var caseOnlyFid = editor.config.PQTemplates.caseOnlyFid
			var caseFid = editor.config.PQTemplates.caseFid

			var tempname = dialog.getValueOf("tempname")
			var noreply = dialog.getValueOf("noreply")

			var caseonly = dialog.getValueOf("caseonly")
			if (caseonly == 1) { 
				var casenum = document.URL.match(/&case=([^&]+)/)
				if (casenum) { var casenum = casenum[1] }
				else { var casenum = 0 }
			}
			else { var casenum = 0 }

			var shared = dialog.getValueOf("shared")
			if (shared == 0) { var category = "PQ Customer Responses" }
			else { var category = "Personal" }
			
			var url="";
			url +="https://intuitcorp.quickbase.com/db/"+dbid;
			url +="?act=API_AddRecord";

			var request="";
			request += '<qdbapi>';
			request += '<apptoken>'+apptoken+'</apptoken>';
			request += '<field fid="'+categoryFid+'">'+category+'</field>';
			request += '<field fid="'+nameFid+'">'+tempname+'</field>';
			request += '<field fid="'+contentFid+'">'+content+'</field>';
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