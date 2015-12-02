/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here.
	// For complete reference see:
	// http://docs.ckeditor.com/#!/api/CKEDITOR.config

	config.extraPlugins = 'dropler,image2,PQTemplates',
	
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
	config.removeButtons = 'Subscript,Superscript,h1,h2,h3,h4,h5,h6,Strike,Format,Cut,Copy,PasteText,PasteFromWord,Templates';

	// Set the most common block elements.
	config.format_tags = 'p;h1;h2;h3;pre';

	// Simplify the dialog windows.
	config.removeDialogTabs = 'image:advanced;link:advanced';
		
	config.fillEmptyBlocks = false;
	
	config.extraAllowedContent = '*[id](*){*}'
	
	//depreciated
	//config.templates_files = [ 'https://ProductQualityTeam-InternalTools.github.io/CKEditor/plugins/templates/templates/TT-templates.js' ];

	config.PQTemplates = {
		batchName: 'TurboTax Customer',
		globalBatchName: 0,
		footerReply: "This message was sent to inform you of a critical matter. Please note that if you have chosen not to receive marketing messages from Intuit, that choice applies <u>only</u> to promotional materials. You will continue to receive critical notifications that are legally required or could affect your service or software.&#160;",
		footerNoReply: "This message was sent to inform you of a critical matter. Replies to this email will not be received. Please note that if you have chosen not to receive marketing messages from Intuit, that choice applies <u>only</u> to promotional materials. You will continue to receive critical notifications that are legally required or could affect your service or software.&#160;",
		TemplateQB: {
			dbid: "bke7kcnze",
			appToken: "bxbj722drzze3sb6jc7endytstjq",
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
	
	config.droplerConfig = {
		backend: 'quickbase',
		settings: {
			dbid: 'bkejf7qv5',
			appToken: 'bxbj722drzze3sb6jc7endytstjq',
			imagefid: '7',
			casefid: '6'
		}
	}
};