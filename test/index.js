'use strict';

var fs = require('fs');
var should = require('chai').should();
var Handlebars = require('handlebars');

require('mocha');

var jsonProc = require('../index');

var fixture;

beforeEach(function () {
  fixture = [{
    layout: {
      items: [{
        height: 136,
        width: 136,
        x: 0,
        y: 0,
        meta: {
          fileName: 'png.png',
          height: 128,
          width: 128
        }
      }, {
        height: 520,
        width: 520,
        x: 0,
        y: 136,
        meta: {
          fileName: 'jpg.jpg',
          height: 512,
          width: 512
        }
      }]
    },
    sprites: [{
      name: 'sprite',
      type: 'png',
      width: 520,
      height: 656
    }]
  }];
});

describe('sprity-json', function () {
  it('should not be beautifyable', function () {
    jsonProc.isBeautifyable({}).should.be.false;
  });

  it('should return json as the extension', function () {
    jsonProc.extension({}).should.equal('json');
  });

  it('should return json as expected', function (done) {
    jsonProc.process(fixture, {}, Handlebars)
      .then(function (style) {
        style.should.equal(fs.readFileSync('test/expected/style.json').toString());
        done();
      });
  });

  it('should throw an error when two tiles has same fileName', function (done) {
    fixture[0].layout.items.push({
      height: 520,
      width: 520,
      x: 0,
      y: 136,
      meta: {
        fileName: 'jpg.jpg',
        height: 512,
        width: 512
      }
    });

    try {
      jsonProc.process(fixture, {}, Handlebars);
    } catch (e) {
      e.message.should.equal('same tile image turned up');
      done();
    }
  });

});
