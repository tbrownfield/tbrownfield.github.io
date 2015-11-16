// Register a template definition set named "default".
CKEDITOR.addTemplates( 'default',
{
	// The name of the subfolder that contains the preview images of the templates.
	imagesPath : CKEDITOR.getUrl( CKEDITOR.plugins.getPath( 'templates' ) + 'templates/images/' ),
 
	// Template definitions.
	templates :
		[
			{
				title: 'Blank TT Template',
				image: 'BlankTTTemplate.gif',
				description: 'Blank TurboTax CSI Template',
				html:
					'<table border="0" style="width:600px">'+
						'<tbody>'+
							'<tr>'+
								'<td style="background-color: #3881C2"><img src="https://intuitcorp.quickbase.com/up/bfztun6np/g/rbb/ei/va/TT_Logo_Horz_RGB_Rev_Intuit_blue2.png" /></td>'+
							'</tr>'+
							'<tr><td>'+
							'[Your Content Here]'+
							'</td></tr>'+
							'<tr><td style="height:12px; width:600px; background-color: #3881C2;"></td></tr>'+
							'<tr><td><p><span style="font-size: 8pt">This message was sent to inform you of a critical matter. Please note that if you have chosen not to receive marketing messages from Intuit, that choice applies <u>only</u> to promotional materials. You will continue to receive critical notifications that are legally required or could affect your service or software.&#160;</p>'+
							'<p><span style="font-size: 8pt">&copy; 2015 Intuit Inc. All rights reserved.  Intuit, the Intuit and TurboTax logos are registered trademarks and/or service marks of Intuit Inc. in the United States and other countries.  Intuit Inc., Customer Communications, 2800 E. Commerce Center Place, Tucson, AZ 85706.</span></p>'+
							'</td></tr>'+
						'</tbody>'+
					'</table>'

			}			
		]
});