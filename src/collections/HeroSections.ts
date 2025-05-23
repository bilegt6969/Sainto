import type { CollectionConfig } from 'payload'

//--- Reusable Options ---
const fontStyleOptions = [
  { label: 'Sans Serif (System Default)', value: 'sans' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'mono' },
  { label: 'Display', value: 'display' },
  { label: 'Handwriting', value: 'handwriting' },
]

const fontSizeOptions = [
  { label: 'XS (xs)', value: 'text-xs' },
  { label: 'Small (sm)', value: 'text-sm' },
  { label: 'Base', value: 'text-base' },
  { label: 'Body (lg)', value: 'text-lg' },
  { label: 'Title (xl)', value: 'text-xl' },
  { label: 'Heading (2xl)', value: 'text-2xl' },
  { label: 'Heading L (3xl)', value: 'text-3xl' },
  { label: 'Heading XL (4xl)', value: 'text-4xl' },
  { label: 'Display S (5xl)', value: 'text-5xl' },
  { label: 'Display M (6xl)', value: 'text-6xl' },
  { label: 'Display L (7xl)', value: 'text-7xl' },
  { label: 'Display XL (8xl)', value: 'text-8xl' },
  { label: 'Display 2XL (9xl)', value: 'text-9xl' },
]

const textTransformOptions = [
  { label: 'Normal', value: 'normal' },
  { label: 'Uppercase', value: 'uppercase' },
  { label: 'Lowercase', value: 'lowercase' },
  { label: 'Capitalize', value: 'capitalize' },
]

const textDecorationOptions = [
  { label: 'None', value: 'none' },
  { label: 'Underline', value: 'underline' },
  { label: 'Line Through', value: 'line-through' },
]

const letterSpacingOptions = [
  { label: 'Tighter', value: '-0.05em' },
  { label: 'Tight', value: '-0.025em' },
  { label: 'Normal', value: '0' },
  { label: 'Wide', value: '0.025em' },
  { label: 'Wider', value: '0.05em' },
  { label: 'Widest', value: '0.1em' },
]

const borderRadiusOptions = [
  { label: 'None', value: 'rounded-none' },
  { label: 'Small', value: 'rounded' },
  { label: 'Medium', value: 'rounded-md' },
  { label: 'Large', value: 'rounded-lg' },
  { label: 'XL', value: 'rounded-xl' },
  { label: '2XL', value: 'rounded-2xl' },
  { label: '3XL', value: 'rounded-3xl' },
  { label: 'Full', value: 'rounded-full' },
  { label: 'Custom', value: 'custom' }, // Keep custom if you intend to allow text input for border-radius elsewhere
]

const shadowOptions = [
  { label: 'None', value: 'none' },
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
  { label: 'Extra Large', value: 'xl' },
]

const buttonStyleOptions = [
  { label: 'Primary (Blue)', value: 'primary' },
  { label: 'Secondary (Light Gray)', value: 'secondary' },
  { label: 'Outline', value: 'outline' },
  { label: 'Ghost', value: 'ghost' },
  { label: 'Link Style', value: 'link' },
  { label: 'Gradient', value: 'gradient' },
  // Consider adding a 'custom' option if the customColors group should be conditional on it
  // { label: 'Custom', value: 'custom' },
]

const buttonSizeOptions = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
]

const buttonAnimationOptions = [
  { label: 'None', value: 'none' },
  { label: 'Pulse', value: 'pulse' },
  { label: 'Bounce', value: 'bounce' },
  { label: 'Shake', value: 'shake' },
  { label: 'Glow', value: 'glow' },
]

const iconPositionOptions = [
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
]

const gradientDirectionOptions = [
  { label: 'Left to Right', value: 'to-r' },
  { label: 'Right to Left', value: 'to-l' },
  { label: 'Top to Bottom', value: 'to-b' },
  { label: 'Bottom to Top', value: 'to-t' },
  { label: 'Top Left to Bottom Right', value: 'to-br' },
  { label: 'Top Right to Bottom Left', value: 'to-bl' },
  { label: 'Bottom Left to Top Right', value: 'to-tr' },
  { label: 'Bottom Right to Top Left', value: 'to-tl' },
]

