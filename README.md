# Fisher Employee | Modern Employee Management Landing Page

A premium, highly interactive, and design-forward landing page built for the **Fisher Employee** workforce management platform. This project showcases modern front-end design paradigms including glassmorphism, responsive grid layouts, scroll-activated animations, and a fully functional interactive sandbox.

---

## 🚀 Key Features

- **Live System Sandbox**: A hands-on, interactive roster dashboard workspace where users can:
  - Add mock employees to the directory.
  - Cycle attendance status between *On Duty*, *Remote*, and *On Leave* in real-time.
  - Remove employees from the roster.
  - Observe real-time metric updates (Total Staff, On Duty count, Attendance Rate) without page reloads.
- **Vibrant & Premium Aesthetics**: Sleek dark slate default theme, deep neon gradient borders, glassmorphic elements (`backdrop-filter`), and floating card animations.
- **Adaptive Light/Dark Theme Switcher**: Toggle styles seamlessly with custom CSS design tokens. User theme selections are persisted in `localStorage`.
- **Responsive Layouts**: Optimizations for mobile, tablet, and desktop viewports, with a slide-out hamburger menu transition for smaller devices.
- **Scroll reveal transitions**: Subtle entry animations triggered on scroll using the browser's `IntersectionObserver` API.

---

## 📁 File Structure

The project is structured with pure semantic HTML, vanilla CSS, and vanilla JS, requiring no build tools or package configurations:

- `index.html` - Contains the semantic HTML5 structure of the headers, hero, stats, interactive sandbox, features, testimonial sliders, CTA, and footers.
- `styles.css` - Declares the design variables, typography (Google Fonts Outfit & Inter), animations, layouts, and responsive media query blocks.
- `app.js` - Controls the roster state, aggregates calculation logic, theme toggling, custom slider transitions, and observer elements.

---

## 🛠️ Getting Started

Since the page uses native web standards, you can open and run it locally without installing any package managers:

1. **Option A: Direct Execution**
   - Double-click or open [index.html](file:///d:/Fish-Employee/index.html) inside any modern web browser (Chrome, Edge, Firefox, Safari).

2. **Option B: Local Server hosting**
   - If you prefer running a local server environment, run one of the following commands in the project directory:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx http-server -p 8000
     ```
   - Then open `http://localhost:8000` in your browser.

---

## 🎨 Design System & Technologies Used

- **Fonts**: [Outfit](https://fonts.google.com/specimen/Outfit) (Headings & Metrics), [Inter](https://fonts.google.com/specimen/Inter) (Body Text)
- **Icons**: [FontAwesome 6](https://fontawesome.com/) loaded securely via CDN.
- **CSS Techniques**: Custom CSS Custom Variables, Flexbox, Grid, Glassmorphic blurs, Keyframe animations.
- **JS Features**: Native ES6, LocalStorage, IntersectionObserver API.
