# HRIS Leave Management - Design System

## Theme Selection
**USE OCEAN THEME** - Professional, trustworthy, calm, and tech-focused. Perfect for corporate HR operations requiring reliability and clarity.

---

## 1. Foundations

### Color Tokens

#### Primary Colors (Ocean Blue Theme)
- **Primary**: `hsl(200, 84%, 42%)` - Rich blue for primary actions, CTA buttons, active states
- **Secondary**: `hsl(200, 84%, 42%)` - Rich blue for secondary emphasis
- **Accent**: `hsl(180, 84%, 45%)` - Teal for highlights and notifications

#### Semantic Colors (Leave Types & Status)
- **Casual Leave (CL)**: `hsl(200, 84%, 42%)` - Primary blue
- **Earned Leave (EL)**: `hsl(160, 84%, 42%)` - Forest green for earned benefits
- **Sick Leave (SL)**: `hsl(320, 84%, 42%)` - Pink for health-related
- **Work From Home (WFH)**: `hsl(45, 84%, 42%)` - Amber for flexible work
- **Compensatory Leave**: `hsl(280, 84%, 42%)` - Purple for special cases

#### Status Colors
- **Pending**: `hsl(45, 84%, 42%)` - Amber for awaiting action
- **Approved**: `hsl(160, 84%, 42%)` - Green for success
- **Rejected**: `hsl(0, 84%, 42%)` - Red for denial
- **Cancelled**: `hsl(0, 0%, 45%)` - Gray for inactive

#### Neutral Colors (Light Mode)
- **Background**: `hsl(0, 0%, 98%)` - Very light gray for main background
- **Card**: `hsl(0, 0%, 100%)` - Pure white for cards and panels
- **Text Primary**: `hsl(0, 0%, 12%)` - Very dark gray for main text
- **Text Secondary**: `hsl(0, 0%, 45%)` - Medium gray for supporting text
- **Border**: `hsl(0, 0%, 88%)` - Light gray for borders and dividers
- **Muted**: `hsl(0, 0%, 94%)` - Very light gray for disabled states

#### Neutral Colors (Dark Mode)
- **Background**: `hsl(0, 0%, 9%)` - Very dark gray for main background
- **Card**: `hsl(0, 0%, 14%)` - Dark gray for cards and panels
- **Text Primary**: `hsl(0, 0%, 95%)` - Very light gray for main text
- **Text Secondary**: `hsl(0, 0%, 65%)` - Medium light gray for supporting text
- **Border**: `hsl(0, 0%, 22%)` - Medium dark gray for borders
- **Muted**: `hsl(0, 0%, 18%)` - Dark gray for disabled states

### Typography Scale

#### Font Family
- **Primary**: Inter - Clean, professional, excellent for data-heavy interfaces
- **Monospace**: JetBrains Mono - For employee IDs, dates, numerical data

#### Type Scale
- **Heading 1**: 2.5rem (40px) / Bold / -0.02em - Page titles
- **Heading 2**: 2rem (32px) / SemiBold / -0.01em - Section headers
- **Heading 3**: 1.5rem (24px) / SemiBold / 0 - Card headers
- **Heading 4**: 1.25rem (20px) / Medium / 0 - Sub-sections
- **Body Large**: 1.125rem (18px) / Regular / 0 - Emphasis text
- **Body**: 1rem (16px) / Regular / 0 - Standard text
- **Body Small**: 0.875rem (14px) / Regular / 0 - Supporting text
- **Caption**: 0.75rem (12px) / Regular / 0.01em - Labels, metadata

#### Line Height
- **Tight**: 1.25 - Headings
- **Normal**: 1.5 - Body text
- **Relaxed**: 1.75 - Long-form content

### Spacing & Grid

#### Spacing Scale (8px base)
- **xs**: 4px - Tight internal spacing
- **sm**: 8px - Component padding
- **md**: 16px - Card padding, element spacing
- **lg**: 24px - Section spacing
- **xl**: 32px - Major section breaks
- **2xl**: 48px - Page-level spacing
- **3xl**: 64px - Hero sections

#### Grid System
- **Container Max Width**: 1440px - Desktop
- **Columns**: 12-column grid
- **Gutter**: 24px (lg)
- **Breakpoints**: Mobile (320px), Tablet (768px), Desktop (1024px), Wide (1440px)

