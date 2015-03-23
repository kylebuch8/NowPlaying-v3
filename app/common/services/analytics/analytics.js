(function () {
    'use strict';

    /*global angular*/
    angular.module('services.analytics', [])
        .factory('$analytics', [function () {
            var googleAnalytics,
                analytics = {};

            if (window.analytics) {
                googleAnalytics = window.analytics;
            } else {
                googleAnalytics = {
                    startTrackerWithId: function () {},
                    trackView: function () {},
                    trackEvent: function () {}
                };
            }

            googleAnalytics.startTrackerWithId('UA-60485034-2');

            analytics.trackPage = function (page) {
                googleAnalytics.trackView(page);
            };

            analytics.trackEvent = function (category, eventAction, eventLabel) {
                googleAnalytics.trackEvent(category, eventAction, eventLabel, 1);
            };

            return analytics;
        }]);
}());
