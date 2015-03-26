(function () {
    'use strict';

    /*global angular*/
    angular.module('directives.uiImage', [])
        .directive('uiImage', [function () {
            return {
                restrict: 'AE',
                link: function (scope, element) {
                    element.addClass('hide');

                    element.bind('transitionend', function () {
                        element.removeClass('fade-in fade-in-start');
                    });

                    element.bind('load', function () {
                        element.removeClass('hide');
                        element.addClass('fade-in');

                        setTimeout(function () {
                            element.addClass('fade-in-start');
                        }, 0);
                    });
                }
            };
        }]);
}());
