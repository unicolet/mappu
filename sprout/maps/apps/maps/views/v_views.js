/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

/*globals Maps */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
Maps.LinkView = SC.ListItemView.extend(SC.ContentDisplay,
/** @scope Maps.CommentView.prototype */ {
		
	contentDisplayProperties: 'title url description'.w(),

	render: function(context, firstTime) {
        if(Maps.featureInfoController.hasSelection()) {
            var content = this.get("content");
            var title = content.get("title");
            var url = Mustache.to_html(content.get("url"), Maps.featureInfoController.get("selection").firstObject().attributes());
            var descr = content.get("description");

            context = context.begin('div').addClass('link-summary-view');
            context = context.begin('div').addClass('link-summary-view-url').begin('a').attr('href',url).attr('target','_mapslink').push(title).end().end();
            context = context.begin('div').addClass('link-summary-view-desc').push(descr).end();
            context = context.end();
        }
	}
});


Maps.CommentView = SC.ListItemView.extend(SC.ContentDisplay,
/** @scope Maps.CommentView.prototype */ {

    useStaticLayout: YES,

	contentDisplayProperties: 'readable'.w(),

	render: function(context, firstTime) {
        var content = this.get("content");
        context = context.begin('div').addClass('comment-view').push(content.get("readable")).end();
        return context;
	}
});

Maps.DropView = SC.LabelView.extend(
    //SC.DropTarget is now a protocol, will cause errors in production
    {
    isDropTarget: true,

    /* Animate the view so the the user knows something happened */
    react: function(){
        SC.$(this.get('layer')).removeClass("drag-entered");
    },

    // acceptDragOperation is a copy of performDragOperation
    acceptDragOperation: function(drag, op) {
		var ret = SC.DRAG_NONE;

		// Continue only if data is available from drag
		var selectionSet = drag.dataForType(Maps.Feature);
		if (!selectionSet) {
		  return ret;
		}

		// Get our record - there should only be 1 selection
		var record = selectionSet.firstObject();
		Maps.featureInfoController.set(this.get("dropTargetProperty"),record.attributes()["name"]);

		var marker = Maps.openLayersController.getMarkersLayer().markers[Maps.featureInfoController.indexOf(record)];
		Maps.featureInfoController.set(this.get("dropTargetProperty")+"geom",marker.data.feature.geometry.clone());

		ret=SC.DRAG_LINK;

        this.react();
        
		return ret;
	},

	performDragOperation: function(drag, op) {
		var ret = SC.DRAG_NONE;

		// Continue only if data is available from drag
		var selectionSet = drag.dataForType(Maps.Feature);
		if (!selectionSet) {
		  return ret;
		}

		// Get our record - there should only be 1 selection
		var record = selectionSet.firstObject();
		Maps.featureInfoController.set(this.get("dropTargetProperty"),record.attributes()["name"]);
		
		var marker = Maps.openLayersController.getMarkersLayer().markers[Maps.featureInfoController.indexOf(record)];
		Maps.featureInfoController.set(this.get("dropTargetProperty")+"geom",marker.data.feature.geometry.clone());
		
		ret=SC.DRAG_LINK;

        this.react();
        
		return ret;
	},
	
	computeDragOperations: function(drag, evt) {
		return SC.DRAG_ANY;
	},
	
	dragEntered: function(drag, evt) {
		//console.log("dragEntered");
		SC.$(this.get('layer')).addClass("drag-entered");
	},
	
	dragExited: function(drag, evt) {
		//console.log("dragExited");
		SC.$(this.get('layer')).removeClass("drag-entered");
	}
});

Maps.FormView = SC.View.extend({
    value: null,

    displayProperties: ["value"],

    render: function(context, firstTime) {

        var selection=Maps.layerQueryController.get("selection").firstObject();
        if(selection) {
            var filterString = selection.get("filterString");

            if (filterString) {
                var params=new Object();
                for (var i=0;i<10;i++) {
                    params["INPUT"+i]="<input type=\"text\" name=\"input"+i+"\" style=\"width:auto;\" onclick=\"this.focus()\">";
                    params["SMALL"+i]="<input type=\"text\" name=\"small"+i+"\" style=\"width:auto;\" size=\'4\' onclick=\"this.focus()\">";
                }
                var form_text = Mustache.to_html(filterString, params);
                //console.log("Maps.FormView.formText="+form_text);

                context = context.begin('div').addClass('maps-form-view');
                //context = context.begin('div').addClass('maps-form-view-url').begin('a').attr('href',url).attr('target','_mapslink').push(title).end().end();
                context = context.begin('div').addClass('maps-form-view-desc').push(form_text).end();
                context = context.end();
            }
        }
	},

    getFormValues: function() {
        var params = new Object();
        $(this.get('layer')).find('input').each(function(i){params[this.name.toUpperCase()]=this.value;});
        return params;
    },

    getCQLFilter: function() {
        var cql=null;
        var filterString = Maps.layerQueryController.get("selection").firstObject().get("filterString");
        if (filterString) {
            cql = Mustache.to_html(filterString, this.getFormValues());
        }
        //@if(debug)
        console.log("Form Values="+this.getFormValues());
        console.log("CQL Filter="+cql);
        //@endif
        return cql;
    }
});

Maps.LegendView = SC.View.extend({
    value: null,

    displayProperties: ["value"],

    render: function(context, firstTime) {
        context = context.begin('div').addClass('maps-legend-view');
        context = context.begin('img').attr('src',this.get("value")).end();
        context = context.end();
        this.set("calculatedHeight","1000");

        return context;
	}
});