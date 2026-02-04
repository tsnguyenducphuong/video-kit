import { NativeModule, requireNativeModule } from 'expo';

import { VideoFrameExtractorModuleEvents } from './VideoFrameExtractorModule.types';

declare class VideoFrameExtractorModule extends NativeModule<VideoFrameExtractorModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  extractFrames(videoUri:string,timestamps:number[]): Promise<string[]>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<VideoFrameExtractorModule>('VideoFrameExtractorModule');
