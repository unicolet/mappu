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
            if(wkt[i]!="")
                geometries.push( selfSnap( reader.read(wkt[i]) ) );
        } catch(e) {} // swallow
    }
    return geometries;
}

function buffer(req,res, distance) {
    var buffer = extractGeometries(req)[0].buffer(distance);
    res.send(200,JSON.stringify({"geom":buffer.toString(),"area":buffer.getArea()}));
}

function selfSnap(g) {
    var snapTol = jsts.operation.overlay.snap.GeometrySnapper.computeOverlaySnapTolerance(g);
    var snapper = new jsts.operation.overlay.snap.GeometrySnapper(g);
    var snapped = snapper.snapTo(g, snapTol);
    // need to "clean" snapped geometry - use buffer(0) as a simple way to do this
    return snapped.buffer(0);
}