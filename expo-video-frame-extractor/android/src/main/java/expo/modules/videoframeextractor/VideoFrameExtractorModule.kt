package expo.modules.videoframeextractor

import android.graphics.Bitmap
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL 
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import java.io.File
import java.io.FileOutputStream
import java.util.*

 

class VideoFrameExtractorModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('VideoFrameExtractor')` in JavaScript.
    Name("VideoFrameExtractor")

    // Defines constant property on the module.
    Constant("PI") {
      Math.PI
    }

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      "Hello world! 👋"
    }

    AsyncFunction("extractVideoFrames") { request: ExtractionRequest ->
            val retriever = MediaMetadataRetriever()
            val results = mutableListOf<VideoFrame>()
            val context = appContext.reactContext ?: throw Exception("React context is unavailable")

            try {
                // Use the URI from the record
                val uri = Uri.parse(request.videoUri)
                retriever.setDataSource(context, uri)

                // 1. Get original video dimensions to prevent blurry thumbnails
                val originalWidth = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toInt() ?: 0
                val originalHeight = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toInt() ?: 0

                for (timeMs in request.timestamps) {
                    val timeUs = (timeMs * 1000).toLong()
                    
                    // Native extraction at the specific timestamp
                    // 2. High-Quality Extraction Logic
                    val bitmap = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1 && originalWidth > 0) {
                        retriever.getScaledFrameAtTime(timeUs, MediaMetadataRetriever.OPTION_CLOSEST, originalWidth, originalHeight)
                    } else {
                        retriever.getFrameAtTime(timeUs, MediaMetadataRetriever.OPTION_CLOSEST)
                    } ?: continue

                    // Determine file extension and format
                    val isPng = request.format.lowercase() == "png"
                    val extension = if (isPng) "png" else "jpg"
                    val file = File(context.cacheDir, "frame_${UUID.randomUUID()}.$extension")

                    val qualityInt = (request.quality * 100).toInt().coerceIn(0,100)
                    
                    FileOutputStream(file).use { out ->
                        val compressFormat = if (isPng) {
                            Bitmap.CompressFormat.PNG 
                        } else {
                            Bitmap.CompressFormat.JPEG
                        }
                        bitmap.compress(compressFormat, qualityInt, out)
                    }

                    results.add(
                        VideoFrame(
                            uri = Uri.fromFile(file).toString(),
                            timestamp = timeMs,
                            width = bitmap.width,
                            height = bitmap.height
                        )
                    )
                }
            } catch (e: Exception) {
                throw Exception("Failed to extract frames: ${e.localizedMessage}")
            } finally {
                retriever.release()
            }

            return@AsyncFunction results
    }
    

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(VideoFrameExtractorModuleView::class) {
      // Defines a setter for the `url` prop.
      Prop("url") { view: VideoFrameExtractorModuleView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      // Defines an event that the view can send to JavaScript.
      Events("onLoad")
    }
  }
}

// Data class for Expo Module auto-serialization
// 1. Must implement 'Record'
// 2. Must use 'var' (mutable) properties
// 3. Must use '@Field' annotation
// 4. Move fields into the primary constructor
// 5. Keep default values so it satisfies the Record interface requirements
class ExtractionRequest(
    @Field var timestamps: List<Double> = emptyList(),
    @Field var videoUri: String = "",
    @Field var quality: Double = 1.0,
    @Field var format: String = "png"
) : Record

class VideoFrame(
    @Field var uri: String = "",
    @Field var timestamp: Double = 0.0,
    @Field var width: Int = 0,
    @Field var height: Int = 0
) : Record