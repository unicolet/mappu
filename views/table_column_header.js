/*globals SCTable*/

/*
  Item view used by SCTable.TableHeaderView to render a column header view.
*/

SCTable.TableColumnHeaderView = SC.View.extend(SC.Control, {

  // PUBLIC PROPERTIES
  
  classNames: 'sctable-column-header-view',
  
  /*
    Set to an SCTable.SORT_DIRECTION_ enumeration as defined in core.js.
  */
  sortDirection: null,

  displayProperties: ['sortDirection', 'isMouseOver'],

  /*
    Min width for resize dragging.
  */
  minWidth: 30,

  /*
    YES when mouse is hovering over this view.
  */
  isMouseOver: NO,
  
  // PUBLIC METHODS
  
  contentPropertyDidChange: function() {
    this.displayDidChange();
  },
  
  render: function(context, firstTime) {
    var sortClasses = ['sort-indicator'];
    var sortDirection = this.get('sortDirection');
    var classNames = this.getPath('content.classNames');

    if (!SC.none(sortDirection)) {
      sortClasses.push(sortDirection);
    }

    context = context.addClass('col-%@'.fmt(this.get('contentIndex')));

    if (this.get('isMouseOver')) {
      context = context.addClass('hover');
    }

    if (classNames) {
      context = context.addClass(classNames);
    }

    context = context.begin('div').addClass('col-name').text(this.getPath('content.name')).end();

    if (this.getPath('content.canSort')) {
      context = context.begin('div').addClass(sortClasses).end();
    }
    
    if (this.getPath('content.canResize')) {
      context = context.begin('div').addClass('resize-handle').end();
    }
  },

  willDestroyLayer: function() {
    this.set('content', null); // make sure all observers disengage.
    this.set('tableDelegate', null);
    sc_super();
  },
  
  /*
    Watch for actions on the resize handle div and feed them back to the table.
  */
  mouseDown: function(evt) {
    var ret = NO, del;

    // initialize
    this._isDraggingHandle = NO;
    this._mouseDownInfo = null;

    if (evt.target.className === 'resize-handle') { // take over the event if we're clicking a resize handle
      this._isDraggingHandle = YES;
      this._mouseDownInfo = {
        didNotifyBeginResize: NO,
        didMove: NO,
        startPageX: evt.pageX,
        startWidth: this.get('frame').width
      };

      ret = YES;
    }

    return ret;
  },

  mouseDragged: function(evt) {
    var del, newWidth;

    if (this._isDraggingHandle) {
      this._mouseDownInfo.didMove = YES;
      del = this.get('displayDelegate');

      if (del && del.isTableColumnsDelegate) {
        if (!this._mouseDownInfo.didNotifyBeginResize) {
          del.beginColumnResizeDrag();
          this._mouseDownInfo.didNotifyBeginResize = YES;
        }
        else {
          newWidth = Math.max(this._mouseDownInfo.startWidth + evt.pageX - this._mouseDownInfo.startPageX, this.get('minWidth'));
          del.updateColumnResizeDrag(evt, this.get('content'), this.get('contentIndex'), newWidth);
        }
      }
    }

    return this._isDraggingHandle;
  },
  
  mouseUp: function(evt) {
    var del, newWidth, ret = this._isDraggingHandle;
    
    if (this._isDraggingHandle && this._mouseDownInfo.didMove) {
      newWidth = Math.max(this._mouseDownInfo.startWidth + evt.pageX - this._mouseDownInfo.startPageX, this.get('minWidth'));
      this.setPath('content.width', newWidth);

      del = this.get('displayDelegate');
      if (del && del.isTableColumnsDelegate) {
        del.endColumnResizeDrag();
      }
    }
    
    // clean up
    this._isDraggingHandle = NO;
    this._mouseDownInfo = null;

    return ret; // take the event if we dragged, to avoid an action getting fired to the owning collection view
  },
  
  mouseEntered: function() {
    if (!this._isDraggingHandle) {
      this.set('isMouseOver', YES);
    }
  },
  
  mouseExited: function() {
    if (!this._isDraggingHandle) {
      this.set('isMouseOver', NO);
    }
  },
  
  // PRIVATE PROPERTIES

  _isDraggingHandle: NO,
  _mouseDownInfo: null
  
});
