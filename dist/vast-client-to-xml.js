'use strict';

var xmlbuilder2 = require('xmlbuilder2');

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

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
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

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var VASTClientSerializer = /*#__PURE__*/function () {
  function VASTClientSerializer() {
    _classCallCheck(this, VASTClientSerializer);
  }

  _createClass(VASTClientSerializer, [{
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
      var resource = null; // Type or language are specific to ExecutableResource.
      // VAST-Client doesn't currently support language parameter so it will always go to the next statement

      if (adVerification.language) {
        resource = {
          'ExecutableResource': {
            '@apiFramework': adVerification.apiFramework,
            '@language': adVerification.language,
            '#': this.wrapCDATA(adVerification.resource)
          }
        };
      } // Otherwise consider its a JavaScriptResource
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
          return _objectSpread2(_objectSpread2({
            '@id': creative.id,
            '@sequence': creative.sequence,
            '@adId': creative.adId,
            '@apiFramework': creative.apiFramework,
            'CreativeExtensions': _this7.buildCreativeExtensions(creative.creativeExtensions)
          }, _this7.buildUniversalAdId(creative.universalAdId)), _this7.buildCreativeByType(creative));
        })
      };
    }
    /**
     * Build UniversalAdI node
     * @param {Object} universalAdId A universalAdId object
     * @returns {Object} An UniversalAdI node
     */

  }, {
    key: "buildUniversalAdId",
    value: function buildUniversalAdId(universalAdId) {
      if (!universalAdId) {
        return {};
      }

      return {
        'UniversalAdId': {
          '@idRegistry': universalAdId.idRegistry,
          '#': universalAdId.value
        }
      };
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
        'AdParameters': this.buildAdParameters(creative.adParameters),
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
        var clickThroughObj = clickThrough === Object ? clickThrough : {
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
            'StaticResource': _this12.wrapCDATA(variation.staticResource),
            'HTMLResource': _this12.wrapCDATA(variation.htmlResources),
            'IFrameResource': _this12.wrapCDATA(variation.iframeResource),
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

  return VASTClientSerializer;
}();

module.exports = VASTClientSerializer;
