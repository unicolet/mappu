// ==========================================================================
// Project:   Maps.FeatureView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Maps */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
Maps.FeatureView = SC.View.extend(SC.ContentDisplay, 
/** @scope Maps.FeatureView.prototype */ {

	render: function(context, firstTime) {
		var content = this.get("content");
		if (content && content.firstObject()) {
			content = content.firstObject();
			context = context.begin('table').attr("cellpadding","0").attr("cellmargin","0").attr("width","100%");
			var i=0;
			$.each(content.attributes(), function(key, value) {
				//console.log("rendering "+key+":"+value+", step:"+i);
				context = context.begin('tr').addClass('feature-details-row');
				context = context.begin('td').addClass('feature-details-key').addClass( (i%2) ? "even" : "odd" ).push(key).end();
				context = context.begin('td').addClass('feature-details-value').addClass( (i%2) ? "even" : "odd" ).push(value).end();
			    context = context.end();
			    i++;
  			});
  			context = context.end(); // end table
		} else {
			context = context.begin('div').addClass('no-feature-details').push("Click on the map to perform a query, then select a feature from the list above to view its attributes.").end();
		}
	}

});
