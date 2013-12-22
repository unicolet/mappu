var jsts=require('jsts');

exports.processJstsRequest=function(req,res) {
    switch(req.params.operation) {
        case "area": area(req,res); break;
        case "intersection": intersection(req,res); break;
        case "union": union(req,res); break;
        case "buffer": buffer(req,res,25); break;
        default:
            if(req.params.operation.substr(0,6)=="buffer") {
                buffer(req,res,parseInt(req.params.operation.substr(6))); break;
            } else {
                res.send(400,"Please specify a valid operation");
            }
    }
};

// LOCALS

var pm=new jsts.geom.PrecisionModel(jsts.geom.PrecisionModel.FLOATING_SINGLE);
var factory = new jsts.geom.GeometryFactory(pm);
var reader = new jsts.io.WKTReader(factory);

function extractGeometries(req) {
    var wkt=req.rawBody.split("*");
    var geometries=[];
    for(var i=0,l=wkt.length;i<l;i++){
        try {
            if(wkt[i]!="") {
                var geom=reader.read(wkt[i]);
                if(!geom.isValid()) {
                    console.warn("geom is not valid, attempting to clean it up: "+wkt[i]);
                    // try to clean it up
                    geom=selfSnap(geom);
                }
                if(!geom.isValid()) {
                    // log a message and carry on
                    console.error("geom is still not valid: "+wkt[i]);
                    return false;
                } else {
                    geometries.push( geom );
                }
            }
        } catch(e) {
            console.error("Error parsing WKT geometry: "+e);
            return false;
        } // swallow
    }
    return geometries;
}

function buffer(req,res, distance) {
    var geometries=extractGeometries(req);
    if(geometries) {
        var buffer = geometries[0].buffer(distance);
        res.send(200,JSON.stringify({"geom":buffer.toString(),"area":buffer.getArea()}));
    } else {
        res.send(400,"Error processing geometries, data probably needs cleaning");
    }
}

function intersection(req,res) {
    var geometries = extractGeometries(req);
    if(geometries) {
        if(geometries.length==2) {
        var intersection=geometries[0].intersection(geometries[1]);
        res.send(200,JSON.stringify({"geom":intersection.toString(),"area":intersection.getArea()}));
        } else {
            res.send(400,"Please specify two geometries");
        }
    } else {
        res.send(400,"Error processing geometries, data probably needs cleaning");
    }
}

function union(req,res) {
    var geometries = extractGeometries(req);
    if(geometries) {
        if(geometries.length==2) {
        var union=geometries[0].union(geometries[1]);
        res.send(200,JSON.stringify({"geom":union.toString(),"area":union.getArea()}));
        } else {
            res.send(400,"Please specify two geometries");
        }
    } else {
        res.send(400,"Error processing geometries, data probably needs cleaning");
    }
}

function area(req,res) {
    var geometries = extractGeometries(req);
    if(geometries) {
        var feature = geometries[0];
        res.send(200,JSON.stringify({"geom":feature.toString(),"area":feature.getArea()}));
    } else {
        res.send(400,"Error processing geometries, data probably needs cleaning");
    }
}

function selfSnap(g) {
    var snapTol = jsts.operation.overlay.snap.GeometrySnapper.computeOverlaySnapTolerance(g);
    var snapper = new jsts.operation.overlay.snap.GeometrySnapper(g);
    var snapped = snapper.snapTo(g, snapTol);
    // need to "clean" snapped geometry - use buffer(0) as a simple way to do this
    return snapped.buffer(0);
}