# 🎨 AroSense Design System

## Overview
AroSense uses a comprehensive design system built on Tailwind CSS with custom components, ensuring consistency and accessibility across the entire application.

## 🎯 Design Principles

### 1. **Accessibility First**
- WCAG AA compliance
- Screen reader support
- Keyboard navigation
- High contrast mode support
- Reduced motion preferences

### 2. **Mobile-First Responsive**
- Touch-friendly interfaces (44px minimum touch targets)
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible grid systems
- Optimized for all screen sizes

### 3. **Visual Hierarchy**
- Clear typography scale
- Consistent spacing system
- Proper color contrast ratios
- Meaningful use of shadows and depth

## 🎨 Color System

### Primary Colors
```css
primary: {
  50: '#f0f9ff',
  500: '#0ea5e9',
  600: '#0284c7',
  DEFAULT: '#0ea5e9'
}
```

### Page-Specific Themes
- **Dashboard**: Energetic Green (#84cc16)
- **Family Profiles**: Inclusive Orange (#f97316)
- **Emergency Info**: Urgent Red (#ef4444)
- **Documents**: Trustworthy Blue (#3b82f6)
- **Wellness**: Vibrant Yellow-Green (#84cc16)
- **Women's Care**: Empowering Pink (#ec4899)
- **Baby Care**: Gentle Pastel Blue (#0ea5e9)
- **Pregnancy**: Nurturing Peach (#fb923c)

### Semantic Colors
- **Success**: Green (#22c55e)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)
- **Info**: Blue (#3b82f6)

## 📝 Typography

### Font Family
- Primary: Inter (system fallback: system-ui, sans-serif)

### Scale
- **2xs**: 10px (0.625rem)
- **xs**: 12px (0.75rem)
- **sm**: 14px (0.875rem)
- **base**: 16px (1rem)
- **lg**: 18px (1.125rem)
- **xl**: 20px (1.25rem)
- **2xl**: 24px (1.5rem)
- **3xl**: 30px (1.875rem)
- **4xl**: 36px (2.25rem)

### Weights
- **medium**: 500
- **semibold**: 600
- **bold**: 700

## 🧩 Component Library

### Buttons
```tsx
<Button variant="primary" size="lg" leftIcon={<Icon />}>
  Primary Action
</Button>
```

**Variants**: primary, secondary, success, warning, error, ghost, outline
**Sizes**: sm, md, lg, xl

### Cards
```tsx
<Card variant="elevated">
  <CardHeader title="Title" subtitle="Subtitle" />
  <CardContent>Content</CardContent>
</Card>
```

**Variants**: default, elevated, interactive, gradient

### Form Components
```tsx
<Input 
  label="Label" 
  error="Error message"
  helperText="Helper text"
  leftIcon={<Icon />}
/>
```

### Dashboard Widgets
```tsx
<DashboardWidget
  title="Metric"
  value="123"
  change={{ value: "+5%", trend: 'up' }}
  variant="gradient"
  gradient="from-blue-500 to-purple-600"
/>
```

## 📐 Spacing System

### Scale (based on 0.25rem = 4px)
- **1**: 4px
- **2**: 8px
- **3**: 12px
- **4**: 16px
- **6**: 24px
- **8**: 32px
- **12**: 48px
- **16**: 64px
- **20**: 80px

### Layout Spacing
- **Container padding**: px-4 sm:px-6 lg:px-8
- **Section spacing**: space-y-6 to space-y-8
- **Card padding**: p-4 to p-6
- **Button padding**: px-4 py-2 to px-8 py-4

## 🌟 Shadows & Elevation

### Shadow Scale
- **sm**: Subtle elevation for cards
- **md**: Standard elevation for modals
- **lg**: High elevation for dropdowns
- **xl**: Maximum elevation for tooltips

### Custom Shadows
- **soft**: Gentle shadow for cards
- **medium**: Standard shadow for elevated elements
- **strong**: Prominent shadow for modals

## 🎭 Animations & Transitions

### Duration
- **Fast**: 150ms (hover states)
- **Standard**: 200ms (most transitions)
- **Slow**: 300ms (page transitions)

### Easing
- **ease-in-out**: Standard transitions
- **ease-out**: Enter animations
- **ease-in**: Exit animations

### Custom Animations
- **fade-in**: Opacity transition
- **slide-up**: Vertical slide with opacity
- **scale-in**: Scale with opacity
- **pulse-soft**: Gentle pulsing effect

## 📱 Responsive Design

### Breakpoints
- **sm**: 640px (tablets)
- **md**: 768px (small laptops)
- **lg**: 1024px (desktops)
- **xl**: 1280px (large screens)

### Grid System
- **Mobile**: 1 column
- **Tablet**: 2-3 columns
- **Desktop**: 3-4 columns
- **Large**: 4-6 columns

## ♿ Accessibility Features

### Focus Management
- Visible focus indicators
- Logical tab order
- Skip-to-main content link
- Focus trapping in modals

### Screen Reader Support
- Semantic HTML structure
- ARIA labels and descriptions
- Screen reader only text
- Proper heading hierarchy

### Color & Contrast
- WCAG AA compliant contrast ratios
- High contrast mode support
- Color is not the only indicator
- Meaningful color usage

### Motion & Animation
- Respects prefers-reduced-motion
- Optional animation controls
- Smooth but not distracting
- Purposeful motion design

## 🔧 Implementation Guidelines

### Component Creation
1. Start with semantic HTML
2. Add Tailwind classes for styling
3. Include proper ARIA attributes
4. Test with keyboard navigation
5. Verify screen reader compatibility

### Color Usage
1. Use semantic colors for meaning
2. Maintain consistent contrast ratios
3. Test in high contrast mode
4. Provide alternative indicators

### Responsive Design
1. Design mobile-first
2. Use flexible units (rem, %)
3. Test on real devices
4. Optimize touch targets

### Performance
1. Minimize CSS bundle size
2. Use efficient selectors
3. Optimize animations
4. Lazy load when appropriate

This design system ensures AroSense provides a consistent, accessible, and delightful user experience across all devices and user needs.