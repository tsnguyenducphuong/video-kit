import { requireNativeView } from 'expo';
import * as React from 'react';

import { VideoFrameExtractorModuleViewProps } from './VideoFrameExtractorModule.types';

const NativeView: React.ComponentType<VideoFrameExtractorModuleViewProps> =
  requireNativeView('VideoFrameExtractorModule');

export default function VideoFrameExtractorModuleView(props: VideoFrameExtractorModuleViewProps) {
  return <NativeView {...props} />;
}
