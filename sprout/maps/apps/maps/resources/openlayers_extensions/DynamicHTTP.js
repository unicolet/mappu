
Maps.DynamicHTTP = OpenLayers.Class(OpenLayers.Protocol.HTTP, {

    /**
     * Property: userCallback
     * {function} Required. The only function called when a response is read.
     */
    userCallback: null,
    
    /**
     * Property: userTarget
     * {function} Required. The scope for the callback.
     */
    userTarget: null,

    /**
     * Property: params
     * {Object} Parameters of GET requests. In this protocol it is read-write and can be changed at runtime
     */
    params: null,

    /**
     * Constructor: OpenLayers.Protocol.HTTP
     * A class for giving layers generic HTTP protocol.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     *
     * Valid options include:
     * url - {String}
     * headers - {Object}
     * params - {Object}
     * format - {<OpenLayers.Format>}
     * callback - {Function}
     * scope - {Object}
     */
    initialize: function(options) {
        options = options || {};
        this.params = {};
        this.headers = {};
        OpenLayers.Protocol.HTTP.prototype.initialize.apply(this, arguments);

        //
        // Override OpenLayers.Protocol.HTTP with our own, dynamic version
        //
        var format = new OpenLayers.Format.QueryStringFilter({
            wildcarded: this.wildcarded,
            srsInBBOX: this.srsInBBOX
        });
        this.filterToParams = function(filter, params) {
            // params are now recomputed with every request
            var f=format.write(filter, OpenLayers.Util.applyDefaults(this.params,params));
            return f;
        }
    },

    handleResponse: function(resp, options) {
        var request = resp.priv;
        if(options.callback) {
            if(request.status >= 200 && request.status < 300) {
                // success
                if(resp.requestType != "delete") {
                    resp.features = this.parseFeatures(request);
                }
                resp.code = OpenLayers.Protocol.Response.SUCCESS;
            } else {
                // failure
                resp.code = OpenLayers.Protocol.Response.FAILURE;
            }
            if(this.userCallback && this.userTarget)
                this.userCallback.apply(this.userTarget, [options.scope, resp]);
        }
    },

    CLASS_NAME: "Maps.DynamicHTTP"
});