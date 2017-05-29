
// This is to emulate Mongo DB calls
function mongoCall(txtExplain, txtMongo) {
	console.log('-----------------------------')
	console.log('Explain: ' + txtExplain)
	var tmp = txtMongo.replace(/\s/g,'')
	//tmp = tmp.replace(' ','')	
	console.log('MongoDB: ' + tmp)
}


// This is the page header with stylesheet etc..
function pageButtons(reportTitle) {
	var htmlCode = ''
	+ '<div style="position: absolute; right: 30px;top:26px;z-index: 1;">'
	+ '	<button onclick="print()" class="btn btn-primary printButtonClass" style="width: 100px; border: 1px solid; border-radius: 4px; padding:6px 12px; color: #fff; background-color: #337ab7; border-color: #2e6da4; font-size: 14px; font-family:Roboto, Arial">Print</button>'
	+ '	&nbsp;'
	+ '	<button onclick="history.go(-1);" class="btn btn-primary printButtonClass" style="width: 100px; border: 1px solid; border-radius: 4px; padding:6px 12px; color: #fff; background-color: #337ab7; border-color: #2e6da4; font-size: 14px; font-family:Roboto, Arial">Back</button>'
	+ '</div>'
	return htmlCode;
}


// This is the top page headline for all reports
function topHeadline(reportTitle) {
	var htmlCode = ''
	+ '		<style type="text/css">                                                         '
	+ '			@media print{                                                               '
	+ '				@page {                                                                 '
	+ '					size: auto;                                                         '
	+ '					margin: 10mm 5mm 5mm 5mm;                                           '
	+ '					size: portrait;                                                     '
	+ '					mso-header-margin:0mm;                                              '
	+ '					mso-footer-margin:0mm;                                              '
	+ '					mso-paper-source:0;                                                 '
	+ '				}                                                                       '
	+ '			}                                                                           '
	+ '		</style>	                                                                    '
	+ '		<table style="width:100%; background-color:#FFFFFF; border-spacing:0px; border-collapse:collapse; border:1px solid #AAAAAA; padding:0px 0px 0px 0px; margin:0px 0px 0px 0px;min-width:650px;">                                                           '
	+ '		<tr>                                                                                                                                                                                                                                                     '
	+ '			<td style="font-size:40px; font-weight:bold; font-family: Roboto, Helvetica Neue, Arial, Helvetica, sans-serif; padding:0px 0px 0px 5px; margin:0px 0px 0px 0px; text-align:center; vertical-align:middle; white-space:nowrap; color: #4CACCD; width:20%;">'   
	+ reportTitle // the title
	+ '			</td>                                                                                                                                                                                                                                                '
	+ '			<td style="align:left; valign:middle; max-width:60px; padding:0px 0px 0px 0px; margin:0px 0px 0px 0px; width:45%; text-align:right; vertical-align:middle; padding-top:5px;">                                                                        '
	+ '				<img style="max-width:100%; height:auto; width:auto\9; min-height:1px; max-height:60px; padding:0px 0px 0px 0px; margin:0px 0px 0px 0px;" src="' + 'http://191.101.12.128:3000/' + 'assets/images/logo_small.png" alt="ThaiHome Logo">                                '
	+ '			</td>                                                                                                                                                                                                                                                '
	+ '		</tr>                                                                                                                                                                                                                                                    '
	+ '		</table>                                                                                                                                                                                                                                                 '
	+ '		<div style="min-height:6px;"></div>                                                                                                                                                                                                                      '
	return htmlCode;
}


// This is the Report Headline for each specific report
function reportHeadline(reportTitle){
	var htmlCode = ''
	+ '		<table border="0"; style="border-spacing:0px; border:1px solid #AAAAAA; width:100%;">                                                                                                                                                                    '
	+ '		<tr>                                                                                                                                                                                                                                                     '
	+ '			<td style="width:90%; text-align:left; padding-left:6px; background-color:#FFFFFF; color:#000000; border:10px solid #EEEEEE; height:30px; white-space: nowrap; font-size:18px; font-weight:normal; font-family:Roboto, Helvetica Neue, Arial, Helvetica, sans-serif;">'
	+ reportTitle // the title
	+ '			</td>                                                                                                                                                                                                                                            '
	+ '			<td style="width:10%; text-align:right; padding-left:6px; padding-right:6px; background-color:#FFFFFF; color:#000000; border:10px solid #EEEEEE; height:30px; white-space: nowrap; font-size:18px; font-family:Arial Narrow;">Printed: <b>           '
	+ new Date().format('d M Y') // todays date
	+ '			</b></td>                                                                                                                                                                                                                                            '
	+ '		</tr>                                                                                                                                                                                                                                                    '
	+ '		</table>                                                                                                                                                                                                                                                 '
	+ '		<div style="min-height:6px;"></div>                                                                                                                                                                                                                      '
	return htmlCode;                                                                                                                                                                                                                                                 
}                                                                                                                                                                                                                                                                    



