
Maps.featureInfoAttributesController = SC.ArrayController.create(SCTable.TableDelegate,{

    whenSelectionChanges: function() {
        if(Maps.featureInfoController.selection().firstObject()) {
            var guid = Maps.featureInfoController.selection().firstObject().get('guid');
            Maps.ATTRIBUTES_QUERY.parameters.id=guid;
            this.content.refresh();
        }
    }.observes("Maps.featureInfoController.selection")

});