/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here.
	// For complete reference see:
	// http://docs.ckeditor.com/#!/api/CKEDITOR.config

	config.extraPlugins = 'email,dropler,image2,PQTemplates',
	
	// The toolbar groups arrangement, optimized for two toolbar rows.
	config.toolbarGroups = [
		{ name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
		{ name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
		{ name: 'links' },
		{ name: 'insert' },
		{ name: 'forms' },
		//{ name: 'tools' },
		{ name: 'document',	   groups: [ 'mode', 'document', 'doctools' ] },
		{ name: 'PQTemplates' },
		{ name: 'finalize' },
		{ name: 'others' },
		'/',
		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
		{ name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
		{ name: 'styles' },
		{ name: 'colors' }
	];

	// Remove some buttons provided by the standard plugins, which are
	// not needed in the Standard(s) toolbar.
	config.removeButtons = 'Subscript,Superscript,h1,h2,h3,h4,h5,h6,Strike,Format,Cut,Copy,PasteText,PasteFromWord,Templates,savetemp';

	// Set the most common block elements.
	config.format_tags = 'p;h1;h2;h3;pre';

	// Simplify the dialog windows.
	config.removeDialogTabs = 'image:advanced;link:advanced';
		
	config.fillEmptyBlocks = false;
	
	config.scayt_autoStartup = true;
	
	config.extraAllowedContent = '*[id](*){*}'

	config.PQTemplates = {
		footerReply: "This message was sent to inform you of a critical matter. Please note that if you have chosen not to receive marketing messages from Intuit, that choice applies <u>only</u> to promotional materials. You will continue to receive critical notifications that are legally required or could affect your service or software.&#160;",
		footerNoReply: "This message was sent to inform you of a critical matter. Replies to this email will not be received. Please note that if you have chosen not to receive marketing messages from Intuit, that choice applies <u>only</u> to promotional materials. You will continue to receive critical notifications that are legally required or could affect your service or software.&#160;",
		TemplateQB: {
			dbid: "bke7detga",
			appToken: "cc648mnd9sin2bcpvxbt9dk64w6f",
			nameFid: "6",
			contentFid: "7",
			categoryFid: "8",
			noReplyFid: "9",
			sharedFid: "10",
			caseFid: "11",
			subjectFid: "14",
			distrosFid: "15",
		},
	}
	
	config.emailConfig = {
		batchName: 'TurboTax Customer',
		defaultSubject: 'TurboTax Support: Response regarding recent TurboTax Support Contact',
		dbid: 'bgkvndp4z',
		appToken: 'bzp4e3ubmekgnt45z6fucmmai5k',
		historyFid: '504',
		bccQB: {
			dbid: '9df5xdir',
			appToken: 'd9qr25tda5rnrb69z3z9de8uy58',
			emailFid: '6',
			emailFName: 'emai_addr',
			caseFid: '12',
			closedFid: '17',
			checkinFid: '222',
			safeMode: '0'
		}
	}
	
	config.droplerConfig = {
		backend: 'quickbase',
		settings: {
			dbid: 'bkemhpvaj',
			appToken: 'cc648mnd9sin2bcpvxbt9dk64w6f',
			imagefid: '7',
			casefid: '6'
		}
	}
};
