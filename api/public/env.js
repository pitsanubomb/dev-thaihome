angular.module('ENV', [])
    .constant('CONFIG', {
        API_URL:'http://localhost:3000/api',
        DEFAULT_CURRENCY:'THB',
        HELPER_URL:'http://localhost:3001',
        DEFAULT_LANGUAGE:'gb',
        DEFAULT_DATE_FORMAT:'MMM D, YYYY',
        SHORT_DATE_FORMAT:'DD MMM',
        DEFAULT_FULL_DATE_FORMAT:'MMM D, YYYY @ HH=mm=ss',
        HOME_IMAGE_TIMEOUT:'10000',
        BOOKING_DAYS_EXPIRE:'5'
    }
);