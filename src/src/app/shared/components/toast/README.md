# 🔔 Toast Notification System - Usage Guide

## Overview
A modern toast notification system that displays messages in the **bottom-right corner** of the screen with smooth animations and auto-dismiss functionality.

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Add ToastComponent to your app

In `app.component.html`, add at the end:
```html
<app-toast></app-toast>
```

### Step 2: Import in app.component.ts

```typescript
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [
    // ... other imports
    ToastComponent  // Add this
  ],
})
```

### Step 3: Use in any component

```typescript
import { ToastService } from './core/services/toast.service';

export class YourComponent {
  constructor(private toastService: ToastService) {}

  showNotification() {
    this.toastService.success('Success!', 'Your changes have been saved.');
  }
}
```

---

## 📖 API Reference

### Success Toast (Green ✓)
```typescript
this.toastService.success(title, message?, duration?);

// Examples:
this.toastService.success('Saved!', 'Your changes have been saved.');
this.toastService.success('Copied to clipboard!');
```

### Error Toast (Red ✕)
```typescript
this.toastService.error(title, message?, duration?);

// Examples:
this.toastService.error('Failed!', 'Unable to save changes.');
this.toastService.error('Network error');
```

### Warning Toast (Orange ⚠)
```typescript
this.toastService.warning(title, message?, duration?);

// Examples:
this.toastService.warning('Session expiring', 'Please save your work.');
this.toastService.warning('Unsaved changes!');
```

### Info Toast (Purple ℹ)
```typescript
this.toastService.info(title, message?, duration?);

// Examples:
this.toastService.info('New feature!', 'Check out the new dashboard.');
this.toastService.info('Tip: Use keyboard shortcuts');
```

### Custom Toast
```typescript
this.toastService.show({
  type: 'success' | 'error' | 'warning' | 'info',
  title: 'Custom Title',
  message: 'Optional message',
  duration: 5000,  // milliseconds (0 = no auto-dismiss)
  icon: '🚀'       // custom emoji or text
});
```

---

## 💡 Real-World Examples

### Form Submission
```typescript
submitForm() {
  this.http.post('/api/data', this.formData).subscribe({
    next: () => {
      this.toastService.success('Form submitted!', 'Your data has been saved.');
    },
    error: () => {
      this.toastService.error('Submission failed', 'Please try again.');
    }
  });
}
```

### Delete Confirmation
```typescript
deleteItem(id: string) {
  this.service.delete(id).subscribe({
    next: () => {
      this.toastService.success('Deleted!', 'Item removed successfully.');
    },
    error: () => {
      this.toastService.error('Delete failed', 'Unable to delete item.');
    }
  });
}
```

### Copy to Clipboard
```typescript
copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    this.toastService.success('Copied!');
  });
}
```

### File Upload
```typescript
uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  this.http.post('/api/upload', formData).subscribe({
    next: () => {
      this.toastService.success('Upload complete!', `${file.name} uploaded.`);
    },
    error: () => {
      this.toastService.error('Upload failed', `Failed to upload ${file.name}.`);
    }
  });
}
```

---

## ✨ Features

- ✅ **Auto-dismiss** after customizable duration
- ✅ **Click to dismiss** anywhere on the toast
- ✅ **Progress bar** showing remaining time
- ✅ **Smooth animations** (slide in from right)
- ✅ **Stacks multiple toasts** (max 5 visible)
- ✅ **Mobile responsive** (bottom center on small screens)
- ✅ **Dark mode support**
- ✅ **Accessible** (ARIA labels, keyboard support)
- ✅ **4 predefined types** with custom icons

---

## 🎨 Toast Types

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| **Success** | Green | ✓ | Successful actions, confirmations |
| **Error** | Red | ✕ | API errors, validation failures |
| **Warning** | Orange | ⚠ | Session timeouts, important notices |
| **Info** | Purple | ℹ | General information, tips |

---

## 🎯 When to Use

### ✅ Good Use Cases:
- Form submission confirmation
- File upload success/failure
- Copy to clipboard feedback
- Delete confirmation
- Session timeout warnings
- Network status changes
- Quick success/error messages

### ❌ Avoid Using For:
- Critical errors (use modal dialogs)
- Long messages (use alerts or modals)
- Permanent information (use banners)
- User decisions (use confirmation dialogs)

---

## ⚙️ Configuration

### Duration Defaults:
- **Success**: 5000ms (5 seconds)
- **Error**: 7000ms (7 seconds) - longer for errors
- **Warning**: 6000ms (6 seconds)
- **Info**: 5000ms (5 seconds)

### Customization:
You can change colors and styles in `globals.css`:
- `.toast.success` - Green theme
- `.toast.error` - Red theme
- `.toast.warning` - Orange theme
- `.toast.info` - Purple theme

---

## 📱 Mobile Behavior

On screens < 640px:
- Toasts appear at **bottom center** (full width)
- Slide in from **bottom** (not right)
- Slightly smaller padding for mobile

---

## 🌙 Dark Mode

Automatically adapts to dark mode:
```css
.dark .toast {
  background: #18181b;
  border-color: #27272a;
  color: #fafafa;
}
```

---

## 🔧 Advanced Usage

### Prevent Auto-Dismiss
```typescript
// Set duration to 0 for manual dismiss only
this.toastService.show({
  type: 'warning',
  title: 'Important!',
  message: 'Click to dismiss',
  duration: 0
});
```

### Custom Icons
```typescript
this.toastService.show({
  type: 'success',
  title: 'Rocket Launch!',
  icon: '🚀',
  message: 'Deployment successful'
});
```

---

## 🐛 Troubleshooting

**Toast not appearing?**
- Check if `<app-toast></app-toast>` is in `app.component.html`
- Verify ToastComponent is imported in app.component.ts
- Check browser console for errors

**Toast appears in wrong position?**
- Check CSS is loaded properly
- Verify no conflicting CSS on `.toast-container`

**Multiple toasts stacking weird?**
- System limits to 5 toasts max
- Older toasts auto-dismiss to make room

---

## 🎉 That's it!

Your toast notification system is ready to use. Enjoy beautiful notifications! 🍞✨
