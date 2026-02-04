import { NativeModule, requireNativeModule } from 'expo-modules-core';

/**
 * Options for the frame extraction process.
 */
export type ExtractionRequest = {
  /**
   * URI of the video file (e.g., 'file://...', 'content://...', or a remote URL).
   */
  videoUri: string;
  /**
   * Array of timestamps in milliseconds where frames should be captured.
   */
  timestamps: number[];
  /**
   * Quality of the output image. Range: 0.0 to 1.0 (for JPEG) or 0 to 100 (for Android quality).
   * Default is 1.0.
   */
  quality?: number;
  /**
   * Output image format.
   * Default is 'png'.
   */
  format?: 'png' | 'jpeg';
};

/**
 * Represents a single extracted frame.
 */
export type VideoFrame = {
  /**
   * Local file URI to the generated PNG/JPEG image.
   */
  uri: string;
  /**
   * The actual timestamp (in ms) where the frame was captured.
   */
  timestamp: number;
  /**
   * Width of the extracted image in pixels.
   */
  width: number;
  /**
   * Height of the extracted image in pixels.
   */
  height: number;
};

// Interface representing the native module structure
interface VideoFrameExtractorModule extends NativeModule {
  extractFrames(request: ExtractionRequest): Promise<VideoFrame[]>;
}

// Link the native module
const module = requireNativeModule<VideoFrameExtractorModule>('VideoFrameExtractor');

/**
 * Extracts frames from a video file at specific timestamps.
 * * @param options - Configuration object including URI and timestamps.
 * @returns A promise that resolves to an array of VideoFrame objects.
 */
export async function extractVideoFrames(options: ExtractionRequest): Promise<VideoFrame[]> {
  // Sanity check: ensure timestamps are sorted to optimize native seeking performance
  const sortedRequest = {
    ...options,
    timestamps: [...options.timestamps].sort((a, b) => a - b),
    quality: options.quality ?? 1.0,
    format: options.format ?? 'png',
  };

  return await module.extractFrames(sortedRequest);
}