// This is the Report Headline for agent sales reports
function reportAgentHeadline(){
	var htmlCode = ''
	+ '	<div>                                                                                                                                                           '
	+ '	<table style="width:100%; background-color:#FFFFFF; border-spacing:0px; border-collapse:collapse; border:1px solid #AAAAAA; padding:8px 8px 8px 8px;">                                                  '
	+ '		<tr><td colspan="2"><div style="min-height:8px;"></div></td></tr>                                                                                                                                   '
	+ '		<tr>                                                                                                                                                                                                '
	+ '			<td style="width:75%;padding:0px 4px 0px 8px;">                                                                                                                                                 '
	+ '				<table style="width:100%; background-color:#FFFFFF; border-spacing:0px; border-collapse:collapse; border:0px solid #AAAAAA; padding:0px;">                                                  '
	+ '				<tr>                                                                                                                                                                                        '
	+ '					<td style="text-align:right; text-align:right; vertical-align:middle; padding:0px 4px 0px 8px; font-size:14px; font-family: Arial; white-space: nowrap;">Property Manager:&nbsp;</td>   '
	+ '					<td style="vertical-align:middle; padding:0px 4px 0px 8px; font-size:14px; font-family: Arial; white-space: nowrap;"><b>{{T.transManagerName}}</b></td>                                 '
	+ '					<td style="vertical-align:middle; padding:0px 4px 0px 8px; font-size:14px; font-family: Arial; white-space: nowrap;">&nbsp; Phone:</td>                                                 '
	+ '					<td style="vertical-align:middle; padding:0px 4px 0px 8px; font-size:14px; font-family: Arial; white-space: nowrap;"><b>{{T.transNotePhone}}</b></td>                                   '
	+ '					<td style="vertical-align:middle; padding:0px 4px 0px 8px; font-size:14px; font-family: Arial; white-space: nowrap;">&nbsp; Email:</td>                                                 '
	+ '					<td style="vertical-align:middle; padding:0px 4px 0px 8px; font-size:14px; font-family: Arial; white-space: nowrap;"><b>{{T.transNoteMail}}</b><br></td>                                '
	+ '				</tr>                                                                                                                                                                                       '
	+ '				<tr>                                                                                                                                                                                        '
	+ '					<td style="text-align:right; vertical-align:middle; padding:0px 4px 0px 8px; font-size:14px; font-family: Arial; white-space: nowrap;">Owner:&nbsp;</td>                                '
	+ '					<td style="vertical-align:middle; padding:0px 4px 0px 8px; font-size:14px; font-family: Arial; white-space: nowrap;"><b>{{T.transOwnerName}}</b></td>                                   '
	+ '					<td style="vertical-align:middle; padding:0px 4px 0px 8px; font-size:14px; font-family: Arial; white-space: nowrap;">&nbsp; Phone:</td>                                                 '
	+ '					<td style="vertical-align:middle; padding:0px 4px 0px 8px; font-size:14px; font-family: Arial; white-space: nowrap;"><b>{{T.transTorbenPhone}}</b></td>                                 '
	+ '					<td style="vertical-align:middle; padding:0px 4px 0px 8px; font-size:14px; font-family: Arial; white-space: nowrap;">&nbsp; Email:</td>                                                 '
	+ '					<td style="vertical-align:middle; padding:0px 4px 0px 8px; font-size:14px; font-family: Arial; white-space: nowrap;"><b>{{T.transTorbenMail}}</b><br></td>                              '
	+ '				</tr>                                                                                                                                                                                       '
	+ '				</table>                                                                                                                                                                                    '
	+ '			</td>                                                                                                                                                                                           '
	+ '			<td style="width:25%; text-align:right; vertical-align:bottom; padding:0px 0px 0px 0px; font-size:14px; font-family: Arial; white-space: nowrap;">Printed: <b>                                  '
	+ new Date().format('d M Y') // todays date                                                                                                                                                                 '
	+ '			</b>&nbsp;</td>                                                                                                                                                                                 '
	+ '		</tr>                                                                                                                                                                                               '
	+ '		<tr><td colspan="2"><div style="min-height:6px;"></div></td></tr>                                                                                                                                   '
	+ '	</table>                                                                                                                                                                                                '
	+ '	<div style="min-height:6px;"></div>                                                                                                                                                                     '
	+ '	</div>                                                                                                                                                                                                  '
	return htmlCode;                                                                                                                                                                                                                                                 
}                                                                                                                                                                                                                                                                    

	

