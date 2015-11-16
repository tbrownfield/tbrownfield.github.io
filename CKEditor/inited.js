if ( CKEDITOR.env.ie && CKEDITOR.env.version < 9 )
	CKEDITOR.tools.enableHtml5Elements( document );

CKEDITOR.config.height = '700';
CKEDITOR.config.width = 'automatic';

function initCKEd() {
	var editorElement = CKEDITOR.document.getById( 'editor' );

	editorElement.setAttribute( 'contenteditable', 'true' );
	CKEDITOR.replace( 'editor' );
	initTemplate();
}

function fixCaps(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function initTemplate() {
	var casenum = document.URL.match(/&case=([^&]+)/);
	var batch = document.URL.match(/&batch=([^&]+)/);
	var custname = document.URL.match(/&name=([^&]+)/);
	
	editor = CKEDITOR.instances.editor;
	var template = editor.getData();
	
	if (casenum) {
		var casenum = casenum[1];
		var template = template.replace("[CASE NUMBER]", casenum);
	}
	else { jQuery("main:first").prepend("<p style='text-align: center; font-weight: bold; background:orange';>No Case # Detected. Email will not be logged to Quickbase. Please record it manually.</p>"); }
	
	if (!batch) { var batch = [1,1] }
	if (batch[1] == 0) {
		if (custname) {
			var template = template.replace("TurboTax Customer", fixCaps(decodeURI(custname[1])));
		}
	}
	editor.setData(template);
}