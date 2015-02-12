(function () {
    'use strict';

    /*global angular*/
    function UiPageIndicators() {
        this.active = 0;
        this.numIndicators = 0;

        this.setNumIndicators = function (number) {
            this.numIndicators = number;
        };

        this.getNumIndicators = function () {
            return this.numIndicators;
        };

        this.activate = function (number) {
            this.active = number;
            return number;
        };
    }

    angular.module('directives.uiPageIndicators', [])
        .directive('uiPageIndicators', [function () {
            return {
                restrict: 'AE',
                scope: {
                    uiPageIndicators: '=provider'
                },
                link: function (scope, element, attr) {
                    var i = 0,
                        length = attr.number,
                        active = parseInt(attr.active, 10),
                        circleEl = '<div class="circle"></div>',
                        circles = [],
                        newCircleEl;

                    for (i; i < length; i += 1) {
                        newCircleEl = angular.element(circleEl);

                        if (i === active) {
                            newCircleEl.addClass('active');
                        }

                        element.append(newCircleEl);
                        circles.push(newCircleEl);
                    }

                    scope.uiPageIndicators.setNumIndicators(circles.length);
                    scope.active = active;

                    scope.$watch('uiPageIndicators.active', function (newValue) {
                        if (newValue  || newValue === 0) {
                            if (newValue === scope.active) {
                                return;
                            }

                            circles[scope.active].removeClass('active');
                            scope.active = newValue;
                            circles[scope.active].addClass('active');
                        }
                    });
                }
            };
        }])

        .service('$uiPageIndicators', [function () {
            return {
                getInstance: function () {
                    return new UiPageIndicators();
                }
            };
        }]);
}());