// This is the top headline for all reports
function reportFooter() {
	var htmlCode = ''
	+ '		<div style="min-height:6px;"></div>                                                                                                                                     '
	+ '		<table style="width:100%; background-color:#FFFFFF; border-spacing:0px; border-collapse:collapse; border:1px solid #AAAAAA; padding:8px 8px 8px 8px;">                  '
	+ '		<tr>                                                                                                                                                                    '
	+ '			<td style="vertical-align:middle; padding:0px 4px 0px 8px; font-size:12px; font-weight:normal; font-family: Roboto, Helvetica Neue, Arial, Helvetica, sans-serif;"> '
	+ '				<a href="http://www.thaihome.co.uk/"><img src="' + 'http://191.101.12.128:3000/' + 'assets/sig/SigLogo.png" alt="ThaiHome Logo" height="70"></a>                                     '
	+ '			</td>                                                                                                                                                               '
	+ '			<td style="vertical-align:middle; padding:0px 4px 0px 8px; font-size:12px; font-weight:normal; font-family: Roboto, Helvetica Neue, Arial, Helvetica, sans-serif;"> '
	+ '				{{T.transManagerName}}<br>                                                                                                                                      '
	+ '				<span style="color:#4caccd;">{{T.transManagerTitle}}</span><br>                                                                                                 '
	+ '				<b>ThaiHome</b> {{T.transSloganShort}}                                                                                                                          '
	+ '			</td>                                                                                                                                                               '
	+ '			<td style="vertical-align:middle; padding:0px 4px 0px 8px; font-size:12px; font-weight:normal; font-family: Roboto, Helvetica Neue, Arial, Helvetica, sans-serif;"> '
	+ '				{{T.transOfficeAddress}}                                                                                                                                        '
	+ '			</td>                                                                                                                                                               '
	+ '			<td style="vertical-align:middle; padding:0px 4px 0px 8px; font-size:12px; font-weight:normal; font-family: Roboto, Helvetica Neue, Arial, Helvetica, sans-serif;"> '
	+ '				{{T.transMobile}}: {{T.transNotePhone}}<br>                                                                                                                     '
	+ '				{{T.transWebsite}}: <a style="color:#0000ff" href="http://www.thaihome.co.uk/">www.ThaiHome.co.uk</a><br>                                                       '
	+ '				{{T.transEmail}}: {{T.transNoteMail}}                                                                                                                           '
	+ '			</td>                                                                                                                                                               '
	+ '		</tr>                                                                                                                                                                   '
	+ '		</table>                                                                                                                                                                '
	htmlCode = findTexts(htmlCode);
	return htmlCode;
}	


// This is the page break used in all reports
function reportPageBreak() {
	var htmlCode = ''	                                                                                                                                                                                                                                                 
	+ ' 	<div style="page-break-before: always; height:20px;"></div>	'
	return htmlCode;        
}	

// This is to get the {{T.whatever}} texts from our translation.json
function findTexts(thisText) {
	var safety=0;
	while (thisText.indexOf('{{T.') !== -1) {
		safety++;
		var fromChar = thisText.indexOf('{{T.')
		var toChar = thisText.indexOf('}}');
		if (safety>100) {            
			console.log('####BREAK#### - not good!')
			break;
		} 
		var fldLang = thisText.substring(fromChar+4, toChar)
		var txtLang = transArray[fldLang];
		thisText = thisText.replace('{{T.' + fldLang + '}}', txtLang);
	}
	return thisText;
}

