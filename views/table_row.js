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
  
  // PUBLIC METHODS

  willDestroyLayer: function() {
    this.set('content', null); // make sure all observers disconnect from content
  },

  contentPropertyDidChange: function() {
    this.displayDidChange();
  },

  // TODO: This render is fast, but make it faster.
  render: function(context, firstTime) {
    //this.start('row render');

    var tableDelegate = this.getPath('displayDelegate.tableDelegate');
    var columns = tableDelegate ? tableDelegate.get('columns') : null;
    var tableWidth = (tableDelegate ? tableDelegate.get('tableWidth') : 0) || 0;
    var left = 0, value, width, valueKey;
    var content = this.get('content');
    var contentIndex = this.get('contentIndex');

    context = context.addClass((contentIndex % 2 === 0) ? 'even' : 'odd');
    context = context.setClass('hover', this.get('isMouseOver'));
    
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
  
  mouseEntered: function(evt) {
    this.set('isMouseOver', YES);
  },
  
  mouseExited: function(evt) {
    this.set('isMouseOver', NO);
  }

});
