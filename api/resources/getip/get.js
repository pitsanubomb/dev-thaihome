var http = require('http');
var _ = require('underscore');
var request = require("request");
$addCallback();
var ip = ctx.req.headers['x-forwarded-for'] ||
  ctx.req.connection.remoteAddress ||
  ctx.req.socket.remoteAddress ||
  ctx.req.connection.socket.remoteAddress;


/*var countries = [
  {
    name: 'Afghanistan',
    code: 'AF'
  },
  {
    name: 'Åland Islands',
    code: 'AX'
  },
  {
    name: 'Albania',
    code: 'AL'
  },
  {
    name: 'Algeria',
    code: 'DZ'
  },
  {
    name: 'American Samoa',
    code: 'AS'
  },
  {
    name: 'AndorrA',
    code: 'AD'
  },
  {
    name: 'Angola',
    code: 'AO'
  },
  {
    name: 'Anguilla',
    code: 'AI'
  },
  {
    name: 'Antarctica',
    code: 'AQ'
  },
  {
    name: 'Antigua and Barbuda',
    code: 'AG'
  },
  {
    name: 'Argentina',
    code: 'AR'
  },
  {
    name: 'Armenia',
    code: 'AM'
  },
  {
    name: 'Aruba',
    code: 'AW'
  },
  {
    name: 'Australia',
    code: 'AU'
  },
  {
    name: 'Austria',
    code: 'AT'
  },
  {
    name: 'Azerbaijan',
    code: 'AZ'
  },
  {
    name: 'Bahamas',
    code: 'BS'
  },
  {
    name: 'Bahrain',
    code: 'BH'
  },
  {
    name: 'Bangladesh',
    code: 'BD'
  },
  {
    name: 'Barbados',
    code: 'BB'
  },
  {
    name: 'Belarus',
    code: 'BY'
  },
  {
    name: 'Belgium',
    code: 'BE'
  },
  {
    name: 'Belize',
    code: 'BZ'
  },
  {
    name: 'Benin',
    code: 'BJ'
  },
  {
    name: 'Bermuda',
    code: 'BM'
  },
  {
    name: 'Bhutan',
    code: 'BT'
  },
  {
    name: 'Bolivia',
    code: 'BO'
  },
  {
    name: 'Bosnia and Herzegovina',
    code: 'BA'
  },
  {
    name: 'Botswana',
    code: 'BW'
  },
  {
    name: 'Bouvet Island',
    code: 'BV'
  },
  {
    name: 'Brazil',
    code: 'BR'
  },
  {
    name: 'British Indian Ocean Territory',
    code: 'IO'
  },
  {
    name: 'Brunei Darussalam',
    code: 'BN'
  },
  {
    name: 'Bulgaria',
    code: 'BG'
  },
  {
    name: 'Burkina Faso',
    code: 'BF'
  },
  {
    name: 'Burundi',
    code: 'BI'
  },
  {
    name: 'Cambodia',
    code: 'KH'
  },
  {
    name: 'Cameroon',
    code: 'CM'
  },
  {
    name: 'Canada',
    code: 'CA'
  },
  {
    name: 'Cape Verde',
    code: 'CV'
  },
  {
    name: 'Cayman Islands',
    code: 'KY'
  },
  {
    name: 'Central African Republic',
    code: 'CF'
  },
  {
    name: 'Chad',
    code: 'TD'
  },
  {
    name: 'Chile',
    code: 'CL'
  },
  {
    name: 'China',
    code: 'CN'
  },
  {
    name: 'Christmas Island',
    code: 'CX'
  },
  {
    name: 'Cocos (Keeling) Islands',
    code: 'CC'
  },
  {
    name: 'Colombia',
    code: 'CO'
  },
  {
    name: 'Comoros',
    code: 'KM'
  },
  {
    name: 'Congo',
    code: 'CG'
  },
  {
    name: 'Congo, The Democratic Republic of the',
    code: 'CD'
  },
  {
    name: 'Cook Islands',
    code: 'CK'
  },
  {
    name: 'Costa Rica',
    code: 'CR'
  },
  {
    name: 'Cote D\'Ivoire',
    code: 'CI'
  },
  {
    name: 'Croatia',
    code: 'HR'
  },
  {
    name: 'Cuba',
    code: 'CU'
  },
  {
    name: 'Cyprus',
    code: 'CY'
  },
  {
    name: 'Czech Republic',
    code: 'CZ'
  },
  {
    name: 'Denmark',
    code: 'DK'
  },
  {
    name: 'Djibouti',
    code: 'DJ'
  },
  {
    name: 'Dominica',
    code: 'DM'
  },
  {
    name: 'Dominican Republic',
    code: 'DO'
  },
  {
    name: 'Ecuador',
    code: 'EC'
  },
  {
    name: 'Egypt',
    code: 'EG'
  },
  {
    name: 'El Salvador',
    code: 'SV'
  },
  {
    name: 'Equatorial Guinea',
    code: 'GQ'
  },
  {
    name: 'Eritrea',
    code: 'ER'
  },
  {
    name: 'Estonia',
    code: 'EE'
  },
  {
    name: 'Ethiopia',
    code: 'ET'
  },
  {
    name: 'Falkland Islands (Malvinas)',
    code: 'FK'
  },
  {
    name: 'Faroe Islands',
    code: 'FO'
  },
  {
    name: 'Fiji',
    code: 'FJ'
  },
  {
    name: 'Finland',
    code: 'FI'
  },
  {
    name: 'France',
    code: 'FR'
  },
  {
    name: 'French Guiana',
    code: 'GF'
  },
  {
    name: 'French Polynesia',
    code: 'PF'
  },
  {
    name: 'French Southern Territories',
    code: 'TF'
  },
  {
    name: 'Gabon',
    code: 'GA'
  },
  {
    name: 'Gambia',
    code: 'GM'
  },
  {
    name: 'Georgia',
    code: 'GE'
  },
  {
    name: 'Germany',
    code: 'DE'
  },
  {
    name: 'Ghana',
    code: 'GH'
  },
  {
    name: 'Gibraltar',
    code: 'GI'
  },
  {
    name: 'Greece',
    code: 'GR'
  },
  {
    name: 'Greenland',
    code: 'GL'
  },
  {
    name: 'Grenada',
    code: 'GD'
  },
  {
    name: 'Guadeloupe',
    code: 'GP'
  },
  {
    name: 'Guam',
    code: 'GU'
  },
  {
    name: 'Guatemala',
    code: 'GT'
  },
  {
    name: 'Guernsey',
    code: 'GG'
  },
  {
    name: 'Guinea',
    code: 'GN'
  },
  {
    name: 'Guinea-Bissau',
    code: 'GW'
  },
  {
    name: 'Guyana',
    code: 'GY'
  },
  {
    name: 'Haiti',
    code: 'HT'
  },
  {
    name: 'Heard Island and Mcdonald Islands',
    code: 'HM'
  },
  {
    name: 'Holy See (Vatican City State)',
    code: 'VA'
  },
  {
    name: 'Honduras',
    code: 'HN'
  },
  {
    name: 'Hong Kong',
    code: 'HK'
  },
  {
    name: 'Hungary',
    code: 'HU'
  },
  {
    name: 'Iceland',
    code: 'IS'
  },
  {
    name: 'India',
    code: 'IN'
  },
  {
    name: 'Indonesia',
    code: 'ID'
  },
  {
    name: 'Iran, Islamic Republic Of',
    code: 'IR'
  },
  {
    name: 'Iraq',
    code: 'IQ'
  },
  {
    name: 'Ireland',
    code: 'IE'
  },
  {
    name: 'Isle of Man',
    code: 'IM'
  },
  {
    name: 'Israel',
    code: 'IL'
  },
  {
    name: 'Italy',
    code: 'IT'
  },
  {
    name: 'Jamaica',
    code: 'JM'
  },
  {
    name: 'Japan',
    code: 'JP'
  },
  {
    name: 'Jersey',
    code: 'JE'
  },
  {
    name: 'Jordan',
    code: 'JO'
  },
  {
    name: 'Kazakhstan',
    code: 'KZ'
  },
  {
    name: 'Kenya',
    code: 'KE'
  },
  {
    name: 'Kiribati',
    code: 'KI'
  },
  {
    name: 'Korea, Democratic People\'S Republic of',
    code: 'KP'
  },
  {
    name: 'Korea, Republic of',
    code: 'KR'
  },
  {
    name: 'Kuwait',
    code: 'KW'
  },
  {
    name: 'Kyrgyzstan',
    code: 'KG'
  },
  {
    name: 'Lao People\'S Democratic Republic',
    code: 'LA'
  },
  {
    name: 'Latvia',
    code: 'LV'
  },
  {
    name: 'Lebanon',
    code: 'LB'
  },
  {
    name: 'Lesotho',
    code: 'LS'
  },
  {
    name: 'Liberia',
    code: 'LR'
  },
  {
    name: 'Libyan Arab Jamahiriya',
    code: 'LY'
  },
  {
    name: 'Liechtenstein',
    code: 'LI'
  },
  {
    name: 'Lithuania',
    code: 'LT'
  },
  {
    name: 'Luxembourg',
    code: 'LU'
  },
  {
    name: 'Macao',
    code: 'MO'
  },
  {
    name: 'Macedonia, The Former Yugoslav Republic of',
    code: 'MK'
  },
  {
    name: 'Madagascar',
    code: 'MG'
  },
  {
    name: 'Malawi',
    code: 'MW'
  },
  {
    name: 'Malaysia',
    code: 'MY'
  },
  {
    name: 'Maldives',
    code: 'MV'
  },
  {
    name: 'Mali',
    code: 'ML'
  },
  {
    name: 'Malta',
    code: 'MT'
  },
  {
    name: 'Marshall Islands',
    code: 'MH'
  },
  {
    name: 'Martinique',
    code: 'MQ'
  },
  {
    name: 'Mauritania',
    code: 'MR'
  },
  {
    name: 'Mauritius',
    code: 'MU'
  },
  {
    name: 'Mayotte',
    code: 'YT'
  },
  {
    name: 'Mexico',
    code: 'MX'
  },
  {
    name: 'Micronesia, Federated States of',
    code: 'FM'
  },
  {
    name: 'Moldova, Republic of',
    code: 'MD'
  },
  {
    name: 'Monaco',
    code: 'MC'
  },
  {
    name: 'Mongolia',
    code: 'MN'
  },
  {
    name: 'Montserrat',
    code: 'MS'
  },
  {
    name: 'Morocco',
    code: 'MA'
  },
  {
    name: 'Mozambique',
    code: 'MZ'
  },
  {
    name: 'Myanmar',
    code: 'MM'
  },
  {
    name: 'Namibia',
    code: 'NA'
  },
  {
    name: 'Nauru',
    code: 'NR'
  },
  {
    name: 'Nepal',
    code: 'NP'
  },
  {
    name: 'Netherlands',
    code: 'NL'
  },
  {
    name: 'Netherlands Antilles',
    code: 'AN'
  },
  {
    name: 'New Caledonia',
    code: 'NC'
  },
  {
    name: 'New Zealand',
    code: 'NZ'
  },
  {
    name: 'Nicaragua',
    code: 'NI'
  },
  {
    name: 'Niger',
    code: 'NE'
  },
  {
    name: 'Nigeria',
    code: 'NG'
  },
  {
    name: 'Niue',
    code: 'NU'
  },
  {
    name: 'Norfolk Island',
    code: 'NF'
  },
  {
    name: 'Northern Mariana Islands',
    code: 'MP'
  },
  {
    name: 'Norway',
    code: 'NO'
  },
  {
    name: 'Oman',
    code: 'OM'
  },
  {
    name: 'Pakistan',
    code: 'PK'
  },
  {
    name: 'Palau',
    code: 'PW'
  },
  {
    name: 'Palestinian Territory, Occupied',
    code: 'PS'
  },
  {
    name: 'Panama',
    code: 'PA'
  },
  {
    name: 'Papua New Guinea',
    code: 'PG'
  },
  {
    name: 'Paraguay',
    code: 'PY'
  },
  {
    name: 'Peru',
    code: 'PE'
  },
  {
    name: 'Philippines',
    code: 'PH'
  },
  {
    name: 'Pitcairn',
    code: 'PN'
  },
  {
    name: 'Poland',
    code: 'PL'
  },
  {
    name: 'Portugal',
    code: 'PT'
  },
  {
    name: 'Puerto Rico',
    code: 'PR'
  },
  {
    name: 'Qatar',
    code: 'QA'
  },
  {
    name: 'Reunion',
    code: 'RE'
  },
  {
    name: 'Romania',
    code: 'RO'
  },
  {
    name: 'Russian Federation',
    code: 'RU'
  },
  {
    name: 'RWANDA',
    code: 'RW'
  },
  {
    name: 'Saint Helena',
    code: 'SH'
  },
  {
    name: 'Saint Kitts and Nevis',
    code: 'KN'
  },
  {
    name: 'Saint Lucia',
    code: 'LC'
  },
  {
    name: 'Saint Pierre and Miquelon',
    code: 'PM'
  },
  {
    name: 'Saint Vincent and the Grenadines',
    code: 'VC'
  },
  {
    name: 'Samoa',
    code: 'WS'
  },
  {
    name: 'San Marino',
    code: 'SM'
  },
  {
    name: 'Sao Tome and Principe',
    code: 'ST'
  },
  {
    name: 'Saudi Arabia',
    code: 'SA'
  },
  {
    name: 'Senegal',
    code: 'SN'
  },
  {
    name: 'Serbia and Montenegro',
    code: 'CS'
  },
  {
    name: 'Seychelles',
    code: 'SC'
  },
  {
    name: 'Sierra Leone',
    code: 'SL'
  },
  {
    name: 'Singapore',
    code: 'SG'
  },
  {
    name: 'Slovakia',
    code: 'SK'
  },
  {
    name: 'Slovenia',
    code: 'SI'
  },
  {
    name: 'Solomon Islands',
    code: 'SB'
  },
  {
    name: 'Somalia',
    code: 'SO'
  },
  {
    name: 'South Africa',
    code: 'ZA'
  },
  {
    name: 'South Georgia and the South Sandwich Islands',
    code: 'GS'
  },
  {
    name: 'Spain',
    code: 'ES'
  },
  {
    name: 'Sri Lanka',
    code: 'LK'
  },
  {
    name: 'Sudan',
    code: 'SD'
  },
  {
    name: 'Suriname',
    code: 'SR'
  },
  {
    name: 'Svalbard and Jan Mayen',
    code: 'SJ'
  },
  {
    name: 'Swaziland',
    code: 'SZ'
  },
  {
    name: 'Sweden',
    code: 'SE'
  },
  {
    name: 'Switzerland',
    code: 'CH'
  },
  {
    name: 'Syrian Arab Republic',
    code: 'SY'
  },
  {
    name: 'Taiwan, Province of China',
    code: 'TW'
  },
  {
    name: 'Tajikistan',
    code: 'TJ'
  },
  {
    name: 'Tanzania, United Republic of',
    code: 'TZ'
  },
  {
    name: 'Thailand',
    code: 'TH'
  },
  {
    name: 'Timor-Leste',
    code: 'TL'
  },
  {
    name: 'Togo',
    code: 'TG'
  },
  {
    name: 'Tokelau',
    code: 'TK'
  },
  {
    name: 'Tonga',
    code: 'TO'
  },
  {
    name: 'Trinidad and Tobago',
    code: 'TT'
  },
  {
    name: 'Tunisia',
    code: 'TN'
  },
  {
    name: 'Turkey',
    code: 'TR'
  },
  {
    name: 'Turkmenistan',
    code: 'TM'
  },
  {
    name: 'Turks and Caicos Islands',
    code: 'TC'
  },
  {
    name: 'Tuvalu',
    code: 'TV'
  },
  {
    name: 'Uganda',
    code: 'UG'
  },
  {
    name: 'Ukraine',
    code: 'UA'
  },
  {
    name: 'United Arab Emirates',
    code: 'AE'
  },
  {
    name: 'United Kingdom',
    code: 'GB'
  },
  {
    name: 'United States',
    code: 'US'
  },
  {
    name: 'United States Minor Outlying Islands',
    code: 'UM'
  },
  {
    name: 'Uruguay',
    code: 'UY'
  },
  {
    name: 'Uzbekistan',
    code: 'UZ'
  },
  {
    name: 'Vanuatu',
    code: 'VU'
  },
  {
    name: 'Venezuela',
    code: 'VE'
  },
  {
    name: 'Viet Nam',
    code: 'VN'
  },
  {
    name: 'Virgin Islands, British',
    code: 'VG'
  },
  {
    name: 'Virgin Islands, U.S.',
    code: 'VI'
  },
  {
    name: 'Wallis and Futuna',
    code: 'WF'
  },
  {
    name: 'Western Sahara',
    code: 'EH'
  },
  {
    name: 'Yemen',
    code: 'YE'
  },
  {
    name: 'Zambia',
    code: 'ZM'
  },
  {
    name: 'Zimbabwe',
    code: 'ZW'
  }
];*/

