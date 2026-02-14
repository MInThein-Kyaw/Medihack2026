# Medihack Frontend

React + TypeScript + Vite frontend for the Nurse Competency Assessment platform.

## Tech Stack

- **React 19** with TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Web Speech API** - Voice recognition
- **Recharts** - Data visualization

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Endpoint

The frontend connects to the backend API at `http://localhost:3001` by default.

If your backend runs on a different port, update `services/apiService.ts`:

```typescript
const API_URL = 'http://localhost:YOUR_PORT/api';
```

### 3. Start Development Server

```bash
npm run dev
```

Runs on **http://localhost:5173**

### 4. Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── components/          # React components
│   ├── Assessment.tsx   # Main assessment interface
│   ├── Dashboard.tsx    # Results dashboard
│   ├── Login.tsx        # Authentication
│   ├── Report.tsx       # IDP reports
│   └── Avatar.tsx       # AI avatar visual
├── services/
│   └── apiService.ts    # Backend API calls
├── types.ts             # TypeScript interfaces
├── constants.ts         # App constants & translations
├── App.tsx              # Main app component
└── index.tsx            # Entry point
```

## Features

- **Voice/Text Input** - Tap to record, or type answers
- **Bilingual UI** - Thai & English toggle
- **Real-time Feedback** - AI voice responses
- **Progress Tracking** - Visual indicators
- **Responsive Design** - Works on all devices

## Environment Variables

Not needed! API key is now securely stored in the backend.

## Development

**Hot Module Replacement (HMR)** is enabled - changes reflect instantly during development.

## Browser Requirements

- Modern browser with Web Speech API support
- Chrome, Edge, or Safari recommended
- Microphone permissions required for voice input
