'use strict';

var xmlbuilder2 = require('xmlbuilder2');

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (String )(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

var VASTClientSerializer = /*#__PURE__*/function () {
  function VASTClientSerializer() {
    _classCallCheck(this, VASTClientSerializer);
  }
  return _createClass(VASTClientSerializer, [{
    key: "serialize",
    value:
    /**
     * Serialize the given VAST-Client parsed object into XML
     * For detail about the data structure to pass see
     * https://github.com/dailymotion/vast-client-js/blob/master/docs/api/class-reference.md
     * @param {Object} parsedVast The VAST-Client parsed VAST object
     * @returns Serialized VAST
     */
    function serialize(parsedVast) {
      var doc = xmlbuilder2.create({
        encoding: 'UTF-8'
      }, this.buildVast(parsedVast));
      return doc.end({
        format: 'xml'
      });
    }

    /**
     * Build the root VAST node object
     * @param {Object} parsedVast The VAST-Client parsed VAST object
     * @returns {Object} The VAST node
     */
  }, {
    key: "buildVast",
    value: function buildVast(parsedVast) {
      var _this = this;
      var ads = parsedVast.ads.map(function (ad) {
        return _this.buildAd(ad);
      });
      var errors = parsedVast.errorURLTemplates.map(function (errorUrl) {
        return _this.wrapCDATA(errorUrl);
      });
      return {
        'VAST': {
          '@version': parsedVast.version,
          'Error': errors,
          'Ad': ads
        }
      };
    }

    /**
     * Build an Ad node object
     * @param {Object} ad An ad object
     * @returns {Object} An ad node
     */
  }, {
    key: "buildAd",
    value: function buildAd(ad) {
      return {
        '@id': ad.id,
        '@sequence': ad.sequence,
        // '@conditionalAd': no current support in VAST-Client
        '@adType': ad.adType,
        'InLine': this.buildInLine(ad)
      };
    }

    /**
     * Build an InLine node object
     * @param {Object} ad An ad object
     * @returns {Object} An InLine node
     */
  }, {
    key: "buildInLine",
    value: function buildInLine(ad) {
      var _this2 = this;
      var impressions = ad.impressionURLTemplates.map(function (impressionTemplate) {
        return {
          '@id': impressionTemplate.id,
          '#': _this2.wrapCDATA(impressionTemplate.url)
        };
      });
      var categories = ad.categories.map(function (category) {
        return {
          '@authority': category.authority,
          '#': category.value
        };
      });
      var errors = ad.errorURLTemplates.map(function (errorURLTemplate) {
        return _this2.wrapCDATA(errorURLTemplate);
      });
      return {
        'AdSystem': {
          '@version': ad.system.version,
          '#': ad.system.value
        },
        'AdTitle': ad.title,
        'Impression': impressions,
        'AdServingId': ad.adServingId,
        'Category': categories,
        'Description': ad.description,
        'Advertiser': this.buildAdvertiser(ad.advertiser),
        'Pricing': this.buildPricing(ad.pricing),
        'Survey': this.buildSurvey(ad.survey),
        'Error': errors,
        'Expires': ad.expires,
        'ViewableImpression': this.buildViewableImpression(ad.viewableImpression),
        'AdVerifications': this.buildAdVerifications(ad.adVerifications),
        'Extensions': this.buildExtensions(ad.extensions),
        'Creatives': this.buildCreatives(ad.creatives)
      };
    }

    /**
     * Build an Advertiser node object
     * @param {Object} advertiser An advertiser object
     * @returns {Object} An Advertiser node
     */
  }, {
    key: "buildAdvertiser",
    value: function buildAdvertiser(advertiser) {
      if (!advertiser || !advertiser.value) {
        return null;
      }
      return {
        '@id': advertiser.id || null,
        '#': advertiser.value
      };
    }

    /**
     * Build a Pricing node object
     * @param {Object} pricing A pricing object
     * @returns {Object} A Pricing node
     */
  }, {
    key: "buildPricing",
    value: function buildPricing(pricing) {
      if (!pricing || !pricing.value) {
        return null;
      }
      return {
        '@model': pricing.model,
        '@currency': pricing.currency,
        '#': this.wrapCDATA(pricing === null || pricing === void 0 ? void 0 : pricing.value)
      };
    }

    /**
     * Build a Survey node object
     * @param {Object} survey A survey object
     * @returns {Object} A Pricing node
     */
  }, {
    key: "buildSurvey",
    value: function buildSurvey(survey) {
      if (!survey) {
        return null;
      }
      return {
        // '@type': '', Not supported by VAST-Client and deprecated
        '#': this.wrapCDATA(survey)
      };
    }

    /**
     * Build a ViewableImpression node object
     * @param {Object} viewableImpression A viewableImpression object
     * @returns {Object} A ViewableImpression node
     */
  }, {
    key: "buildViewableImpression",
    value: function buildViewableImpression(viewableImpression) {
      if (!viewableImpression) {
        return null;
      }
      return {
        '@id': viewableImpression.id,
        'Viewable': this.wrapCDATA(viewableImpression.viewable),
        'NotViewable': this.wrapCDATA(viewableImpression.notviewable),
        'ViewUndetermined': this.wrapCDATA(viewableImpression.viewundetermined)
      };
    }

    /**
     * Build a AdVerifications node object
     * @param {Array[Object]} adVerifications An array of adVerification objects
     * @returns {Object} An AdVerifications node
     */
  }, {
    key: "buildAdVerifications",
    value: function buildAdVerifications(adVerifications) {
      var _this3 = this;
      if (!adVerifications) {
        return null;
      }
      return {
        'Verification': adVerifications.map(function (adVerification) {
          return _objectSpread2({
            '@vendor': adVerification.vendor,
            'TrackingEvents': _this3.buildTrackingEvents(adVerification.trackingEvents),
            'VerificationParameters': _this3.wrapCDATA(adVerification.parameters)
          }, _this3.buildResource(adVerification));
        })
      };
    }

    /**
     * Build either a ExecutableResource or JavaScriptResource node object
     * @param {Object} adVerification An adVerification objects
     * @returns {Object} Either a ExecutableResource or JavaScriptResource node
     */
  }, {
    key: "buildResource",
    value: function buildResource(adVerification) {
      // Can't determine if it's a ExecutableResource or JavaScriptResource from the parsed Object
      // So I need to rely on the attributes

      var resource = null;
      // Type or language are specific to ExecutableResource.
      // VAST-Client doesn't currently support language parameter so it will always go to the next statement
      if (adVerification.language) {
        resource = {
          'ExecutableResource': {
            '@apiFramework': adVerification.apiFramework,
            '@language': adVerification.language,
            '#': this.wrapCDATA(adVerification.resource)
          }
        };
      }
      // Otherwise consider its a JavaScriptResource
      else {
        resource = {
          'JavaScriptResource': {
            '@apiFramework': adVerification.apiFramework,
            '@browserOptional': adVerification.browserOptional,
            '#': this.wrapCDATA(adVerification.resource)
          }
        };
      }
      return resource;
    }

    /**
     * Build a TrackingEvents node object
     * @param {Object} events An event object
     * @returns {Object} A Tracking node with all provided events
     */
  }, {
    key: "buildTrackingEvents",
    value: function buildTrackingEvents(events) {
      var _this4 = this;
      var trackingArray = [];
      Object.entries(events).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          urls = _ref2[1];
        // Some event have the offset append to the name (ie: progress-15)
        // We need to split it in order to put them in the right place
        var event = key.split('-');
        trackingArray = trackingArray.concat(urls.map(function (url) {
          return {
            '@event': event[0],
            '@offset': _this4.convertToHHMMSS(event[1]),
            '#': _this4.wrapCDATA(url)
          };
        }));
      });
      return {
        'Tracking': trackingArray
      };
    }

    /**
     * Build a Extensions node
     * @param {Array[Object]} extensions An array of extension objects
     * @returns {Object} An array of Extension nodes
     */
  }, {
    key: "buildExtensions",
    value: function buildExtensions(extensions) {
      var _this5 = this;
      return {
        'Extension': extensions.map(function (extension) {
          return _this5.buildExtension(extension);
        })
      };
    }

    /**
     * Build a single Extension node
     * @param {Object} extension An extension object
     * @returns {Object} An Extension node
     */
  }, {
    key: "buildExtension",
    value: function buildExtension(extension) {
      var _this6 = this;
      var ext = {};
      if (extension.value !== null) {
        ext['#'] = this.wrapCDATA(extension.value);
      }
      Object.entries(extension.attributes).forEach(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
          key = _ref4[0],
          value = _ref4[1];
        ext["@".concat(key)] = value;
      });
      extension.children.forEach(function (child) {
        if (!ext[child.name]) {
          ext[child.name] = [];
        }
        ext[child.name].push(_this6.buildExtension(child));
      });
      return ext;
    }

    /**
     * Build Creative nodes
     * @param {Array[Object]} creatives An array of creative objects
     * @returns {Object} An array of Creative nodes
     */
  }, {
    key: "buildCreatives",
    value: function buildCreatives(creatives) {
      var _this7 = this;
      return {
        'Creative': creatives.map(function (creative) {
          return _objectSpread2({
            '@id': creative.id,
            '@sequence': creative.sequence,
            '@adId': creative.adId,
            '@apiFramework': creative.apiFramework,
            'CreativeExtensions': _this7.buildCreativeExtensions(creative.creativeExtensions),
            'UniversalAdId': _this7.buildUniversalAdId(creative.universalAdIds)
          }, _this7.buildCreativeByType(creative));
        })
      };
    }

    /**
     * Build UniversalAdI node
     * @param {Array<Object>} universalAdIds A universalAdId object array
     * @returns {Array<Object> | null} An UniversalAdId node array
     */
  }, {
    key: "buildUniversalAdId",
    value: function buildUniversalAdId(universalAdIds) {
      if (!universalAdIds.length) {
        return null;
      }
      return universalAdIds.map(function (universalAdId) {
        return {
          "@idRegistry": universalAdId.idRegistry,
          "#": universalAdId.value
        };
      });
    }

    /**
     * Build CreativeExtension nodes
     * @param {Array[Object]} creativeExtensions An array of creativeExtensions objects
     * @returns {Object} An array of CreativeExtension nodes
     */
  }, {
    key: "buildCreativeExtensions",
    value: function buildCreativeExtensions(creativeExtensions) {
      var _this8 = this;
      if (!creativeExtensions) {
        return null;
      }
      return {
        'CreativeExtension': creativeExtensions.map(function (creativeExtension) {
          return _this8.buildExtension(creativeExtension);
        })
      };
    }

    /**
     * Build Creative node from it's type
     * @param {Object} creative A creative object
     * @returns {Object} Either a Linear, NonLinearAds, CompanionAds node
     */
  }, {
    key: "buildCreativeByType",
    value: function buildCreativeByType(creative) {
      switch (creative.type) {
        case 'linear':
          return {
            'Linear': this.buildLinear(creative)
          };
        case 'nonlinear':
          return {
            'NonLinearAds': this.buildNonLinearAds(creative)
          };
        case 'companion':
          return {
            '@required': creative.required,
            'CompanionAds': this.buildCompanionAds(creative)
          };
      }
    }

    /**
     * Build Linear node from creative
     * @param {Object} creative A creative object
     * @returns {Object} A Linear node
     */
  }, {
    key: "buildLinear",
    value: function buildLinear(creative) {
      return {
        '@skipoffset': this.convertToHHMMSS(creative.skipDelay),
        'Duration': this.convertToHHMMSS(creative.duration),
        'AdParameters': creative.adParameters ? this.buildAdParameters(creative.adParameters.value, creative.adParameters.xmlEncoded) : null,
        'MediaFiles': this.buildMediafiles(creative.mediaFiles, creative.mezzanine, creative.interactiveCreativeFile, creative.closedCaptionFiles),
        'VideoClicks': this.buildVideoClicks(creative.videoClickThroughURLTemplate, creative.videoClickTrackingURLTemplates, creative.videoCustomClickURLTemplates),
        'TrackingEvents': this.buildTrackingEvents(creative.trackingEvents),
        'Icons': this.buildIcons(creative.icons)
      };
    }

    /**
     * Build AdParameters node
     * @param {String} adParameters The adParameters string
     * @param {Boolean} xmlEncoded The xmlEncoded parameter
     * @returns {Object} A AdParameters node
     */
  }, {
    key: "buildAdParameters",
    value: function buildAdParameters(adParameters) {
      var xmlEncoded = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      if (!adParameters) {
        return null;
      }
      return {
        '@xmlEncoded': xmlEncoded,
        '#': this.wrapCDATA(adParameters)
      };
    }

    /**
     * Build staticResource node
     * @param {String} staticResource The staticResource string
     * @param {String} creativeType The creativeType parameter
     * @returns {Object} A staticResource node
     */
  }, {
    key: "buildStaticRessource",
    value: function buildStaticRessource(staticResource, creativeType) {
      if (!staticResource) {
        return null;
      }
      return {
        '@creativeType': creativeType,
        '#': this.wrapCDATA(staticResource)
      };
    }

    /**
     * Build VideoClicks parameter node
     * @param {Object} clickThrough The clickThrough object
     * @param {Array[Object]} clickTrackings The array of clickTracking objects
     * @param {Array[Object]} customClicks The array of customClicks objects
     * @returns {Object} A VideoClicks node
     */
  }, {
    key: "buildVideoClicks",
    value: function buildVideoClicks(clickThrough, clickTrackings, customClicks) {
      var _this9 = this;
      var videoClicks = {};
      if (clickThrough) {
        var clickThroughObj = _typeof(clickThrough) === 'object' ? clickThrough : {
          url: clickThrough
        };
        videoClicks = _objectSpread2(_objectSpread2({}, videoClicks), {}, {
          'ClickThrough': {
            '@id': clickThroughObj.id,
            '#': this.wrapCDATA(clickThroughObj.url)
          }
        });
      }
      if (clickTrackings !== null && clickTrackings !== void 0 && clickTrackings.length) {
        videoClicks = _objectSpread2(_objectSpread2({}, videoClicks), {}, {
          'ClickTracking': clickTrackings.map(function (clickTracking) {
            return {
              '@id': clickTracking.id,
              '#': _this9.wrapCDATA(clickTracking.url)
            };
          })
        });
      }
      if (customClicks !== null && customClicks !== void 0 && customClicks.length) {
        videoClicks = _objectSpread2(_objectSpread2({}, videoClicks), {}, {
          'CustomClick': customClicks.map(function (customClick) {
            return {
              '@id': customClick.id,
              '#': _this9.wrapCDATA(customClick.url)
            };
          })
        });
      }
      return Object.keys(videoClicks).length ? videoClicks : null;
    }

    /**
     * Build Mediafiles node
     * @param {Array[Object]} mediaFiles The list of mediafiles objects
     * @param {Object} mezzanine The mezzanine object
     * @param {String} interactiveCreativeFile The interactiveCreativeFile object
     * @param {String} closedCaptionFiles The closedCaptionFiles object
     * @returns {Object} A Mediafiles node
     */
  }, {
    key: "buildMediafiles",
    value: function buildMediafiles(mediaFiles, mezzanine, interactiveCreativeFile, closedCaptionFiles) {
      var _this10 = this;
      var mediaFilesObject = {};
      if (mediaFiles) {
        mediaFilesObject = _objectSpread2(_objectSpread2({}, mediaFilesObject), {}, {
          'MediaFile': mediaFiles.map(function (mediaFile) {
            return {
              '@id': mediaFile.id,
              '@delivery': mediaFile.deliveryType,
              '@type': mediaFile.mimeType,
              '@bitrate': mediaFile.bitrate,
              '@minBitrate': mediaFile.minBitrate,
              '@maxBitrate': mediaFile.maxBitrate,
              '@width': mediaFile.width,
              '@height': mediaFile.height,
              '@scalable': mediaFile.scalable,
              '@mantainAspectRatio': mediaFile.maintainAspectRatio,
              '@codec': mediaFile.codec,
              '@apiFramework': mediaFile.apiFramework,
              '@fileSize': mediaFile.fileSize,
              '@mediaType': mediaFile.mediaType,
              '#': _this10.wrapCDATA(mediaFile.fileURL)
            };
          })
        });
      }
      if (mezzanine) {
        mediaFilesObject = _objectSpread2(_objectSpread2({}, mediaFilesObject), {}, {
          'Mezzanine': {
            '@delivery': mezzanine.delivery,
            '@type': mezzanine.type,
            '@width': mezzanine.width,
            '@height': mezzanine.height,
            '@codec': mezzanine.codec,
            '@id': mezzanine.id,
            '@fileSize': mezzanine.fileSize,
            '@mediaType': mezzanine.mediaType,
            '#': this.wrapCDATA(mezzanine.fileURL)
          }
        });
      }
      if (interactiveCreativeFile !== null && interactiveCreativeFile !== void 0 && interactiveCreativeFile.fileURL) {
        mediaFilesObject = _objectSpread2(_objectSpread2({}, mediaFilesObject), {}, {
          'InteractiveCreativeFile': {
            '@type': interactiveCreativeFile.type,
            '@apiFramework': interactiveCreativeFile.apiFramework,
            '@variableDuration': interactiveCreativeFile.variableDuration,
            '#': this.wrapCDATA(interactiveCreativeFile.fileURL)
          }
        });
      }
      if (closedCaptionFiles !== null && closedCaptionFiles !== void 0 && closedCaptionFiles.length) {
        mediaFilesObject = _objectSpread2(_objectSpread2({}, mediaFilesObject), {}, {
          'ClosedCaptionFiles': {
            'ClosedCaptionFile': closedCaptionFiles.map(function (closedCaptionFile) {
              return {
                '@type': closedCaptionFile.type,
                '@language': closedCaptionFile.language,
                '#': _this10.wrapCDATA(closedCaptionFile.fileURL)
              };
            })
          }
        });
      }
      return mediaFilesObject;
    }

    /**
     * Build Icons node. IconClickFallbackImages children not supported.
     * @param {Array[Object]} icons The list of icons objects
     * @returns {Object} A Icons node
     */
  }, {
    key: "buildIcons",
    value: function buildIcons(icons) {
      var _this11 = this;
      if (!(icons !== null && icons !== void 0 && icons.length)) {
        return null;
      }
      return {
        'Icon': icons.map(function (icon) {
          var staticResource = !icon.staticResource ? {} : {
            'StaticResource': {
              '@creativeType': icon.type,
              '#': _this11.wrapCDATA(icon.staticResource)
            }
          };
          return _objectSpread2({
            '@program': icon.program,
            '@width': icon.width,
            '@height': icon.height,
            '@xPosition': icon.xPosition,
            '@yPosition': icon.yPosition,
            '@duration': _this11.convertToHHMMSS(icon.duration),
            '@offset': icon.offset,
            '@apiFramework': icon.apiFramework,
            '@pxratio': icon.pxratio,
            'IFrameResource': _this11.wrapCDATA(icon.iframeResource),
            'HTMLResource': _this11.wrapCDATA(icon.htmlResource),
            'IconClicks': {
              'IconClickThrough': _this11.wrapCDATA(icon.iconClickThroughURLTemplate),
              'IconClickTracking': icon.iconClickTrackingURLTemplates.map(function (iconClickTrackingURLTemplate) {
                return {
                  '@id': iconClickTrackingURLTemplate.id,
                  '#': _this11.wrapCDATA(iconClickTrackingURLTemplate.url)
                };
              })
              /* NonLinearClickTracking is not supported by the VAST-Client for the moment
               NonLinearClickTracking
              'IconClickFallbackImages': {
                'IconClickFallbackImage': icon.iconClickFallbackURLTemplates.map((iconClickFallbackURLTemplate) => {
                  return {
                    'AltText': iconClickFallbackURLTemplate.altText,
                    'StaticResource': this.wrapCDATA(iconClickFallbackURLTemplate.staticResource),
                  }
                })
              },*/
            },
            'IconViewTracking': _this11.wrapCDATA(icon.iconViewTrackingURLTemplate)
          }, staticResource);
        })
      };
    }

    /**
     * Build a NonLinearAds node object
     * @param {Object} creative A creative object
     * @returns {Object} A NonLinearAds node containing a list of NonLinear nodes
     */
  }, {
    key: "buildNonLinearAds",
    value: function buildNonLinearAds(creative) {
      var _this12 = this;
      return {
        'NonLinear': creative.variations.map(function (variation) {
          return {
            '@id': variation.id,
            '@width': variation.width,
            '@height': variation.height,
            '@expandedWidth': variation.expandedWidth,
            '@expandedHeight': variation.expandedHeight,
            '@scalable': variation.scalable,
            '@maintainAspectRatio': variation.maintainAspectRatio,
            '@minSuggestedDuration': _this12.convertToHHMMSS(variation.minSuggestedDuration),
            '@apiFramework': variation.apiFramework,
            'StaticResource': _this12.buildStaticRessource(variation.staticResource, variation.type),
            'HTMLResource': _this12.wrapCDATA(variation.htmlResources),
            'IFrameResource': _this12.wrapCDATA(variation.iframeResource),
            'AdParameters': _this12.buildAdParameters(variation.adParameters, variation.xmlEncoded),
            'NonLinearClickThrough': _this12.wrapCDATA(variation.nonlinearClickThroughURLTemplate),
            'NonLinearClickTracking': variation.nonlinearClickTrackingURLTemplates.map(function (nonlinearClickTrackingURLTemplate) {
              return _this12.wrapCDATA(nonlinearClickTrackingURLTemplate.url);
            })
          };
        }),
        'TrackingEvents': this.buildTrackingEvents(creative.trackingEvents)
      };
    }

    /**
     * Build a CompanionAds node object
     * @param {Object} creative A creative object
     * @returns {Object} A CompanionAds node containing a list of Companion nodes
     */
  }, {
    key: "buildCompanionAds",
    value: function buildCompanionAds(creative) {
      var _this13 = this;
      return {
        'Companion': creative.variations.map(function (variation) {
          return {
            '@id': variation.id,
            '@width': variation.width,
            '@height': variation.height,
            '@assetWidth': variation.assetWidth,
            '@expandedWidth': variation.expandedWidth,
            '@expandedHeight': variation.expandedHeight,
            '@apiFramework': variation.apiFramework,
            '@adSlotId': variation.adSlotId,
            '@pxratio': variation.pxratio,
            '@renderingMode': variation.renderingMode,
            'StaticResource': variation.staticResources.map(function (staticResources) {
              return {
                '@creativeType': staticResources.creativeType,
                '#': _this13.wrapCDATA(staticResources.url)
              };
            }),
            'IFrameResource': variation.htmlResources.map(function (htmlResource) {
              return _this13.wrapCDATA(htmlResource.url);
            }),
            'HTMLResource': variation.iframeResources.map(function (iframeResource) {
              return _this13.wrapCDATA(iframeResource.url);
            }),
            'AdParameters': _this13.buildAdParameters(variation.adParameters, variation.xmlEncoded),
            'AltText': variation.altText,
            'CompanionClickThrough': _this13.wrapCDATA(variation.companionClickThroughURLTemplate),
            'CompanionClickTracking': variation.companionClickTrackingURLTemplates.map(function (companionClickTrackingURLTemplate) {
              return {
                '@id': companionClickTrackingURLTemplate.id,
                '#': _this13.wrapCDATA(companionClickTrackingURLTemplate.url)
              };
            }),
            'TrackingEvents': _this13.buildTrackingEvents(variation.trackingEvents)
          };
        })
      };
    }

    /**
     * Convert given number into HH:MM:SS format
     * @param {String|Number} number The number to convert
     * @returns {String} The number on HH:MM:SS format
     */
  }, {
    key: "convertToHHMMSS",
    value: function convertToHHMMSS(number) {
      if (!number) {
        return null;
      }

      // Some values are in percentage, we don't need to convert them
      if (typeof number === 'string' && number.endsWith('%')) {
        return number;
      }
      var measuredTime = new Date(null);
      measuredTime.setSeconds(parseInt(number));
      return measuredTime.toISOString().substr(11, 8);
    }

    /**
     * Wrap given data into specific CDATA format for xmlbuilder2
     * @param {Any} data The data to wrap
     * @returns {Object} Specific CDATA wrapper for xmlbuilder2
     */
  }, {
    key: "wrapCDATA",
    value: function wrapCDATA(data) {
      if (data === null || data === undefined) {
        return null;
      }
      return {
        '$': data
      };
    }
  }]);
}();

module.exports = VASTClientSerializer;
