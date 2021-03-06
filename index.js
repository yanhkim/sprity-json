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

function makeSprite(data) {
  return {
    name: data.name + '.' + data.type,
    width: data.width,
    height: data.height
  };
}

function makeTile(item, sprite) {
  var margin = (item.height - item.meta.height) / 2;
  return {
    name: item.meta.fileName,
    width: item.meta.width,
    height: item.meta.height,
    x: item.x + margin,
    y: item.y + margin,
    sprite: sprite.name + '.' + sprite.type
  };
}

module.exports = {
  process: function (layouts, opt, Handlebars) {
    var sprites = [];
    var tiles = [];
    var tileNames = {};
    layouts.forEach(function (layout) {
      layout.sprites.forEach(function (data) {
        sprites.push(makeSprite(data));
      });
      layout.layout.items.forEach(function (item) {
        tiles.push(makeTile(item, layout.sprites[0]));
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
