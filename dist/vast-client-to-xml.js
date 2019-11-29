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

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var TRACKING_EVENTS = {
  PROGRESS: 'progress'
};
var CREATIVE_TYPES = {
  LINEAR: 'Linear'
};
var AD_STRUCTURE = 'inline';

var VASTXmlConverter =
/*#__PURE__*/
function () {
  function VASTXmlConverter() {
    _classCallCheck(this, VASTXmlConverter);
  }

  _createClass(VASTXmlConverter, [{
    key: "attachMediaFiles",
    value: function attachMediaFiles(vastBuilderCreative, mediaFiles) {
      mediaFiles.forEach(function (file) {
        vastBuilderCreative.attachMediaFile(file.fileURL, {
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
    key: "parseEventDuration",
    value: function parseEventDuration(eventName) {
      return parseInt(eventName.match(/\d+/));
    }
  }, {
    key: "formatDuration",
    value: function formatDuration(duration) {
      // TODO: implement proper formatting for minutes and hours
      return "00:00:".concat(duration);
    }
  }, {
    key: "addTrackingEvent",
    value: function addTrackingEvent(vastBuilderCreative, eventName, urls) {
      var _this = this;

      urls.forEach(function (url) {
        var duration = _this.parseEventDuration(eventName);

        if (duration) {
          vastBuilderCreative.attachTrackingEvent(TRACKING_EVENTS.PROGRESS, url, _this.formatDuration(duration));
        } else {
          vastBuilderCreative.attachTrackingEvent(eventName, url);
        }
      });
    }
  }, {
    key: "attachTrackingEvents",
    value: function attachTrackingEvents(creative, trackingEvents) {
      var _this2 = this;

      Object.entries(trackingEvents).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            name = _ref2[0],
            urls = _ref2[1];

        _this2.addTrackingEvent(creative, name, urls);
      });
    }
  }, {
    key: "attachCreatives",
    value: function attachCreatives(vastBuilderAd, creatives) {
      var _this3 = this;

      creatives.forEach(function (creative) {
        var vastBuilderCreative = vastBuilderAd.attachCreative(CREATIVE_TYPES.LINEAR, {
          Duration: _this3.formatDuration(creative.duration)
        });

        _this3.attachMediaFiles(vastBuilderCreative, creative.mediaFiles);

        _this3.attachTrackingEvents(vastBuilderCreative, creative.trackingEvents);
      });
    }
  }, {
    key: "attachAds",
    value: function attachAds(builder, ads) {
      var _this4 = this;

      ads.forEach(function (ad) {
        var vastBuilderAd = builder.attachAd({
          id: ad.id,
          structure: AD_STRUCTURE,
          sequence: ad.sequence,
          AdTitle: ad.title,
          AdSystem: {
            name: ad.system.value,
            version: ad.system.version
          }
        });

        _this4.attachCreatives(vastBuilderAd, ad.creatives);
      });
    }
  }, {
    key: "convert",
    value: function convert(vastClientResponse) {
      var ads = vastClientResponse.ads;
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
