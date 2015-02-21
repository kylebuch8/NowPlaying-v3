(function () {
    'use strict';

    /*global angular*/
    angular.module('directives.embedVideo', [])
        .directive('embedVideo', [function () {
            return {
                restrict: 'AE',
                scope: {
                    youtubeId: '='
                },
                template: '<iframe ng-src="{{url}}" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>',
                controller: ['$scope', '$sce', function ($scope, $sce) {
                    $scope.url = $sce.trustAsResourceUrl('//www.youtube.com/embed/' + $scope.youtubeId + '?showinfo=0');
                }]
            };
        }]);
}());
