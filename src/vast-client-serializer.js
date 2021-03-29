import { create } from 'xmlbuilder2'

export default class VASTClientSerializer {

  /**
   * Serialize the given Vast-client parsed object into XML
   * For detail about the data structure to pass see
   * https://github.com/dailymotion/vast-client-js/blob/master/docs/api/class-reference.md
   * @param {Object} parsedVast The VAST-Client parsed VAST object
   * @returns Serialized VAST
   */
  serialize(parsedVast) {
    const doc = create({ encoding: 'UTF-8' }, this.buildVast(parsedVast))
    return doc.end({ format: 'xml' })
  }

  /**
   * Build the root VAST node object
   * @param {Object} parsedVast The VAST-Client parsed VAST object
   * @returns {Object} The VAST node
   */
  buildVast(parsedVast) {
    const ads = parsedVast.ads.map((ad) => {
      return this.buildAd(ad)
    })

    const errors = parsedVast.errorURLTemplates.map((errorUrl) => {
      return this.wrapCDATA(errorUrl)
    })

    return {
      'VAST': {
        '@version': parsedVast.version,
        'Error': errors,
        'Ad': ads,
      }
    }
  }

  /**
   * Build an Ad node object
   * @param {Object} ad An ad object
   * @returns {Object} An ad node
   */
  buildAd(ad) {
    return {
      '@id': ad.id,
      '@sequence': ad.sequence,
      // '@conditionalAd': no current support in vast-client
      '@adType': ad.adType,
      'Inline': this.buildInline(ad),
    }
  }

