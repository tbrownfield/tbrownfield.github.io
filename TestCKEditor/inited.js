if ( CKEDITOR.env.ie && CKEDITOR.env.version < 9 )
	CKEDITOR.tools.enableHtml5Elements( document );

CKEDITOR.config.height = '700';
CKEDITOR.config.width = 'automatic';

function initCKEd() {
	var editorElement = CKEDITOR.document.getById( 'editor' );

	editorElement.setAttribute( 'contenteditable', 'true' );
	CKEDITOR.replace( 'editor' );
}

function fixCaps(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}