sc_require('controllers/feature_info');

Maps.featureInfoAttributesController = SC.ArrayController.create(SCTable.TableDelegate,{

    content: SC.Binding.transform(
        function(v,b){
            if(v && v.firstObject()) {
                return v.firstObject().attributes();
            } else {
                return {};
            }
        }).from('Maps.featureInfoController.selection')

});