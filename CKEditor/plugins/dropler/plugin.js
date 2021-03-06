CKEDITOR.plugins.add('dropler', {
    init: function(editor) {
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
                return suppliedKeys.indexOf(key) < 0;
            });
            if (missing.length > 0) {
                throw 'Invalid Config: Missing required keys: ' + missing.join(', ');
            }
        }

        validateConfig();
        progbar = {};

        var backend = backends[editor.config.droplerConfig.backend];
        backend.init();

        function doNothing(e) {}

        function orPopError(err) {
            alert(err);
            console.log("CKEditor Error: Failed to upload image to Quickbase. "+err);
        }

        function dropHandler(e) {
            e.preventDefault();
            var file = e.dataTransfer.files[0];

            var fntoken = btoa(file.name);

            progbar[fntoken] = editor.showNotification('Adding Image...', 'progress', 0);
            backend.upload(file).then(insertImage, orPopError);
        }

        function insertImage(href) {
            var fntoken = href[1];
            progbar[fntoken].update({
                progress: 0.9
            });
            var elem = editor.document.createElement('img', {
                attributes: {
                    src: href[0]
                }
            });
            editor.insertElement(elem);
            editor.widgets.initOn(elem, 'image');
            progbar[fntoken].update({
                type: 'success',
                message: 'File uploaded.'
            });
        }

        // function addHeaders(xhttp, headers) {
        //     for (var key in headers) {
        //         if (headers.hasOwnProperty(key)) {
        //             xhttp.setRequestHeader(key, headers[key]);
        //         }
        //     }
        // }

        function uploadQB(file) {
            return new Promise(function(resolve, reject) {
                var settings = editor.config.droplerConfig.settings;

                var fntoken = btoa(file.name);

                progbar[fntoken].update({
                    progress: 0.1
                });

                var reader = new FileReader();
                reader.onloadend = function() {
                    var blob = reader.result;
                    blob = blob.split(",");

                    var casenum = sessionStorage.getItem('casenum');

                    var apptoken = settings.appToken;
                    var dbid = settings.dbid;
                    var fid = settings.imagefid;
                    var casefid = settings.casefid;
                    var url = "";
                    url += "https://intuitcorp.quickbase.com/db/" + dbid;
                    url += "?act=API_AddRecord";

                    var request = "";
                    request += '<qdbapi>';
                    request += '<apptoken>' + apptoken + '</apptoken>';
                    request += "<field fid='" + fid + "' filename='" + file.name + "'>" + blob[1] + "</field>";
                    if (casenum) {
                        request += "<field fid='" + casefid + "'>" + casenum + "</field>";
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
                            var errcode = $(xml).find('errcode').text();
                            if (errcode != 0) {
                                progbar[fntoken].update({
                                  type: 'warning',
                                    message: 'Upload Failed.'
                                });
                                reject($(xml).find("errtext").text());
                            }
                            else {
                                var rid = $(xml).find('rid').text();

                                progbar[fntoken].update({
                                    progress: 0.5
                                });
                                resolve(["https://intuitcorp.quickbase.com/up/" + dbid + "/a/r" + rid + "/e" + fid + "/v0", fntoken]);
                            }
                        },
                        error: function(xml) {
                            var errtext = $(xml).find("errtext").text();
                            progbar[fntoken].update({
                                type: 'warning',
                                message: 'Upload Failed. ' + errtext
                            });
                            reject(errtext);
                        }
                    });
                };
                reader.readAsDataURL(file);
            });
        }

        editor.addCommand('initDropler', {
            exec: function(editor) {
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
            }
        });

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