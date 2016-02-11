CKEDITOR.plugins.add('EmbedHandler', {
	init: function(editor) {
		editor.addCommand('embedHandler', {
			exec: function(editor) {
		        var emailbody = "";
                var basicbox = document.getElementById(editor.name);
                if (basicbox) {
                    emailbody = basicbox.value;
                }
				if (/<[\s\S]*>/i.test(emailbody) == false) {
					emailbody = strToHTML(emailbody);
				}
				editor.setData(emailbody);
				// editor.execCommand('initDropler', editor);
			}
		});

		function strToHTML(text) {
    	    var htmls = [];
    	    var lines = text.split(/\n/);
    	    var tmpDiv = $(document.createElement('div'));
    	    for (var i = 0; i < lines.length ; i++) {
    	        htmls.push(tmpDiv.text(lines[i]).html());
    	    }
    	    return htmls.join("<br>");
		}
	}
});