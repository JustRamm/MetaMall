# 🏙️ MetaMall | Virtual 3D Shopping Experience

MetaMall is a high-fidelity, immersive 3D virtual shopping mall built for the web. Experience world-class flagship stores like **H&M** in a hyper-realistic 3D environment directly in your browser.

![MetaMall Showcase](https://raw.githubusercontent.com/JustRamm/MetaMall/main/src/assets/logo.png)

## 🚀 Experience the Future of Retail

MetaMall bridges the gap between physical and digital shopping using cutting-edge web technologies. Walk through stores, interact with products, and explore a meticulously designed retail environment.

### ✨ Key Features

- **Immersive 3D Walkthrough**: Full first-person navigation (WASD + Mouse) inside a multi-floor flagship store.
- **Architectural Realism**: Detailed industrial ceiling systems, glass elevators, escalators, and realistic lighting.
- **Living Environment**: Animated NPCs including security guards, cashiers, and store associates.
- **Merchandising**: Realistic product displays featuring folded clothes, hanging racks, shoe galleries, and accessory bars.
- **High-End Visuals**: Advanced post-processing including **Bloom** and **SSAO** for deep, atmospheric lighting.
- **Security & Safety**: Integrated security pedestals, illuminated exit signs, and fire safety equipment.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/)
- **3D Engine**: [Three.js](https://threejs.org/)
- **React Components for Three.js**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- **3D Utilities**: [React Three Drei](https://github.com/pmnd.rs/drei)
- **Post-Processing**: [React Three Postprocessing](https://github.com/pmnd.rs/react-postprocessing)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)

---

## 🏃 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/JustRamm/MetaMall.git
   cd MetaMall
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to `http://localhost:5173` to explore the mall!

---

## 🎮 Controls

| Action | Control |
|--------|---------|
| **Move** | `W`,`A`,`S`,`D` or `Arrow Keys` |
| **Look Around** | `Mouse Movement` |
| **Interact** | `Z` (Open Fitting Room Doors) |
| **Exit Simulator**| `Exit Button` (Top Right) |

---

## 📂 Project Structure

- `src/components/HMSimulator.tsx`: The core 3D flagship store environment.
- `src/components/HomePage.tsx`: Store selection and landing experience.
- `src/components/SplashScreen.tsx`: Animated loading experience.
- `src/components/ui/`: Reusable UI components (Buttons, Inputs, Auth).
- `src/assets/`: Branding and texture assets.

---

## 📄 License

This project is licensed under the MIT License.

---

Developed with ❤️ by the MetaMall Team.
