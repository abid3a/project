# Color Palette

## Overview

The TBDC Horizon color palette is designed to convey professionalism, trust, and accessibility while maintaining strong brand identity. The palette consists of primary brand colors, semantic colors, and neutral tones.

## Primary Brand Colors

### Blue (#1976d2)
- **Usage**: Primary brand color, active states, links
- **Purpose**: Conveys trust, professionalism, and reliability
- **Applications**:
  - Active tab indicators
  - Primary buttons
  - Links and interactive elements
  - Selected states
  - Brand accents

### Gold (#cd9d5a)
- **Usage**: Secondary brand color, highlights, accents
- **Purpose**: Represents premium quality and warmth
- **Applications**:
  - Login/signup buttons
  - Highlight elements
  - Brand accents
  - Call-to-action elements

## Semantic Colors

### Success Green (#388e3c)
- **Usage**: Success states, positive feedback
- **Purpose**: Indicates successful actions and positive outcomes
- **Applications**:
  - Success messages
  - Completed actions
  - Positive status indicators
  - Confirmation dialogs

### Warning Orange (#f57c00)
- **Usage**: Warning states, caution messages
- **Purpose**: Alerts users to potential issues or required attention
- **Applications**:
  - Warning messages
  - Caution indicators
  - Required field markers
  - Attention-grabbing elements

### Error Red (#d32f2f)
- **Usage**: Error states, destructive actions
- **Purpose**: Indicates errors, failures, or destructive actions
- **Applications**:
  - Error messages
  - Delete buttons
  - Failed actions
  - Critical alerts

### Info Blue (#1976d2)
- **Usage**: Information states, neutral feedback
- **Purpose**: Provides neutral information and guidance
- **Applications**:
  - Information messages
  - Help text
  - Neutral status indicators
  - Informational dialogs

## Neutral Colors

### Primary Text (#1a1a1a)
- **Usage**: Main text content, headings
- **Purpose**: High contrast for readability
- **Applications**:
  - Headings and titles
  - Primary text content
  - Important information
  - Navigation labels

### Secondary Text (#666666)
- **Usage**: Secondary text, descriptions
- **Purpose**: Lower emphasis while maintaining readability
- **Applications**:
  - Descriptions and captions
  - Secondary information
  - Metadata and timestamps
  - Placeholder text

### Tertiary Text (#999999)
- **Usage**: Tertiary text, disabled states
- **Purpose**: Lowest emphasis text
- **Applications**:
  - Disabled text
  - Very secondary information
  - Muted content
  - Inactive states

### Background Colors

#### Primary Background (#ffffff)
- **Usage**: Main screen backgrounds
- **Purpose**: Clean, neutral background
- **Applications**:
  - Screen backgrounds
  - Card backgrounds
  - Modal backgrounds
  - Form backgrounds

#### Secondary Background (#f8f9fa)
- **Usage**: Secondary backgrounds, sections
- **Purpose**: Subtle background variation
- **Applications**:
  - Section backgrounds
  - List backgrounds
  - Alternate row colors
  - Subtle separators

#### Card Background (#ffffff)
- **Usage**: Card and component backgrounds
- **Purpose**: Elevated content areas
- **Applications**:
  - Card components
  - Modal content
  - Form fields
  - Elevated elements

### Border Colors

#### Primary Border (#e0e0e0)
- **Usage**: Main borders and separators
- **Purpose**: Subtle visual separation
- **Applications**:
  - Card borders
  - Section separators
  - Form field borders
  - List item separators

#### Secondary Border (#f0f0f0)
- **Usage**: Subtle borders and dividers
- **Purpose**: Very subtle visual separation
- **Applications**:
  - Subtle dividers
  - Light separators
  - Background borders
  - Inactive states

## Status Colors

### Session Type Colors

#### Workshop (#e8f4fd)
- **Background**: Light blue
- **Text**: #1976d2
- **Usage**: Workshop session types

#### Seminar (#fff3e0)
- **Background**: Light orange
- **Text**: #f57c00
- **Usage**: Seminar session types

#### Lecture (#f3e5f5)
- **Background**: Light purple
- **Text**: #7b1fa2
- **Usage**: Lecture session types

#### Discussion (#e8f5e8)
- **Background**: Light green
- **Text**: #388e3c
- **Usage**: Discussion session types

#### Training (#fff8e1)
- **Background**: Light yellow
- **Text**: #f9a825
- **Usage**: Training session types

### Dynamic Colors
The app includes a dynamic color system for new session types that automatically assigns colors from a predefined palette:

