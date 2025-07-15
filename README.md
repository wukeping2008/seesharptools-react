# SeeSharpTools-React

🚀 **Professional Test & Measurement Instrument Control Library - React Edition**

A modern web-based test and measurement control platform built with React 18 + TypeScript, featuring AI-powered control generation, real-time data visualization, and professional instrument controls.

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF.svg)](https://vitejs.dev/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5.12+-1890FF.svg)](https://ant.design/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🌟 Features

### 🎯 Core Capabilities
- **Modern Architecture**: Built with React 18, TypeScript, and Vite for optimal performance
- **Professional UI**: Ant Design components with custom themes (Light/Dark mode)
- **Internationalization**: Full i18n support with Chinese/English languages
- **AI-Powered**: Integrated DeepSeek AI for natural language control generation
- **Real-time Data**: Live data visualization with high-performance charts
- **Responsive Design**: Mobile-friendly and adaptive layouts

### 🔧 Control Components
- **Simple Controls**: Buttons, LED indicators, circular gauges
- **Professional Instruments**: Oscilloscopes, signal generators, multimeters
- **Advanced Charts**: Real-time strip charts, spectrum analyzers, waveform displays
- **Data Acquisition**: Temperature sensors, DIO cards, measurement devices

### 🤖 AI Features
- **Natural Language Processing**: Generate controls using plain English descriptions
- **Smart Templates**: Pre-built control templates for common scenarios
- **Code Generation**: Automatic React component generation
- **Interactive Preview**: Real-time preview of generated controls

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/wukeping2008/seesharptools-react.git
   cd seesharptools-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy environment template
   cd backend
   cp .env.example .env
   
   # Edit .env file and add your API keys
   # VOLCES_DEEPSEEK_API_KEY=your_actual_api_key_here
   ```

4. **Start development servers**
   ```bash
   # Start frontend (Port 3002)
   npm run dev
   
   # Start backend (Port 3001)
   cd backend && npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3002`

## 📁 Project Structure

```
seesharptools-react/
├── src/
│   ├── components/          # Reusable components
│   │   ├── simple/         # Simple control components
│   │   ├── charts/         # Chart components
│   │   │   ├── core/       # Chart architecture
│   │   │   └── ...
│   │   └── professional/   # Professional instruments
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API and business logic
│   ├── stores/             # State management (Zustand)
│   ├── styles/             # Global styles and themes
│   ├── i18n/               # Internationalization
│   └── types/              # TypeScript definitions
├── backend/                # Node.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business services
│   │   └── types/          # Backend types
│   └── data/               # JSON data storage
└── docs/                   # Documentation
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Hooks
- **Language**: TypeScript 5.0+
- **Build Tool**: Vite 5.0+
- **UI Library**: Ant Design 5.12+
- **State Management**: Zustand
- **Routing**: React Router v6
- **Styling**: Styled-Components + SCSS
- **Charts**: ECharts + React-ECharts
- **Internationalization**: react-i18next

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **AI Integration**: DeepSeek API
- **Data Storage**: JSON files (lightweight)
- **Real-time**: WebSocket support

## 📊 Component Library

### Simple Controls
- **SimpleButton**: Customizable buttons with hover effects
- **SimpleLEDIndicator**: LED indicators with blinking animations
- **SimpleCircularGauge**: SVG-based circular gauges with thresholds

### Chart Components
- **EasyChart**: General-purpose chart component
- **StripChart**: Real-time data strip charts
- **EnhancedStripChart**: Professional strip charts with multiple themes

### Professional Instruments
- **Oscilloscope**: Digital oscilloscope interface
- **SignalGenerator**: Waveform generation controls
- **DigitalMultimeter**: Multi-measurement display
- **DataAcquisitionCard**: Data acquisition interfaces

## 🎨 Theming & Customization

### Theme System
```typescript
// Light/Dark mode support
const { theme, toggleTheme } = useAppStore()

// Custom theme configuration
const customTheme = {
  token: {
    colorPrimary: '#2E86AB',
    borderRadius: 8,
    // ... more customizations
  }
}
```

### Internationalization
```typescript
// Language switching
const { t, i18n } = useTranslation()
i18n.changeLanguage('en') // or 'zh-CN'
```

## 🤖 AI Control Generation

### Usage Example
```typescript
const { generateControl, isLoading } = useAIControl()

// Generate control from natural language
const result = await generateControl({
  description: "Create a temperature gauge with warning thresholds",
  type: "gauge",
  parameters: {
    min: 0,
    max: 100,
    warningThreshold: 80
  }
})
```

## 📈 Performance Features

- **Code Splitting**: Lazy loading for optimal bundle size
- **Virtual Scrolling**: Handle large datasets efficiently
- **WebGL Rendering**: High-performance chart rendering
- **Memory Optimization**: Efficient component lifecycle management

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📚 Documentation

- [Development Plan](./REACT_DEVELOPMENT_PLAN.md) - Detailed development roadmap
- [Component Migration Guide](./COMPONENT_MIGRATION_GUIDE.md) - Vue to React migration
- [Technical Architecture](./TECHNICAL_ARCHITECTURE_ANALYSIS.md) - System architecture
- [API Documentation](./docs/api.md) - Backend API reference

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The web framework used
- [Ant Design](https://ant.design/) - UI component library
- [ECharts](https://echarts.apache.org/) - Charting library
- [DeepSeek](https://www.deepseek.com/) - AI model integration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/wukeping2008/seesharptools-react/issues)
- **Discussions**: [GitHub Discussions](https://github.com/wukeping2008/seesharptools-react/discussions)
- **Email**: keping.wu@jytek.com

---

**Built with ❤️ by the SeeSharpTools Team**

*Empowering engineers with modern web-based test and measurement solutions.*
