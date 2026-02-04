import { registerWebModule, NativeModule } from 'expo';

import { VideoFrameExtractorModuleEvents } from './VideoFrameExtractorModule.types';

class VideoFrameExtractorModule extends NativeModule<VideoFrameExtractorModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(VideoFrameExtractorModule, 'VideoFrameExtractorModule');
