(function () {
    'use strict';

    /*global angular*/
    angular.module('directives.uiNavButton', [])
        .directive('uiNavButton', [function () {
            return {
                restrict: 'AE',
                link: function (scope, element) {
                    element.on('touchstart', function (event) {
                        event.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    });

                    element.on('touchend touchcancel', function (event) {
                        event.currentTarget.style.backgroundColor = null;
                    });
                }
            };
        }]);
}());
