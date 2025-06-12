import imageUrlBuilder from '@sanity/image-url'
import { dataset, projectId } from './client'

const imageBuilder = imageUrlBuilder({
  projectId: projectId || 'c7bxnoyq',
  dataset: dataset || 'production',
})

export const urlForImage = (source) => {
  return imageBuilder.image(source)
}