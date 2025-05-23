import type { CollectionConfig } from 'payload'

// src/collections/ProductCollection.ts

export const ProductCollection: CollectionConfig = {
  slug: 'product-collections',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      required: true,
    }
    
  ],
};