const blendModeOptions = [
  { label: 'Normal', value: 'normal' },
  { label: 'Multiply', value: 'multiply' },
  { label: 'Screen', value: 'screen' },
  { label: 'Overlay', value: 'overlay' },
  { label: 'Darken', value: 'darken' },
  { label: 'Lighten', value: 'lighten' },
]

const backgroundTypeOptions = [
  { label: 'Color', value: 'color' },
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: 'Gradient', value: 'gradient' },
  // Note: 'pattern' is defined below but not included here.
  // If backgroundType should allow 'pattern', add it here.
]

const layoutTypeOptions = [
  { label: 'Centered', value: 'centered' },
  { label: 'Split', value: 'split' },
  { label: 'Offset', value: 'offset' },
  { label: 'Stacked', value: 'stacked' },
  // Note: 'custom' was present in the frontend component but not defined here.
]

const animationEntranceOptions = [
  { label: 'Fade', value: 'fade' },
  { label: 'Slide', value: 'slide' },
  { label: 'Zoom', value: 'zoom' },
  { label: 'None', value: 'none' },
]

const animationSpeedOptions = [
  { label: 'Slow', value: 'slow' },
  { label: 'Medium', value: 'medium' },
  { label: 'Fast', value: 'fast' },
]

const dividerTypeOptions = [
  { label: 'Wave', value: 'wave' },
  { label: 'Curve', value: 'curve' },
  { label: 'Triangle', value: 'triangle' },
  { label: 'Chevron', value: 'chevron' },
  { label: 'Straight', value: 'straight' },
]

const dividerPositionOptions = [
  { label: 'Top', value: 'top' },
  { label: 'Bottom', value: 'bottom' },
]

const backgroundPatternOptions = [
  { label: 'None', value: 'none' },
  { label: 'Dots', value: 'dots' },
  { label: 'Grid', value: 'grid' },
  { label: 'Waves', value: 'waves' },
  { label: 'Triangles', value: 'triangles' },
]

const patternSizeOptions = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
]

const sideContentTypeOptions = [
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: 'Shape', value: 'shape' },
]

const sideContentAnimationOptions = [
  { label: 'None', value: 'none' },
  { label: 'Float', value: 'float' },
  { label: 'Rotate', value: 'rotate' },
  { label: 'Slide', value: 'slide' },
  { label: 'Fade', value: 'fade' },
]

const sideContentPositionOptions = [
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
]

const textAlignmentOptions = [
  { label: 'Left', value: 'text-left' },
  { label: 'Center', value: 'text-center' },
  { label: 'Right', value: 'text-right' },
]

const verticalAlignmentOptions = [
  { label: 'Start', value: 'items-start' },
  { label: 'Center', value: 'items-center' },
  { label: 'End', value: 'items-end' },
]

const maxWidthOptions = [
  { label: 'Small (640px)', value: 'max-w-sm' },
  { label: 'Medium (768px)', value: 'max-w-md' },
  { label: 'Large (1024px)', value: 'max-w-lg' },
  { label: 'Extra Large (1280px)', value: 'max-w-xl' },
  { label: '2XL (1536px)', value: 'max-w-2xl' },
  { label: '3XL (1792px)', value: 'max-w-3xl' },
  { label: '4XL (2048px)', value: 'max-w-4xl' },
  { label: '5XL (2304px)', value: 'max-w-5xl' },
  { label: '6XL (2560px)', value: 'max-w-6xl' },
  { label: '7XL (2816px)', value: 'max-w-7xl' },
  { label: 'Full', value: 'max-w-full' },
]

