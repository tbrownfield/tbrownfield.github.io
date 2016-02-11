CKEDITOR.dialog.add('PQSaveTemplateDialog', function(editor) {
	return {
		title: 'Save Template',
		minWidth: 300,
		minHeight: 75,
		contents: [{
			id: 'tab1',
			label: 'Only Tab',
			elements: [{
            	type: 'html',
				html: 'Are you sure you want to replace the current content with the new template?',
			}]
		}],
		onOk: function() {

		},
		onCancel: function() {
		    
		}
	};
});