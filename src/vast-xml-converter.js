import VASTBuilder from 'vast-xml';

export default class VASTXmlConverter {

  attachMediaFiles(vastClientCreative, mediaFiles) {
    mediaFiles.forEach((file) => {
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

  attachCreatives(vastClientAd, creatives) {
    creatives.forEach(creative => {
      const vastClientCreative = vastClientAd.attachCreative('Linear', {
        Duration: `00:00:${creative.duration}`
      });

      this.attachMediaFiles(vastClientCreative, creative.mediaFiles);
    });
  }

  attachAds(builder, ads) {
    ads.forEach(ad => {
      const vastAd = builder.attachAd({
        id: ad.id,
        structure: 'inline',
        sequence: ad.sequence,
        Error: 'http://error.err',
        AdTitle: ad.title,
        AdSystem: { name: 'Test Ad Server', version: '1.0' }
      });

      this.attachCreatives(vastAd, ad.creatives);
    });
  }

  convert(ads) {
    const builder = new VASTBuilder();

    this.attachAds(builder, ads);

    return builder.xml();
  }
}
