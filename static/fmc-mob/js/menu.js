(function() {
  var menubuttonClass = 'menubutton-pressed';

  $('div.menubutton').live('vmousedown', function() {
    var self = this;

    $(self).addClass(menubuttonClass);

    setTimeout(function() {
      $(self).removeClass(menubuttonClass);
    }, 500);
  });

  $('div.menubutton').live('vmouseup', function() {
    $(this).removeClass(menubuttonClass);
  });
}).call(this);