const HeroSections: CollectionConfig = {
  slug: 'hero-sections',
  labels: {
    singular: 'Hero Section',
    plural: 'Hero Sections',
  },
  admin: {
    useAsTitle: 'name', // Use 'name' field for the entry title in admin UI
    defaultColumns: ['name', 'layoutType', 'updatedAt'],
  },
  access: {
    read: () => true, // Public read access
  },
  fields: [
    // --- Section Identification ---
    {
      name: 'name',
      type: 'text',
      required: false, // Optional internal name for the section
      label: 'Section Name (Internal)',
    },

    // --- Background Styling ---
    {
      name: 'backgroundType',
      type: 'select',
      options: backgroundTypeOptions, // Defined above
      defaultValue: 'color',
      required: false, // Assuming default is sufficient
    },
    {
      name: 'backgroundColor',
      type: 'text', // Consider Payload's built-in color picker type if available/preferred
      label: 'Background Color',
      admin: {
        condition: (data) => data.backgroundType === 'color',
      },
      defaultValue: '#ffffff',
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media', // Ensure 'media' collection exists
      label: 'Background Image',
      admin: {
        condition: (data) => data.backgroundType === 'image',
      },
    },
    {
      name: 'backgroundVideo',
      type: 'upload',
      relationTo: 'media', // Ensure 'media' collection exists
      label: 'Background Video',
      admin: {
        condition: (data) => data.backgroundType === 'video',
      },
    },
    {
      name: 'backgroundGradient',
      type: 'group',
      label: 'Background Gradient',
      admin: {
        condition: (data) => data.backgroundType === 'gradient',
      },
      fields: [
        { name: 'from', type: 'text', label: 'From Color', required: false, defaultValue: '#007AFF' },
        { name: 'to', type: 'text', label: 'To Color', required: false, defaultValue: '#AF52DE' },
        {
          name: 'direction',
          type: 'select',
          options: gradientDirectionOptions, // Defined above
          defaultValue: 'to-r',
        },
      ],
    },
    {
      name: 'backgroundPattern',
      type: 'group',
      label: 'Background Pattern Overlay', // Added overlay to clarify it sits on top
      fields: [
        { name: 'type', type: 'select', options: backgroundPatternOptions, defaultValue: 'none' },
        {
          name: 'color',
          type: 'text', // Consider color picker
          admin: { condition: (data, siblingData) => siblingData.type !== 'none' },
          defaultValue: '#000000',
        },
        {
          name: 'opacity',
          type: 'number',
          admin: {
            condition: (data, siblingData) => siblingData.type !== 'none',
            step: 0.01, // Allow finer control
          },
          defaultValue: 0.1,
          min: 0,
          max: 1,
        },
        {
          name: 'size',
          type: 'select',
          options: patternSizeOptions, // Defined above
          admin: { condition: (data, siblingData) => siblingData.type !== 'none' },
          defaultValue: 'medium',
        },
        {
          name: 'animated',
          type: 'checkbox',
          label: 'Animate Pattern',
          admin: { condition: (data, siblingData) => siblingData.type !== 'none' },
          defaultValue: false,
        },
      ],
    },
    {
      name: 'backgroundImageOverlay',
      type: 'group',
      label: 'Background Image/Video Overlay', // Clarify purpose
      admin: {
        condition: (data) => data.backgroundType === 'image' || data.backgroundType === 'video',
      },
      fields: [
        { name: 'color', type: 'text', label: 'Overlay Color (e.g., rgba(0,0,0,0.5))', defaultValue: 'rgba(0, 0, 0, 0.2)' },
        {
          name: 'blendMode',
          type: 'select',
          options: blendModeOptions, // Defined above
          defaultValue: 'normal',
        },
      ],
    },

    // --- Content Styling & Layout ---
    {
      name: 'contentAlignment',
      type: 'group',
      label: 'Content Alignment & Width',
      fields: [
        { name: 'textAlignment', type: 'select', label: 'Horizontal Text Align', options: textAlignmentOptions, defaultValue: 'text-center' },
        { name: 'verticalAlignment', type: 'select', label: 'Vertical Item Align', options: verticalAlignmentOptions, defaultValue: 'items-center' },
        { name: 'maxWidth', type: 'select', label: 'Max Content Width', options: maxWidthOptions, defaultValue: 'max-w-7xl' },
      ],
    },
    {
      name: 'spacing',
      type: 'group',
      label: 'Vertical & Horizontal Padding',
      fields: [
        { name: 'paddingTop', type: 'text', label: 'Padding Top (e.g., pt-20)', defaultValue: 'pt-20' },
        { name: 'paddingBottom', type: 'text', label: 'Padding Bottom (e.g., pb-20)', defaultValue: 'pb-20' },
        { name: 'paddingX', type: 'text', label: 'Padding Left/Right (e.g., px-6)', defaultValue: 'px-6' },
      ],
    },

    // --- Text Content ---
    // Using groups for text fields to bundle styling options
    {
      name: 'headline',
      label: 'Headline Text & Style',
      type: 'group',
      fields: [
        { name: 'text', type: 'text' },
        { name: 'style', type: 'select', label: 'Font Style', options: fontStyleOptions, defaultValue: 'sans' },
        { name: 'size', type: 'select', label: 'Font Size', options: fontSizeOptions, defaultValue: 'text-6xl' },
        { name: 'color', type: 'text', label: 'Text Color', defaultValue: '#1d1d1f' },
        { name: 'bold', type: 'checkbox', label: 'Bold', defaultValue: true },
        { name: 'italic', type: 'checkbox', label: 'Italic' },
        { name: 'letterSpacing', type: 'select', options: letterSpacingOptions, defaultValue: '0' },
        { name: 'textShadow', type: 'text', label: 'Text Shadow (CSS)' },
        { name: 'highlight', type: 'text', label: 'Highlight Color (CSS)' },
        { name: 'transform', type: 'select', label: 'Text Transform', options: textTransformOptions, defaultValue: 'normal' },
        { name: 'decoration', type: 'select', label: 'Text Decoration', options: textDecorationOptions, defaultValue: 'none' },
      ],
    },
    {
      name: 'subHeadline',
      label: 'Sub-Headline Text & Style',
      type: 'group',
      fields: [
        { name: 'text', type: 'text' },
        { name: 'style', type: 'select', label: 'Font Style', options: fontStyleOptions, defaultValue: 'sans' },
        { name: 'size', type: 'select', label: 'Font Size', options: fontSizeOptions, defaultValue: 'text-xl' },
        { name: 'color', type: 'text', label: 'Text Color', defaultValue: '#86868b' },
        { name: 'bold', type: 'checkbox', label: 'Bold' },
        { name: 'italic', type: 'checkbox', label: 'Italic' },
        { name: 'letterSpacing', type: 'select', options: letterSpacingOptions, defaultValue: '0' },
        { name: 'textShadow', type: 'text', label: 'Text Shadow (CSS)' },
        { name: 'highlight', type: 'text', label: 'Highlight Color (CSS)' },
        { name: 'transform', type: 'select', label: 'Text Transform', options: textTransformOptions, defaultValue: 'normal' },
        { name: 'decoration', type: 'select', label: 'Text Decoration', options: textDecorationOptions, defaultValue: 'none' },
      ],
    },
    {
      name: 'supportingText',
      label: 'Supporting Text & Style',
      type: 'group',
      fields: [
        { name: 'text', type: 'textarea' }, // Use textarea for potentially longer text
        { name: 'style', type: 'select', label: 'Font Style', options: fontStyleOptions, defaultValue: 'sans' },
        { name: 'size', type: 'select', label: 'Font Size', options: fontSizeOptions, defaultValue: 'text-base' },
        { name: 'color', type: 'text', label: 'Text Color', defaultValue: '#1d1d1f' },
        { name: 'bold', type: 'checkbox', label: 'Bold' },
        { name: 'italic', type: 'checkbox', label: 'Italic' },
        { name: 'letterSpacing', type: 'select', options: letterSpacingOptions, defaultValue: '0' },
        { name: 'textShadow', type: 'text', label: 'Text Shadow (CSS)' },
        { name: 'highlight', type: 'text', label: 'Highlight Color (CSS)' },
        { name: 'transform', type: 'select', label: 'Text Transform', options: textTransformOptions, defaultValue: 'normal' },
        { name: 'decoration', type: 'select', label: 'Text Decoration', options: textDecorationOptions, defaultValue: 'none' },
      ],
    },

    // --- Call to Action Buttons ---
    {
      name: 'ctaButtons',
      label: 'Call to Action Buttons',
      type: 'array',
      minRows: 0,
      maxRows: 3, // Example limit
      fields: [
        // These fields directly map to the CtaButton type expected by the frontend
        { name: 'text', type: 'text', label: 'Button Text', required: false },
        { name: 'url', type: 'text', label: 'Button URL', required: false },
        { name: 'style', type: 'select', options: buttonStyleOptions, defaultValue: 'primary' },
        { name: 'size', type: 'select', options: buttonSizeOptions, defaultValue: 'medium' },
        { name: 'icon', type: 'text', label: 'Icon Name (Optional)' }, // Example: 'arrow-right' from an icon library
        { name: 'iconPosition', type: 'select', options: iconPositionOptions, defaultValue: 'left' },
        {
          name: 'customColors',
          type: 'group',
          label: 'Custom Button Colors',
          admin: {
            // Show only if style requires custom colors (e.g., if a 'custom' option is added to buttonStyleOptions)
            // condition: (data, siblingData) => siblingData.style === 'custom'
          },
          fields: [
            { name: 'background', type: 'text' },
            { name: 'text', type: 'text' },
            { name: 'border', type: 'text' },
            { name: 'hoverBackground', type: 'text' },
            { name: 'hoverText', type: 'text' },
          ],
        },
        { name: 'animation', type: 'select', label: 'Button Hover Animation', options: buttonAnimationOptions, defaultValue: 'none' },
      ],
    },

    // --- Side Content (e.g., floating image/video) ---
    {
      name: 'sideContent',
      label: 'Side Content Element',
      type: 'array', // Allow multiple side elements if needed, otherwise use 'group'
      minRows: 0,
      maxRows: 1, // Limit to one for typical hero sections
      fields: [
        // These fields directly map to the SideContent type expected by the frontend
        { name: 'type', type: 'select', options: sideContentTypeOptions, defaultValue: 'image' },
        {
          name: 'source', // This should be the resolved media object after population
          type: 'upload',
          relationTo: 'media',
          required: true, // Source is usually required for image/video
          admin: { condition: (data) => data.type === 'image' || data.type === 'video' },
        },
        { name: 'altText', type: 'text', label: 'Image Alt Text', admin: { condition: (data) => data.type === 'image' } },
        { name: 'width', type: 'text', label: 'Width (e.g., 400px or w-1/2)', defaultValue: '400px' },
        { name: 'height', type: 'text', label: 'Height (e.g., 400px or h-auto)', defaultValue: '400px' },
        { name: 'animation', type: 'select', options: sideContentAnimationOptions, defaultValue: 'none' },
        { name: 'position', type: 'select', options: sideContentPositionOptions, defaultValue: 'right' },
        { name: 'offset', type: 'text', label: 'Position Offset (Tailwind)' },
        { name: 'zIndex', type: 'number', label: 'Z-Index', defaultValue: 1 },
        // Add fields for 'shape' type if needed (e.g., shape type, color, size)
      ],
    },

    // --- Overall Section Layout & Styling ---
    {
      name: 'layoutType',
      type: 'select',
      options: layoutTypeOptions, // Defined above
      defaultValue: 'centered',
    },
    {
      name: 'divider',
      type: 'group',
      label: 'Section Divider (Top or Bottom)',
      fields: [
        { name: 'show', type: 'checkbox', label: 'Show Divider', defaultValue: false },
        {
          name: 'type',
          type: 'select',
          options: dividerTypeOptions, // Defined above
          admin: { condition: (data, siblingData) => siblingData.show },
          defaultValue: 'wave',
        },
        {
          name: 'color',
          type: 'text', // Consider color picker
          admin: { condition: (data, siblingData) => siblingData.show },
          defaultValue: '#ffffff',
        },
        {
          name: 'height',
          type: 'text', // Example: '50px', '10vh'
          admin: { condition: (data, siblingData) => siblingData.show },
          defaultValue: '50px',
        },
        {
          name: 'position',
          type: 'select',
          options: dividerPositionOptions, // Defined above
          admin: { condition: (data, siblingData) => siblingData.show },
          defaultValue: 'bottom',
        },
      ],
    },
    {
      name: 'animation',
      type: 'group',
      label: 'Content Entrance Animation',
      fields: [
        { name: 'entrance', type: 'select', options: animationEntranceOptions, defaultValue: 'fade' },
        { name: 'speed', type: 'select', options: animationSpeedOptions, defaultValue: 'medium' },
        { name: 'stagger', type: 'checkbox', label: 'Stagger Child Animations', defaultValue: true },
      ],
    },
    { name: 'customClass', type: 'text', label: 'Custom CSS Classes' },
    { name: 'minHeight', type: 'text', label: 'Minimum Section Height (Tailwind)', defaultValue: 'min-h-[calc(100vh-10rem)]' },
    { name: 'borderRadius', type: 'select', label: 'Section Border Radius', options: borderRadiusOptions, defaultValue: 'rounded-none' },
    { name: 'boxShadow', type: 'select', label: 'Section Box Shadow', options: shadowOptions, defaultValue: 'none' },
  ],
}

export default HeroSections