### Iconography
- **Library**: Lucide React - Consistent, professional icon system
- **Size Scale**: 16px (small), 20px (default), 24px (medium), 32px (large)
- **Style**: 2px stroke, rounded caps for friendly corporate feel
- **Usage**: Navigation, actions, status indicators, leave type identifiers

---

## 2. Theming

### Light Mode (Default)
Primary interface for daytime corporate use with high contrast and readability.

**Token Mapping:**
- Background layers: 98% → 100% (subtle depth)
- Text hierarchy: 12% (primary) → 45% (secondary) → 65% (tertiary)
- Interactive states: Primary color at 42% lightness with 10% darker hover

### Dark Mode
Optional evening/night mode for reduced eye strain during extended use.

**Token Mapping:**
- Background layers: 9% → 14% → 18% (progressive elevation)
- Text hierarchy: 95% (primary) → 65% (secondary) → 45% (tertiary)
- Interactive states: Primary color maintains 42% lightness, background darkens 5% on hover

**Mode Toggle:**
- Location: Top navigation bar (consistent across all role dashboards)
- Icon: Sun/Moon toggle with smooth transition
- Persistence: localStorage preference per user

---

## 3. Animation & Micro-interactions

### Transition Timing
- **Fast**: 150ms - Hover states, button presses
- **Normal**: 300ms - Dropdowns, modals, page transitions
- **Slow**: 500ms - Complex animations, data visualizations

### Easing Functions
- **Standard**: ease-in-out - General transitions
- **Enter**: ease-out - Elements appearing
- **Exit**: ease-in - Elements disappearing
- **Bounce**: spring(1, 80, 10, 0) - Success confirmations

### Key Interactions
- **Button Hover**: Scale 1.02, brightness 110%, 150ms
- **Card Hover**: Lift 4px shadow, 300ms
- **Form Focus**: Border color transition to primary, 150ms
- **Toast Notifications**: Slide in from top-right, 300ms ease-out
- **Table Row Hover**: Background muted color, 150ms
- **Calendar Date Hover**: Background primary with 10% opacity, scale 1.05, 150ms
- **Leave Status Badge**: Pulse animation on status change, 500ms
- **Approval Action**: Ripple effect on click, 400ms
- **Data Refresh**: Subtle rotate icon animation, 600ms
- **Sidebar Collapse**: Width transition, 300ms ease-in-out

### Loading States
- **Skeleton Screens**: Shimmer animation for data tables, 1500ms loop
- **Spinner**: Primary color rotation for async operations, 800ms
- **Progress Bar**: Smooth width transition for multi-step forms, 300ms

---

## 4. Component Guidelines

### Buttons
- **Primary**: Ocean blue background, white text, rounded corners (8px), medium padding
- **Secondary**: White background, primary border, primary text
- **Ghost**: Transparent background, primary text, subtle hover
- **Danger**: Red background for rejection/deletion actions
- **Sizes**: Small (32px), Medium (40px), Large (48px)

### Form Elements
- **Input Fields**: White background, light border, primary border on focus, 8px radius
- **Dropdowns**: Custom styled with consistent height (40px), primary accent on active
- **Date Pickers**: Calendar overlay with color-coded leave types, primary selection
- **Textareas**: Min height 120px for leave reason fields
- **Validation**: Inline error messages in red below field, success checkmark in green

### Cards & Panels
- **Elevation**: Subtle shadow for depth (0 2px 8px rgba(0,0,0,0.08))
- **Padding**: 24px internal, 16px on mobile
- **Radius**: 12px for modern but professional feel
- **Hover State**: Lift shadow on interactive cards

### Data Tables
- **Header**: Sticky header with muted background, bold text
- **Rows**: Alternating subtle background (zebra striping), hover highlight
- **Actions**: Icon buttons in rightmost column, primary color
- **Pagination**: Bottom-aligned, shows current page and total
- **Sorting**: Arrow indicators in headers, primary color when active
- **Filtering**: Top-aligned filter bar with dropdown and search

### Badges & Status Indicators
- **Leave Type Badges**: Small rounded pills with semantic colors, white text
- **Status Badges**: Outlined style with status color, color-matched text
- **Count Badges**: Circle badges for notification counts, primary background

