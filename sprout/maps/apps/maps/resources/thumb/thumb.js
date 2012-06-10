/*
    https://github.com/tim-evans/RSS-Reader/blob/master/apps/reading_list/resources/ace/thumb/thumb.css
*/

require('theme');

Maps.Theme.thumbRenderDelegate = SC.RenderDelegate.create({

  render: function (dataSource, context) {
    context.push('<span class="gripper"></span>');
  },

  update: SC.K

});

SC.ThumbView.reopen({
  renderDelegateName: 'thumbRenderDelegate'
});