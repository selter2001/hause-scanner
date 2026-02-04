# Hause Scanner

> **Cross-platform mobile application built with React, TypeScript, and Capacitor**

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-8.0-119EFF?style=flat-square&logo=capacitor&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

Modern mobile application with native iOS deployment, built using a React + TypeScript stack with Capacitor for cross-platform capabilities.

## Features

- Native iOS app experience via Capacitor
- Responsive UI with Tailwind CSS
- Component library with shadcn/ui (Radix primitives)
- Type-safe development with TypeScript
- Fast development with Vite + HMR
- Testing setup with Vitest

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                     │
│  ┌─────────────────────────────────────────────────────┐│
│  │                   Components                         ││
│  │  (shadcn/ui + Radix UI primitives)                  ││
│  └─────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────┐│
│  │                   React Router                       ││
│  │  (Navigation & routing)                             ││
│  └─────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────┐│
│  │                   TanStack Query                     ││
│  │  (Data fetching & caching)                          ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                      Capacitor                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   iOS       │  │  Android    │  │      Web        │ │
│  │   Native    │  │  Native     │  │    (PWA)        │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 |
| Language | TypeScript 5 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Components | shadcn/ui (Radix) |
| Mobile | Capacitor 8 |
| Data | TanStack Query |
| Forms | React Hook Form + Zod |
| Testing | Vitest |

## Installation

### Prerequisites

- Node.js 18+ or Bun
- Xcode 15+ (for iOS builds)
- CocoaPods (for iOS dependencies)

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/selter2001/hause-scanner.git
   cd hause-scanner
   npm install
   # or
   bun install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   ```
   http://localhost:5173
   ```

### iOS Build

1. **Build web assets**
   ```bash
   npm run build
   ```

2. **Sync Capacitor**
   ```bash
   npx cap sync ios
   ```

3. **Open in Xcode**
   ```bash
   npx cap open ios
   ```

4. **Run on device/simulator**
   - Select target device in Xcode
   - Press `Cmd + R`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |
| `npm run lint` | Lint code |

## Project Structure

```
src/
├── components/     # UI components (shadcn/ui)
├── hooks/          # Custom React hooks
├── lib/            # Utilities and helpers
├── pages/          # Route pages
└── styles/         # Global styles

ios/                # Native iOS project
public/             # Static assets
```

## Development

### Adding Components

This project uses [shadcn/ui](https://ui.shadcn.com/). Add components via:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
```

### Running Tests

```bash
npm run test        # Single run
npm run test:watch  # Watch mode
```

## License

MIT License

## Author

**Wojciech Olszak**

Built with React, TypeScript, and Capacitor.
Created with assistance from Lovable AI.

---

*Hause Scanner | 2026*
