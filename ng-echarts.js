'use strict';

angular.module('ngEcharts', [])
.directive('chart', ['$window', '$http', function ($window, $http) {
    return {
        restrict: 'A',
        scope: {
            option: '=option'
        },
        require: '?ngModule',
        link: function ($scope, element, attr, ctrl) {
            var chart;
            var chartWrapper = element[0];
            // 事件只注册一次
            var events = {};
            var getSizes = function () {
                var chartParent = element.parent()[0];
                var parentWidth = chartParent.clientWidth;
                var parentHeight = chartParent.clientHeight;
                var width = attr.width || parentWidth || 320;
                var height = attr.height || parentHeight || 320;
                chartWrapper.style.width = width + 'px';
                chartWrapper.style.height = height + 'px';
            };
            var getOption = function (value) {
                var option = angular.extend({}, value);
                return option;
            };
            var setOption = function (value) {
                if (!value) {
                    return;
                }
                getSizes();
                var option = getOption(value);
                if (!chart) {
                    chart = echarts.init(chartWrapper, option.theme ? option.theme : {});
                }
                if (option.event) {
                    if (!Array.isArray(option.event)) {
                        option.event = [option.event];
                    }
                    $.each(option.event, function (index, event) {
                        if (!events[event]) {
                            events[event] = true;
                            chart.on(event.type, function (param) {
                                event.fn(param);
                            });
                        }
                    });
                }
                if (option.series.length) {
                    chart.setOption(option);
                    chart.resize();
                    chart.hideLoading();
                } else {
                    chart.showLoading({
                        text: option.errorMsg || '\u6CA1\u6709\u6570\u636E',
                        textStyle: {
                            color: 'red',
                            fontSize: 36,
                            fontWeight: 900,
                            fontFamily: 'Microsoft Yahei, Arial'
                        }
                    });
                }
            };
            var isEmptyObject = function (obj) {
                for (var i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        return false;
                    }
                }
                return true;
            };
            $scope.$watch('option', function (value) {
                if (value.theme && isEmptyObject(value.theme)) {
                    return;
                }
                setOption(value);
            }, true);
            // 当浏览器窗口大小发生变化时，重新刷新组件
            angular.element($window).bind('resize', function () {
                setOption($scope.option);
            });
        }
    };
}]);
