CKEDITOR.dialog.add('bccdialog', function(editor) {
	return {
		title: 'Customer Response BCC recipients',
		minWidth: 300,
		minHeight: 200,
		contents: [{
			id: 'tab1',
			label: 'Only Tab',
			elements: [{
				type: 'vbox',
				heights: [null, null, null],
				children: [{
					type: 'textarea',
					id: 'BCCField',
					label: '',
					rows: '10',
					style: 'width:100%;height:100%',
					onLoad: function() {
						var bcclist = sessionStorage.getItem('bcclist');

						if (bcclist) {
							var dialog = this;
							dialog.setValue(bcclist);
						}
					},
					onShow: function() {
						var bcclist = sessionStorage.getItem('bcclist');
						if (bcclist) {
							var dialog = CKEDITOR.dialog.getCurrent();
							dialog.setValueOf('tab1', 'BCCField', bcclist);
						}
					},
					validate: CKEDITOR.dialog.validate.notEmpty("BCC list is blank."),
				}, {
					type: 'html',
					html: '<div id="bccinfo"></div>',
				}, {
					type: 'hbox',
					widths: [null, null, null],
					height: ['20px'],
					styles: ['vertical-align:bottom'],
					children: [{
						type: 'button',
						id: 'pullallemails',
						label: 'Get Emails',
						title: 'Get All Emails from Quickbase',
						onClick: function() {
							var editor = this.getDialog();
							editor = editor.getParentEditor();
							var settings = editor.config.emailConfig.bccQB;
							var caseFid = settings.caseFid;
							var closedfid = settings.closedFid;
							//var checkinfid = settings.checkinFid;
							var casenum = sessionStorage.getItem('casenum');
							var query = "{'" + caseFid + "'.EX.'" + casenum + "'}AND{'" + closedfid + "'.EX.''}";
							//sessionStorage.setItem('bulkType','Response')
							getEmails(editor, this, query);
						}
					}, {
						type: 'select',
						id: 'bulkType',
						label: '',
						title: 'Response Type',
						items: [
							['Check-in'],
							['Response'],
							['No Update']
						],
						'default': 'No Update',
						onShow: function() {
							if (sessionStorage.getItem("bulkType") == 'Response') {
								this.setValue('Response');
							}
							if (sessionStorage.getItem("bulkType") == 'Check-in') {
								this.setValue('Check-in');
							}
						}
					}, {
						type: 'button',
						id: 'openreport',
						label: 'Open in Quickbase',
						title: 'Open a report of these emails in the Quickbase',
						onClick: function() {
							var editor = this.getDialog();
							editor = editor.getParentEditor();
							var settings = editor.config.emailConfig.bccQB;
							var dbid = settings.dbid;
							// var apptoken = settings.appToken;
							// var emailfid = settings.emailFid;
							var caseFid = settings.caseFid;
							var casenum = sessionStorage.getItem('casenum');
							var query = "{'" + caseFid + "'.EX.'" + casenum + "'}";

							var url = "";
							url += "https://intuitcorp.quickbase.com/db/" + dbid + "?a=q&query=" + query;

							window.open(url, "Related Records");
						}
					}]
				}],
			}]
		}],
		onOk: function() {
			var editor = this.getParentEditor();
			// var dialog = this;
			//var editor = CKEDITOR.instances.editor;


			var bulkType = this.getContentElement('tab1', 'bulkType').getValue();
			sessionStorage.setItem("bulkType", bulkType);
			var bcclist = this.getContentElement('tab1', 'BCCField').getValue();
			if (!bcclist) {
				sessionStorage.setItem('bulkType', 'No Update')
			}
			var lentest = "mailto:" + sessionStorage.getItem("distros") + "&subject=" + sessionStorage.getItem("emailSubj") + "&bcc=" + bcclist;
			if (lentest.length > 2000) {
				editor.showNotification("Too many email addresses to autopopulate. You will be prompted to copy/paste them manually.");
			}

			var custName = sessionStorage.getItem("custName");
			if (custName) {
				var content = editor.getData();
				var batchName = editor.config.emailConfig.batchName;

				var regex = new RegExp(fixCaps(custName));
				content = content.replace(regex, batchName);

				editor.setData(content);
			}
			sessionStorage.setItem('bcclist', bcclist);
		}
	};

	function fixCaps(str) {
		return str.replace(/\w\S*/g, function(txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}

	function getEmails(editor, dlg, query) {
		var doc = dlg.getElement().getDocument();
		doc.getById("bccinfo")["$"].innerHTML = "Retrieving emails from Quickbase...";

		//var editor = CKEDITOR.instances.editor
		var settings = editor.config.emailConfig.bccQB;
		var dbid = settings.dbid;
		var apptoken = settings.appToken;
		var emailfid = settings.emailFid;
		var clist = emailfid + ".3";
		var ridlist = [];

		var url = "";
		url += "https://intuitcorp.quickbase.com/db/" + dbid;
		url += "?act=API_DoQuery";

		var request = "";
		request += '<qdbapi>';
		request += '<apptoken>' + apptoken + '</apptoken>';
		request += '<query>' + query + '</query>';
		request += '<clist>' + clist + '</clist>';
		request += '</qdbapi>';

		$.ajax({
				type: "POST",
				contentType: "text/xml",
				url: url,
				dataType: "xml",
				processData: false,
				data: request
			})
			.done(function(xml) {
				if ($("errcode", xml).text() != 0) {
					var errcode = $("errcode", xml).text();
					var errtext = $("errtext", xml).text();
					doc.getById("bccinfo")["$"].innerHTML = "Error: " + errtext;
					console.log("CKEditor Error: Email Tracker QuickBase returned error. " + errcode + ": " + errtext);
					return;
				}
				var bcclist = "";
				var dupes = 0;
				var emailFName = settings.emailFName;
				$.each($("record", xml), function() {
					var thisemail = $(emailFName, this).text().toLowerCase();
					ridlist.push($("record_id_", this).text() + ":" + thisemail);
					if (bcclist.indexOf(thisemail) == -1) {
						bcclist += thisemail + ";";
					}
					else {
						dupes++
					}
				});
				sessionStorage.setItem("ridlist", ridlist);
				if (!bcclist) {
					doc.getById("bccinfo")["$"].innerHTML = "No matching records found in QuickBase.";
					console.log("CKEditor Information: No records retrieved from Email Tracker QuickBase, but there was no error returned.");
					sessionStorage.setItem('bulkType', 'No Update');
					return;
				}
				var dialog = CKEDITOR.dialog.getCurrent()
				dialog.setValueOf("tab1", "BCCField", bcclist);
				//var doc = this.getElement().getDocument();
				doc.getById("bccinfo")["$"].innerHTML = (bcclist.split(";").length - 1) + " addresses added. " + dupes + " duplicates skipped.";
			})
			.fail(function(data) {
				doc.getById("bccinfo")["$"].innerHTML = "Error retrieving emails from Quickbase.";
				console.log("CKEditor Error: Request to Email Tracker QuickBase Failed. Error " + data.status + ": " + data.statusText);
				sessionStorage.setItem('bulkType', 'No Update');
			});
	}
});