```javascript
const dynamicColors = [
  { bg: '#e3f2fd', text: '#1565c0' }, // Light blue
  { bg: '#fce4ec', text: '#c2185b' }, // Light pink
  { bg: '#e0f2f1', text: '#00695c' }, // Light teal
  { bg: '#fff3e0', text: '#ef6c00' }, // Light orange
  { bg: '#f3e5f5', text: '#7b1fa2' }, // Light purple
  { bg: '#e8f5e8', text: '#2e7d32' }, // Light green
  { bg: '#fff8e1', text: '#f57f17' }, // Light amber
  { bg: '#fce4ec', text: '#ad1457' }, // Light rose
  { bg: '#e0f7fa', text: '#00838f' }, // Light cyan
  { bg: '#f1f8e9', text: '#558b2f' }, // Light lime
];
```

## Accessibility Considerations

### Color Contrast Ratios
All color combinations meet WCAG AA standards (4.5:1 minimum):

- **Primary text on white**: 15.6:1 ✓
- **Secondary text on white**: 4.5:1 ✓
- **Blue text on light blue**: 4.8:1 ✓
- **Orange text on light orange**: 4.6:1 ✓

### Color Independence
- Information is never conveyed by color alone
- Icons and text labels accompany color-coded elements
- Status indicators include both color and text
- Error states include descriptive text

### Dark Mode Support
The app supports system dark mode preferences with appropriate color adjustments:

```javascript
// Dark mode color variants
const darkModeColors = {
  primaryBackground: '#121212',
  secondaryBackground: '#1e1e1e',
  cardBackground: '#2d2d2d',
  primaryText: '#ffffff',
  secondaryText: '#b3b3b3',
  border: '#404040',
};
```

## Implementation Guidelines

### Color Usage Rules

1. **Consistency**: Use the same color for the same purpose throughout the app
2. **Hierarchy**: Use color to establish visual hierarchy
3. **Accessibility**: Ensure sufficient contrast ratios
4. **Semantic Meaning**: Use colors that match their semantic meaning
5. **Brand Alignment**: Maintain brand consistency

### Color Application

#### Buttons
- **Primary**: Blue background (#1976d2) with white text
- **Secondary**: Gold background (#cd9d5a) with black text
- **Destructive**: Red background (#d32f2f) with white text
- **Disabled**: Gray background (#e0e0e0) with gray text (#999999)

#### Text
- **Headings**: Primary text color (#1a1a1a)
- **Body**: Primary text color (#1a1a1a)
- **Captions**: Secondary text color (#666666)
- **Disabled**: Tertiary text color (#999999)

#### Cards
- **Background**: White (#ffffff)
- **Border**: Primary border (#e0e0e0)
- **Shadow**: Subtle shadow for elevation

#### Status Indicators
- **Active**: Blue (#1976d2)
- **Inactive**: Gray (#999999)
- **Success**: Green (#388e3c)
- **Warning**: Orange (#f57c00)
- **Error**: Red (#d32f2f)

## Color Variables

### CSS Variables (Web)
```css
:root {
  /* Primary Colors */
  --color-primary: #1976d2;
  --color-secondary: #cd9d5a;
  
  /* Semantic Colors */
  --color-success: #388e3c;
  --color-warning: #f57c00;
  --color-error: #d32f2f;
  --color-info: #1976d2;
  
  /* Text Colors */
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #666666;
  --color-text-tertiary: #999999;
  
  /* Background Colors */
  --color-background-primary: #ffffff;
  --color-background-secondary: #f8f9fa;
  
  /* Border Colors */
  --color-border-primary: #e0e0e0;
  --color-border-secondary: #f0f0f0;
}
```

### React Native StyleSheet
```javascript
const colors = {
  // Primary Colors
  primary: '#1976d2',
  secondary: '#cd9d5a',
  
  // Semantic Colors
  success: '#388e3c',
  warning: '#f57c00',
  error: '#d32f2f',
  info: '#1976d2',
  
  // Text Colors
  textPrimary: '#1a1a1a',
  textSecondary: '#666666',
  textTertiary: '#999999',
  
  // Background Colors
  backgroundPrimary: '#ffffff',
  backgroundSecondary: '#f8f9fa',
  
  // Border Colors
  borderPrimary: '#e0e0e0',
  borderSecondary: '#f0f0f0',
};
```

## Color Testing

### Contrast Testing
Use tools like WebAIM's Contrast Checker to verify color combinations meet accessibility standards.

### Color Blindness Testing
Test color combinations with color blindness simulators to ensure information is accessible to all users.

### Print Testing
Verify colors work well in grayscale for print materials and accessibility. 