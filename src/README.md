# 🚀 Agent Operations Platform - Angular Application

A comprehensive Angular-based platform for managing AI agent operations, contexts, sessions, and memory with a beautiful **purple-to-teal gradient design system**.

---

## ✨ Features

### 🎨 **Modern Gradient Design**
- Purple (#8B5CF6) to Teal (#06B6D4) gradient theme
- Beautiful shadow effects and animations
- Responsive design for all devices

### 📊 **Core Modules**
- **Dashboard** - Overview with metrics and stats
- **Context Management** - Create, search, and manage contexts
- **Agent Management** - Configure and monitor AI agents
- **Session Management** - Track user interactions
- **Memory Management** - Store and retrieve agent memory
- **Audit Logs** - Track all system activities
- **Cost Metrics** - Monitor usage and costs
- **Sentiment Analysis** - Analyze user sentiment
- **RBAC** - Role-based access control

### 🧭 **Navigation Structure**
- **Context** (4 submenus)
  - Context Management
  - Create Context
  - Search Context
  - Reflection Context
- **User Interaction** (2 submenus)
  - Agents
  - Sessions
- **Memory** (2 submenus)
  - Create Memory
  - Search Memory
- **Diagnosis** (3 submenus)
  - Audit Log
  - Cost Metrics
  - Sentiment Analysis
- **RBAC** - User roles & permissions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- Angular CLI 17

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm start
   # or
   ng serve
   ```

3. **Open in browser:**
   ```
   http://localhost:4200/
   ```

### Build for Production
```bash
ng build --configuration production
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                    # Core functionality
│   │   ├── guards/             # Route guards
│   │   ├── interceptors/       # HTTP interceptors
│   │   ├── layout/             # Layout components
│   │   │   ├── navbar/        # Gradient navbar
│   │   │   └── sidebar/       # Sidebar navigation
│   │   └── services/          # Core services
│   ├── features/               # Feature modules
│   │   ├── admin/             # Admin & context management
│   │   ├── agent/             # Agent management
│   │   ├── audit/             # Audit logging
│   │   ├── context/           # Context operations
│   │   ├── cost-metrics/      # Cost tracking
│   │   ├── dashboard/         # Dashboard
│   │   ├── memory/            # Memory management
│   │   ├── rbac/              # Access control
│   │   ├── sentiment/         # Sentiment analysis
│   │   └── session/           # Session management
│   └── shared/                # Shared components
│       ├── components/        # Reusable components
│       │   ├── button/       # Gradient buttons
│       │   ├── card/         # Card component
│       │   ├── loader/       # Loading spinner
│       │   └── modal/        # Modal dialogs
│       └── shared.module.ts
└── assets/
    └── styles/
        ├── globals.css        # Global styles & gradients
        └── ats-utilities.css  # Utility classes
```

---

## 🎨 Design System

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| **Purple (Primary)** | `#8B5CF6` | Primary actions, gradients |
| **Teal (Accent)** | `#06B6D4` | Accents, gradients |
| **Purple Dark** | `#7C3AED` | Hover states |
| **Teal Dark** | `#0891B2` | Hover states |

### Gradients
```css
/* Primary Gradient (135° angle) */
background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%);

/* Hover State */
background: linear-gradient(135deg, #7C3AED 0%, #0891B2 100%);
```

### Applied To:
- ✅ Navbar background
- ✅ Section headers (Dashboard, User Management)
- ✅ Primary buttons
- ✅ Hero sections
- ✅ Progress bars
- ✅ Active/hover states

---

## 🛠 Technology Stack

- **Framework:** Angular 17
- **Language:** TypeScript 5.2
- **Styling:** SCSS + CSS Variables
- **Icons:** Font Awesome 6.4
- **HTTP:** RxJS + HttpClient
- **Notifications:** ngx-toastr
- **Date:** date-fns
- **Build:** Angular CLI + Webpack

---

## 📄 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server on port 4200 |
| `npm run build` | Build for production |
| `npm test` | Run unit tests |
| `npm run lint` | Lint TypeScript files |
| `ng serve --port 4300` | Run on custom port |

---

## 🔧 Configuration

### Environment Files
- **Development:** `src/environments/environment.ts`
- **Production:** `src/environments/environment.prod.ts`

### API Configuration
Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  apiTimeout: 30000
};
```

---

## 📱 Responsive Design

Breakpoints:
- **Mobile:** 375px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+

All components are fully responsive and tested across devices.

---

## 🧪 Testing

### Run Tests
```bash
ng test
```

### Run E2E Tests
```bash
ng e2e
```

---

## 📦 Deployment

### Build Production Bundle
```bash
ng build --configuration production
```

### Deploy to:
- **Netlify:** Drag & drop `dist/` folder
- **Vercel:** Connect GitHub repository
- **AWS S3:** Upload `dist/` folder
- **Firebase:** `firebase deploy`

---

## 📚 Documentation

- **Download Guide:** `/DOWNLOAD_AND_RUN.md`
- **Gradient Theme:** `/GRADIENT_THEME_IMPLEMENTED.md`
- **Setup Guide:** `/SETUP_GUIDE.md`
- **Testing:** `/TESTING_CHECKLIST.md`

---

## 🎯 Key Features Implemented

### ✅ Gradient Theme
- [x] Purple-teal gradient variables
- [x] Navbar with gradient background
- [x] Gradient buttons with shadow effects
- [x] Section headers with gradients
- [x] Hover states and animations
- [x] Responsive gradient layouts

### ✅ Navigation
- [x] Main navbar with dropdowns
- [x] Sidebar navigation
- [x] Breadcrumb navigation
- [x] Mobile responsive menu

### ✅ Forms
- [x] Context creation form
- [x] Agent management form
- [x] User management form
- [x] Validation and error handling

### ✅ Components
- [x] Reusable button component
- [x] Card component
- [x] Modal component
- [x] Loader component
- [x] Table component

---

## 🔮 Future Enhancements

- [ ] Dark mode toggle
- [ ] Advanced filtering
- [ ] Export to PDF/Excel
- [ ] Real-time notifications
- [ ] WebSocket integration
- [ ] Advanced charts
- [ ] User preferences
- [ ] Multi-language support

---

## 📞 Support

For issues or questions:
1. Check `/DOWNLOAD_AND_RUN.md` for troubleshooting
2. Review Angular documentation
3. Check GitHub user stories repository

---

## 📄 License

This project is part of the Context-UI platform by Aspire Systems India Private Limited.

---

## 🎉 Getting Started

1. **Install dependencies:** `npm install`
2. **Start server:** `npm start`
3. **Open browser:** `http://localhost:4200/`
4. **Enjoy the gradient theme!** 🚀

---

**Built with ❤️ using Angular 17**  
**Design System:** Purple-Teal Gradient Theme 🎨  
**Status:** Production Ready ✅
