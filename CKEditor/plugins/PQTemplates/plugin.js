CKEDITOR.plugins.add( 'PQTemplates', {
    icons: 'emailtemps,savetemp,bcclist,batch,noreply,setCase',
    init: function( editor ) {
		var editor = CKEDITOR.instances.editor

		CKEDITOR.dialog.add( 'PQTemplateDialog', this.path + 'dialogs/templates.js' );
		CKEDITOR.dialog.add( 'PQBatchDialog', this.path + 'dialogs/bcc.js' );
		CKEDITOR.dialog.add( 'PQSaveTemplateDialog', this.path + 'dialogs/savetemplate.js' );

		editor.addCommand( 'emailtemps', new CKEDITOR.dialogCommand( 'PQTemplateDialog' ) );

		editor.addCommand( 'savetemp', new CKEDITOR.dialogCommand( 'PQSaveTemplateDialog' ) );		
		
        editor.addCommand( 'batch', {
            exec: function( editor ) {
				var custname = sessionStorage.getItem('custName');
				if (custname) {
					custname = fixCaps(custname)
				}
				var batchname = editor.config.PQTemplates.batchName
				var global = editor.config.PQTemplates.globalBatchName
				
				if (!custname) { this.setState( 0 );}

				if (this.state == "1") {
					if (custname) {
						replaceTxt(batchname, custname, global)
						this.setState( 2 )
						return;
					}
				}
				if (this.state == "2") {
					if (custname) {
						replaceTxt(custname, batchname, global);
						this.setState( 1 )
					}
				}
            }
        });
		
		/*
		editor.addCommand( 'setCase', {
			exec: function ( editor ) {

				var casenum = sessionStorage.getItem('casenum');
				if (!casenum) { this.setState( 0 ); }
			
				if (this.state == "2") {
					if (casenum) {
						replaceTxt("\\[CASE NUMBER\\]", casenum, 1)
						this.setState( 1 );
						return;
					}
				}
				if (this.state == "1") {
					if (casenum) {
						replaceTxt(casenum, "\[CASE NUMBER\]", 1);
						this.setState( 2 );
					}
				}
			}
		});
		*/
		
		editor.addCommand( 'noreply', {
			exec: function ( editor ) {

				//If footer is not found, disable button
				if ($("#footer").length == 0) { this.setState( 0 ); }

				//If button is currently 'Off' then turn it on and insert no reply footer.
				if (this.state == "2") {
					var footer = editor.config.PQTemplates.footerNoReply;
					var content = editor.getData();
					var cfooter = $("#footer", content)[0].innerHTML;
					var content = content.replace(cfooter, footer);
					editor.setData(content);
					this.setState( 1 );
					return;
				}
				//If button is currently 'On' then turn it off and insert reply footer
				if (this.state == "1") {
					var footer = editor.config.PQTemplates.footerReply;
					var content = editor.getData();
					var cfooter = $("#footer", content)[0].innerHTML;
					var content = content.replace(cfooter, footer);
					editor.setData(content);
					this.setState( 2 );
				}
			}
		});
		
		editor.addCommand( 'loadTemplate', {
			exec: function ( editor ) {
				var template = sessionStorage.getItem('template')
				var editorData
				if (template) {

					var dbid = "bke7kcnze"
					var apptoken = "bxbj722drzze3sb6jc7endytstjq"
					var namefid = "6"
					
					var query = "{'"+namefid+"'.EX.'"+template+"'}"
					var clist = "7.9.14.15"
					
					var url="";
					url +="https://intuitcorp.quickbase.com/db/"+dbid;
					url +="?act=API_DoQuery";

					var request="";
					request += '<qdbapi>';
					request += '<apptoken>'+apptoken+'</apptoken>';
					request += '<query>'+query+'</query>';
					request += '<clist>'+clist+'</clist>';
					request += '</qdbapi>';

					jQuery.ajax({
						type: "POST",
						contentType: "text/xml",
						url: url,
						dataType: "xml",
						processData: false,
						data: request,
						success: function(xml) {
							var templateContent = $("record content",xml).text();
							sessionStorage.setItem("NoReply", $("record no_reply",xml).text());
							sessionStorage.setItem("emailsubj", $("record email_subject",xml).text());
							sessionStorage.setItem("distros", $("record default_recipients",xml).text());

							var editorData = editor.getData();

							var editorData = $.parseHTML(editorData)[0]
							$("#body",editorData).html(templateContent)
							
							var editorData = $(editorData)[0].outerHTML
							var content = initTemplate(editor, editorData)
							
							editor.setData(content)
							
							document.getElementById("loadOverlay").style.display = "none";
						},
						error: function() {
							document.getElementById("loadOverlay").style.display = "none";
							console.log("Error loading template.")
						}
					});
				}

			}
		})

		
		//Utility functions
		
		function initTemplate(editor, content) {
			
			//If footer exists, replace with the appropriate reply/noreply footer, otherwise disable the button
			if ($("#footer").length != 0) {
				if (sessionStorage.NoReply == 1) {
					var footer = editor.config.PQTemplates.footerNoReply;
					var cfooter = $("#footer")[0].innerHTML;
					var content = content.replace(cfooter, footer);
					editor.getCommand('noreply').setState( 1 )
				}
				else {
					var footer = editor.config.PQTemplates.footerNoReply;
					var cfooter = $("#footer")[0].innerHTML;
					var content = content.replace(cfooter, footer);
				}
			}
			else { editor.getCommand('noreply').setState( 0 ); }

			//Keyword replacements
			var analystName = sessionStorage.analystName
			var analystEmail = sessionStorage.analystEmail
			var custName = sessionStorage.custName
			var casenum = sessionStorage.casenum
			
			if (content.match(/\[CUSTOMER NAME\]/)) {
				if (custName) {
					var regex = new RegExp("\[CUSTOMER NAME\]")
					//$("#body", content).html().replace(regex, fixCaps(custName));
					content.replace(regex, fixCaps(custName));
				}
				else {
					var regex = new RegExp("\[CUSTOMER NAME\]")
					content.replace(regex, editor.config.PQTemplates.batchName);
				}
			}

			if (sessionStorage.getItem('casenum')) {
				var regex = new RegExp("\[CASE NUMBER\]","g")
				content.replace(regex, casenum);
			}
			else {
				$("main:first").prepend("<div style='text-align: center; font-weight: bold; background:orange';>No Case number found. Email will not be logged to Quickbase. Please record it manually.</div>");
			}
			
			
			if (analystName) {
				var regex = new RegExp("\[ANALYST NAME\]","g")
				content.replace(regex, fixCaps(analystName));
			}
			
			if (analystEmail) {
				var regex = new RegExp("\[ANALYST EMAIL\]","g")
				content.replace(regex, analystEmail);
			}
			return(content)
			
		}

		function fixCaps(str) {
			return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		}
		
		function replaceTxt(str1, str2, global) {
			if (global == 1) {
				var regex = new RegExp(str1,"g")
				var content = editor.getData();
				var content = $.parseHTML(content)[0]
				$("#body", content).html().replace(regex, str2);
				editor.setData($(content)[0].outerHTML)
			}
			else {
				var content = editor.getData();
				var content = $.parseHTML(content)[0]
				$("#body", content).html().replace(str1, str2);				
				editor.setData($(content)[0].outerHTML)
			}
		}
		
		CKEDITOR.on('instanceReady', function() { console.log("ready."); editor.execCommand('loadTemplate', editor)});
		
		editor.ui.addButton( 'emailtemps', {
			label: 'Email Templates',
			command: 'emailtemps',
			toolbar: 'PQTemplates,0'
		});
		editor.ui.addButton( 'savetemp', {
			label: 'Save Template',
			command: 'savetemp',
			toolbar: 'PQTemplates,1'
		});
		/*
        editor.ui.addButton( 'Batch', {
            label: 'Multiple Customers',
            command: 'batch',
            toolbar: 'PQTemplates,2'
        });
		*/
		editor.ui.addButton( 'noreply', {
            label: 'No Reply',
            command: 'noreply',
            toolbar: 'PQTemplates,3'
        });
		/*
		editor.ui.addButton( 'setCase', {
            label: 'Insert Case #',
            command: 'setCase',
            toolbar: 'PQTemplates,4'
        });
		*/
    }
});