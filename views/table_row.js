// ==========================================================================
// Project:   SCTable - JavaScript Framework
// Copyright: ©2011 Jonathan Lewis and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals SCTable*/

/*
  Item view used by SCTable.TableView to draw one row.  This view calls
  SCTable.TableDelegate.renderTableCellContent() to allow custom cell rendering.
*/

SCTable.TableRowView = SC.View.extend(SC.Control, /*SC.Benchmark,*/ {

  // PUBLIC PROPERTIES
  
  classNames: 'sctable-row-view',
  
  //verbose: YES, // for benchmarking
  
  isMouseOver: NO,

  displayProperties: ['isMouseOver'],

  /*
    Set this property to YES (default) to disable the re-rendering of rows when the mouse
    moves over.
    On slower computers (i.e. my 2006 dual core mac mini) this is quite slow.
   */
  fastRendering: YES,

  /*
    @read-only
  */
  tableDelegate: function() {
    return this.getPath('displayDelegate.tableDelegate');
  }.property('displayDelegate').cacheable(),
  
  // PUBLIC METHODS

  willDestroyLayer: function() {
    this.set('content', null); // make sure all observers disconnect from content
  },

  contentPropertyDidChange: function(target, key) {
    this.displayDidChange();
  },

  // TODO: This render is fast, but make it faster.
  render: function(context, firstTime) {
    //this.start('row render');
    
    var tableDelegate = this.get('tableDelegate');
    var columns = this.getPath('displayDelegate.columns');
    var left = 0, value, width;
    var content = this.get('content');
    var contentIndex = this.get('contentIndex');
    var classes = [(contentIndex % 2 === 0) ? 'even' : 'odd'];
    
    if (this.get('isMouseOver')) {
      classes.push('hover');
    }
  
    context = context.addClass(classes);
  
    if (columns && columns.isEnumerable) {
      columns.forEach(function(col, index) {
        var iconKey = col.get('iconKey');
  
        width = col.get('width') || 0;
        context = context.push('<div class=\"cell col-%@ %@\" style=\"left: %@px; top: 0px; bottom: 0px; width: %@px;\">'.fmt(index, (iconKey ? 'has-icon' : ''), left, width));
        context = tableDelegate.renderTableCellContent(this, context, content, contentIndex, col, index);
        context = iconKey ? context.push('<div class=\"icon %@\"></div></div>'.fmt(content.get(iconKey))) : context.push('</div>');
  
        left += width;
      }, this);
    }
  
    //this.end('row render');
  },

  mouseDown: function(evt) {
    var del = this.get('tableDelegate');
    
    if (del) {
      del.mouseDownOnTableRow(this.get('displayDelegate'), this, evt);
    }
    
    return NO;
  },

  mouseEntered: function(evt) {
    if(!this.get("fastRendering"))
        this.set('isMouseOver', YES);
  },
  
  mouseExited: function(evt) {
    if(!this.get("fastRendering"))
        this.set('isMouseOver', NO);
  }

});

SCTable.TableRowView.mixin({
  isReusableInCollections: YES
});
