declare module 'react-youtube-embed' {
  import { ComponentType } from 'react';
  
  interface YouTubeProps {
    id: string;
    aspectRatio?: string;
    prependSrc?: string;
    appendSrc?: string;
    autoplay?: boolean;
    modestbranding?: boolean;
  }
  
  const YouTube: ComponentType<YouTubeProps>;
  export default YouTube;
}




