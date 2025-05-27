import { groq } from 'next-sanity';

export const heroQuery = groq`
  *[_type == "hero"][0] {
    title,
    subtitle,
    description,
    primaryButton {
      text,
      link
    },
    backgroundImage {
      ...,
      asset->{
        _id,
        url,
        metadata {
          dimensions
        }
      }
    }
  }
`;