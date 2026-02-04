import type { StyleProp, ViewStyle } from 'react-native';

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


export type OnLoadEventPayload = {
  url: string;
};

export type VideoFrameExtractorModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type VideoFrameExtractorModuleViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
