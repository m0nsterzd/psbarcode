angular.module('starter.controllers', [])

.controller('ManualScanCtrl', function($scope, $http) {
    $scope.message = '';
    $scope.branch_name = '';
    if (typeof(Storage) != "undefined") {
        $scope.branch_name = localStorage.getItem("branch_name");
    } else {
        alert("Sorry, your browser does not support Web Storage...");
    }
    $scope.click = function(barcode) {
        $scope.ean_code = '';
        console.log(barcode);
        $http.get('http://' + localStorage.getItem("server_ip") + '/positiv/index.php/products/get_ean/' + barcode).
            // $http.get('http://localhost/positiv/index.php/products/get_ean/' + barcode).
        success(function(data, status, headers, config) {
            $scope.message = ' <div class = "list">' +
                '<div class = "item ng-binding">' +
                '<strong> Prodcode &nbsp; </strong>' + data.ST_Prodcode + '</div> <div class = "item ng-binding" >' +
                '<strong> Description &nbsp; </strong>' + data.ST_SDesc + '</div> < div class = "item ng-binding" >' +
                '<strong> UOM&nbsp; </strong>' + data.ST_Unit + '</div> < div class = "item ng-binding" >' +
                '<strong> List Price&nbsp; </strong>' + data.ST_List + '</div> < div class = "item ng-binding" >' +
                '<strong> Location&nbsp; </strong>' + data.ST_Bin + '</div> < div class = "item ng-binding" >' +
                '<strong> SOH &nbsp; </strong>' + data.ST_SOH + '</div> </div>';

        }).
        error(function(data, status, headers, config) {
            // log error
        });
    }

    $scope.clear = function() {
        $scope.message = '';
        $scope.ean_code = null;
    }
})

.controller('ScanCtrl', function($scope, appServices, $http) {
    $scope.message = '';
    $scope.branch_name = '';
    if (typeof(Storage) != "undefined") {
        $scope.branch_name = localStorage.getItem("branch_name");
    } else {
        alert("Sorry, your browser does not support Web Storage...");
    }
    $scope.click = function() {
        var promise = appServices.scanBarcode();
        promise.then(
            function(result) {
                if (result.error == false) {
                    var d = new Date();
                    console.log(result);
                    $scope.message = ' <div class = "list">' +
                        '<div class = "item ng-binding">' +
                        '<strong> Prodcode &nbsp; </strong>' + result.result.ST_Prodcode + '</div> <div class = "item ng-binding" >' +
                        '<strong> Description &nbsp; </strong>' + result.result.ST_SDesc + '</div> < div class = "item ng-binding" >' +
                        '<strong> UOM&nbsp; </strong>' + result.result.ST_Unit + '</div> < div class = "item ng-binding" >' +
                        '<strong> List Price&nbsp; </strong>' + result.result.ST_List + '</div> < div class = "item ng-binding" >' +
                        '<strong> Location&nbsp; </strong>' + result.result.ST_Bin + '</div> < div class = "item ng-binding" >' +
                        '<strong> SOH &nbsp; </strong>' + result.result.ST_SOH + '</div> </div>'
                } else {
                    $scope.message = '<b>ERROR</b>: ' + result;
                }
            },
            function(result) {
                $scope.message = '' + result.error;
            },
            function(result) {
                $scope.message = '' + result.error;
            });
    }

    $scope.clear = function() {
        $scope.message = '';
    }
})

.controller('AboutCtrl', function($scope) {
    // if (typeof(Storage) != "undefined") {
    //     // localStorage.setItem("firstname", "Nic");// localStorage.setItem("lastname", "Raboy");

    //     alert(localStorage.getItem("firstname") + " " + localStorage.getItem("lastname"));
    // } else {
    //     alert("Sorry, your browser does not support Web Storage...");
    // }

})

.controller('BranchesCtrl', function($scope, todoDb, $rootScope, $location) {
    $scope.branches = [];
    $scope.online = false;
    $scope.syncstatus = "Offline";

    $scope.toggleOnline = function() {
        $scope.online = !$scope.online;
        if ($scope.online) { // Read http://pouchdb.com/api.html#sync
            $scope.syncstatus = "Online";
            var filter = function(doc, req) {
                if (doc.type && doc.type == 'branch') {
                    return true;
                } else {
                    return false;
                }
            }
            $scope.sync = todoDb.replicate.from('http://192.168.1.131:5984/psmobile')
                .on('complete', function(info) {
                    alert('Replication complete');
                    get_branches();
                })
                .on('error', function(err) {
                    console.log("Syncing stopped");

                    $scope.$apply(function() {
                        $scope.syncstatus = err.statusText;
                    });
                    console.log(err);
                });
        } else {
            $scope.sync.cancel();
            $scope.syncstatus = "Offline";
        }
    };
    var get_branches = function() {
        function map(doc) {
            emit(null, doc);
        }
        todoDb.query({
            map: map
        }, {
            reduce: false
        }, function(err, response) {
            console.log(response);
            angular.forEach(response.rows, function(value, key) {
                console.log(value);
                $scope.branches.push(value.value);
            })
            $scope.$apply(function() {
                $scope.branches = $scope.branches;
            });

        })
    }

    get_branches();



    $scope.branchSelect = function(branch) {
        if (typeof(Storage) != "undefined") {
            localStorage.setItem("server_ip", branch.server_ip);
            localStorage.setItem("branch_name", branch.branch_name);
            // localStorage.setItem("lastname", "Raboy");

            alert('Server set as ' + branch.branch_name + ' ' + localStorage.getItem("server_ip"));
        } else {
            alert("Sorry, your browser does not support Web Storage...");
        }
    }

})

.directive('selectOnClick', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.on('click', function() {
                this.select();
            });
        }
    };
});