  /**
   * Build an Inline node object
   * @param {Object} ad An ad object
   * @returns {Object} An Inline node
   */
  buildInline(ad) {
    const impressions = ad.impressionURLTemplates.map((impressionTemplate) => {
      return {
        '@id': impressionTemplate.id,
        '#': this.wrapCDATA(impressionTemplate.url),
      }
    })

    const categories = ad.categories.map((category) => {
      return {
        '@authority': category.authority,
        '#': category.value,
      }
    })

    const errors = ad.errorURLTemplates.map((errorURLTemplate) => {
      return this.wrapCDATA(errorURLTemplate)
    })

    return {
      'AdSystem': {
        '@version': ad.system.version,
        '#': ad.system.value,
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
      'Creatives': this.buildCreatives(ad.creatives),
    }
  }

  /**
   * Build an Advertiser node object
   * @param {Object} advertiser An advertiser object
   * @returns {Object} An Inline node
   */
  buildAdvertiser(advertiser) {
    if (!advertiser || !advertiser.value) {
      return null
    }

    return {
      '@id': advertiser.id || null,
      '#': advertiser.value,
    }
  }

  /**
   * Build a Pricing node object
   * @param {Object} pricing A pricing object
   * @returns {Object} A Pricing node
   */
  buildPricing(pricing) {
    if (!pricing || !pricing.value) {
      return null
    }

    return {
      '@model': pricing.model,
      '@currency': pricing.currency,
      '#': this.wrapCDATA(pricing?.value),
    }
  }

  /**
   * Build a Survey node object
   * @param {Object} survey A survey object
   * @returns {Object} A Pricing node
   */
  buildSurvey(survey) {
    if (!survey) {
      return null
    }

    return {
      // '@type': '', Not supported by vast-client and deprecated
      '#': this.wrapCDATA(survey),
    }
  }

  /**
   * Build a ViewableImpression node object
   * @param {Object} viewableImpression A viewableImpression object
   * @returns {Object} A ViewableImpression node
   */
  buildViewableImpression(viewableImpression) {
    if (!viewableImpression) {
      return null
    }

    return {
      '@id': viewableImpression.id,
      'Viewable': this.wrapCDATA(viewableImpression.viewable),
      'NotViewable': this.wrapCDATA(viewableImpression.notviewable),
      'ViewUndetermined': this.wrapCDATA(viewableImpression.viewundetermined),
    }
  }

  /**
   * Build a AdVerifications node object
   * @param {Array[Object]} adVerifications An array of adVerification objects
   * @returns {Object} An AdVerifications node
   */
  buildAdVerifications(adVerifications) {
    if (!adVerifications) {
      return null
    }

    return {
      'Verification': adVerifications.map((adVerification) => {
        return {
          '@vendor': adVerification.vendor,
          'TrackingEvents': this.buildTrackingEvents(adVerification.trackingEvents),
          'VerificationParameters': this.wrapCDATA(adVerification.parameters),
          ...this.buildResource(adVerification)
        }
      })
    }
  }

  /**
   * Build either a ExecutableResource or JavaScriptResource node object
   * @param {Object} adVerification An adVerification objects
   * @returns {Object} Either a ExecutableResource or JavaScriptResource node
   */
  buildResource(adVerification) {
    // Can't determine if it's a ExecutableResource or JavaScriptResource from the parsed Object
    // So I need to rely on the attributes

    let resource = null
    // Type or language are specific to ExecutableResource.
    // Vast-client doesn't currently support language parameter so it will always go to the next statement
    if (adVerification.language) {
      resource = {
        'ExecutableResource': {
          '@apiFramework': adVerification.apiFramework,
          '@language': adVerification.language,
          '#': this.wrapCDATA(adVerification.resource),
        }
      }
    }
    // Otherwise consider its a JavaScriptResource
    else {
      resource = {
        'JavaScriptResource': {
          '@apiFramework': adVerification.apiFramework,
          '@browserOptional': adVerification.browserOptional,
          '#': this.wrapCDATA(adVerification.resource),
        }
      }
    }

    return resource
  }

  /**
   * Build a TrackingEvents node object
   * @param {Object} events An event object
   * @returns {Object} A Tracking node with all provided events
   */
  buildTrackingEvents(events) {
    let trackingArray = []
    Object.entries(events).forEach(([key, urls]) => {
      const event = key.split('-')
      trackingArray = trackingArray.concat(urls.map((url) => {
        return {
          '@event': event[0],
          '@offset': this.convertToHHMMSS(event[1]),
          '#': this.wrapCDATA(url),
        }
      }))
    })
    return {
      'Tracking': trackingArray
    }
  }

  /**
   * Build a Extensions node
   * @param {Array[Object]} extensions An array of extension objects
   * @returns {Object} An array of Extension nodes
   */
  buildExtensions(extensions) {
    return {
      'Extension': extensions.map((extension) => this.buildExtension(extension))
    }
  }

  /**
   * Build a single Extension node
   * @param {Object} extension An extension object
   * @returns {Object} An Extension node
   */
  buildExtension(extension) {
    const ext = {}

    if (extension.value !== null) {
      ext['#'] = this.wrapCDATA(extension.value)
    }

    Object.entries(extension.attributes).forEach(([key, value]) => {
      ext[`@${key}`] = value
    })

    extension.children.forEach((child) => {
      if (!ext[child.name]) {
        ext[child.name] = []
      }

      ext[child.name].push(this.buildExtension(child))
    })

    return ext
  }

  /**
   * Build Creative nodes
   * @param {Array[Object]} creatives An array of creative objects
   * @returns {Object} An array of Creative nodes
   */
  buildCreatives(creatives) {
    return {
      'Creative': creatives.map((creative) => {
        return {
          '@id': creative.id,
          '@sequence': creative.sequence,
          '@adId': creative.adId,
          '@apiFramework': creative.apiFramework,
          'CreativeExtensions': this.buildCreativeExtensions(creative.creativeExtensions),
          ...this.buildUniversalAdId(creative.universalAdId),
          ...this.buildCreativeByType(creative)
        }
      }),
    }
  }

  /**
   * Build UniversalAdI node
   * @param {Object} universalAdId A universalAdId object
   * @returns {Object} An UniversalAdI node
   */
  buildUniversalAdId(universalAdId) {
    if (!universalAdId) {
      return {}
    }

    return {
      'UniversalAdId': {
        '@idRegistry': universalAdId.idRegistry,
        '#': universalAdId.value,
      }
    }
  }

  /**
   * Build CreativeExtension nodes
   * @param {Array[Object]} creativeExtensions An array of creativeExtensions objects
   * @returns {Object} An array of CreativeExtension nodes
   */
  buildCreativeExtensions(creativeExtensions) {
    if (!creativeExtensions) {
      return null
    }

    return {
      'CreativeExtension': creativeExtensions.map(
        (creativeExtension) => this.buildExtension(creativeExtension)
      ),
    }
  }

  /**
   * Build Creative node from it's type
   * @param {Object} creative A creative object
   * @returns {Object} Either a Linear, NonLinearAds, CompanionAds node
   */
  buildCreativeByType(creative) {
    switch (creative.type) {
      case 'linear':
        return {
          'Linear': this.buildLinear(creative)
        }
      case 'nonlinear':
        return {
          'NonLinearAds': this.buildNonLinearAds(creative)
        }
      case 'companion':
        return {
          '@required': creative.required,
          'CompanionAds': this.buildCompanionAds(creative)
        }
    }
  }

  /**
   * Build Linear node from creative
   * @param {Object} creative A creative object
   * @returns {Object} A Linear node
   */
  buildLinear(creative) {
    return {
      '@skipoffset': this.convertToHHMMSS(creative.skipDelay),
      'Duration': this.convertToHHMMSS(creative.duration),
      'AdParameters': this.buildAdParameters(creative.adParameters),
      'MediaFiles': this.buildMediafiles(
        creative.mediaFiles,
        creative.mezzanine,
        creative.interactiveCreativeFile,
        creative.closedCaptionFiles
      ),
      'VideoClicks': this.buildVideoClicks(
        creative.videoClickThroughURLTemplate,
        creative.videoClickTrackingURLTemplates,
        creative.videoCustomClickURLTemplates,
      ),
      'TrackingEvents': this.buildTrackingEvents(creative.trackingEvents),
      'Icons': this.buildIcons(creative.icons),
    }
  }

  /**
   * Build AdParameters node
   * @param {String} adParameters The adParameters string
   * @param {Boolean} xmlEncoded The xmlEncoded parameter
   * @returns {Object} A AdParameters node
   */
  buildAdParameters(adParameters, xmlEncoded = null) {
    if (!adParameters) {
      return null
    }

    return {
      '@xmlEncoded': xmlEncoded,
      '#': this.wrapCDATA(adParameters),
    }
  }

  /**
   * Build VideoClicks parameter node
   * @param {Object} clickThrough The clickThrough object
   * @param {Array[Object]} clickTrackings The array of clickTracking objects
   * @param {Array[Object]} customClicks The array of customClicks objects
   * @returns {Object} A VideoClicks node
   */
  buildVideoClicks(clickThrough, clickTrackings, customClicks) {
    let videoClicks = {}

    if (clickThrough) {
      videoClicks = {
        ...videoClicks,
        'ClickThrough': {
          '@id': clickThrough.id,
          '#': this.wrapCDATA(clickThrough.url),
        }
      }
    }

    if (clickTrackings?.length) {
      videoClicks = {
        ...videoClicks,
        'ClickTracking': clickTrackings.map((clickTracking) => {
          return {
            '@id': clickTracking.id,
            '#': this.wrapCDATA(clickTracking.url),
          }
        })
      }
    }

    if (customClicks?.length) {
      videoClicks = {
        ...videoClicks,
        'CustomClick': customClicks.map((customClick) => {
          return {
            '@id': customClick.id,
            '#': this.wrapCDATA(customClick.url),
          }
        })
      }
    }
    return Object.keys(videoClicks).length ? videoClicks : null
  }

  /**
   * Build Mediafiles node
   * @param {Array[Object]} mediaFiles The list of mediafiles objects
   * @param {Object} mezzanine The mezzanine object
   * @param {String} interactiveCreativeFile The interactiveCreativeFile object
   * @param {String} closedCaptionFiles The closedCaptionFiles object
   * @returns {Object} A Mediafiles node
   */
  buildMediafiles(mediaFiles, mezzanine, interactiveCreativeFile, closedCaptionFiles) {
    let mediaFilesObject = {}

    if (mediaFiles) {
      mediaFilesObject = {
        ...mediaFilesObject,
        'MediaFile': mediaFiles.map((mediaFile) => {
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
            '#': this.wrapCDATA(mediaFile.fileURL),
          }
        })
      }
    }

    if (mezzanine) {
      mediaFilesObject = {
        ...mediaFilesObject,
        'Mezzanine': {
          '@delivery': mezzanine.delivery,
          '@type': mezzanine.type,
          '@width': mezzanine.width,
          '@height': mezzanine.height,
          '@codec': mezzanine.codec,
          '@id': mezzanine.id,
          '@fileSize': mezzanine.fileSize,
          '@mediaType': mezzanine.mediaType,
          '#': this.wrapCDATA(mezzanine.fileURL),
        }
      }
    }

    if (interactiveCreativeFile?.fileURL) {
      mediaFilesObject = {
        ...mediaFilesObject,
        'InteractiveCreativeFile': {
          '@type': interactiveCreativeFile.type,
          '@apiFramework': interactiveCreativeFile.apiFramework,
          '@variableDuration': interactiveCreativeFile.variableDuration,
          '#': this.wrapCDATA(interactiveCreativeFile.fileURL),
        }
      }
    }

    if (closedCaptionFiles?.length) {
      mediaFilesObject = {
        ...mediaFilesObject,
        'ClosedCaptionFiles': {
          'ClosedCaptionFile': closedCaptionFiles.map((closedCaptionFile) => {
            return {
              '@type': closedCaptionFile.type,
              '@language': closedCaptionFile.language,
              '#': this.wrapCDATA(closedCaptionFile.fileURL),
            }
          })
        }
      }
    }

    return mediaFilesObject
  }

