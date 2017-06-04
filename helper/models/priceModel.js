// Global Price Model
// This model is the structure containing the correct price data for all properties
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var priceSchema = new Schema({
    _id:                String,     // Property ID
    priceNight:         Number,     // The price pr night is priceTotal divided by nights 
    nights:             Number,     // The correct calculated amount of nights from checkin to checkout
    hotdealPct:         Number,     // If this property is in a hotdeal, we want to show the Pct on the site 
    hotdealTxt:         String,		// If this property is in a hotdeal, we want to show the Text on the site 
    priceWeekend:       Number,     // The standard price for friday night or saturday night
    priceWeek1:         Number,     // The standard price for weekday night (sun-mon-tue-wed-thu)
    priceWeek2:         Number,     // The standard price pr night (mon-sun) if more than 7 nights (more than 1 week)
    priceWeek3:         Number,     // The standard price pr night (mon-sun) if more than 14 nights (more than 2 weeks)
    priceMonth1:        Number,     // The standard price pr night (mon-sun) if more than 21 nights (more than 3 weeks)
    priceMonth2:        Number,     // The standard price pr night (mon-sun) if more than 30 nights (more than 1 month)
    priceMonth3:        Number,     // The standard price pr night (mon-sun) if more than 60 nights (more than 2 months)
    priceMonth6:        Number,     // The standard price pr night (mon-sun) if more than 180 nights (more than 6 months)
    priceYear:          Number,     // The standard price pr night (mon-sun) if more than 360 nights (1 year or more)
    commissionDay:      Number,     // Agent commission in percentage for daily rental 1-6 nights
    commissionWeek:     Number,     // Agent commission in percentage for weekly rental 7-30 nights
    commissionMonth:    Number,     // Agent commission in percentage for monthly rental 31-180 nights
    depositDay:         Number,     // Safety Deposit for daily rental 1-6 nights
    depositWeek:        Number,     // Safety Deposit for weekly rental 7-30 nights
    reservationWeek:    Number,     // Reservation fee for daily/weekly rental 1-30 nights (reservation is paid as part of total price)
    reservationMonth:   Number,     // Reservation fee for monthly rental 31-179 nights (reservation is paid as part of total price)
    updated:            Number,     // When was this record updated
    userId:             String      // Who updated this record 
});

module.exports = mongoose.model('priceModel', priceSchema,'price');

