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
						style: 'width:300px;height:185px',
						size: 15,
						items: [],
						onLoad: function() {
							var editor = CKEDITOR.instances.editor
							var dialog = this.getDialog()
							
							selbox = dialog.getContentElement( 'tab1', 'PQTemplatesSelect' );
							selbox.add("Blank"," ")
							
							var dbid = "bke7detga"
							var apptoken = "cc648mnd9sin2bcpvxbt9dk64w6f"
							var catfid = "8"
							
							var query = "{'"+catfid+"'.EX.'PQ Customer Responses'}"
							var clist = "6"

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
									var temps = $("record name",xml)
									$.each(temps, function(){ 
										var tempname = this.text()
										selbox.add(tempname, tempname)
									})
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