  /**
   * Build Icons node. IconClickFallbackImages children not supported.
   * @param {Array[Object]} icons The list of icons objects
   * @returns {Object} A Icons node
   */
  buildIcons(icons) {
    if (!icons?.length) {
      return null
    }

    return {
      'Icon': icons.map((icon) => {
        const staticResource = !icon.staticResource ? {} : {
          'StaticResource': {
            '@creativeType': icon.type,
            '#': this.wrapCDATA(icon.staticResource),
          },
        }

        return {
          '@program': icon.program,
          '@width': icon.width,
          '@height': icon.height,
          '@xPosition': icon.xPosition,
          '@yPosition': icon.yPosition,
          '@duration': this.convertToHHMMSS(icon.duration),
          '@offset': icon.offset,
          '@apiFramework': icon.apiFramework,
          '@pxratio': icon.pxratio,
          'IFrameResource': this.wrapCDATA(icon.iframeResource),
          'HTMLResource': this.wrapCDATA(icon.htmlResource),
          'IconClicks': {
            'IconClickThrough': this.wrapCDATA(icon.iconClickThroughURLTemplate),
            'IconClickTracking': icon.iconClickTrackingURLTemplates.map((iconClickTrackingURLTemplate) => {
              return {
                '@id': iconClickTrackingURLTemplate.id,
                '#': this.wrapCDATA(iconClickTrackingURLTemplate.url), // TODO verify
              }
            }),
            /* NonLinearClickTracking
            'IconClickFallbackImages': {
              'IconClickFallbackImage': icon.iconClickFallbackURLTemplates.map((iconClickFallbackURLTemplate) => {
                return {
                  'AltText': iconClickFallbackURLTemplate.altText,
                  'StaticResource': this.wrapCDATA(iconClickFallbackURLTemplate.staticResource),
                }
              })
            },*/
          },
          'IconViewTracking': this.wrapCDATA(icon.iconViewTrackingURLTemplate),
          ...staticResource,
        }
      })
    }
  }

