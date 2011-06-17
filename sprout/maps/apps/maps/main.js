// ==========================================================================
// Project:   Maps
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Maps */

// This is the function that will start your app running.  The default
// implementation will load any fixtures you have created then instantiate
// your controllers and awake the elements on your page.
//
// As you develop your application you will probably want to override this.
// See comments for some pointers on what to do next.
//
Maps.main = function main() {

    Maps.getPath('mainPage.mainPane').append();

    var layers = Maps.store.find(Maps.LAYERS_QUERY);
    Maps.openLayersController.set('content', layers);

    var queries = Maps.featuresStore.find(Maps.LAYERQUERY_QUERY);
    Maps.layerQueryController.set('content', queries);

    Maps.makeFirstResponder(Maps.MAIN_RESPONDER);

};

function main() {
    Maps.main();
}
