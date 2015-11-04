'use strict';

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));
var path = require('path');

var getTemplate = function () {
  return fs.readFileAsync(path.join(__dirname, 'template', 'json.hbs'), 'utf8');
};

var transform = Promise.method(function (sprites, tiles, source, Handlebars) {
  var template = Handlebars.compile(source);
  return template({
    sprites: sprites,
    tiles: tiles
  });
});

module.exports = {
  process: function (layouts, opt, Handlebars) {
    var sprites = [];
    var tiles = [];
    var tileNames = {};
    layouts.forEach(function (layout) {
      layout.sprites.forEach(function (sprite) {
        sprites.push({
          name: sprite.name + '.' + sprite.type,
          width: sprite.width,
          height: sprite.height
        });
      });
      layout.layout.items.forEach(function (item) {
        tiles.push({
          name: item.meta.fileName,
          width: item.width,
          height: item.height,
          x: item.x,
          y: item.y,
          sprite: layout.sprites[0].name + '.' + layout.sprites[0].type
        });
        if (tileNames[item.meta.fileName]) {
          throw new Error('same tile image turned up');
        }
        tileNames[item.meta.fileName] = true;
      });
    });
    if (sprites.length) {
      sprites[sprites.length - 1].last = true;
    }
    if (tiles.length) {
      tiles[tiles.length - 1].last = true;
    }
    return getTemplate()
      .then(function (source) {
        return transform(sprites, tiles, source, Handlebars);
      });
  },
  isBeautifyable: function () {
    return false;
  },
  extension: function () {
    return 'json';
  }
};
