(function () {
    'use strict';

    /*global angular*/
    angular.module('services.analytics', [])
        .factory('analytics', [function () {
            var gaPlugin,
                analytics = {};

            if (window.plugins && window.plugins.gaPlugin) {
                gaPlugin = window.plugins.gaPlugin;
            } else {
                gaPlugin = {
                    init: function () {},
                    trackPage: function () {},
                    trackEvent: function () {},
                    exit: function () {}
                };
            }

            function nativePluginResultHandler(result) {
                console.log('nativePluginResultHandler: ' + result);
            }

            function nativePluginErrorHandler(error) {
                console.log('nativePluginErrorHandler: ' + error);
            }

            gaPlugin.init(function () {}, function () {}, 'UA-60485034-2', 10);

            analytics.trackPage = function (page) {
                gaPlugin.trackPage(nativePluginResultHandler, nativePluginErrorHandler, page);
            };

            analytics.trackEvent = function (category, eventAction, eventLabel) {
                gaPlugin.trackEvent(nativePluginResultHandler, nativePluginErrorHandler, category, eventAction, eventLabel, 1);
            };

            analytics.exit = function () {
                gaPlugin.exit(nativePluginResultHandler, nativePluginErrorHandler);
            };

            return analytics;
        }]);
}());
