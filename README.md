# VisioCalc 🎨✨

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" />
</div>

## 🌟 Overview

VisioCalc is an innovative AI-powered mathematical calculation tool that transforms handwritten equations and drawings into solved mathematical expressions. Simply draw mathematical expressions on the canvas, and let OpenAI handle the calculations!

## ✨ Features

- **🖌️ Interactive Canvas**: Draw mathematical expressions naturally with your mouse or touch device
- **🤖 AI-Powered Recognition**: Uses OpenAI to recognize and solve mathematical expressions
- **🧮 Advanced Calculations**: Supports complex mathematical operations following PEMDAS rules
- **📊 Variable Support**: Store and use variables across multiple calculations
- **🎨 Customizable Interface**:
  - Multiple pen sizes (small, medium, large)
  - Color palette for drawing
  - Customizable canvas background
  - Eraser tool with adjustable sizes
- **↩️ Undo/Redo**: Full history support for all canvas operations
- **📐 LaTeX Rendering**: Beautiful mathematical notation display using MathJax
- **🖼️ Draggable Results**: Position calculation results anywhere on the canvas
- **🌓 Theme Support**: Light and dark mode support
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Mantine UI** components
- **React Router** for navigation
- **MathJax** for LaTeX rendering
- **React Draggable** for movable results
- **Axios** for API requests

### Backend

- **Node.js** with Express.js
- **OpenAI API** for image recognition and calculation
- **CORS** enabled for cross-origin requests
- **Cookie Parser** for session management

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/VisioCalc.git
   cd VisioCalc
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the backend directory:

   ```env
   PORT=3000
   CLIENT_URL=http://localhost:5173
       OPENAI_API_KEY=your_openai_api_key_here
   ```

   Create a `.env` file in the frontend directory:

   ```env
   VITE_BASE_URL=http://localhost:3000
   ```

4. **Run the application**

   In separate terminals:

   Backend:

   ```bash
   cd backend
   npm run dev
   ```

   Frontend:

   ```bash
   cd frontend
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## 📖 Usage

1. **Drawing**: Click and drag on the canvas to draw mathematical expressions
2. **Calculation**: Click the "Run" button to process your drawing
3. **Variables**: Assign values using expressions like `x = 5`
4. **Clear Canvas**: Use the Reset button to clear everything
5. **Undo/Redo**: Use the undo/redo buttons to navigate through your drawing history
6. **Customize**: Change pen color, background color, and pen/eraser sizes using the toolbar

### Supported Operations

- Basic arithmetic: `+`, `-`, `*`, `/`
- Exponents: `x^2`, `2^3`
- Parentheses: `(2 + 3) * 4`
- Variables: `x = 5`, `y = x + 3`
- Systems of equations
- Graphical math problems
- Abstract concept recognition

## 🏗️ Project Structure

```
VisioCalc/
├── frontend/              # React TypeScript frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React contexts (Theme)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── screens/      # Page components
│   │   └── App.tsx       # Main application component
│   └── package.json
├── backend/              # Node.js Express backend
│   ├── src/
│   │   ├── models/       # Data models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── app.js        # Express application entry
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Frontend Configuration

- Vite configuration: `frontend/vite.config.ts`
- TypeScript configuration: `frontend/tsconfig.json`
- Tailwind configuration: `frontend/tailwind.config.js`

### Backend Configuration

- Express server configuration in `backend/src/app.js`
- AI service configuration in `backend/src/services/calculate.service.js`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for powerful image recognition capabilities
- MathJax for beautiful mathematical notation rendering
- The React and Node.js communities for excellent tools and libraries

## 📧 Contact

Abhishek Kumar - Project Author

Project Link: [https://github.com/Abhi8531/VisioCalc](https://github.com/Abhi8531/VisioCalc)

---

<div align="center">
  Made with ❤️ by Abhishek Kumar
</div>
