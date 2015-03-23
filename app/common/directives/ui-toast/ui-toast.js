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
                resultDeferred = $q.defer()
                element;

            function transitionendHandler() {
                if (element) {
                    element[0].classList.remove('enter', 'enter-active');

                    if (element[0].classList.contains('leave')) {
                        element[0].removeEventListener(transitionendHandler);
                        element[0].parentNode.removeChild(element[0]);
                        resultDeferred.resolve();

                        element = null;
                    }
                }
            }

            self.result = resultDeferred.promise;
            self.dismiss = function () {
                element[0].classList.add('leave');
            };

            scope.text = options.text;

            element = angular.element('<ui-toast class="enter">{{text}}</ui-toast>');

            if (options.action) {
                scope.action = options.action;
                element.append('<a class="ui-toast-action" ng-href="" ng-click="dismiss()">{{action}}</a>');
            }

            var compiledElement = $compile(element)(scope);
            document.body.appendChild(compiledElement[0]);

            element[0].addEventListener('transitionend', transitionendHandler);

            setTimeout(function () {
                element[0].classList.add('enter-active');
            }, 0);

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
