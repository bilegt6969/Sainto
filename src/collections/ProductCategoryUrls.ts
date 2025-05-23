import type { CollectionConfig } from 'payload'

// src/collections/ProductCategoryUrls.ts


export const ProductCategoryUrls: CollectionConfig = {
  slug: 'product-category-urls',
  admin: {
    useAsTitle: 'category',
  },
  fields: [
    {
      name: 'category',
      type: 'text',
      required: true,
    },
    {
      name: 'key', // e.g. 'el1', 'el2', etc.
      type: 'text',
      required: true,
    },
    {
      name: 'urls',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
        }
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    }
  ],
};