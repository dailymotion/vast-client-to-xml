import {AD_STRUCTURE, CREATIVE_TYPES, TRACKING_EVENTS} from './consts';

import VASTBuilder from 'vast-xml';

export default class VASTXmlConverter {

  attachMediaFiles(vastBuilderCreative, mediaFiles) {
    mediaFiles.forEach((file) => {
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

  parseEventDuration(eventName) {
    return parseInt(eventName.match(/\d+/));
  }

  formatDuration(duration) {
    // TODO: implement proper formatting for minutes and hours
    return `00:00:${duration}`;
  }

  addTrackingEvent(vastBuilderCreative, eventName, urls) {
    urls.forEach(url => {
      const duration = this.parseEventDuration(eventName);

      if (duration) {
        vastBuilderCreative.attachTrackingEvent(TRACKING_EVENTS.PROGRESS, url, this.formatDuration(duration));
      } else {
        vastBuilderCreative.attachTrackingEvent(eventName, url);
      }
    });
  }

  attachTrackingEvents(creative, trackingEvents) {
    Object.entries(trackingEvents).forEach(([name, urls]) => {
      this.addTrackingEvent(creative, name, urls);
    });
  }

  attachCreatives(vastBuilderAd, creatives) {
    creatives.forEach(creative => {
      const vastBuilderCreative = vastBuilderAd.attachCreative(CREATIVE_TYPES.LINEAR, {
        Duration: this.formatDuration(creative.duration),
        AdParameters: creative.adParameters
      });

      this.attachMediaFiles(vastBuilderCreative, creative.mediaFiles);
      this.attachTrackingEvents(vastBuilderCreative, creative.trackingEvents);
    });
  }

  attachImpressionsUrls(vastBuilderAd, impressionsUrls = []) {
    impressionsUrls.forEach((url, index) => {
      // TODO: Impression ID should be changed to unique value provided by vast-client
      vastBuilderAd.attachImpression({ id: index, url });
    });
  }

  attachAds(builder, ads) {
    ads.forEach(ad => {
      const [errorUrl] = ad.errorURLTemplates;

      const vastBuilderAd = builder.attachAd({
        id: ad.id,
        structure: AD_STRUCTURE,
        sequence: ad.sequence,
        Error: errorUrl,
        AdTitle: ad.title,
        AdSystem: {
          name: ad.system.value,
          version: ad.system.version
        }
      });


      this.attachImpressionsUrls(vastBuilderAd, ad.impressionURLTemplates)
      this.attachCreatives(vastBuilderAd, ad.creatives);
    });
  }

  convert(vastClientResponse) {
    const { ads } = vastClientResponse;
    const builder = new VASTBuilder();

    this.attachAds(builder, ads);

    return builder.xml();
  }
}
