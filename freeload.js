var freeload = {
  
  filter: '', // if empty, all images will be preloaded (suffix: '_p$' -> image_p.jpg)
  verbose: true, // print info about loaded images to the console
  
  // TODO: whitelist + blacklist for images and/or CSS files and/or folders
  
  properties: [
    'background', // this might be needed for some edge cases
    'background-image'
    // TODO: border-image (+ multiple backgrounds)
  ],
  
  init: function() {
    // delete these two lines if not using domcontentloaded.js
    if (arguments.callee.done) return;
  	arguments.callee.done = true;
  	freeload.parseCSS();
  },
  
  css: /\/[\w\._-]+\.css$/, // example: `/main.css`
  ext: /\.[\w]+$/, // example: `.jpg`
  folder: /\/[\w\._-]+\/$/, // example: `/images/`
  url: /url\(['"]?([\w\.\/_-]+)['"]?\)/, // example: `url(bg_p.png)`, `url("../css/bg.png")`
  
  parseCSS: function() {
    // take care of all stylesheets linked from the document
    var stylesheets = document.styleSheets;
  	for (var i = 0; i < stylesheets.length; i++) {
			var stylesheet = stylesheets[i];
  		if (!stylesheet.disabled) {
  			this.parseStyleSheet(stylesheet);
  		};
  	};
  },
  
  getSupportInfo: function(property) {
    // check if the property is supposed to be checked for `url()`
    // FIXME: probably very inefficent
    var properties = this.properties,
        supported = false;
    for (var i=0; i < properties.length; i++) {
      if (property == properties[i]) {
        supported = true;
        break;
      };
    };
    return supported;
  },
  
  transformPropertyName: function(property) {
    // example: replace `background-image` with `backgroundImage`
    var r = /\-([a-z]){1}/g;
    if (property.match(r)) {
      var n = RegExp.$1.toUpperCase();
      property = property.replace(r, n);
    };
    return property;
  },
  
  getImagePath: function(value, href) {
    var url_exists = value.match(this.url);
    var r = '';
    if (url_exists) { // if not `none`
      var url_path = url_exists[1];
      var url_parts = url_path.split('/');    
      var image = url_parts[url_parts.length - 1].replace(this.ext, ''); // delete extension from the filename
      var filter = new RegExp(this.filter);

      if (image.match(filter)) {
        var new_url_path = [], // here be `css/image.png` if url_path was `../../css/image.png`
            css_path = href.replace(this.css, '/'); // URL to the .css file
          
        for (var i=0; i < url_parts.length; i++) {
          if (url_parts[i] == '..') {
            // if it's `..`, delete one folder up from CSS path
            css_path = css_path.replace(this.folder, '/');
          } else {
            // if it's just plain folder, add it to the new path
            new_url_path.push(url_parts[i]);
          };
          // FIXME: `./image.png`
          // FIXME: `http://example.com/images/bg.png`
        };

        new_url_path = new_url_path.join('/');
        r = css_path + new_url_path; // voila, path to the image
      };
    };
    
    return r;
  },
  
  preloadImage: function(path) {
    var v = this.verbose;
    var i = new Image();
    i.setAttribute('src', path);
    if (v) {
      i.onload = function() {
        console.log('Image [[' + path + ']] loaded');
      };
      i.onerror = function() {
        console.log('>>> FAIL [[' + path + ']]');
      };
    }
  },
    
  parseStyleSheet: function(stylesheet) {
    var ss_href = stylesheet.href,
        ss_name = ss_href.substring(ss_href.lastIndexOf('/') + 1, ss_href.length),
  	    rules = stylesheet.cssRules;
  	for (var i = 0; i < rules.length; i++) {
  		var rule = rules[i];
  		if (rule.type == 3) {
  			// handle @import rules
  			this.parseStyleSheet(rule.styleSheet);
  		} else if (rule.type == 1) {
  			// parse a rule
  			var style = rule.style;
  			// iterate all properties in this rule
  			for (var j=0; j < style.length; j++) {
  			  if (this.getSupportInfo(style[j])) {
			      var property_name = this.transformPropertyName(style[j]);
			      var value = style[property_name];			      
            var image_path = this.getImagePath(value, ss_href);
            
            if (image_path) {
              this.preloadImage(image_path);
            };
  			  };
  			};
  		};
  	};
  }
  
};