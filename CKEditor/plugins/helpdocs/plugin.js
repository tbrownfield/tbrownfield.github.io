CKEDITOR.plugins.add( 'helpdocs', {
	icons: 'helpdocs',
	init: function()
	{
		var editor = CKEDITOR.instances.editor
		editor.addCommand( 'helpdocs', {
			exec: function () {
				window.open('https://intuitcorp.quickbase.com/db/bkemhpu9e?a=dbpage&pageID=3','Help Docs','location=0,status=0,resizable=1,width=800,height=750');
			}
			
		});
		editor.ui.addButton( 'helpdocs', {
			label: 'Help Docs',
			command: 'helpdocs',
			toolbar: 'help,0'
		});
	}
});