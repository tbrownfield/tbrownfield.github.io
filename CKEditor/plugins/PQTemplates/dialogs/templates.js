CKEDITOR.dialog.add('PQTemplateDialog', function(editor) {
	return {
		title: 'Customer Response Email Templates',
		minWidth: 300,
		minHeight: 200,
		contents: [{
			id: 'tab1',
			label: 'Only Tab',
			elements: [{
				type: 'select',
				id: 'PQTemplatesSelect',
				label: '',
				style: 'width:300px;height:100%',
				size: 20,
				items: [],
				onLoad: function() {
					var settings = editor.config.PQTemplates.TemplateQB;
					var dialog = this.getDialog();

					selbox = dialog.getContentElement('tab1', 'PQTemplatesSelect');
					selbox.add("Blank", " ");

					var dbid = settings.dbid;
					var appToken = settings.appToken;
					var nameFid = settings.nameFid;
					var qid = "5";
					var clist = nameFid;

					var url = "";
					url += "https://intuitcorp.quickbase.com/db/" + dbid;
					url += "?act=API_DoQuery";

					var request = "";
					request += '<qdbapi>';
					request += '<apptoken>' + appToken + '</apptoken>';
					request += '<qid>' + qid + '</qid>';
					request += '<clist>' + clist + '</clist>';
					request += '</qdbapi>';

					jQuery.ajax({
							type: "POST",
							contentType: "text/xml",
							url: url,
							dataType: "xml",
							processData: false,
							data: request
						})
						.done(function(xml) {
							if ($('errcode', xml).text() == 0) {
								var temps = $("record", xml);
								$.each(temps, function() {
									var tempname = $("name", this).text();
									selbox.add(tempname, $("name", this).text());
								});
							}
							else {
								var errcode = $('errcode', xml).text();
								var errtext = $('errtext', xml).text();
								console.log("CKEditor Error: Failed to load template list from Quickbase. Error " + errcode + ": " + errtext);
							}
						})
						.fail(function(data) {
							console.log("CKEditor Error: Failed to load template list from QuickBase. Error " + data.status + ": " + data.statusText);
						});
				},
				validate: CKEDITOR.dialog.validate.notEmpty("No template selected.")
			}]
		}],
		onOk: function() {
			var template = this.getContentElement('tab1', 'PQTemplatesSelect').getValue();
			loadTemplate(editor, template);
		}
	};

	function loadTemplate(editor, template) {
		//var editor = CKEDITOR.instances.editor;
		sessionStorage.setItem('template', template);
		editor.execCommand('loadTemplate', editor);
	}
});