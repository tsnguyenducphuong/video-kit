import * as React from 'react';

import { VideoFrameExtractorModuleViewProps } from './VideoFrameExtractorModule.types';

export default function VideoFrameExtractorModuleView(props: VideoFrameExtractorModuleViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
