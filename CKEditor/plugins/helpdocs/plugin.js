CKEDITOR.plugins.add( 'helpdocs', {
	icons: 'helpdocs',
	init: function(editor)
	{
		//var editor = CKEDITOR.currentInstance
		for ( var i in CKEDITOR.instances ){
		   var currentInstance = i;
		   break;
		}
		//var editor   = CKEDITOR.instances[currentInstance];
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