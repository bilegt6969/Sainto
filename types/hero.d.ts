export interface HeroButton {
    text: string;
    link: string;
  }
  
  export interface HeroData {
    title: string;
    subtitle?: string;
    description?: string;
    primaryButton?: HeroButton;
    backgroundImage: {
      asset: {
        _id: string;
        url: string;
        metadata?: {
          dimensions?: {
            width: number;
            height: number;
          };
        };
      };
    };
  }