### Navigation
- **Top Bar**: Fixed header with logo, search, notifications, profile, theme toggle
- **Sidebar**: Collapsible left sidebar with role-based menu items, active state highlighting
- **Breadcrumbs**: Show current location in hierarchy, clickable navigation
- **Tabs**: Underline style with primary color indicator for active tab

### Modals & Dialogs
- **Overlay**: Semi-transparent dark backdrop (rgba(0,0,0,0.5))
- **Container**: White card centered, max-width 600px, 24px padding
- **Transitions**: Fade in overlay, scale up modal, 300ms
- **Actions**: Footer with aligned buttons (cancel left, confirm right)

### Calendars
- **Month View**: Grid layout with color-coded leave blocks
- **Day Cell**: Hover state, today indicator (primary border)
- **Leave Indicators**: Small colored dots or bars below date
- **Tooltip**: Show leave details on hover with employee name, type, status

### Charts & Visualizations
- **Leave Balance**: Progress bars with semantic colors
- **Trends**: Line charts with primary color gradient
- **Distribution**: Pie charts with leave type colors
- **Team View**: Horizontal bar charts for manager dashboard

---

## 5. Role-Specific UI Patterns

### Employee Dashboard
- **Focus**: Personal leave balance, quick request form, upcoming leaves
- **Layout**: Grid with balance cards (top), request form (left), calendar (right)
- **Priority Actions**: Apply Leave (primary button, prominent), View Balance

### Manager Dashboard
- **Focus**: Pending approvals, team calendar, quick decision-making
- **Layout**: Pending requests table (top), team calendar (bottom), filters (sidebar)
- **Priority Actions**: Approve/Reject (inline in table), View Team Availability

### Admin Dashboard
- **Focus**: System configuration, user management, comprehensive reports
- **Layout**: Multi-tab interface with data tables, configuration forms, analytics
- **Priority Actions**: Bulk Operations, Export Reports, Manage Policies

---

## 6. Accessibility Considerations

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum ratio)
- Status colors verified for colorblind users with additional icons
- Focus indicators visible with 3px primary outline

### Keyboard Navigation
- Logical tab order through all interactive elements
- Escape key closes modals and dropdowns
- Enter key submits forms and confirms actions
- Arrow keys navigate calendar and table rows

### Screen Readers
- Semantic HTML with proper ARIA labels
- Status announcements for async actions
- Table headers associated with data cells
- Form labels explicitly linked to inputs

---

## Dark Mode & Color Contrast Rules (Critical)
- Always use explicit colors - never rely on browser defaults or component variants like 'variant="outline"'
- Force dark mode with CSS: 'html { color-scheme: dark; }' and 'meta name="color-scheme" content="dark"'
- Use high contrast ratios: minimum 4.5:1 for normal text, 3:1 for large text
- Override browser defaults with '!important' for form elements: 'input, textarea, select { background-color: #000000 !important; color: #ffffff !important; }'
- Test in both light and dark system modes - system dark mode can override custom styling
- Use semantic color classes instead of component variants: 'className="bg-gray-800 text-gray-300 border border-gray-600"' not 'variant="outline"'
- Create CSS custom properties for consistency across components
- Quick debugging: check if using 'variant="outline"', add explicit colors, use '!important' if needed, test system modes

### Color Contrast Checklist (apply to all components):
□ No 'variant="outline"' or similar browser-dependent styles
□ Explicit background and text colors specified
□ High contrast ratios (4.5:1+ for text, 3:1+ for large text)
□ Tested with system dark mode ON and OFF
□ Form elements have forced dark styling
□ Badges and buttons use custom classes, not default variants
□ Placeholder text has proper contrast
□ Focus states are visible and accessible

---

## 7. Implementation Notes

### CSS Custom Properties
Define all color tokens as CSS variables in root for easy theming and consistency.

### Component Library
Use shadcn/ui as base with custom overrides matching this design system.

### Responsive Behavior
Mobile-first approach with collapsible navigation, stacked layouts, and touch-friendly targets (min 44px).

### Performance
Lazy load calendar views, paginate large data tables, optimize chart rendering with data sampling.

### Browser Support
Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) with graceful degradation.
