import ExpoModulesCore
import AVFoundation


struct ExtractionRequest: Record {
  @Field var videoUri: URL? = nil
  @Field var timestamps: [Double] = []
  @Field var quality: Double = 1.0
  @Field var format: String = "png"
}

struct VideoFrame: Record {
  @Field var uri: String = ""
  @Field var timestamp: Double = 0.0
  @Field var width: Int = 0
  @Field var height: Int = 0
}

public class VideoFrameExtractorModule: Module {
  public func definition() -> ModuleDefinition {
    Name("VideoFrameExtractor")

    AsyncFunction("extractVideoFrames") { (request: ExtractionRequest, promise: Promise) in
      guard let url = request.videoUri else {
        return promise.reject("ERR_INVALID_URI", "The provided video URI is null or invalid.")
      }

      let asset = AVAsset(url: url)
      let generator = AVAssetImageGenerator(asset: asset)
      
      // Precision settings
      // --- Quality Improvements ---
      generator.appliesPreferredTrackTransform = true
      generator.maximumSize = .zero // Force full-resolution extraction
      generator.requestedTimeToleranceBefore = .zero
      generator.requestedTimeToleranceAfter = .zero

      let times = request.timestamps.map { 
        NSValue(time: CMTime(seconds: $0 / 1000.0, preferredTimescale: 600)) 
      }

      var results: [VideoFrame] = []
      var processedCount = 0

      generator.generateCGImagesAsynchronously(forTimes: times) { requestedTime, cgImage, _, result, _ in
        processedCount += 1
        
        if let image = cgImage, result == .succeeded {
          let uiImg = UIImage(cgImage: image)
          let isPng = request.format.lowercased() == "png"
          
          // Save frame to temporary cache
          let data = isPng ? uiImg.pngData() : uiImg.jpegData(compressionQuality: CGFloat(request.quality))
          let ext = isPng ? "png" : "jpg"
          let fileUrl = self.appContext!.config.cacheDirectory!.appendingPathComponent("frame_\(UUID().uuidString).\(ext)")
          
          try? data?.write(to: fileUrl)

          // 2. Initializing the Record and setting properties
          var frame = VideoFrame()
          frame.uri = fileUrl.absoluteString
          frame.timestamp = requestedTime.seconds * 1000.0
          frame.width = Int(uiImg.size.width)
          frame.height = Int(uiImg.size.height)
          
          results.append(frame)
        }

        // Return resolved promise once all frames are handled
        if processedCount == times.count {
          promise.resolve(results.sorted(by: { $0.timestamp < $1.timestamp }))
        }
      }
    }
 
  
    // Enables the module to be used as a native view. Definition components that are accepted as part of the
    // view definition: Prop, Events.
    View(VideoFrameExtractorModuleView.self) {
      // Defines a setter for the `url` prop.
      Prop("url") { (view: VideoFrameExtractorModuleView, url: URL) in
        if view.webView.url != url {
          view.webView.load(URLRequest(url: url))
        }
      }

      Events("onLoad")
    }
  }
}



extension CMTime {
    init(milliseconds: Int64) {
        self.init(value: milliseconds, timescale: 1000)
    }
}

extension VideoFrame {
  func apply(_ block: (VideoFrame) -> Void) -> VideoFrame {
    block(self)
    return self
  }
}