var countries = [ { name: 'Afghanistan',
        code: 'AF',
        currencies: 'AFN',
        language: 'ps' },
      { name: 'Albania', code: 'AL', currencies: 'ALL', language: 'sq' },
      { name: 'Algeria', code: 'DZ', currencies: 'DZD', language: 'ar' },
      { name: 'American Samoa',
        code: 'AS',
        currencies: 'USD',
        language: 'en' },
      { name: 'AndorrA', code: 'AD', currencies: 'EUR', language: 'ca' },
      { name: 'Angola', code: 'AO', currencies: 'AOA', language: 'pt' },
      { name: 'Anguilla',
        code: 'AI',
        currencies: 'XCD',
        language: 'en' },
      { name: 'Antarctica', code: 'AQ', currencies: '', language: '' },
      { name: 'Antigua and Barbuda',
        code: 'AG',
        currencies: 'XCD',
        language: 'en' },
      { name: 'Argentina',
        code: 'AR',
        currencies: 'ARS',
        language: 'es' },
      { name: 'Armenia', code: 'AM', currencies: 'AMD', language: 'hy' },
      { name: 'Aruba', code: 'AW', currencies: 'AWG', language: 'nl' },
      { name: 'Australia',
        code: 'AU',
        currencies: 'AUD',
        language: 'en' },
      { name: 'Austria', code: 'AT', currencies: 'EUR', language: 'de' },
      { name: 'Azerbaijan',
        code: 'AZ',
        currencies: 'AZN',
        language: 'az' },
      { name: 'Bahamas', code: 'BS', currencies: 'BSD', language: 'en' },
      { name: 'Bahrain', code: 'BH', currencies: 'BHD', language: 'ar' },
      { name: 'Bangladesh',
        code: 'BD',
        currencies: 'BDT',
        language: 'bn' },
      { name: 'Barbados',
        code: 'BB',
        currencies: 'BBD',
        language: 'en' },
      { name: 'Belarus', code: 'BY', currencies: 'BYR', language: 'be' },
      { name: 'Belgium', code: 'BE', currencies: 'EUR', language: 'nl' },
      { name: 'Belize', code: 'BZ', currencies: 'BZD', language: 'en' },
      { name: 'Benin', code: 'BJ', currencies: 'XOF', language: 'fr' },
      { name: 'Bermuda', code: 'BM', currencies: 'BMD', language: 'en' },
      { name: 'Bhutan', code: 'BT', currencies: 'BTN', language: 'dz' },
      { name: 'Bolivia', code: 'BO', currencies: 'BOB', language: 'es' },
      { name: 'Bosnia and Herzegovina',
        code: 'BA',
        currencies: 'BAM',
        language: 'bs' },
      { name: 'Botswana',
        code: 'BW',
        currencies: 'BWP',
        language: 'en' },
      { name: 'Bouvet Island',
        code: 'BV',
        currencies: 'NOK',
        language: 'ms' },
      { name: 'Brazil', code: 'BR', currencies: 'BRL', language: 'pt' },
      { name: 'British Indian Ocean Territory',
        code: 'IO',
        currencies: 'USD',
        language: 'en' },
      { name: 'Brunei Darussalam',
        code: 'BN',
        currencies: 'BND',
        language: 'ms' },
      { name: 'Bulgaria',
        code: 'BG',
        currencies: 'BGN',
        language: 'bg' },
      { name: 'Burkina Faso',
        code: 'BF',
        currencies: 'XOF',
        language: 'fr' },
      { name: 'Burundi', code: 'BI', currencies: 'BIF', language: 'fr' },
      { name: 'Cambodia',
        code: 'KH',
        currencies: 'KHR',
        language: 'km' },
      { name: 'Cameroon',
        code: 'CM',
        currencies: 'XAF',
        language: 'en' },
      { name: 'Canada', code: 'CA', currencies: 'CAD', language: 'en' },
      { name: 'Cape Verde',
        code: 'CV',
        currencies: 'CVE',
        language: 'pt' },
      { name: 'Cayman Islands',
        code: 'KY',
        currencies: 'KYD',
        language: 'en' },
      { name: 'Central African Republic',
        code: 'CF',
        currencies: 'XAF',
        language: 'fr' },
      { name: 'Chad', code: 'TD', currencies: 'XAF', language: 'fr' },
      { name: 'Chile', code: 'CL', currencies: 'CLF', language: 'es' },
      { name: 'China', code: 'CN', currencies: 'CNY', language: 'zh' },
      { name: 'Christmas Island',
        code: 'CX',
        currencies: 'AUD',
        language: 'en' },
      { name: 'Cocos (Keeling) Islands',
        code: 'CC',
        currencies: 'AUD',
        language: 'en' },
      { name: 'Colombia',
        code: 'CO',
        currencies: 'COP',
        language: 'es' },
      { name: 'Comoros', code: 'KM', currencies: 'KMF', language: 'ar' },
      { name: 'Congo', code: 'CG', currencies: 'XAF', language: 'fr' },
      { name: 'Congo, The Democratic Republic of the',
        code: 'CD',
        currencies: 'CDF',
        language: 'fr' },
      { name: 'Cook Islands',
        code: 'CK',
        currencies: 'NZD',
        language: 'en' },
      { name: 'Costa Rica',
        code: 'CR',
        currencies: 'CRC',
        language: 'es' },
      { name: 'Cote D\'Ivoire',
        code: 'CI',
        currencies: 'XOF',
        language: 'fr' },
      { name: 'Croatia', code: 'HR', currencies: 'HRK', language: 'hr' },
      { name: 'Cuba', code: 'CU', currencies: 'CUC', language: 'es' },
      { name: 'Cyprus', code: 'CY', currencies: 'EUR', language: 'el' },
      { name: 'Czech Republic',
        code: 'CZ',
        currencies: 'CZK',
        language: 'cs' },
      { name: 'Denmark', code: 'DK', currencies: 'DKK', language: 'da' },
      { name: 'Djibouti',
        code: 'DJ',
        currencies: 'DJF',
        language: 'fr' },
      { name: 'Dominica',
        code: 'DM',
        currencies: 'XCD',
        language: 'en' },
      { name: 'Dominican Republic',
        code: 'DO',
        currencies: 'DOP',
        language: 'es' },
      { name: 'Ecuador', code: 'EC', currencies: 'USD', language: 'es' },
      { name: 'Egypt', code: 'EG', currencies: 'EGP', language: 'ar' },
      { name: 'El Salvador',
        code: 'SV',
        currencies: 'SVC',
        language: 'es' },
      { name: 'Equatorial Guinea',
        code: 'GQ',
        currencies: 'XAF',
        language: 'es' },
      { name: 'Eritrea', code: 'ER', currencies: 'ERN', language: 'ti' },
      { name: 'Estonia', code: 'EE', currencies: 'EUR', language: 'et' },
      { name: 'Ethiopia',
        code: 'ET',
        currencies: 'ETB',
        language: 'am' },
      { name: 'Falkland Islands (Malvinas)',
        code: 'FK',
        currencies: 'FKP',
        language: 'en' },
      { name: 'Faroe Islands',
        code: 'FO',
        currencies: 'DKK',
        language: 'fo' },
      { name: 'Fiji', code: 'FJ', currencies: 'FJD', language: 'en' },
      { name: 'Finland', code: 'FI', currencies: 'EUR', language: 'fi' },
      { name: 'France', code: 'FR', currencies: 'EUR', language: 'fr' },
      { name: 'French Guiana',
        code: 'GF',
        currencies: 'EUR',
        language: 'fr' },
      { name: 'French Polynesia',
        code: 'PF',
        currencies: 'XPF',
        language: 'fr' },
      { name: 'French Southern Territories',
        code: 'TF',
        currencies: 'EUR',
        language: 'fr' },
      { name: 'Gabon', code: 'GA', currencies: 'XAF', language: 'fr' },
      { name: 'Gambia', code: 'GM', currencies: 'GMD', language: 'en' },
      { name: 'Georgia', code: 'GE', currencies: 'GEL', language: 'ka' },
      { name: 'Germany', code: 'DE', currencies: 'EUR', language: 'de' },
      { name: 'Ghana', code: 'GH', currencies: 'GHS', language: 'en' },
      { name: 'Gibraltar',
        code: 'GI',
        currencies: 'GIP',
        language: 'en' },
      { name: 'Greece', code: 'GR', currencies: 'EUR', language: 'el' },
      { name: 'Greenland',
        code: 'GL',
        currencies: 'DKK',
        language: 'kl' },
      { name: 'Grenada', code: 'GD', currencies: 'XCD', language: 'en' },
      { name: 'Guadeloupe',
        code: 'GP',
        currencies: 'EUR',
        language: 'fr' },
      { name: 'Guam', code: 'GU', currencies: 'USD', language: 'en' },
      { name: 'Guatemala',
        code: 'GT',
        currencies: 'GTQ',
        language: 'es' },
      { name: 'Guernsey',
        code: 'GG',
        currencies: 'GBP',
        language: 'en' },
      { name: 'Guinea', code: 'GN', currencies: 'GNF', language: 'fr' },
      { name: 'Guinea-Bissau',
        code: 'GW',
        currencies: 'XOF',
        language: 'pt' },
      { name: 'Guyana', code: 'GY', currencies: 'GYD', language: 'en' },
      { name: 'Haiti', code: 'HT', currencies: 'HTG', language: 'fr' },
      { name: 'Heard Island and Mcdonald Islands',
        code: 'HM',
        currencies: 'AUD',
        language: 'en' },
      { name: 'Holy See (Vatican City State)',
        code: 'VA',
        currencies: '',
        language: '' },
      { name: 'Honduras',
        code: 'HN',
        currencies: 'HNL',
        language: 'es' },
      { name: 'Hong Kong',
        code: 'HK',
        currencies: 'HKD',
        language: 'en' },
      { name: 'Hungary', code: 'HU', currencies: 'HUF', language: 'hu' },
      { name: 'Iceland', code: 'IS', currencies: 'ISK', language: 'is' },
      { name: 'India', code: 'IN', currencies: 'INR', language: 'hi' },
      { name: 'Indonesia',
        code: 'ID',
        currencies: 'IDR',
        language: 'id' },
      { name: 'Iran, Islamic Republic Of',
        code: 'IR',
        currencies: 'IRR',
        language: 'fa' },
      { name: 'Iraq', code: 'IQ', currencies: 'IQD', language: 'ar' },
      { name: 'Ireland', code: 'IE', currencies: 'EUR', language: 'ga' },
      { name: 'Isle of Man',
        code: 'IM',
        currencies: 'GBP',
        language: 'en' },
      { name: 'Israel', code: 'IL', currencies: 'ILS', language: 'he' },
      { name: 'Italy', code: 'IT', currencies: 'EUR', language: 'it' },
      { name: 'Jamaica', code: 'JM', currencies: 'JMD', language: 'en' },
      { name: 'Japan', code: 'JP', currencies: 'JPY', language: 'ja' },
      { name: 'Jersey', code: 'JE', currencies: 'GBP', language: 'en' },
      { name: 'Jordan', code: 'JO', currencies: 'JOD', language: 'ar' },
      { name: 'Kazakhstan',
        code: 'KZ',
        currencies: 'KZT',
        language: 'kk' },
      { name: 'Kenya', code: 'KE', currencies: 'KES', language: 'en' },
      { name: 'Kiribati',
        code: 'KI',
        currencies: 'AUD',
        language: 'en' },
      { name: 'Korea, Democratic People\'S Republic of',
        code: 'KP',
        currencies: 'KPW',
        language: 'ko' },
      { name: 'Korea, Republic of',
        code: 'KR',
        currencies: 'KRW',
        language: 'ko' },
      { name: 'Kuwait', code: 'KW', currencies: 'KWD', language: 'ar' },
      { name: 'Kyrgyzstan',
        code: 'KG',
        currencies: 'KGS',
        language: 'ky' },
      { name: 'Lao People\'S Democratic Republic',
        code: 'LA',
        currencies: 'LAK',
        language: 'lo' },
      { name: 'Latvia', code: 'LV', currencies: 'EUR', language: 'lv' },
      { name: 'Lebanon', code: 'LB', currencies: 'LBP', language: 'ar' },
      { name: 'Lesotho', code: 'LS', currencies: 'LSL', language: 'en' },
      { name: 'Liberia', code: 'LR', currencies: 'LRD', language: 'en' },
      { name: 'Libyan Arab Jamahiriya',
        code: 'LY',
        currencies: 'LYD',
        language: 'ar' },
      { name: 'Liechtenstein',
        code: 'LI',
        currencies: 'CHF',
        language: 'de' },
      { name: 'Lithuania',
        code: 'LT',
        currencies: 'EUR',
        language: 'lt' },
      { name: 'Luxembourg',
        code: 'LU',
        currencies: 'EUR',
        language: 'fr' },
      { name: 'Macao', code: 'MO', currencies: 'MOP', language: 'zh' },
      { name: 'Macedonia, The Former Yugoslav Republic of',
        code: 'MK',
        currencies: 'MKD',
        language: 'mk' },
      { name: 'Madagascar',
        code: 'MG',
        currencies: 'MGA',
        language: 'fr' },
      { name: 'Malawi', code: 'MW', currencies: 'MWK', language: 'en' },
      { name: 'Malaysia',
        code: 'MY',
        currencies: 'MYR',
        language: 'ms' },
      { name: 'Maldives',
        code: 'MV',
        currencies: 'MVR',
        language: 'dv' },
      { name: 'Mali', code: 'ML', currencies: 'XOF', language: 'fr' },
      { name: 'Malta', code: 'MT', currencies: 'EUR', language: 'mt' },
      { name: 'Marshall Islands',
        code: 'MH',
        currencies: 'USD',
        language: 'en' },
      { name: 'Martinique',
        code: 'MQ',
        currencies: 'EUR',
        language: 'fr' },
      { name: 'Mauritania',
        code: 'MR',
        currencies: 'MRO',
        language: 'ar' },
      { name: 'Mauritius',
        code: 'MU',
        currencies: 'MUR',
        language: 'en' },
      { name: 'Mayotte', code: 'YT', currencies: 'EUR', language: 'fr' },
      { name: 'Mexico', code: 'MX', currencies: 'MXN', language: 'es' },
      { name: 'Micronesia, Federated States of',
        code: 'FM',
        currencies: 'USD',
        language: 'en' },
      { name: 'Moldova, Republic of',
        code: 'MD',
        currencies: 'MDL',
        language: 'ro' },
      { name: 'Monaco', code: 'MC', currencies: 'EUR', language: 'fr' },
      { name: 'Mongolia',
        code: 'MN',
        currencies: 'MNT',
        language: 'mn' },
      { name: 'Montserrat',
        code: 'MS',
        currencies: 'XCD',
        language: 'en' },
      { name: 'Morocco', code: 'MA', currencies: 'MAD', language: 'ar' },
      { name: 'Mozambique',
        code: 'MZ',
        currencies: 'MZN',
        language: 'pt' },
      { name: 'Myanmar', code: 'MM', currencies: 'MMK', language: 'my' },
      { name: 'Namibia', code: 'NA', currencies: 'NAD', language: 'en' },
      { name: 'Nauru', code: 'NR', currencies: 'AUD', language: 'en' },
      { name: 'Nepal', code: 'NP', currencies: 'NPR', language: 'ne' },
      { name: 'Netherlands',
        code: 'NL',
        currencies: 'EUR',
        language: 'nl' },
      { name: 'Netherlands Antilles',
        code: 'AN',
        currencies: '',
        language: '' },
      { name: 'New Caledonia',
        code: 'NC',
        currencies: 'XPF',
        language: 'fr' },
      { name: 'New Zealand',
        code: 'NZ',
        currencies: 'NZD',
        language: 'en' },
      { name: 'Nicaragua',
        code: 'NI',
        currencies: 'NIO',
        language: 'es' },
      { name: 'Niger', code: 'NE', currencies: 'XOF', language: 'fr' },
      { name: 'Nigeria', code: 'NG', currencies: 'NGN', language: 'en' },
      { name: 'Niue', code: 'NU', currencies: 'NZD', language: 'en' },
      { name: 'Norfolk Island',
        code: 'NF',
        currencies: 'AUD',
        language: 'en' },
      { name: 'Northern Mariana Islands',
        code: 'MP',
        currencies: 'USD',
        language: 'en' },
      { name: 'Norway', code: 'NO', currencies: 'NOK', language: 'no' },
      { name: 'Oman', code: 'OM', currencies: 'OMR', language: 'ar' },
      { name: 'Pakistan',
        code: 'PK',
        currencies: 'PKR',
        language: 'en' },
      { name: 'Palau', code: 'PW', currencies: 'USD', language: 'en' },
      { name: 'Palestinian Territory, Occupied',
        code: 'PS',
        currencies: 'ILS',
        language: 'ar' },
      { name: 'Panama', code: 'PA', currencies: 'PAB', language: 'es' },
      { name: 'Papua New Guinea',
        code: 'PG',
        currencies: 'PGK',
        language: 'en' },
      { name: 'Paraguay',
        code: 'PY',
        currencies: 'PYG',
        language: 'es' },
      { name: 'Peru', code: 'PE', currencies: 'PEN', language: 'es' },
      { name: 'Philippines',
        code: 'PH',
        currencies: 'PHP',
        language: 'en' },
      { name: 'Pitcairn',
        code: 'PN',
        currencies: 'NZD',
        language: 'en' },
      { name: 'Poland', code: 'PL', currencies: 'PLN', language: 'pl' },
      { name: 'Portugal',
        code: 'PT',
        currencies: 'EUR',
        language: 'pt' },
      { name: 'Puerto Rico',
        code: 'PR',
        currencies: 'USD',
        language: 'es' },
      { name: 'Qatar', code: 'QA', currencies: 'QAR', language: 'ar' },
      { name: 'RWANDA', code: 'RW', currencies: 'RWF', language: 'rw' },
      { name: 'Reunion', code: 'RE', currencies: 'EUR', language: 'fr' },
      { name: 'Romania', code: 'RO', currencies: 'RON', language: 'ro' },
      { name: 'Russian Federation',
        code: 'RU',
        currencies: 'RUB',
        language: 'ru' },
      { name: 'Saint Helena',
        code: 'SH',
        currencies: 'SHP',
        language: 'en' },
      { name: 'Saint Kitts and Nevis',
        code: 'KN',
        currencies: 'XCD',
        language: 'en' },
      { name: 'Saint Lucia',
        code: 'LC',
        currencies: 'XCD',
        language: 'en' },
      { name: 'Saint Pierre and Miquelon',
        code: 'PM',
        currencies: 'EUR',
        language: 'fr' },
      { name: 'Saint Vincent and the Grenadines',
        code: 'VC',
        currencies: 'XCD',
        language: 'en' },
      { name: 'Samoa', code: 'WS', currencies: 'WST', language: 'sm' },
      { name: 'San Marino',
        code: 'SM',
        currencies: 'EUR',
        language: 'it' },
      { name: 'Sao Tome and Principe',
        code: 'ST',
        currencies: 'STD',
        language: 'pt' },
      { name: 'Saudi Arabia',
        code: 'SA',
        currencies: 'SAR',
        language: 'ar' },
      { name: 'Senegal', code: 'SN', currencies: 'XOF', language: 'fr' },
      { name: 'Serbia and Montenegro',
        code: 'CS',
        currencies: '',
        language: '' },
      { name: 'Seychelles',
        code: 'SC',
        currencies: 'SCR',
        language: 'fr' },
      { name: 'Sierra Leone',
        code: 'SL',
        currencies: 'SLL',
        language: 'en' },
      { name: 'Singapore',
        code: 'SG',
        currencies: 'SGD',
        language: 'en' },
      { name: 'Slovakia',
        code: 'SK',
        currencies: 'EUR',
        language: 'sk' },
      { name: 'Slovenia',
        code: 'SI',
        currencies: 'EUR',
        language: 'sl' },
      { name: 'Solomon Islands',
        code: 'SB',
        currencies: 'SDB',
        language: 'en' },
      { name: 'Somalia', code: 'SO', currencies: 'SOS', language: 'so' },
      { name: 'South Africa',
        code: 'ZA',
        currencies: 'ZAR',
        language: 'af' },
      { name: 'South Georgia and the South Sandwich Islands',
        code: 'GS',
        currencies: 'GBP',
        language: 'en' },
      { name: 'Spain', code: 'ES', currencies: 'EUR', language: 'es' },
      { name: 'Sri Lanka',
        code: 'LK',
        currencies: 'LKR',
        language: 'si' },
      { name: 'Sudan', code: 'SD', currencies: 'SDG', language: 'ar' },
      { name: 'Suriname',
        code: 'SR',
        currencies: 'SRD',
        language: 'nl' },
      { name: 'Svalbard and Jan Mayen',
        code: 'SJ',
        currencies: 'NOK',
        language: 'no' },
      { name: 'Swaziland',
        code: 'SZ',
        currencies: 'SZL',
        language: 'en' },
      { name: 'Sweden', code: 'SE', currencies: 'SEK', language: 'sv' },
      { name: 'Switzerland',
        code: 'CH',
        currencies: 'CHE',
        language: 'de' },
      { name: 'Syrian Arab Republic',
        code: 'SY',
        currencies: 'SYP',
        language: 'ar' },
      { name: 'Taiwan, Province of China',
        code: 'TW',
        currencies: 'TWD',
        language: 'zh' },
      { name: 'Tajikistan',
        code: 'TJ',
        currencies: 'TJS',
        language: 'tg' },
      { name: 'Tanzania, United Republic of',
        code: 'TZ',
        currencies: 'TZS',
        language: 'sw' },
      { name: 'Thailand',
        code: 'TH',
        currencies: 'THB',
        language: 'th' },
      { name: 'Timor-Leste',
        code: 'TL',
        currencies: 'USD',
        language: 'pt' },
      { name: 'Togo', code: 'TG', currencies: 'XOF', language: 'fr' },
      { name: 'Tokelau', code: 'TK', currencies: 'NZD', language: 'en' },
      { name: 'Tonga', code: 'TO', currencies: 'TOP', language: 'en' },
      { name: 'Trinidad and Tobago',
        code: 'TT',
        currencies: 'TTD',
        language: 'en' },
      { name: 'Tunisia', code: 'TN', currencies: 'TND', language: 'ar' },
      { name: 'Turkey', code: 'TR', currencies: 'TRY', language: 'tr' },
      { name: 'Turkmenistan',
        code: 'TM',
        currencies: 'TMT',
        language: 'tk' },
      { name: 'Turks and Caicos Islands',
        code: 'TC',
        currencies: 'USD',
        language: 'en' },
      { name: 'Tuvalu', code: 'TV', currencies: 'AUD', language: 'en' },
      { name: 'Uganda', code: 'UG', currencies: 'UGX', language: 'en' },
      { name: 'Ukraine', code: 'UA', currencies: 'UAH', language: 'uk' },
      { name: 'United Arab Emirates',
        code: 'AE',
        currencies: 'AED',
        language: 'ar' },
      { name: 'United Kingdom',
        code: 'GB',
        currencies: 'GBP',
        language: 'en' },
      { name: 'United States',
        code: 'US',
        currencies: 'USD',
        language: 'en' },
      { name: 'United States Minor Outlying Islands',
        code: 'UM',
        currencies: 'USD',
        language: 'en' },
      { name: 'Uruguay', code: 'UY', currencies: 'UYI', language: 'es' },
      { name: 'Uzbekistan',
        code: 'UZ',
        currencies: 'UZS',
        language: 'uz' },
      { name: 'Vanuatu', code: 'VU', currencies: 'VUV', language: 'bi' },
      { name: 'Venezuela',
        code: 'VE',
        currencies: 'VEF',
        language: 'es' },
      { name: 'Viet Nam',
        code: 'VN',
        currencies: 'VND',
        language: 'vi' },
      { name: 'Virgin Islands, British',
        code: 'VG',
        currencies: 'USD',
        language: 'en' },
      { name: 'Virgin Islands, U.S.',
        code: 'VI',
        currencies: '',
        language: '' },
      { name: 'Wallis and Futuna',
        code: 'WF',
        currencies: 'XPF',
        language: 'fr' },
      { name: 'Western Sahara',
        code: 'EH',
        currencies: 'MAD',
        language: 'es' },
      { name: 'Yemen', code: 'YE', currencies: 'YER', language: 'ar' },
      { name: 'Zambia', code: 'ZM', currencies: 'ZMK', language: 'en' },
      { name: 'Zimbabwe',
        code: 'ZW',
        currencies: 'USD',
        language: 'en' },
      { name: 'Åland Islands',
        code: 'AX',
        currencies: 'EUR',
        language: 'sv' } ];


console.log(" MY IP : ", ip);
request.get("http://ipinfo.io/" + ip + "/json", function (error, response, body) {
  if (error) {
    cancel();
  } else {
    var body = JSON.parse(body);
    var ctry=null;
	if(body.country){
		ctry = _.findWhere(countries, {
		  code: body.country.toUpperCase()
		});
	}
    body.country = ctry && ctry.name || null;
    body.language = ctry && ctry.language || null;
    body.currency = ctry && ctry.currencies || null;
    setResult(body);
    $finishCallback();
  }
});
