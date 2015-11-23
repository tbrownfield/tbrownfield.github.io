CKEDITOR.plugins.add( 'dropler', {
    init: function( editor ) {
        backends = {
            quickbase: {
                upload: uploadQB,
                required: ['dbid', 'appToken', 'imagefid', 'casefid'],
                init: function() {}
            }
        };

        var checkRequirement = function(condition, message) {
            if (!condition)
                throw Error("Assert failed" + (typeof message !== "undefined" ? ": " + message : ""));
        };

        function validateConfig() {
            var errorTemplate = 'DragDropUpload Error: ->';
            checkRequirement(
                editor.config.hasOwnProperty('droplerConfig'),
                errorTemplate + "Missing required droplerConfig in CKEDITOR.config.js"
            );

            var backend = backends[editor.config.droplerConfig.backend];

            var suppliedKeys = Object.keys(editor.config.droplerConfig.settings);
            var requiredKeys = backend.required;

            var missing = requiredKeys.filter(function(key) {
                return suppliedKeys.indexOf(key) < 0
            });

            if (missing.length > 0) {
                throw 'Invalid Config: Missing required keys: ' + missing.join(', ')
            }
        }

        validateConfig();

        var backend = backends[editor.config.droplerConfig.backend];
        backend.init();

        function doNothing(e) { }
        function orPopError(err) { alert(err.data.error) }

        function dropHandler(e) {
            e.preventDefault();
            var file = e.dataTransfer.files[0];
            backend.upload(file).then(insertImage, orPopError);
        }

        function insertImage(href) {
            var elem = editor.document.createElement('img', {
                attributes: {
                    src: href
                }
            });
            editor.insertElement(elem);
			editor.widgets.initOn(elem, 'image');
        }

        function addHeaders(xhttp, headers) {
            for (var key in headers) {
                if (headers.hasOwnProperty(key)) {
                    xhttp.setRequestHeader(key, headers[key]);
                }
            }
        }

        function uploadQB(file) {
			return new Promise(function(resolve, reject) {
				var settings = editor.config.droplerConfig.settings;

				var reader = new FileReader();
				reader.onloadend = function() {
					var blob = reader.result;
					var blob = blob.split(",");

					var csicase = document.URL.match(/&case=([^&]+)/);
					if (csicase) {
						var casenum = csicase[1];
					}
					
					var apptoken = settings.appToken
					var dbid = settings.dbid
					var fid = settings.imagefid
					var casefid = settings.casefid
					var url="";
					url +="https://intuitcorp.quickbase.com/db/"+dbid;
					url +="?act=API_AddRecord";

					var request="";
					request += '<qdbapi>';
					request += '<apptoken>'+apptoken+'</apptoken>';
					request += "<field fid='"+fid+"' filename='"+file.name+"'>"+blob[1]+"</field>";
					if (csicase) {
						request += "<field fid='"+casefid+"'>"+casenum+"</field>";
					}
					request += '</qdbapi>';

					jQuery.ajax({
					 type: "POST",
					 contentType: "text/xml",
					 url: url,
					 dataType: "xml",
					 processData: false,
					 data: request,
					 success: function(xml) {
						var rid = $(xml).find('rid').text();
						resolve("https://intuitcorp.quickbase.com/up/"+dbid+"/a/r"+rid+"/e"+fid+"/v0")
					 },
					 error: function(xml) {
						reject($(xml).find("errtext").text())
					 }
					});
					
				}
				reader.readAsDataURL(file)
			});
		}
		
        CKEDITOR.on('instanceReady', function() {
            var iframeBase = document.querySelector('iframe').contentDocument.querySelector('html');
            var iframeBody = iframeBase.querySelector('body');

            iframeBody.ondragover = doNothing;
            iframeBody.ondrop = dropHandler;

            paddingToCenterBody = ((iframeBase.offsetWidth - iframeBody.offsetWidth) / 2) + 'px';
            iframeBase.style.height = '100%';
            iframeBase.style.width = '100%';
            iframeBase.style.overflowX = 'hidden';

            iframeBody.style.height = '100%';
            iframeBody.style.margin = '0';
            iframeBody.style.paddingLeft = paddingToCenterBody;
            iframeBody.style.paddingRight = paddingToCenterBody;
        });
    }
});