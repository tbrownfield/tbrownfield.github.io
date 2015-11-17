CKEDITOR.plugins.add( 'dropler', {
    init: function( editor ) {
        backends = {
            quickbase: {
                upload: uploadQB,
                required: ['uploadUrl', 'token'],
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
        }

        function addHeaders(xhttp, headers) {
            for (var key in headers) {
                if (headers.hasOwnProperty(key)) {
                    xhttp.setRequestHeader(key, headers[key]);
                }
            }
        }

        function post(url, data, headers) {
            return new Promise(function(resolve, reject) {
                var xhttp    = new XMLHttpRequest();
                xhttp.open('POST', url);
                addHeaders(xhttp, headers);
                xhttp.onreadystatechange = function () {
                    if (xhttp.readyState === 4) {
                        if (xhttp.status === 200) {
                            resolve(JSON.parse(xhttp.responseText).data.link);
                        } else {
                            reject(JSON.parse(xhttp.responseText));
                        }
                    }
                };
                xhttp.send(data);
            });
        }
		
		function qbpost(filename, data) {
				

		}

        function uploadBasic(file) {
            var settings = editor.config.droplerConfig.settings;
            return post(settings.uploadUrl, file, settings.headers);
        }

        function uploadQB(file) {
			return new Promise(function(resolve, reject) {
				var settings = editor.config.droplerConfig.settings;
				//return post(settings.uploadUrl, file, {'apptoken': settings.token});
				console.log("file in: "+file)
				var reader = new FileReader();
				console.log("file"+file)
				reader.onloadend = function() {
					var blob = reader.result;
					console.log("blob: "+blob)
					var blob = blob.split(",")

					var apptoken = "bxbj722drzze3sb6jc7endytstjq"
					var dbid = "bkejf7qv5"
					var fid = "7"
					var url="";
					url +="https://intuitcorp.quickbase.com/db/"+dbid;
					url +="?act=API_AddRecord";

					var request="";
					request += '<qdbapi>';
					request += '<apptoken>'+apptoken+'</apptoken>';
					request += "<field fid='"+fid+"' filename='"+file.name+"'>"+blob[1]+"</field>";
					request += '</qdbapi>';

					jQuery.ajax({
					 type: "POST",
					 contentType: "text/xml",
					 async: false,
					 url: url,
					 dataType: "xml",
					 processData: false,
					 data: request,
					 success: function(xml) {
						console.log(xml);
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
		
        function uploadImgur(file) {
            var settings = editor.config.droplerConfig.settings;
            return post('https://api.imgur.com/3/image', file, {'Authorization': settings.clientId});
        }

        function uploadS3(file) {
            var settings = editor.config.droplerConfig.settings;
            AWS.config.update({accessKeyId: settings.accessKeyId, secretAccessKey: settings.secretAccessKey});
            AWS.config.region = 'us-east-1';

            var bucket = new AWS.S3({params: {Bucket: settings.bucket}});
            var params = {Key: file.name, ContentType: file.type, Body: file, ACL: "public-read"};
            return new Promise(function(resolve, reject) {
                bucket.upload(params, function (err, data) {
                    if (!err) resolve(data.Location);
                    else reject(err);
                });
            });
        };

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
