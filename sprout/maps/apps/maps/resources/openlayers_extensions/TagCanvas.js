/*
 * 2011 - Modified by Umberto Nicoletti to allow simpler, faster feature Drawing.
 *
 * Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Renderer.js
 */

/**
 * Class: OpenLayers.Renderer.Canvas 
 * A renderer based on the 2D 'canvas' drawing element.
 * 
 * Inherits:
 *  - <OpenLayers.Renderer>
 */

Maps.TagCanvas = OpenLayers.Class(OpenLayers.Renderer, {
    
    /**
     * APIProperty: hitDetection
     * {Boolean} Allow for hit detection of features.  Default is true.
     */
    hitDetection: false,
    
    /**
     * Property: hitOverflow
     * {Number} The method for converting feature identifiers to color values
     *     supports 16777215 sequential values.  Two features cannot be 
     *     predictably detected if their identifiers differ by more than this
     *     value.  The hitOverflow allows for bigger numbers (but the 
     *     difference in values is still limited).
     */
    hitOverflow: 0,

    /**
     * Property: canvas
     * {Canvas} The canvas context object.
     */
    canvas: null, 
    
    /**
     * Property: features
     * {Object} Internal object of feature/style pairs for use in redrawing the layer.
     */
    features: null,
    
    /**
     * Property: pendingRedraw
     * {Boolean} The renderer needs a redraw call to render features added while
     *     the renderer was locked.
     */
    pendingRedraw: false,

    angles : [0, Math.PI*(30/180), Math.PI * (60/180), Math.PI * (90/180)],

    anchors: [
        [5,5,15,5,15,-5,5,-5],
        [],
        [],
        []
    ],

    tagMapper: {},

    
    /**
     * Constructor: OpenLayers.Renderer.TagCanvas
     *
     * Parameters:
     * containerID - {<String>}
     * options - {Object} Optional properties to be set on the renderer.
     */
    initialize: function(containerID, options) {
        OpenLayers.Renderer.prototype.initialize.apply(this, arguments);
        this.root = document.createElement("canvas");
        this.container.appendChild(this.root);
        this.canvas = this.root.getContext("2d");
        this.features = {};
        if (this.hitDetection) {
            this.hitCanvas = document.createElement("canvas");
            this.hitContext = this.hitCanvas.getContext("2d");
        }
        for (var i=1; i<4; i++) {
            for(var j=0, l=this.anchors[0].length; j<l; j=j+2) {
                var x=this.anchors[0][j];
                var y=this.anchors[0][j+1];

                var newx=( 0.5 + ( x*Math.cos(this.angles[i])+y*Math.sin(this.angles[i]) ) | 0 );
                var newy=( 0.5 + ( y*Math.cos(this.angles[i])-x*Math.sin(this.angles[i]) ) | 0 );

                this.anchors[i].push(newx);
                this.anchors[i].push(newy);
            }
        }
    },

    /**
     * Method: eraseGeometry
     * Erase a geometry from the renderer. Because the Canvas renderer has
     *     'memory' of the features that it has drawn, we have to remove the
     *     feature so it doesn't redraw.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>}
     * featureId - {String}
     */
    eraseGeometry: function(geometry, featureId) {
        this.eraseFeatures(this.features[featureId][0]);
    },

    /**
     * APIMethod: supported
     * 
     * Returns:
     * {Boolean} Whether or not the browser supports the renderer class
     */
    supported: function() {
        var canvas = document.createElement("canvas");
        return !!canvas.getContext;
    },    
    
    /**
     * Method: setSize
     * Sets the size of the drawing surface.
     *
     * Once the size is updated, redraw the canvas.
     *
     * Parameters:
     * size - {<OpenLayers.Size>} 
     */
    setSize: function(size) {
        this.size = size.clone();
        var root = this.root;
        root.style.width = size.w + "px";
        root.style.height = size.h + "px";
        root.width = size.w;
        root.height = size.h;
        this.resolution = null;
        if (this.hitDetection) {
            var hitCanvas = this.hitCanvas;
            hitCanvas.style.width = size.w + "px";
            hitCanvas.style.height = size.h + "px";
            hitCanvas.width = size.w;
            hitCanvas.height = size.h;
        }
    },
    
    /**
     * Method: drawFeature
     * Draw the feature. Stores the feature in the features list,
     * then redraws the layer. 
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} 
     * style - {<Object>} 
     *
     * Returns:
     * {Boolean} The feature has been drawn completely.  If the feature has no
     *     geometry, undefined will be returned.  If the feature is not rendered
     *     for other reasons, false will be returned.
     */
    drawFeature: function(feature, style) {
        var rendered;
        if (feature.x && feature.y) {

            // don't render if display none or feature outside extent
            //var bounds = feature.geometry.getBounds();
            //rendered = (style.display !== "none") && !!bounds && bounds.intersectsBounds(this.extent);
            //rendered =  !!bounds && bounds.intersectsBounds(this.extent);
            rendered = this.extent.contains(feature.x, feature.y);
            if (rendered) {
                // keep track of what we have rendered for redraw
                this.features[feature.id] = feature;
            }
            else {
                // remove from features tracked for redraw
                delete(this.features[feature.id]);
            }
            this.pendingRedraw = true;
        }
        if (this.pendingRedraw && !this.locked) {
            this.redraw();
            this.pendingRedraw = false;
        }
        return rendered;
    },

    /** 
     * Method: drawGeometry
     * Used when looping (in redraw) over the features; draws
     * the canvas. 
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>} 
     * style - {Object} 
     */
    drawGeometry: function(geometry, style, featureId) {
        this.drawPoint(geometry, style, featureId);
    },

    /**
     * Method: setCanvasStyle
     * Prepare the canvas for drawing by setting various global settings.
     *
     * Parameters:
     * type - {String} one of 'stroke', 'fill', or 'reset'
     * style - {Object} Symbolizer hash
     */
    setCanvasStyle: function(type, style) {
        if (type === "fill") {     
            this.canvas.globalAlpha = style['fillOpacity'];
            this.canvas.fillStyle = style['fillColor'];
        } else if (type === "stroke") {  
            this.canvas.globalAlpha = style['strokeOpacity'];
            this.canvas.strokeStyle = style['strokeColor'];
            this.canvas.lineWidth = style['strokeWidth'];
        } else {
            this.canvas.globalAlpha = 0;
            this.canvas.lineWidth = 1;
        }
    },
    
    /**
     * Method: featureIdToHex
     * Convert a feature ID string into an RGB hex string.
     *
     * Parameters:
     * featureId - {String} Feature id
     *
     * Returns:
     * {String} RGB hex string.
     */
    featureIdToHex: function(featureId) {
        var id = Number(featureId.split("_").pop()) + 1; // zero for no feature
        if (id >= 16777216) {
            this.hitOverflow = id - 16777215;
            id = id % 16777216 + 1;
        }
        var hex = "000000" + id.toString(16);
        var len = hex.length;
        hex = "#" + hex.substring(len-6, len);
        return hex;
    },
    
    /**
     * Method: setHitContextStyle
     * Prepare the hit canvas for drawing by setting various global settings.
     *
     * Parameters:
     * type - {String} one of 'stroke', 'fill', or 'reset'
     * featureId - {String} The feature id.
     * symbolizer - {<OpenLayers.Symbolizer>} The symbolizer.
     */
    setHitContextStyle: function(type, featureId, symbolizer) {
        var hex = this.featureIdToHex(featureId);
        if (type == "fill") {
            this.hitContext.globalAlpha = 1.0;
            this.hitContext.fillStyle = hex;
        } else if (type == "stroke") {  
            this.hitContext.globalAlpha = 1.0;
            this.hitContext.strokeStyle = hex;
            // bump up stroke width to deal with antialiasing
            this.hitContext.lineWidth = symbolizer.strokeWidth + 2;
        } else {
            this.hitContext.globalAlpha = 0;
            this.hitContext.lineWidth = 1;
        }
    },

    /**
     * Method: drawPoint
     * Draw an arrow label.
     * 
     * Parameters: 
     * geometry - {<OpenLayers.Geometry>}
     * style    - {Object}
     * featureId - {String}
     */ 
    drawPoint: function(geometry, style, featureId) {
        var pt = this.getLocalXY(geometry);
        //
        // avoid expensive floating poit sub-pixel rendering
        // http://www.html5rocks.com/en/tutorials/canvas/performance/#toc-avoid-float
        //
        var p0 = (0.5 + pt[0]) | 0;
        var p1 = (0.5 + pt[1]) | 0;
        if (!(!isNaN(p0) && !isNaN(p1))) {
        } else {
            // Visit http://colorbrewer2.org/ for more schemes
            // Permalink for this one: http://colorbrewer2.org/index.php?type=sequential&scheme=YlGnBu&n=4
            var fills = ['#ffffcc', '#a1dab4', '#41b6c4', '#225ea8'];
            var strokes = ['#3F6C3F', '#3F6C3F', '#3F6C3F', '#3F6C3F'];

            // behave when older APIs do not return a tag attribute
            var featureTags = null;
            for (var key in this.tagMapper) {
                if(this.tagMapper.hasOwnProperty(key)) {
                    featureTags = [key];
                    break;
                }
            }
            if (geometry.tags) {
                featureTags = geometry.tags.split(',').sort();
            }
            for (var i = 0, l = featureTags.length; i < l; i++) {
                var tag = featureTags[i].trim();
                if (this.tagMapper[tag] != undefined) {
                    var idx = this.tagMapper[tag];
                    // Set the style properties.
                    this.canvas.fillStyle = fills[idx];
                    this.canvas.strokeStyle = strokes[idx];
                    this.canvas.lineWidth = 1;

                    this.canvas.beginPath();
                    this.canvas.moveTo(p0, p1); // give the (x,y) coordinates
                    for (var j = 0, len = this.anchors[idx].length; j < len; j = j + 2) {
                        this.canvas.lineTo(p0 + this.anchors[idx][j], p1 + this.anchors[idx][j + 1]);
                    }
                    this.canvas.lineTo(p0, p1);

                    // Done! Now fill the shape, and draw the stroke.
                    // Note: your shape will not be visible until you call any of the two methods.
                    this.canvas.fill();
                    this.canvas.stroke();
                    this.canvas.closePath();
                }
            }
        }
    },
    
    /**
     * Method: getLocalXY
     * transform geographic xy into pixel xy
     *
     * Parameters: 
     * point - {<OpenLayers.Geometry.Point>}
     */
    getLocalXY: function(point) {
        var resolution = this.getResolution();
        var extent = this.extent;
        var x = (point.x / resolution + (-extent.left / resolution));
        var y = ((extent.top / resolution) - point.y / resolution);
        return [x, y];
    },

    /**
     * Method: clear
     * Clear all vectors from the renderer.
     */    
    clear: function() {
        var height = this.root.height;
        var width = this.root.width;
        this.canvas.clearRect(0, 0, width, height);
        this.features = {};
        if (this.hitDetection) {
            this.hitContext.clearRect(0, 0, width, height);
        }
    },

    /**
     * Method: getFeatureIdFromEvent
     * Returns a feature id from an event on the renderer.  
     * 
     * Parameters:
     * evt - {<OpenLayers.Event>} 
     *
     * Returns:
     * {<OpenLayers.Feature.Vector} A feature or null.  This method returns a 
     *     feature instead of a feature id to avoid an unnecessary lookup on the
     *     layer.
     */
    getFeatureIdFromEvent: function(evt) {
        var feature = null;
        if (this.hitDetection) {
            // this dragging check should go in the feature handler
            if (!this.map.dragging) {
                var xy = evt.xy;
                var x = xy.x | 0;
                var y = xy.y | 0;
                var data = this.hitContext.getImageData(x, y, 1, 1).data;
                if (data[3] === 255) { // antialiased
                    var id = data[2] + (256 * (data[1] + (256 * data[0])));
                    if (id) {
                        feature = this.features["OpenLayers.Feature.Vector_" + (id - 1 + this.hitOverflow)][0];
                    }
                }
            }
        }
        return feature;
    },
    
    /**
     * Method: eraseFeatures 
     * This is called by the layer to erase features; removes the feature from
     *     the list, then redraws the layer.
     * 
     * Parameters:
     * features - {Array(<OpenLayers.Feature.Vector>)} 
     */
    eraseFeatures: function(features) {
        if(!(OpenLayers.Util.isArray(features))) {
            features = [features];
        }
        for(var i=0; i<features.length; ++i) {
            delete this.features[features[i].id];
        }
        this.redraw();
    },

    /**
     * Method: redraw
     * The real 'meat' of the function: any time things have changed,
     *     redraw() can be called to loop over all the data and (you guessed
     *     it) redraw it.  Unlike Elements-based Renderers, we can't interact
     *     with things once they're drawn, to remove them, for example, so
     *     instead we have to just clear everything and draw from scratch.
     */
    redraw: function() {
        if (!this.locked) {
            var height = this.root.height;
            var width = this.root.width;
            this.canvas.clearRect(0, 0, width, height);
            //if (this.hitDetection) {
            //    this.hitContext.clearRect(0, 0, width, height);
            //}
            //var labelMap = [];
            var feature;
            for (var id in this.features) {
                //if (!this.features.hasOwnProperty(id)) { continue; }
                feature = this.features[id];
                //style = this.features[id][1];
                this.drawGeometry(feature, null, feature.id);
                //if(style.label) {
                //    labelMap.push([feature, style]);
                //}
            }
            //var item;
            //for (var i=0, len=labelMap.length; i<len; ++i) {
            //    item = labelMap[i];
            //    this.drawText(item[0].geometry.getCentroid(), item[1]);
            //}
        }    
    },

    CLASS_NAME: "Maps.TagCanvas"
});

/**
 * Constant: OpenLayers.Renderer.Canvas.LABEL_ALIGN
 * {Object}
 */
Maps.TagCanvas.LABEL_ALIGN = {
    "l": "left",
    "r": "right",
    "t": "top",
    "b": "bottom"
};

/**
 * Constant: OpenLayers.Renderer.Canvas.LABEL_FACTOR
 * {Object}
 */
Maps.TagCanvas.LABEL_FACTOR = {
    "l": 0,
    "r": -1,
    "t": 0,
    "b": -1
};

/**
 * Constant: OpenLayers.Renderer.Canvas.drawImageScaleFactor
 * {Number} Scale factor to apply to the canvas drawImage arguments. This
 *     is always 1 except for Android 2.1 devices, to work around
 *     http://code.google.com/p/android/issues/detail?id=5141.
 */
Maps.TagCanvas.drawImageScaleFactor = null;