  /**
   * Build a NonLinearAds node object
   * @param {Object} creative A creative object
   * @returns {Object} A NonLinearAds node containing a list of NonLinear nodes
   */
  buildNonLinearAds(creative) {
    return {
      'NonLinear': creative.variations.map((variation) => {
        return {
          '@id': variation.id,
          '@width': variation.width,
          '@height': variation.height,
          '@expandedWidth': variation.expandedWidth,
          '@expandedHeight': variation.expandedHeight,
          '@scalable': variation.scalable,
          '@maintainAspectRatio': variation.maintainAspectRatio,
          '@minSuggestedDuration': this.convertToHHMMSS(variation.minSuggestedDuration),
          '@apiFramework': variation.apiFramework,
          'StaticResource': this.wrapCDATA(variation.staticResource),
          'HTMLResource': this.wrapCDATA(variation.htmlResources),
          'IFrameResource': this.wrapCDATA(variation.iframeResource),
          'NonLinearClickThrough': this.wrapCDATA(variation.nonlinearClickThroughURLTemplate),
          'NonLinearClickTracking': variation.nonlinearClickTrackingURLTemplates.map((nonlinearClickTrackingURLTemplate) => {
            return this.wrapCDATA(nonlinearClickTrackingURLTemplate.url)
          }),
        }
      }),
      'TrackingEvents': this.buildTrackingEvents(creative.trackingEvents),
    }
  }

