'use strict';

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));
var path = require('path');

var getTemplate = function () {
  return fs.readFileAsync(path.join(__dirname, 'template', 'json.hbs'), 'utf8');
};

var transform = Promise.method(function (layouts, source, opt, Handlebars) {
  var template = Handlebars.compile(source);
  return template({
    layouts: layouts
  });
});

module.exports = {
  process: function (layouts, opt, Handlebars) {
    layouts.forEach(function (l, idx) {
      l.layout.items[l.layout.items.length - 1].last = true;
      l.sprites[l.sprites.length - 1].last = true;
      if (idx === layouts.length - 1) {
        l.last = true;
      }
    });
    return getTemplate()
      .then(function (source) {
        return transform(layouts, source, opt, Handlebars);
      });
  },
  isBeautifyable: function () {
    return false;
  },
  extension: function () {
    return 'json';
  }
};
