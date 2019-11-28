'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var VASTBuilder = _interopDefault(require('vast-xml'));

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var VASTXmlConverter =
/*#__PURE__*/
function () {
  function VASTXmlConverter() {
    _classCallCheck(this, VASTXmlConverter);
  }

  _createClass(VASTXmlConverter, [{
    key: "attachMediaFiles",
    value: function attachMediaFiles(vastClientCreative, mediaFiles) {
      mediaFiles.forEach(function (file) {
        vastClientCreative.attachMediaFile(file.fileURL, {
          id: file.id,
          type: file.mimeType,
          bitrate: file.bitrate,
          minBitrate: file.minBitrate,
          maxBitrate: file.maxBitrate,
          width: file.width,
          height: file.height,
          scalable: file.scalable,
          maintainAspectRatio: file.maintainAspectRatio,
          codec: file.codec,
          apiFramework: file.apiFramework
        });
      });
    }
  }, {
    key: "attachCreatives",
    value: function attachCreatives(vastClientAd, creatives) {
      var _this = this;

      creatives.forEach(function (creative) {
        var vastClientCreative = vastClientAd.attachCreative('Linear', {
          Duration: "00:00:".concat(creative.duration)
        });

        _this.attachMediaFiles(vastClientCreative, creative.mediaFiles);
      });
    }
  }, {
    key: "attachAds",
    value: function attachAds(builder, ads) {
      var _this2 = this;

      ads.forEach(function (ad) {
        var vastAd = builder.attachAd({
          id: ad.id,
          structure: 'inline',
          sequence: ad.sequence,
          Error: 'http://error.err',
          AdTitle: ad.title,
          AdSystem: {
            name: 'Test Ad Server',
            version: '1.0'
          }
        });

        _this2.attachCreatives(vastAd, ad.creatives);
      });
    }
  }, {
    key: "convert",
    value: function convert(ads) {
      var builder = new VASTBuilder();
      this.attachAds(builder, ads);
      return builder.xml();
    }
  }]);

  return VASTXmlConverter;
}();

var index = {
  VASTXmlConverter: VASTXmlConverter
};

module.exports = index;
