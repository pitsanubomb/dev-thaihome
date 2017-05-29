(function () {
    "use strict";
    angular.module('ThaiHome')
        .factory("CountryToLanguage", ['$rootScope', function ($rootScope) {
            var countryList = [
                {
                    "country": "Afghanistan",
                    "code": "AF",
                    "language": "Dari",
                    "default": "English",
                    "languageCode": "af",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "AFN",
                    "Currency": "Afghani",
                    "Symbol": "AFN"
                },
                {
                    "country": "Albania",
                    "code": "AL",
                    "language": "Albanian",
                    "default": "English",
                    "languageCode": "al",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "ALL",
                    "Currency": "Lek",
                    "Symbol": "ALL"
                },
                {
                    "country": "Algeria",
                    "code": "DZ",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "dz",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "DZD",
                    "Currency": "Dinar",
                    "Symbol": "دج"
                },
                {
                    "country": "American Samoa",
                    "code": "AS",
                    "language": "Samoan",
                    "default": "English",
                    "languageCode": "as",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Dollar",
                    "Symbol": "$"
                },
                {
                    "country": "Andorra",
                    "code": "AD",
                    "language": "Catalan",
                    "default": "Spanish",
                    "languageCode": "ad",
                    "defaultLanguageCode": "es",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "Angola",
                    "code": "AO",
                    "language": "Portuguese",
                    "default": "Portuguese",
                    "languageCode": "ao",
                    "defaultLanguageCode": "pt",
                    "currencyCode": "AOA",
                    "Currency": "Kwanza",
                    "Symbol": "Kz"
                },
                {
                    "country": "Antigua and Barbuda",
                    "code": "AG",
                    "language": "English",
                    "default": "English",
                    "languageCode": "ag",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "XCD",
                    "Currency": "Dollar",
                    "Symbol": "EC$"
                },
                {
                    "country": "Argentina",
                    "code": "AR",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "ar",
                    "defaultLanguageCode": "es",
                    "currencyCode": "ARS",
                    "Currency": "Peso",
                    "Symbol": "AR$"
                },
                {
                    "country": "Armenia",
                    "code": "AM",
                    "language": "Armenian",
                    "default": "Russian",
                    "languageCode": "am",
                    "defaultLanguageCode": "am",
                    "currencyCode": "AMD",
                    "Currency": "Dram",
                    "Symbol": "֏"
                },
                {
                    "country": "Aruba",
                    "code": "AW",
                    "language": "Dutch",
                    "default": "Dutch",
                    "languageCode": "aw",
                    "defaultLanguageCode": "nl",
                    "currencyCode": "AWG",
                    "Currency": "Florin",
                    "Symbol": "ƒ"
                },
                {
                    "country": "Australia",
                    "code": "AU",
                    "language": "English",
                    "default": "English",
                    "languageCode": "au",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "AUD",
                    "Currency": "Dollar",
                    "Symbol": "AU$"
                },
                {
                    "country": "Austria",
                    "code": "AT",
                    "language": "German",
                    "default": "German",
                    "languageCode": "at",
                    "defaultLanguageCode": "de",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "Azerbaijan",
                    "code": "AZ",
                    "language": "Azerbaijani",
                    "default": "Russian",
                    "languageCode": "az",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "AZN",
                    "Currency": "Manat",
                    "Symbol": "ман"
                },
                {
                    "country": "Bahamas",
                    "code": "BS",
                    "language": "English",
                    "default": "English",
                    "languageCode": "bs",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BSD",
                    "Currency": "Dollar",
                    "Symbol": "BS$"
                },
                {
                    "country": "Bahrain",
                    "code": "BH",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "bh",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "BHD",
                    "Currency": "Dinar",
                    "Symbol": "ب.د"
                },
                {
                    "country": "Bangladesh",
                    "code": "BD",
                    "language": "Bengali",
                    "default": "English",
                    "languageCode": "bd",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BDT",
                    "Currency": "Taka",
                    "Symbol": "৳"
                },
                {
                    "country": "Barbados",
                    "code": "BB",
                    "language": "English",
                    "default": "English",
                    "languageCode": "bb",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BBD",
                    "Currency": "Dollar",
                    "Symbol": "Bds$"
                },
                {
                    "country": "Belarus",
                    "code": "BY",
                    "language": "Belarusian",
                    "default": "Russian",
                    "languageCode": "by",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "BYR",
                    "Currency": "Rubel",
                    "Symbol": "Br"
                },
                {
                    "country": "Belgium",
                    "code": "BE",
                    "language": "Dutch",
                    "default": "English",
                    "languageCode": "be",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "Belize",
                    "code": "BZ",
                    "language": "Spanish",
                    "default": "English",
                    "languageCode": "bz",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BZD",
                    "Currency": "Dollar",
                    "Symbol": "BZ$"
                },
                {
                    "country": "Benin",
                    "code": "BJ",
                    "language": "French",
                    "default": "French",
                    "languageCode": "bj",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XOF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Bermuda",
                    "code": "BM",
                    "language": "English",
                    "default": "English",
                    "languageCode": "bm",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BMD",
                    "Currency": "Dollar",
                    "Symbol": "BD$"
                },
                {
                    "country": "Bhutan",
                    "code": "BT",
                    "language": "Dzongkha",
                    "default": "English",
                    "languageCode": "bt",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BTN",
                    "Currency": "Ngultrum",
                    "Symbol": "Nu"
                },
                {
                    "country": "Bolivia",
                    "code": "BO",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "bo",
                    "defaultLanguageCode": "es",
                    "currencyCode": "BOB",
                    "Currency": "Boliviano",
                    "Symbol": "Bs"
                },
                {
                    "country": "Bosnia Herzegovina",
                    "code": "BA",
                    "language": "Bosnian",
                    "default": "English",
                    "languageCode": "ba",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BAM",
                    "Currency": "Mark",
                    "Symbol": "KM"
                },
                {
                    "country": "Botswana",
                    "code": "BW",
                    "language": "English",
                    "default": "English",
                    "languageCode": "bw",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BWP",
                    "Currency": "Pula",
                    "Symbol": "P"
                },
                {
                    "country": "Brazil",
                    "code": "BR",
                    "language": "Portuguese",
                    "default": "Spanish",
                    "languageCode": "br",
                    "defaultLanguageCode": "es",
                    "currencyCode": "BRL",
                    "Currency": "Real",
                    "Symbol": "R$"
                },
                {
                    "country": "British Indian Ocean Territory",
                    "code": "IO",
                    "language": "English",
                    "default": "English",
                    "languageCode": "io",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Dollar",
                    "Symbol": "$"
                },
                {
                    "country": "Brunei",
                    "code": "BN",
                    "language": "Malay",
                    "default": "English",
                    "languageCode": "bn",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BND",
                    "Currency": "Dollar",
                    "Symbol": "B$"
                },
                {
                    "country": "Bulgaria",
                    "code": "BG",
                    "language": "Bulgarian",
                    "default": "English",
                    "languageCode": "bg",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BGN",
                    "Currency": "Lew",
                    "Symbol": "лв"
                },
                {
                    "country": "Burkina Faso",
                    "code": "BF",
                    "language": "French",
                    "default": "French",
                    "languageCode": "bf",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XOF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Burundi",
                    "code": "BI",
                    "language": "French",
                    "default": "French",
                    "languageCode": "bi",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "BIF",
                    "Currency": "Franc",
                    "Symbol": "FBu"
                },
                {
                    "country": "Cambodia",
                    "code": "KH",
                    "language": "Khmer",
                    "default": "English",
                    "languageCode": "kh",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "KHR",
                    "Currency": "Riel",
                    "Symbol": "៛"
                },
                {
                    "country": "Cameroon",
                    "code": "CM",
                    "language": "English",
                    "default": "English",
                    "languageCode": "cm",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "XAF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Canada",
                    "code": "CA",
                    "language": "English",
                    "default": "English",
                    "languageCode": "ca",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "CAD",
                    "Currency": "Dollar",
                    "Symbol": "CA$"
                },
                {
                    "country": "Cape Verde",
                    "code": "CV",
                    "language": "Portuguese",
                    "default": "Portuguese",
                    "languageCode": "cv",
                    "defaultLanguageCode": "pt",
                    "currencyCode": "CVE",
                    "Currency": "Escudo",
                    "Symbol": "CV$"
                },
                {
                    "country": "Cayman Islands",
                    "code": "KY",
                    "language": "English",
                    "default": "English",
                    "languageCode": "ky",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "KYD",
                    "Currency": "Cayman-Dollar",
                    "Symbol": "CI$"
                },
                {
                    "country": "Central African Republic",
                    "code": "CF",
                    "language": "French",
                    "default": "French",
                    "languageCode": "cf",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XAF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Chad",
                    "code": "TD",
                    "language": "Arabic",
                    "default": "French",
                    "languageCode": "td",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XAF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Chile",
                    "code": "CL",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "cl",
                    "defaultLanguageCode": "es",
                    "currencyCode": "CLP",
                    "Currency": "Peso",
                    "Symbol": "CL$"
                },
                {
                    "country": "China",
                    "code": "CN",
                    "language": "Chinese",
                    "default": "Chinese",
                    "languageCode": "cn",
                    "defaultLanguageCode": "cn",
                    "currencyCode": "CNY",
                    "Currency": "Yuan",
                    "Symbol": "CN¥"
                },
                {
                    "country": "Christmas Island",
                    "code": "CX",
                    "language": "English",
                    "default": "English",
                    "languageCode": "cx",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "AUD",
                    "Currency": "Dollar",
                    "Symbol": "AU$"
                },
                {
                    "country": "Colombia",
                    "code": "CO",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "co",
                    "defaultLanguageCode": "es",
                    "currencyCode": "COP",
                    "Currency": "Peso",
                    "Symbol": "Col$"
                },
                {
                    "country": "Comoros",
                    "code": "KM",
                    "language": "Arabic",
                    "default": "French",
                    "languageCode": "km",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "KMF",
                    "Currency": "Franc",
                    "Symbol": "KMF"
                },
                {
                    "country": "Congo",
                    "code": "CG",
                    "language": "Swahili",
                    "default": "French",
                    "languageCode": "cg",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "CDF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Costa Rica",
                    "code": "CR",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "cr",
                    "defaultLanguageCode": "es",
                    "currencyCode": "CRC",
                    "Currency": "ColÃ³n",
                    "Symbol": "₡"
                },
                {
                    "country": "Côte d'Ivoire",
                    "code": "CI",
                    "language": "French",
                    "default": "French",
                    "languageCode": "ci",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XOF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Croatia",
                    "code": "HR",
                    "language": "Croatian",
                    "default": "English",
                    "languageCode": "hr",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "HRK",
                    "Currency": "Kuna",
                    "Symbol": "HRK"
                },
                {
                    "country": "Cuba",
                    "code": "CU",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "cu",
                    "defaultLanguageCode": "es",
                    "currencyCode": "CUP",
                    "Currency": "Peso",
                    "Symbol": "CU$"
                },
                {
                    "country": "Cyprus",
                    "code": "CY",
                    "language": "Greek",
                    "default": "English",
                    "languageCode": "cy",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "CY£"
                },
                {
                    "country": "Czech Republic",
                    "code": "CZ",
                    "language": "Czech",
                    "default": "English",
                    "languageCode": "cz",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "CZK",
                    "Currency": "Krone",
                    "Symbol": "Kč"
                },
                {
                    "country": "Denmark",
                    "code": "DK",
                    "language": "Danish",
                    "default": "English",
                    "languageCode": "dk",
                    "defaultLanguageCode": "dk",
                    "currencyCode": "DKK",
                    "Currency": "Krone",
                    "Symbol": "ø"
                },
                {
                    "country": "Djibouti",
                    "code": "DJ",
                    "language": "Arabic",
                    "default": "French",
                    "languageCode": "dj",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "DJF",
                    "Currency": "Franc",
                    "Symbol": "Fdj"
                },
                {
                    "country": "Dominica",
                    "code": "DM",
                    "language": "English",
                    "default": "English",
                    "languageCode": "dm",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "XCD",
                    "Currency": "Dollar",
                    "Symbol": "EC$"
                },
                {
                    "country": "Dominican Republic",
                    "code": "DO",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "do",
                    "defaultLanguageCode": "es",
                    "currencyCode": "DOP",
                    "Currency": "Peso",
                    "Symbol": "RD$"
                },
                {
                    "country": "Ecuador",
                    "code": "EC",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "ec",
                    "defaultLanguageCode": "es",
                    "currencyCode": "USD",
                    "Currency": "Dollar",
                    "Symbol": "US$"
                },
                {
                    "country": "Egypt",
                    "code": "EG",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "eg",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "EGP",
                    "Currency": "Pfund",
                    "Symbol": "ج.م"
                },
                {
                    "country": "El Salvador",
                    "code": "SV",
                    "language": "French",
                    "default": "English",
                    "languageCode": "sv",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Dollar",
                    "Symbol": "US$"
                },
                {
                    "country": "Equatorial Guinea",
                    "code": "GQ",
                    "language": "French",
                    "default": "Spanish",
                    "languageCode": "gq",
                    "defaultLanguageCode": "es",
                    "currencyCode": "XAF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Eritrea",
                    "code": "ER",
                    "language": "Arabic",
                    "default": "English",
                    "languageCode": "er",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "ERN",
                    "Currency": "Nakfa",
                    "Symbol": "Nfk"
                },
                {
                    "country": "Estonia",
                    "code": "EE",
                    "language": "Estonian",
                    "default": "English",
                    "languageCode": "ee",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "KR"
                },
                {
                    "country": "Ethiopia",
                    "code": "ET",
                    "language": "Amharic",
                    "default": "English",
                    "languageCode": "et",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "ETB",
                    "Currency": "Birr",
                    "Symbol": "Br"
                },
                {
                    "country": "Faroe Islands",
                    "code": "FO",
                    "language": "Faroese",
                    "default": "English",
                    "languageCode": "fo",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "DKK",
                    "Currency": "Krone",
                    "Symbol": "ø"
                },
                {
                    "country": "Fiji",
                    "code": "FJ",
                    "language": "English",
                    "default": "English",
                    "languageCode": "fj",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "FJD",
                    "Currency": "Dollar",
                    "Symbol": "FJ$"
                },
                {
                    "country": "Finland",
                    "code": "FI",
                    "language": "Finnish",
                    "default": "English",
                    "languageCode": "fi",
                    "defaultLanguageCode": "fi",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "France",
                    "code": "FR",
                    "language": "French",
                    "default": "French",
                    "languageCode": "fr",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "French Guiana",
                    "code": "GF",
                    "language": "French",
                    "default": "French",
                    "languageCode": "gf",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "French Polynesia",
                    "code": "PF",
                    "language": "French",
                    "default": "French",
                    "languageCode": "pf",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XPF",
                    "Currency": "Franc",
                    "Symbol": "CFP"
                },
                {
                    "country": "Gabon",
                    "code": "GA",
                    "language": "French",
                    "default": "French",
                    "languageCode": "ga",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XAF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Gambia",
                    "code": "GM",
                    "language": "English",
                    "default": "English",
                    "languageCode": "gm",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "GMD",
                    "Currency": "Dalasi",
                    "Symbol": "D"
                },
                {
                    "country": "Georgia",
                    "code": "GE",
                    "language": "Georgian",
                    "default": "English",
                    "languageCode": "ge",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "GEL",
                    "Currency": "Lari",
                    "Symbol": "GEL"
                },
                {
                    "country": "Germany",
                    "code": "DE",
                    "language": "German",
                    "default": "German",
                    "languageCode": "de",
                    "defaultLanguageCode": "de",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "Ghana",
                    "code": "GH",
                    "language": "English",
                    "default": "English",
                    "languageCode": "gh",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "GHS",
                    "Currency": "Ghana Cedi",
                    "Symbol": "₵"
                },
                {
                    "country": "Greece",
                    "code": "GR",
                    "language": "Greek",
                    "default": "English",
                    "languageCode": "gr",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "Greenland",
                    "code": "GL",
                    "language": "Greenlandic",
                    "default": "English",
                    "languageCode": "gl",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "DKK",
                    "Currency": "Krone",
                    "Symbol": "ø"
                },
                {
                    "country": "Grenada",
                    "code": "GD",
                    "language": "English",
                    "default": "English",
                    "languageCode": "gd",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "XCD",
                    "Currency": "Dollar",
                    "Symbol": "EC$"
                },
                {
                    "country": "Guadeloupe",
                    "code": "GP",
                    "language": "French",
                    "default": "French",
                    "languageCode": "gp",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "Guam",
                    "code": "GU",
                    "language": "Spanish",
                    "default": "English",
                    "languageCode": "gu",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Dollar",
                    "Symbol": "US$"
                },
                {
                    "country": "Guatemala",
                    "code": "GT",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "gt",
                    "defaultLanguageCode": "es",
                    "currencyCode": "GTQ",
                    "Currency": "Quetzal",
                    "Symbol": "Q"
                },
                {
                    "country": "Guinea",
                    "code": "GN",
                    "language": "French",
                    "default": "French",
                    "languageCode": "gn",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "GNF",
                    "Currency": "Pfund",
                    "Symbol": "FG"
                },
                {
                    "country": "Guinea-Bissau",
                    "code": "GW",
                    "language": "Portuguese",
                    "default": "Portuguese",
                    "languageCode": "gw",
                    "defaultLanguageCode": "pt",
                    "currencyCode": "XOF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Guyana",
                    "code": "GY",
                    "language": "English",
                    "default": "English",
                    "languageCode": "gy",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "GYD",
                    "Currency": "Franc",
                    "Symbol": "GY$"
                },
                {
                    "country": "Haiti",
                    "code": "HT",
                    "language": "French",
                    "default": "French",
                    "languageCode": "ht",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "HTG",
                    "Currency": "Dollar",
                    "Symbol": "G"
                },
                {
                    "country": "Honduras",
                    "code": "HN",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "hn",
                    "defaultLanguageCode": "es",
                    "currencyCode": "HNL",
                    "Currency": "Dollar",
                    "Symbol": "L"
                },
                {
                    "country": "Hong Kong",
                    "code": "HK",
                    "language": "Chinese",
                    "default": "English",
                    "languageCode": "hk",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "HKD",
                    "Currency": "Lempira",
                    "Symbol": "HK$"
                },
                {
                    "country": "Hungary",
                    "code": "HU",
                    "language": "Hungarian",
                    "default": "English",
                    "languageCode": "hu",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "HUF",
                    "Currency": "Dollar",
                    "Symbol": "Ft"
                },
                {
                    "country": "Iceland",
                    "code": "IS",
                    "language": "Icelandic",
                    "default": "English",
                    "languageCode": "is",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "ISK",
                    "Currency": "Forint",
                    "Symbol": "ISK"
                },
                {
                    "country": "India",
                    "code": "IN",
                    "language": "Hindi",
                    "default": "English",
                    "languageCode": "in",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "INR",
                    "Currency": "Krone",
                    "Symbol": "IN₨"
                },
                {
                    "country": "Indonesia",
                    "code": "ID",
                    "language": "Indonesian",
                    "default": "English",
                    "languageCode": "id",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "IDR",
                    "Currency": "Rupie",
                    "Symbol": "Rp"
                },
                {
                    "country": "Iran",
                    "code": "IR",
                    "language": "Persian",
                    "default": "English",
                    "languageCode": "ir",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "IRR",
                    "Currency": "Rupiah",
                    "Symbol": "ريال"
                },
                {
                    "country": "Iraq",
                    "code": "IQ",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "iq",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "IQD",
                    "Currency": "Rial",
                    "Symbol": "ع.د"
                },
                {
                    "country": "Ireland",
                    "code": "IE",
                    "language": "English",
                    "default": "English",
                    "languageCode": "ie",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Dinar",
                    "Symbol": "€"
                },
                {
                    "country": "Isle of Man",
                    "code": "IM",
                    "language": "English",
                    "default": "English",
                    "languageCode": "im",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "IMP",
                    "Currency": "Euro",
                    "Symbol": "UK£"
                },
                {
                    "country": "Israel",
                    "code": "IL",
                    "language": "Hebrew",
                    "default": "Arabic",
                    "languageCode": "il",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "ILS",
                    "Currency": "Pfund",
                    "Symbol": "₪"
                },
                {
                    "country": "Italy",
                    "code": "IT",
                    "language": "Italian",
                    "default": "English",
                    "languageCode": "it",
                    "defaultLanguageCode": "it",
                    "currencyCode": "EUR",
                    "Currency": "Schekel",
                    "Symbol": "€"
                },
                {
                    "country": "Jamaica",
                    "code": "JM",
                    "language": "English",
                    "default": "English",
                    "languageCode": "jm",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "JMD",
                    "Currency": "Euro",
                    "Symbol": "JA$"
                },
                {
                    "country": "Japan",
                    "code": "JP",
                    "language": "Japanese",
                    "default": "Japanese",
                    "languageCode": "jp",
                    "defaultLanguageCode": "jp",
                    "currencyCode": "JPY",
                    "Currency": "Dollar",
                    "Symbol": "JP¥"
                },
                {
                    "country": "Jersey",
                    "code": "JE",
                    "language": "English",
                    "default": "English",
                    "languageCode": "je",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "JEP",
                    "Currency": "Yen",
                    "Symbol": "UK£"
                },
                {
                    "country": "Jordan",
                    "code": "JO",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "jo",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "JOD",
                    "Currency": "Pfund-Sterling",
                    "Symbol": "JD"
                },
                {
                    "country": "Kazakhstan",
                    "code": "KZ",
                    "language": "Russian",
                    "default": "Russian",
                    "languageCode": "kz",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "KZT",
                    "Currency": "Dinar",
                    "Symbol": "KZT"
                },
                {
                    "country": "Kenya",
                    "code": "KE",
                    "language": "Swahili",
                    "default": "English",
                    "languageCode": "ke",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "KES",
                    "Currency": "Tenge",
                    "Symbol": "KSh"
                },
                {
                    "country": "Kiribati",
                    "code": "KI",
                    "language": "English",
                    "default": "English",
                    "languageCode": "ki",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "AUD",
                    "Currency": "Schilling",
                    "Symbol": "AU$"
                },
                {
                    "country": "Kosovo",
                    "code": "XK",
                    "language": "Albanian",
                    "default": "English",
                    "languageCode": "xk",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "North Korea",
                    "code": "KP",
                    "language": "Korean",
                    "default": "Korean",
                    "languageCode": "kp",
                    "defaultLanguageCode": "kr",
                    "currencyCode": "KPW",
                    "Currency": "Euro",
                    "Symbol": "₩"
                },
                {
                    "country": "South Korea",
                    "code": "KR",
                    "language": "Korean",
                    "default": "Korean",
                    "languageCode": "kr",
                    "defaultLanguageCode": "kr",
                    "currencyCode": "KRW",
                    "Currency": "Won",
                    "Symbol": "₩"
                },
                {
                    "country": "Kuwait",
                    "code": "KW",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "kw",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "KWD",
                    "Currency": "Won",
                    "Symbol": "د.ك"
                },
                {
                    "country": "Kyrgyzstan",
                    "code": "KG",
                    "language": "Russian",
                    "default": "Russian",
                    "languageCode": "kg",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "KGS",
                    "Currency": "Dinar",
                    "Symbol": "KGS"
                },
                {
                    "country": "Laos",
                    "code": "LA",
                    "language": "Lao",
                    "default": "English",
                    "languageCode": "la",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "LAK",
                    "Currency": "Som",
                    "Symbol": "₭"
                },
                {
                    "country": "Latvia",
                    "code": "LV",
                    "language": "Latvian",
                    "default": "English",
                    "languageCode": "lv",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Kip",
                    "Symbol": "Ls"
                },
                {
                    "country": "Lebanon",
                    "code": "LB",
                    "language": "Arabic",
                    "default": "French",
                    "languageCode": "lb",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "LBP",
                    "Currency": "Euro",
                    "Symbol": "ل.ل"
                },
                {
                    "country": "Lesotho",
                    "code": "LS",
                    "language": "English",
                    "default": "English",
                    "languageCode": "ls",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "LSL",
                    "Currency": "Pfund",
                    "Symbol": "L"
                },
                {
                    "country": "Liberia",
                    "code": "LR",
                    "language": "English",
                    "default": "English",
                    "languageCode": "lr",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "LRD",
                    "Currency": "Loti",
                    "Symbol": "L$"
                },
                {
                    "country": "Libya",
                    "code": "LY",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "ly",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "LYD",
                    "Currency": "Dollar",
                    "Symbol": "ل.د"
                },
                {
                    "country": "Liechtenstein",
                    "code": "LI",
                    "language": "German",
                    "default": "German",
                    "languageCode": "li",
                    "defaultLanguageCode": "de",
                    "currencyCode": "CHF",
                    "Currency": "Dinar",
                    "Symbol": "CHF"
                },
                {
                    "country": "Lithuania",
                    "code": "LT",
                    "language": "Lithuanian",
                    "default": "English",
                    "languageCode": "lt",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "LTL",
                    "Currency": "Franken",
                    "Symbol": "Lt"
                },
                {
                    "country": "Luxembourg",
                    "code": "LU",
                    "language": "German",
                    "default": "French",
                    "languageCode": "lu",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Litas",
                    "Symbol": "€"
                },
                {
                    "country": "Macau",
                    "code": "MO",
                    "language": "Chinese",
                    "default": "Chinese",
                    "languageCode": "mo",
                    "defaultLanguageCode": "cn",
                    "currencyCode": "MOP",
                    "Currency": "Euro",
                    "Symbol": "MO$"
                },
                {
                    "country": "Macedonia",
                    "code": "MK",
                    "language": "Macedonian",
                    "default": "English",
                    "languageCode": "mk",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "MKD",
                    "Currency": "Pataca",
                    "Symbol": "MKD"
                },
                {
                    "country": "Madagascar",
                    "code": "MG",
                    "language": "French",
                    "default": "French",
                    "languageCode": "mg",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "MGA",
                    "Currency": "Denar",
                    "Symbol": "MGA"
                },
                {
                    "country": "Malawi",
                    "code": "MW",
                    "language": "English",
                    "default": "English",
                    "languageCode": "mw",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "MWK",
                    "Currency": "Ariary",
                    "Symbol": "MK"
                },
                {
                    "country": "Malaysia",
                    "code": "MY",
                    "language": "Malay",
                    "default": "English",
                    "languageCode": "my",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "MYR",
                    "Currency": "Kwacha",
                    "Symbol": "RM"
                },
                {
                    "country": "Maldives",
                    "code": "MV",
                    "language": "Maldivian",
                    "default": "English",
                    "languageCode": "mv",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "MVR",
                    "Currency": "Ringgit",
                    "Symbol": "MRf"
                },
                {
                    "country": "Mali",
                    "code": "ML",
                    "language": "French",
                    "default": "French",
                    "languageCode": "ml",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XOF",
                    "Currency": "Rufiyaa",
                    "Symbol": "franc"
                },
                {
                    "country": "Malta",
                    "code": "MT",
                    "language": "English",
                    "default": "English",
                    "languageCode": "mt",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Franc",
                    "Symbol": "Lm"
                },
                {
                    "country": "Marshall Islands",
                    "code": "MH",
                    "language": "English",
                    "default": "English",
                    "languageCode": "mh",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Euro",
                    "Symbol": "US$"
                },
                {
                    "country": "Martinique",
                    "code": "MQ",
                    "language": "French",
                    "default": "French",
                    "languageCode": "mq",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Dollar",
                    "Symbol": "€"
                },
                {
                    "country": "Mauritania",
                    "code": "MR",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "mr",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "MRO",
                    "Currency": "Euro",
                    "Symbol": "UM"
                },
                {
                    "country": "Mauritius",
                    "code": "MU",
                    "language": "French",
                    "default": "English",
                    "languageCode": "mu",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "MUR",
                    "Currency": "Ouguiya",
                    "Symbol": "MU₨"
                },
                {
                    "country": "Mayotte",
                    "code": "YT",
                    "language": "French",
                    "default": "French",
                    "languageCode": "yt",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Rupie",
                    "Symbol": "€"
                },
                {
                    "country": "Mexico",
                    "code": "MX",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "mx",
                    "defaultLanguageCode": "es",
                    "currencyCode": "MXN",
                    "Currency": "Euro",
                    "Symbol": "Mex$"
                },
                {
                    "country": "Micronesia",
                    "code": "FM",
                    "language": "English",
                    "default": "English",
                    "languageCode": "fm",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Peso",
                    "Symbol": "US$"
                },
                {
                    "country": "Moldova",
                    "code": "MD",
                    "language": "Moldavian",
                    "default": "Romanian",
                    "languageCode": "md",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "MDL",
                    "Currency": "Dollar",
                    "Symbol": "MDL"
                },
                {
                    "country": "Monaco",
                    "code": "MC",
                    "language": "French",
                    "default": "French",
                    "languageCode": "mc",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Leu",
                    "Symbol": "€"
                },
                {
                    "country": "Mongolia",
                    "code": "MN",
                    "language": "Mongolian",
                    "default": "English",
                    "languageCode": "mn",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "MNT",
                    "Currency": "Euro",
                    "Symbol": "₮"
                },
                {
                    "country": "Montenegro",
                    "code": "ME",
                    "language": "Montenegrin",
                    "default": "English",
                    "languageCode": "me",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "TÃ¶grÃ¶g",
                    "Symbol": "€"
                },
                {
                    "country": "Morocco",
                    "code": "MA",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "ma",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "MAD",
                    "Currency": "Euro",
                    "Symbol": "د.م"
                },
                {
                    "country": "Mozambique",
                    "code": "MZ",
                    "language": "Portuguese",
                    "default": "Portuguese",
                    "languageCode": "mz",
                    "defaultLanguageCode": "pt",
                    "currencyCode": "MZN",
                    "Currency": "Dirham",
                    "Symbol": "MTn"
                },
                {
                    "country": "Myanmar",
                    "code": "MM",
                    "language": "Burmese",
                    "default": "English",
                    "languageCode": "mm",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "MMK",
                    "Currency": "Metical",
                    "Symbol": "K"
                },
                {
                    "country": "Namibia",
                    "code": "NA",
                    "language": "Afrikaans",
                    "default": "English",
                    "languageCode": "na",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "NAD",
                    "Currency": "Kyat",
                    "Symbol": "N$"
                },
                {
                    "country": "Nepal",
                    "code": "NP",
                    "language": "Nepali",
                    "default": "English",
                    "languageCode": "np",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "NPR",
                    "Currency": "Dollar",
                    "Symbol": "NP₨"
                },
                {
                    "country": "Netherlands",
                    "code": "NL",
                    "language": "Dutch",
                    "default": "Dutch",
                    "languageCode": "nl",
                    "defaultLanguageCode": "nl",
                    "currencyCode": "EUR",
                    "Currency": "Rupie",
                    "Symbol": "€"
                },
                {
                    "country": "New Caledonia",
                    "code": "NC",
                    "language": "French",
                    "default": "French",
                    "languageCode": "nc",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XPF",
                    "Currency": "Euro",
                    "Symbol": "CFP"
                },
                {
                    "country": "New Zealand",
                    "code": "NZ",
                    "language": "English",
                    "default": "English",
                    "languageCode": "nz",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "NZD",
                    "Currency": "Franc",
                    "Symbol": "NZ$"
                },
                {
                    "country": "Nicaragua",
                    "code": "NI",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "ni",
                    "defaultLanguageCode": "es",
                    "currencyCode": "NIO",
                    "Currency": "Dollar",
                    "Symbol": "C$"
                },
                {
                    "country": "Niger",
                    "code": "NE",
                    "language": "French",
                    "default": "French",
                    "languageCode": "ne",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XOF",
                    "Currency": "CÃ³rdoba Oro",
                    "Symbol": "franc"
                },
                {
                    "country": "Nigeria",
                    "code": "NG",
                    "language": "English",
                    "default": "English",
                    "languageCode": "ng",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "NGN",
                    "Currency": "Franc",
                    "Symbol": "₦"
                },
                {
                    "country": "Niue",
                    "code": "NU",
                    "language": "English",
                    "default": "English",
                    "languageCode": "nu",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "NZD",
                    "Currency": "Naira",
                    "Symbol": "NZ$"
                },
                {
                    "country": "Norfolk Island",
                    "code": "NF",
                    "language": "English",
                    "default": "English",
                    "languageCode": "nf",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "AUD",
                    "Currency": "Dollar",
                    "Symbol": "AU$"
                },
                {
                    "country": "Northern Mariana Islands",
                    "code": "MP",
                    "language": "English",
                    "default": "English",
                    "languageCode": "mp",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Dollar",
                    "Symbol": "US$"
                },
                {
                    "country": "Norway",
                    "code": "NO",
                    "language": "Norwegian",
                    "default": "English",
                    "languageCode": "no",
                    "defaultLanguageCode": "no",
                    "currencyCode": "NOK",
                    "Currency": "Dollar",
                    "Symbol": "øre"
                },
                {
                    "country": "Oman",
                    "code": "OM",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "om",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "OMR",
                    "Currency": "Krone",
                    "Symbol": "ر.ع"
                },
                {
                    "country": "Pakistan",
                    "code": "PK",
                    "language": "Urdu",
                    "default": "English",
                    "languageCode": "pk",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "PKR",
                    "Currency": "Rial",
                    "Symbol": "PKRs"
                },
                {
                    "country": "Palestine",
                    "code": "PS",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "ps",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "ILS",
                    "Currency": "Rupie",
                    "Symbol": "JD"
                },
                {
                    "country": "Panama",
                    "code": "PA",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "pa",
                    "defaultLanguageCode": "es",
                    "currencyCode": "PAB",
                    "Currency": "Schekel",
                    "Symbol": "PAB"
                },
                {
                    "country": "Papua New Guinea",
                    "code": "PG",
                    "language": "English",
                    "default": "English",
                    "languageCode": "pg",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "PGK",
                    "Currency": "Balboa",
                    "Symbol": "K"
                },
                {
                    "country": "Paraguay",
                    "code": "PY",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "py",
                    "defaultLanguageCode": "es",
                    "currencyCode": "PYG",
                    "Currency": "Kina",
                    "Symbol": "₲"
                },
                {
                    "country": "Peru",
                    "code": "PE",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "pe",
                    "defaultLanguageCode": "es",
                    "currencyCode": "PEN",
                    "Currency": "GuaranÃ­",
                    "Symbol": "S./"
                },
                {
                    "country": "Philippines",
                    "code": "PH",
                    "language": "Filipino",
                    "default": "English",
                    "languageCode": "ph",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "PHP",
                    "Currency": "Nuevo Sol",
                    "Symbol": "₱"
                },
                {
                    "country": "Pitcairn",
                    "code": "PN",
                    "language": "English",
                    "default": "English",
                    "languageCode": "pn",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "GBP",
                    "Currency": "Peso",
                    "Symbol": "NZ$"
                },
                {
                    "country": "Poland",
                    "code": "PL",
                    "language": "Polish",
                    "default": "English",
                    "languageCode": "pl",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "PLN",
                    "Currency": "Pfund",
                    "Symbol": "zł"
                },
                {
                    "country": "Portugal",
                    "code": "PT",
                    "language": "Portuguese",
                    "default": "Portuguese",
                    "languageCode": "pt",
                    "defaultLanguageCode": "pt",
                    "currencyCode": "EUR",
                    "Currency": "Zloty",
                    "Symbol": "€"
                },
                {
                    "country": "Puerto Rico",
                    "code": "PR",
                    "language": "Spanish",
                    "default": "English",
                    "languageCode": "pr",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Euro",
                    "Symbol": "US$"
                },
                {
                    "country": "Qatar",
                    "code": "QA",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "qa",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "QAR",
                    "Currency": "Dollar",
                    "Symbol": "ر.ق"
                },
                {
                    "country": "Réunion",
                    "code": "RE",
                    "language": "French",
                    "default": "French",
                    "languageCode": "re",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Dollar",
                    "Symbol": "€"
                },
                {
                    "country": "Romania",
                    "code": "RO",
                    "language": "Romanian",
                    "default": "English",
                    "languageCode": "ro",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "RON",
                    "Currency": "Euro",
                    "Symbol": "ROL"
                },
                {
                    "country": "Russia",
                    "code": "RU",
                    "language": "Russian",
                    "default": "Russian",
                    "languageCode": "ru",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "RUB",
                    "Currency": "Leu",
                    "Symbol": "RUруб"
                },
                {
                    "country": "Rwanda",
                    "code": "RW",
                    "language": "English",
                    "default": "English",
                    "languageCode": "rw",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "RWF",
                    "Currency": "Rubel",
                    "Symbol": "RF"
                },
                {
                    "country": "Saint Kitts and Nevis",
                    "code": "KN",
                    "language": "English",
                    "default": "English",
                    "languageCode": "kn",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "XCD",
                    "Currency": "Euro",
                    "Symbol": "EC$"
                },
                {
                    "country": "Saint Lucia",
                    "code": "LC",
                    "language": "English",
                    "default": "English",
                    "languageCode": "lc",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "XCD",
                    "Currency": "Dollar",
                    "Symbol": "EC$"
                },
                {
                    "country": "Saint Pierre and Miquelon",
                    "code": "PM",
                    "language": "French",
                    "default": "French",
                    "languageCode": "pm",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Gulden",
                    "Symbol": "€"
                },
                {
                    "country": "Saint Vincent and Grenadines",
                    "code": "VC",
                    "language": "English",
                    "default": "English",
                    "languageCode": "vc",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "XCD",
                    "Currency": "Euro",
                    "Symbol": "EC$"
                },
                {
                    "country": "Samoa",
                    "code": "WS",
                    "language": "English",
                    "default": "English",
                    "languageCode": "ws",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "WST",
                    "Currency": "Dollar",
                    "Symbol": "WS$"
                },
                {
                    "country": "Saudi Arabia",
                    "code": "SA",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "sa",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "SAR",
                    "Currency": "Tala",
                    "Symbol": "ر.س"
                },
                {
                    "country": "Senegal",
                    "code": "SN",
                    "language": "French",
                    "default": "French",
                    "languageCode": "sn",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XOF",
                    "Currency": "Riyal",
                    "Symbol": "franc"
                },
                {
                    "country": "Serbia",
                    "code": "RS",
                    "language": "Serbian",
                    "default": "English",
                    "languageCode": "rs",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "RSD",
                    "Currency": "Franc",
                    "Symbol": "дин"
                },
                {
                    "country": "Seychelles",
                    "code": "SC",
                    "language": "French",
                    "default": "English",
                    "languageCode": "sc",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "SCR",
                    "Currency": "Dinar",
                    "Symbol": "SRe"
                },
                {
                    "country": "Sierra Leone",
                    "code": "SL",
                    "language": "English",
                    "default": "English",
                    "languageCode": "sl",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "SLL",
                    "Currency": "Rupie",
                    "Symbol": "Le"
                },
                {
                    "country": "Singapore",
                    "code": "SG",
                    "language": "Chinese",
                    "default": "English",
                    "languageCode": "sg",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "SGD",
                    "Currency": "Leone",
                    "Symbol": "S$"
                },
                {
                    "country": "Slovakia",
                    "code": "SK",
                    "language": "Slovak",
                    "default": "English",
                    "languageCode": "sk",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Dollar",
                    "Symbol": "Sk"
                },
                {
                    "country": "Slovenia",
                    "code": "SI",
                    "language": "Slovene",
                    "default": "English",
                    "languageCode": "si",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "Solomon Islands",
                    "code": "SB",
                    "language": "English",
                    "default": "English",
                    "languageCode": "sb",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "SBD",
                    "Currency": "Euro",
                    "Symbol": "SI$"
                },
                {
                    "country": "Somalia",
                    "code": "SO",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "so",
                    "defaultLanguageCode": "sa",
                        "currencyCode": "SOS",
                    "Currency": "Dollar",
                    "Symbol": "Sh"
                },
                {
                    "country": "South Africa",
                    "code": "ZA",
                    "language": "Afrikaans",
                    "default": "English",
                    "languageCode": "za",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "ZAR",
                    "Currency": "Schilling",
                    "Symbol": "SAR"
                },
                {
                    "country": "South Georgia/South Sandwich Islands",
                    "code": "GS",
                    "language": "English",
                    "default": "English",
                    "languageCode": "gs",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "GBP",
                    "Currency": "Rand",
                    "Symbol": "UK£"
                },
                {
                    "country": "Spain",
                    "code": "ES",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "es",
                    "defaultLanguageCode": "es",
                    "currencyCode": "EUR",
                    "Currency": "Pfund",
                    "Symbol": "€"
                },
                {
                    "country": "Sri Lanka",
                    "code": "LK",
                    "language": "Sinhala",
                    "default": "English",
                    "languageCode": "lk",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "LKR",
                    "Currency": "Euro",
                    "Symbol": "LK₨"
                },
                {
                    "country": "Sudan",
                    "code": "SD",
                    "language": "Arabic",
                    "default": "English",
                    "languageCode": "sd",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "SDG",
                    "Currency": "Rupie",
                    "Symbol": "£Sd"
                },
                {
                    "country": "Suriname",
                    "code": "SR",
                    "language": "Dutch",
                    "default": "Dutch",
                    "languageCode": "sr",
                    "defaultLanguageCode": "nl",
                    "currencyCode": "SRD",
                    "Currency": "Pfund",
                    "Symbol": "SR$"
                },
                {
                    "country": "Swaziland",
                    "code": "SZ",
                    "language": "English",
                    "default": "English",
                    "languageCode": "sz",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "SZL",
                    "Currency": "Dollar",
                    "Symbol": "SZL"
                },
                {
                    "country": "Sweden",
                    "code": "SE",
                    "language": "Swedish",
                    "default": "English",
                    "languageCode": "se",
                    "defaultLanguageCode": "se",
                    "currencyCode": "SEK",
                    "Currency": "Lilangeni",
                    "Symbol": "kr"
                },
                {
                    "country": "Switzerland",
                    "code": "cn",
                    "language": "French",
                    "default": "German",
                    "languageCode": "cn",
                    "defaultLanguageCode": "de",
                    "currencyCode": "CHF",
                    "Currency": "Krone",
                    "Symbol": "CHF"
                },
                {
                    "country": "Syria",
                    "code": "SY",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "sy",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "SYP",
                    "Currency": "Franken",
                    "Symbol": "S£"
                },
                {
                    "country": "Taiwan",
                    "code": "TW",
                    "language": "Chinese",
                    "default": "Chinese",
                    "languageCode": "tw",
                    "defaultLanguageCode": "cn",
                    "currencyCode": "TWD",
                    "Currency": "Pfund",
                    "Symbol": "NT$"
                },
                {
                    "country": "Tajikistan",
                    "code": "TJ",
                    "language": "Russian",
                    "default": "Russian",
                    "languageCode": "tj",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "TJS",
                    "Currency": "Dollar",
                    "Symbol": "TJS"
                },
                {
                    "country": "Tanzania",
                    "code": "TZ",
                    "language": "Swahili",
                    "default": "English",
                    "languageCode": "tz",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "TZS",
                    "Currency": "Somoni",
                    "Symbol": "TSh"
                },
                {
                    "country": "Thailand",
                    "code": "TH",
                    "language": "Thai",
                    "default": "English",
                    "languageCode": "th",
                    "defaultLanguageCode": "th",
                    "currencyCode": "THB",
                    "Currency": "Schilling",
                    "Symbol": "฿"
                },
                {
                    "country": "Timor-Leste",
                    "code": "TL",
                    "language": "Portuguese",
                    "default": "Portuguese",
                    "languageCode": "tl",
                    "defaultLanguageCode": "pt",
                    "currencyCode": "USD",
                    "Currency": "Baht",
                    "Symbol": "US$"
                },
                {
                    "country": "Togo",
                    "code": "TG",
                    "language": "French",
                    "default": "French",
                    "languageCode": "tg",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XOF",
                    "Currency": "Dollar",
                    "Symbol": "franc"
                },
                {
                    "country": "Tokelau",
                    "code": "TK",
                    "language": "English",
                    "default": "English",
                    "languageCode": "tk",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "NZD",
                    "Currency": "Franc",
                    "Symbol": "NZ$"
                },
                {
                    "country": "Tonga",
                    "code": "TO",
                    "language": "English",
                    "default": "English",
                    "languageCode": "to",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "TOP",
                    "Currency": "Dollar",
                    "Symbol": "PT$"
                },
                {
                    "country": "Trinidad and Tobago",
                    "code": "TT",
                    "language": "English",
                    "default": "English",
                    "languageCode": "tt",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "TTD",
                    "Currency": "Pa'anga",
                    "Symbol": "TT$"
                },
                {
                    "country": "Tunisia",
                    "code": "TN",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "tn",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "TND",
                    "Currency": "Dollar",
                    "Symbol": "د.ت"
                },
                {
                    "country": "Turkey",
                    "code": "TR",
                    "language": "Turkish",
                    "default": "English",
                    "languageCode": "tr",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "TRY",
                    "Currency": "Dinar",
                    "Symbol": "YTL"
                },
                {
                    "country": "Turkmenistan",
                    "code": "TM",
                    "language": "Russian",
                    "default": "Russian",
                    "languageCode": "tm",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "TMT",
                    "Currency": "Lira",
                    "Symbol": "m"
                },
                {
                    "country": "Uganda",
                    "code": "UG",
                    "language": "Swahili",
                    "default": "English",
                    "languageCode": "ug",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "UGX",
                    "Currency": "Manat",
                    "Symbol": "USh"
                },
                {
                    "country": "Ukraine",
                    "code": "UA",
                    "language": "Ukrainian",
                    "default": "Russian",
                    "languageCode": "ua",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "UAH",
                    "Currency": "Schilling",
                    "Symbol": "₴"
                },
                {
                    "country": "United Arab Emirates",
                    "code": "AE",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "ae",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "AED",
                    "Currency": "Hrywnja",
                    "Symbol": "د.إ"
                },
                {
                    "country": "United Kingdom",
                    "code": "GB",
                    "language": "English",
                    "default": "English",
                    "languageCode": "gb",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "GBP",
                    "Currency": "Dirham",
                    "Symbol": "UK£"
                },
                {
                    "country": "United States",
                    "code": "US",
                    "language": "English",
                    "default": "English",
                    "languageCode": "us",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Pfund",
                    "Symbol": "US$"
                },
                {
                    "country": "Uruguay",
                    "code": "UY",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "uy",
                    "defaultLanguageCode": "es",
                    "currencyCode": "UYU",
                    "Currency": "Dollar",
                    "Symbol": "UR$"
                },
                {
                    "country": "Uzbekistan",
                    "code": "UZ",
                    "language": "Russian",
                    "default": "Russian",
                    "languageCode": "uz",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "UZS",
                    "Currency": "Peso",
                    "Symbol": "UZS"
                },
                {
                    "country": "Vanuatu",
                    "code": "VU",
                    "language": "English",
                    "default": "English",
                    "languageCode": "vu",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "VUV",
                    "Currency": "So'm",
                    "Symbol": "Vt"
                },
                {
                    "country": "Venezuela",
                    "code": "VE",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "ve",
                    "defaultLanguageCode": "es",
                    "currencyCode": "VEF",
                    "Currency": "Vatu",
                    "Symbol": "Bs"
                },
                {
                    "country": "Vietnam",
                    "code": "VN",
                    "language": "Vietnamese",
                    "default": "English",
                    "languageCode": "vn",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "VND",
                    "Currency": "BolÃ­var Fuerte",
                    "Symbol": "₫"
                },
                {
                    "country": "Virgin Islands",
                    "code": "VI",
                    "language": "English",
                    "default": "English",
                    "languageCode": "vi",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Dong",
                    "Symbol": "US$"
                },
                {
                    "country": "Yemen",
                    "code": "YE",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "ye",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "YER",
                    "Currency": "Dollar",
                    "Symbol": "YER"
                },
                {
                    "country": "Zambia",
                    "code": "ZM",
                    "language": "English",
                    "default": "English",
                    "languageCode": "zm",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "ZMK",
                    "Currency": "Rial",
                    "Symbol": "ZK"
                },
                {
                    "country": "Zimbabwe",
                    "code": "ZW",
                    "language": "English",
                    "default": "English",
                    "languageCode": "zw",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "ZWL",
                    "Currency": "Kwacha",
                    "Symbol": "Z$"
                }
            ];

            return {
                get: function (country) {
                    console.log(country);
                    var current = countryList.filter(function (obj) {
                        return obj.countryList == country;
                    });
                    return current;
                },
                getCountryByName: function (c) {
                    var current = countryList.filter(function (obj) {
                        return obj.country == c;
                    });
                    return current[0];

                },
                getLanguageFromCountryName: function (country) {
                    var current = countryList.filter(function (obj) {
                        return obj.country == country;
                    });
                    if (!current.length) {
                        return 'gb';
                    } else {
                        var lngDef = $rootScope.languages.filter(function (obj) {
                            return obj.shortname == current[0].defaultLanguageCode;
                        });
                        if (lngDef.length) {
                            return current[0].defaultLanguageCode;
                        } else {
                            return "gb";
                        }
                    }
                },
                getCurrencyByCountryName: function (country) {
                    var current = countryList.filter(function (obj) {
                        return obj.country == country;
                    });
                    console.log(' CCCC : ', country, current);
                    if (current.length) {
                        return current[0].currencyCode
                    } else {
                        return "THB";
                    }
                },
                getLanguageFromCountry: function (lng) {
                    console.log(lng);
                    if (lng == 'uk') {
                        return "USD"
                    } else {
                        var current = countryList.filter(function (obj) {
                            return obj.languageCode == lng;
                        });
                        var lngDef = $rootScope.currencies.filter(function (obj) {
                            return obj.currency == current[0].currencyCode;
                        });
                        if (lngDef.length) {
                            return current[0].currencyCode;
                        } else {
                            return "USD";
                        }
                    }
                    return current;
                },
                getCountries: function () {
                    var list = [];
                    for (var i = 0; i < countryList.length; i++) {
                        list.push(countryList[i].country);
                    }
                    return list;
                }
            };
        }]);
})();
