/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

// sc_resource('appconfig.js'); // publish into inline format

var WMSCONFIG = {
    use_cache: true,
    server_path : "/geoserver/wms",
    wfs_server_path : "/geoserver/wfs",
    server_cache_path : "/geoserver/gwc/service/wms",
    wms_options: {tiled:'yes'},

//    server_path : "/cgi-bin/wms",
//    wfs_server_path : "/cgi-bin/wms",
//    server_cache_path : "/cgi-bin/wms",
    default_srs: "EPSG:3003",
    // enable use of regexps in link matching
    extended_link_regex: true,
    // attempt to save memory and improve performance
    // might confuse the reordering of layers
    remove_wms_layers_when_not_used: false,
    // set to the desired initial zoom level or false to have the map calculate the
    // most appropriate one based on the map's extent
    default_zoom_level: false
};

var APPCONFIG = {
    title: "Sample",
    print: {
        chrome: "/chrome.html",
        firefox: "/firefox.html",
        other: "/other.html"
    },
    admin_user: "admin",
    advanced_options: "/mapsocial/",
    // disable tips globally
    showTips: true,
    enablePrinting: true,
    enableSessionSaving: true,
    /*
     Use this variable to customize the logo shown on the right-hand part of the login page.
     Recommended size: 400x100
     */
    custom_app_logo : static_url('images/app-logo-huge.png'),
    attribution: 'mailto:umberto.nicoletti@gmail.com'
};

var whiteTile=static_url('white.png');

/*
 Use this variable to customize the base layers used in the map.
 
 Each layer should have a name attribute (used in the radio button label) and a provider,args
 couple where the provider is the name of the OpenLayers layer subclass to use and args is the list of arguments
 to the constructor. PLease note at this stage the OpenLayers objects have not been loaded yet and therefore
 attempting to reference them will throw an error and break your Mappu app.
*/
var MAPPU_BASELAYERS=[
    {name:"Streets", provider: 'OpenLayers.Layer.Google', args:["Streets",{'sphericalMercator': true}]},
    {name:"Satellite", provider: 'OpenLayers.Layer.Google', args:["Satellite",{'type': "satellite",'sphericalMercator': true}]},
    {name:"_blank", provider: 'OpenLayers.Layer.OSM', args:["_blank", whiteTile]}
];
