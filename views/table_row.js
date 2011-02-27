/*globals SCTable*/

/*
  Item view used by SCTable.TableView to draw one row.  This view calls
  SCTable.TableDelegate.renderTableCellContent() to allow custom cell rendering.
*/

SCTable.TableRowView = SC.View.extend(SC.Control, /*SC.Benchmark,*/ {

  // PUBLIC PROPERTIES
  
  classNames: 'sctable-row-view',
  
  //verbose: NO, // for benchmarking
  
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
    var tableDelegate = this.getPath('displayDelegate.tableDelegate');
    var columns = tableDelegate ? tableDelegate.get('columns') : null;
    var tableWidth = (tableDelegate ? tableDelegate.get('tableWidth') : 0) || 0;
    var left = 0, value, width, valueKey;
    var content = this.get('content');
    var contentIndex = this.get('contentIndex');

    //console.log('%@.render(firstTime: %@, tableWidth: %@)'.fmt(this, firstTime, tableWidth));

    context = context.addClass((contentIndex % 2 === 0) ? 'even' : 'odd');
    context = context.setClass('hover', this.get('isMouseOver'));

    //this.start('render B');

    if (columns && columns.isEnumerable) {
      columns.forEach(function(col, index) {
        //value = content ? content.get(col.get('valueKey')) : null;
        width = col.get('width') || 0;
        context = context.push('<div class=\"cell col-%@\" style=\"left: %@px; top: 0px; bottom: 0px; width: %@px;\">'.fmt(index, left, width));
        context = tableDelegate.renderTableCellContent(this, context, content, contentIndex, col, index);
        context = context.push('</div>');
        left += width;
      }, this);
    }

    //this.end('render B');
  },
  
  mouseEntered: function(evt) {
    this.set('isMouseOver', YES);
  },
  
  mouseExited: function(evt) {
    this.set('isMouseOver', NO);
  }

});
