CKEDITOR.dialog.add( 'PQTemplateDialog', function(  ) {
    return {
        title: 'Customer Response Email Templates',
        minWidth: 300,
        minHeight: 200,
        contents: [
            {
                id: 'tab1',
                label: 'Only Tab',
                elements: [
                    {
                        type: 'select',
                        id: 'PQTemplatesSelect',
                        label: '',
						style: 'width:300px;height:100%',
						size: 20,
						items: [],
						onLoad: function() {
							var editor = CKEDITOR.instances.editor
							var dialog = this.getDialog()
							
							selbox = dialog.getContentElement( 'tab1', 'PQTemplatesSelect' );
							selbox.add("Blank"," ")
							
							var dbid = editor.config.PQTemplates.TemplateQB.dbid
							var appToken = editor.config.PQTemplates.TemplateQB.appToken
							var nameFid = editor.config.PQTemplates.TemplateQB.nameFid
							var categoryFid = editor.config.PQTemplates.TemplateQB.categoryFid

							var sharedFid = editor.config.PQTemplates.TemplateQB.sharedFid
							var caseOnlyFid = editor.config.PQTemplates.TemplateQB.caseOnlyFid
							var caseFid = editor.config.PQTemplates.TemplateQB.caseFid
							
							var qid = "5"
							var clist = nameFid+'.'+categoryFid+'.'+sharedFid+'.'+caseOnlyFid+'.'+caseFid

							var url="";
							url +="https://intuitcorp.quickbase.com/db/"+dbid;
							url +="?act=API_DoQuery";

							var request="";
							request += '<qdbapi>';
							request += '<apptoken>'+appToken+'</apptoken>';
							request += '<qid>'+qid+'</qid>';
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
									var temps = $("record",xml)
									$.each(temps, function() {
										if ($("case_only",this).text == "1") {
											var tempname = $("name",this).text()
											var casenum = document.URL.match(/&case=([^&]+)/)
											if (casenum) {
												var casenum = casenum[1]
												if ($("case_number", this).text() != casenum) { return true; }
												var tempname = "[Case] "+tempname
											}
											else { return true; }
											selbox.add(tempname, $("name",this).text())
										}
									})
									$.each(temps, function() {
										if ($("category", this).text() == "Personal") {
											var tempname = $("name",this).text()
											var tempname = "[Personal] "+tempname
											selbox.add(tempname, $("name",this).text())
										}
									})
									$.each(temps, function() {
										if ($("category", this).text() == "PQ Customer Responses") {
											var tempname = $("name",this).text()
											selbox.add(tempname, $("name",this).text())
										}
									})
									
									
									/*
									$.each(temps, function(){ 
										var tempname = $("name", this).text()

										if ($("caseonly", this).text() == "1") {

											var casenum = document.URL.match(/&case=([^&]+)/)
											if (casenum) {
												var casenum = casenum[1]
												if ($("case_number", this).text() != casenum) { return true; }
												var tempname = "[Case] "+tempname
											}
											else { return true; }
												
										}
										if ($("category", this).text() == "Personal") { var tempname = "[Personal] "+tempname}
										selbox.add(tempname, tempname)
									})
									*/
								},
								error: function() {
									console.log("Error loading template.")
								}
							});
						},
                        validate: CKEDITOR.dialog.validate.notEmpty( "No template selected." )
                    }
                ]
            }
        ],
        onOk: function() {
            var dialog = this;
			var tempname = this.getContentElement('tab1', 'PQTemplatesSelect').getValue();
			loadTemplate(tempname)
        }
    };
	function loadTemplate(tempname) {
		var newurl = document.URL.replace(/&temp=([^&]*)/,"\&temp="+tempname);
		location.href = newurl;
	}
});