angular.module('starter.services', [])

.service('appServices', function appServices($q, $http) {
    // Wrap the barcode scanner in a service so that it can be shared easily.
    this.scanBarcode = function() {
        // The plugin operates asynchronously so a promise
        // must be used to display the results correctly.
        var deferred = $q.defer();
        try {
            cordova.plugins.barcodeScanner.scan(
                function(result) { // success
                    var barcode = parseInt(result.text);
                    $http.get('http://' + localStorage.getItem("server_ip") + '/positiv/index.php/products/get_ean/' + barcode).
                    success(function(data, status, headers, config) {
                        var record = data.rows[0].value;
                        deferred.resolve({
                            'error': false,
                            'result': data
                        });
                    }).
                    error(function(data, status, headers, config) {
                        // log error
                    });

                },
                function(error) { // failure
                    deferred.resolve({
                        'error': true,
                        'result': error.toString()
                    });
                }
            );
        } catch (exc) {
            deferred.resolve({
                'error': true,
                'result': 'exception: ' + exc.toString()
            });
        }
        return deferred.promise;
    };
});