  /**
   * Build a CompanionAds node object
   * @param {Object} creative A creative object
   * @returns {Object} A CompanionAds node containing a list of Companion nodes
   */
  buildCompanionAds(creative) {
    return {
      'Companion': creative.variations.map((variation) => {
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
          'StaticResource': variation.staticResources.map((staticResources) => {
            return {
              '@creativeType': staticResources.creativeType,
              '#': this.wrapCDATA(staticResources.url),
            }
          }),
          'IFrameResource': variation.htmlResources.map((htmlResource) => {
            return this.wrapCDATA(htmlResource.url)
          }),
          'HTMLResource': variation.iframeResources.map((iframeResource) => {
            return this.wrapCDATA(iframeResource.url)
          }),
          'AdParameters': this.buildAdParameters(variation.adParameters, variation.xmlEncoded),
          'AltText': variation.altText,
          'CompanionClickThrough': this.wrapCDATA(variation.companionClickThroughURLTemplate),
          'CompanionClickTracking': variation.companionClickTrackingURLTemplates.map((companionClickTrackingURLTemplate) => {
            return {
              '@id': companionClickTrackingURLTemplate.id,
              '#': this.wrapCDATA(companionClickTrackingURLTemplate.url),
            }
          }),
          'TrackingEvents': this.buildTrackingEvents(variation.trackingEvents),
        }
      })
    }
  }

  /**
   * Convert given number into HH:MM:SS format
   * @param {String|Number} number The number to convert
   * @returns {String} The number on HH:MM:SS format
   */
  convertToHHMMSS(number) {
    if (!number) {
      return null
    }

    const measuredTime = new Date(null)
    measuredTime.setSeconds(parseInt(number))
    return measuredTime.toISOString().substr(11, 8)
  }

  /**
   * Wrap given data into specific CDATA format for xmlbuilder2
   * @param {Any} data The data to wrap
   * @returns {Object} Specific CDATA wrapper for xmlbuilder2
   */
  wrapCDATA(data) {
    if (data === null || data === undefined) {
      return null
    }

    return {
      '$': data,
    }
  }
}
