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
                template: '<div ng-if="loadingTrailer" class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div><div id="player"></div>',
                controller: ['$scope', '$sce', function ($scope, $sce) {
                    var tag,
                        firstTagScript,
                        player;

                    $scope.loadingTrailer = true;

                    if (!window.YT) {
                        tag = document.createElement('script');
                        tag.src = 'https://www.youtube.com/iframe_api';

                        firstTagScript = document.getElementsByTagName('script')[0];
                        firstTagScript.parentNode.insertBefore(tag, firstTagScript);
                    } else {
                        setupPlayer();
                    }

                    function setupPlayer() {
                        player = new YT.Player('player', {
                            height: '390',
                            width: '640',
                            videoId: $scope.youtubeId,
                            events: {
                                'onReady': onPlayerReady
                            }
                        });
                    }

                    function onPlayerReady(event) {
                        $scope.loadingTrailer = false;
                        $scope.$apply();
                    }

                    window.onYouTubeIframeAPIReady = setupPlayer;

                    $scope.url = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + $scope.youtubeId + '?showinfo=0');
                }]
            };
        }]);
}());
