if ( CKEDITOR.env.ie && CKEDITOR.env.version < 9 )
	CKEDITOR.tools.enableHtml5Elements( document );

CKEDITOR.config.height = '700';
CKEDITOR.config.width = 'automatic';

function initCKEd() {
	var editorElement = CKEDITOR.document.getById( 'editor' );

	editorElement.setAttribute( 'contenteditable', 'true' );
	CKEDITOR.replace( 'editor' );
	//initTemplate();
}