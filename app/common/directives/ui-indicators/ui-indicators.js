(function () {
    'use strict';

    /*global angular*/
    var circles = [];

    function UiPageIndicators() {
        var self = this;

        this.active = 0;
        this.numIndicators = 0;

        document.body.addEventListener('pagechange', function (event) {
            self.activate(event.detail);
        });

        this.setNumIndicators = function (number) {
            this.numIndicators = number;
        };

        this.getNumIndicators = function () {
            return this.numIndicators;
        };

        this.activate = function (number) {
            circles[this.active].removeClass('active-page');
            this.active = number;
            circles[this.active].addClass('active-page');

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
                        newCircleEl;

                    for (i; i < length; i += 1) {
                        newCircleEl = angular.element(circleEl);

                        if (i === active) {
                            newCircleEl.addClass('active-page');
                        }

                        element.append(newCircleEl);
                        circles.push(newCircleEl);
                    }

                    // scope.uiPageIndicators.setNumIndicators(circles.length);
                    // scope.active = active;
                    //
                    // scope.$watch('uiPageIndicators.active-page', function (newValue) {
                    //     if (newValue  || newValue === 0) {
                    //         if (newValue === scope.active) {
                    //             return;
                    //         }
                    //
                    //         circles[scope.active].removeClass('active-page');
                    //         scope.active = newValue;
                    //         circles[scope.active].addClass('active-page');
                    //     }
                    // });
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
