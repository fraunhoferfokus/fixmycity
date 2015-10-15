(function($, window, undefined) {

  // Given a query string, convert all the name/value pairs
  // into a property/value object. If a name appears more than
  // once in a query string, the value is automatically turned
  // into an array.
  // XXX: We have a near-duplicate of this in helper.js (App.parseUri)
  function queryStringToObject(qstr) {
    var result = {}, nvPairs = ( ( qstr || "" )
      .replace( /^\?/, "" ).split( /&/ ) ), i, pair, n, v;

    for(i = 0; i < nvPairs.length; i++) {
      var pstr = nvPairs[i];
      if(pstr) {
        pair = pstr.split( /=/ );
        n = pair[0];
        v = pair[1];
        if(result[n] === undefined) {
          result[n] = v;
        } else {
          if(typeof result[ n ] !== "object") {
            result[n] = [result[n]];
          }
          result[n].push(v);
        }
      }
    }
    return result;
  }

  $(document).bind("pagebeforechange", function(e, data) {
    if(typeof data.toPage === "string") {
      var u = $.mobile.path.parseUrl(data.toPage);
      if(u.search) {
        if(!data.options.dataUrl) {
          data.options.dataUrl = data.toPage;
        }
        // We don't use this data yet. Maybe later.
        data.options.pageData = queryStringToObject(u.search);
        data.toPage = u.hrefNoSearch;
      }
    }
  });
})(jQuery, window);
