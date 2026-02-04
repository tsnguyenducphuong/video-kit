import VideoFrameExtractorModule from './VideoFrameExtractorModule';
import { ExtractionRequest,VideoFrame } from './VideoFrameExtractorModule.types'; 

/**
 * Extracts frames from a video file at specific timestamps.
 * * @param options - Configuration object including video URI and timestamps.
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

  return await VideoFrameExtractorModule.extractVideoFrames(sortedRequest);
}