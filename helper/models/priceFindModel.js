// Global Price Model
// This model is the structure containing the correct price data for any property
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var priceFindSchema = new Schema({
    priceTotal:         Number,       // The correct calculated total price from checkin to checkout 
    priceNight:         Number,       // The price pr night is priceTotal divided by nights 
    nights:             Number,       // The correct calculated amount of nights from checkin to checkout
    priceWeekend:       Number,       // The standard price for friday night or saturday night
    priceWeek1:         Number,       // The standard price for weekday night (sun-mon-tue-wed-thu)
    priceWeek2:         Number,       // The standard price pr night (mon-sun) if more than 7 nights (more than 1 week)
    priceWeek3:         Number,       // The standard price pr night (mon-sun) if more than 14 nights (more than 2 weeks)
    priceMonth1:        Number,       // The standard price pr night (mon-sun) if more than 21 nights (more than 3 weeks)
    priceMonth2:        Number,       // The standard price pr night (mon-sun) if more than 30 nights (more than 1 month)
    priceMonth3:        Number,       // The standard price pr night (mon-sun) if more than 60 nights (more than 2 months)
    priceMonth6:        Number,       // The standard price pr night (mon-sun) if more than 180 nights (more than 6 months)
    priceYear:          Number,       // The standard price pr night (mon-sun) if more than 360 nights (1 year or more)
    commissionDay:      Number,       // Agent commission in percentage for daily rental 1-6 nights
    commissionWeek:     Number,       // Agent commission in percentage for weekly rental 7-30 nights
    commissionMonth:    Number,       // Agent commission in percentage for monthly rental 31-180 nights
    commissionHalf:     Number,       // Agent commission in percentage for half year rental 181-359 nights (half a month rent)
    commissionYear:     Number,       // Agent commission in percentage for full year rental 360+ nights (a month rent)
    depositDay:         Number,       // Safety Deposit for daily rental 1-6 nights
    depositWeek:        Number,       // Safety Deposit for weekly rental 7-30 nights
    depositMonth:       Number,       // Safety Deposit for monthly rental 31-359 nights (1 month rent)
    depositYear:        Number,       // Safety Deposit for year rental 360+ nights (2 months rent)  
    reservationWeek:    Number,       // Reservation fee for daily/weekly rental 1-30 nights (reservation is paid as part of total price)
    reservationMonth:   Number,       // Reservation fee for monthly rental 31-179 nights (reservation is paid as part of total price)
    reservationYear:    Number        // Reservation fee for year rental 180+ nights (reservation is paid as part of total price)
});

module.exports = mongoose.model('priceFindModel', priceFindSchema, 'price');

