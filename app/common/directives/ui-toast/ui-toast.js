(function () {
    'use strict';

    /*global angular*/
    function UiToast($rootScope, $compile, $timeout, $q) {
        var scope = $rootScope.$new(),
            element,
            TOAST_CLOSE_DELAY = 3000;

        scope.dismiss = angular.bind(this, function () {
            this.dismiss();
        });

        this.show = function (options) {
            var self = this,
                resultDeferred = $q.defer();

            self.result = resultDeferred.promise;
            self.dismiss = function () {
                document.body.removeChild(element)
                resultDeferred.resolve();
            };

            scope.text = options.text;

            var compiledElement = $compile('<ui-toast>{{text}} <a ng-href="" ng-click="dismiss()">REFRESH</a></ui-toast>')(scope);
            element = document.body.appendChild(compiledElement[0]);

            if (options.delay && options.delay !== 0) {
                $timeout(function () {
                    self.dismiss(element);
                }, TOAST_CLOSE_DELAY);
            }

            return this;
        };
    }

    function UiToastDirective() {
        return {
            restrict: 'E'
        };
    }

    function UiToastProvider($rootScope, $compile, $timeout, $q) {
        this.$get = function($rootScope, $compile, $timeout, $q) {
            return new UiToast($rootScope, $compile, $timeout, $q);
        };
    }

    angular.module('directives.uiToast', [])
        .directive('uiToast', [UiToastDirective])
        .provider('$uiToast', [UiToastProvider]);
}());
