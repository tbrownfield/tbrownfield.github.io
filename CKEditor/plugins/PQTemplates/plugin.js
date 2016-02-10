/*global CKEDITOR*/
CKEDITOR.plugins.add('PQTemplates', {
	icons: 'emailtemps,savetemp,bcclist,batch,noreply,setCase',
	init: function(editor) {
		//var editor = CKEDITOR.instances.editor

		CKEDITOR.dialog.add('PQTemplateDialog', this.path + 'dialogs/templates.js');
		CKEDITOR.dialog.add('PQSaveTemplateDialog', this.path + 'dialogs/savetemplate.js');

		editor.addCommand('emailtemps', new CKEDITOR.dialogCommand('PQTemplateDialog'));
		editor.addCommand('savetemp', new CKEDITOR.dialogCommand('PQSaveTemplateDialog'));

		editor.addCommand('noreply', {
			exec: function(editor) {

				//If footer is not found, disable button
				if ($("#footer").length == 0) {
					this.setState(0);
				}

				//If button is currently 'Off' then turn it on and insert no reply footer.
				if (this.state == "2") {
					var footer = editor.config.PQTemplates.footerNoReply;
					var content = editor.getData();
					var cfooter = $("#footer", content)[0].innerHTML;
					content = content.replace(cfooter, footer);
					editor.setData(content);
					this.setState(1);
					return;
				}
				//If button is currently 'On' then turn it off and insert reply footer
				if (this.state == "1") {
					footer = editor.config.PQTemplates.footerReply;
					content = editor.getData();
					cfooter = $("#footer", content)[0].innerHTML;
					content = content.replace(cfooter, footer);
					editor.setData(content);
					this.setState(2);
				}
			}
		});

		//Load template from quickbase
		editor.addCommand('loadTemplate', {
			exec: function(editor) {
				var template = sessionStorage.getItem('template');
				var emailbody = sessionStorage.getItem('emailbody');
				sessionStorage.setItem("skipInit", "0");
				var editorData;
				if (template) {
					var settings = editor.config.PQTemplates.TemplateQB;
					var dbid = settings.dbid;
					var apptoken = settings.appToken;
					var namefid = settings.nameFid;
					var contentFid = settings.contentFid;
					var noReplyFid = settings.noReplyFid;
					var subjectFid = settings.subjectFid;
					var distrosFid = settings.distrosFid;

					var query = "{'" + namefid + "'.EX.'" + template + "'}";
					var clist = contentFid + "." + noReplyFid + "." + subjectFid + "." + distrosFid;

					var url = "";
					url += "https://intuitcorp.quickbase.com/db/" + dbid;
					url += "?act=API_DoQuery";

					var request = "";
					request += '<qdbapi>';
					request += '<apptoken>' + apptoken + '</apptoken>';
					request += '<query>' + query + '</query>';
					request += '<clist>' + clist + '</clist>';
					request += '</qdbapi>';

					jQuery.ajax({
							type: "POST",
							contentType: "text/xml",
							url: url,
							dataType: "xml",
							processData: false,
							data: request
						})
						.done(function(xml) {
							if ($("errcode", xml).text() == 0) {
								var templateContent = $("record content", xml).text();
								sessionStorage.setItem("NoReply", $("record no_reply", xml).text());
								sessionStorage.setItem("emailsubj", $("record email_subject", xml).text());
								sessionStorage.setItem("distros", $("record default_recipients", xml).text());

								var editorData = editor.getData();

								editorData = $(editorData)[0];
								$("#body", editorData).html(templateContent);

								editorData = $(editorData)[0].outerHTML;
								var content = initTemplate(editor, editorData);

								editor.setData(content, function() {
									editor.execCommand('initDropler', editor);
									document.getElementById("loadOverlay").style.display = "none";
								});
							}
							else {
								var errcode = $('errcode', xml).text();
								var errtext = $('errtext', xml).text();
								console.log("CKEditor Error: Failed to load template. Error " + errcode + ": " + errtext);

								editorData = editor.getData();
								sessionStorage.setItem("skipInit", "1");
								content = initTemplate(editor, editorData);
								editor.setData(content, function() {
									editor.execCommand('initDropler', editor);
									document.getElementById("loadOverlay").style.display = "none";
								});
							}
						})
						.fail(function(data) {
							editor.execCommand('initDropler', editor);
							document.getElementById("loadOverlay").style.display = "none";
							console.log("CKEditor Error: Failed to load template. Error " + data.status + ": " + data.statusText);
						});
				}
				else if (emailbody) {
					editorData = editor.getData();
					sessionStorage.setItem("skipInit", "0");
					editorData = $(editorData)[0];
					emailbody = unescape(emailbody);
					if (/<[\s\S]*>/i.test(emailbody) == false) {
						emailbody = strToHTML(emailbody);
					}
					
					$("#body", editorData).html(emailbody);

					editorData = $(editorData)[0].outerHTML;
					var content = initTemplate(editor, editorData);

					editor.setData(content, function() {
						editor.execCommand('initDropler', editor);
						document.getElementById("loadOverlay").style.display = "none";
					});
				}
				else {
					editorData = editor.getData();
					sessionStorage.setItem("skipInit", "1");
					content = initTemplate(editor, editorData);
					editor.setData(content, function() {
						editor.execCommand('initDropler', editor);
						if (document.getElementById("loadOverlay")) {
							document.getElementById("loadOverlay").style.display = "none";
						}
					});
				}
			}
		});


		//Utility functions
		function initTemplate(editor, content) {
			//If footer exists, replace with the appropriate reply/noreply footer, otherwise disable the button
			if ($("#footer").length != 0) {
				if (sessionStorage.NoReply == 1) {
					var footer = editor.config.PQTemplates.footerNoReply;
					var cfooter = $("#footer")[0].innerHTML;
					content = content.replace(cfooter, footer);
					editor.getCommand('noreply').setState(1);
				}
				else {
					footer = editor.config.PQTemplates.footerReply;
					cfooter = $("#footer")[0].innerHTML;
					content = content.replace(cfooter, footer);
				}
			}
			else {
				editor.getCommand('noreply').setState(0);
			}

			var thisyear = new Date().getFullYear();
			var regex = new RegExp("\\[COPYRIGHT YEAR\\]", "g");
			content = content.replace(regex, thisyear);
			//skipInit is set for the template editor to prevent it from replacing keywords in the template. [COPYRIGHT YEAR] and the footer are still replaced, as they're not part of the template.
			var skipInit = sessionStorage.getItem("skipInit");
			if (skipInit != 1) {
				if (!sessionStorage.getItem('casenum')) {
					$("main:first").prepend("<div style='text-align: center; font-weight: bold; background:orange';>No Case number found. Email will not be logged to Quickbase. Please record it manually.</div>");
				}
				content = replaceKeywords(content);
				var subject = unescape(sessionStorage.getItem('emailsubj'));
				if (subject) {
					subject = replaceKeywords(subject);
					sessionStorage.setItem("emailsubj", subject);
				}
			}
			return (content);

		}

		function fixCaps(str) {
			return str.replace(/\w\S*/g, function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		}
		function strToHTML(text) {
	    var htmls = [];
	    var lines = text.split(/\n/);
	    var tmpDiv = $(document.createElement('div'));
	    for (var i = 0; i < lines.length ; i++) {
	        htmls.push(tmpDiv.text(lines[i]).html());
	    }
	    return htmls.join("<br>");
		}
		function replaceKeywords(content) {
			//Keyword replacements
			var analystName = sessionStorage.analystName;
			analystName = unescape(analystName);
			if (analystName == "undefined") {
				analystName = "";
			}

			var analystEmail = sessionStorage.analystEmail;
			analystEmail = unescape(analystEmail);
			if (analystEmail == "undefined") {
				analystEmail = "";
			}

			var custName = sessionStorage.custName;
			custName = unescape(custName);
			if (custName == "undefined") {
				custName = "";
			}

			var custEmail = sessionStorage.custEmail;
			custEmail = unescape(custEmail);
			if (custEmail == "undefined") {
				custEmail = "";
			}

			var casenum = sessionStorage.casenum;
			casenum = unescape(casenum);
			if (casenum == "undefined") {
				casenum = "";
			}

			var issueTitle = sessionStorage.issueTitle;
			issueTitle = unescape(issueTitle);
			if (issueTitle == "undefined") {
				issueTitle = "";
			}

			var containKB = sessionStorage.containKB;
			containKB = unescape(containKB);
			if (containKB == "undefined") {
				containKB = "";
			}

			var containAXC = sessionStorage.containAXC;
			containAXC = unescape(containAXC);
			if (containAXC == "undefined") {
				containAXC = "";
			}

			var curYear = new Date().getFullYear();
			var regex = new RegExp("\\[COPYRIGHT YEAR\\]", "g");
			content = content.replace(regex, curYear);

			if (content.match(/\[CUSTOMER NAME\]/)) {
				if (custName) {
					regex = new RegExp("\\[CUSTOMER NAME\\]", "g");
					content = content.replace(regex, fixCaps(custName));
				}
				else {
					regex = new RegExp("\\[CUSTOMER NAME\\]", "g");
					content = content.replace(regex, editor.config.emailConfig.batchName);
				}
			}

			//special case to handle existing response templates that use %CUSTOMER_NAME%
			if (content.match(/\%CUSTOMER_NAME\%/)) {
				regex = new RegExp("\\%CUSTOMER_NAME\\%", "g");
				content = content.replace(regex, editor.config.emailConfig.batchName);
			}

			if (custEmail) {
				regex = new RegExp("\\[CUSTOMER EMAIL\\]", "g");
				content = content.replace(regex, custEmail.toLowerCase());
			}

			if (sessionStorage.getItem('casenum')) {
				regex = new RegExp("\\[CASE NUMBER\\]", "g");
				content = content.replace(regex, casenum);
			}

			if (analystName) {
				regex = new RegExp("\\[ANALYST NAME\\]", "g");
				content = content.replace(regex, fixCaps(analystName));
			}

			if (analystEmail) {
				regex = new RegExp("\\[ANALYST EMAIL\\]", "g");
				content = content.replace(regex, analystEmail.toLowerCase());
			}

			if (issueTitle) {
				regex = new RegExp("\\[ISSUE TITLE\\]", "g");
				content = content.replace(regex, issueTitle);
			}

			if (containKB) {
				regex = new RegExp("\\[KB Containment\\]", "g");
				content = content.replace(regex, "<a href='https://turbotax.intuit.com/support/go/" + containKB + "'>https://turbotax.intuit.com/support/go/" + containKB + "</a>");
			}

			if (containAXC) {
				regex = new RegExp("\\[AXC Containment\\]", "g");
				content = content.replace(regex, "<a href='https://ttlc.intuit.com/questions/" + containAXC + "'>https://ttlc.intuit.com/questions/" + containAXC + "</a>");
			}

			regex = new RegExp("\\[KB ([A-Za-z]{3}[0-9]+)\\]", "g");
			content = content.replace(regex, function(x, y) {
				return "<a href='https://turbotax.intuit.com/support/go/" + y + "'>https://turbotax.intuit.com/support/go/" + y + "</a>";
			});

			regex = new RegExp("\\[AXC ([0-9]+)\\]", "g");
			content = content.replace(regex, function(x, y) {
				return "<a href='https://ttlc.intuit.com/questions/" + y + "'>https://ttlc.intuit.com/questions/" + y + "</a>";
			});

			regex = new RegExp("\\[CURRENT YEAR\\]", "g");
			content = content.replace(regex, curYear);

			var curDate = new Date().toJSON().slice(0, 10).split('-');
			curDate = curDate[1] + "/" + curDate[2] + "/" + curDate[0];
			regex = new RegExp("\\[CURRENT DATE\\]", "g");
			content = content.replace(regex, curDate);

			//Current Tax Year - If before November, then (current year - 1), otherwise current year
			var taxyear = curYear;
			var curmonth = new Date().getMonth();
			if (curmonth < 10) {
				taxyear--;
			}
			regex = new RegExp("\\[TAX YEAR\\]", "g");
			content = content.replace(regex, taxyear);
			return (content);
		}

		CKEDITOR.on('instanceReady', function() {
			editor.execCommand('loadTemplate', editor);
		});

		editor.ui.addButton('emailtemps', {
			label: 'Email Templates',
			command: 'emailtemps',
			toolbar: 'PQTemplates,0'
		});
		editor.ui.addButton('savetemp', {
			label: 'Save Template',
			command: 'savetemp',
			toolbar: 'PQTemplates,1'
		});
		editor.ui.addButton('noreply', {
			label: 'No Reply',
			command: 'noreply',
			toolbar: 'PQTemplates,2'
		});
	}
});