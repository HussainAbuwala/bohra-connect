import NavBar from "./components/NavBar";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Connect from "./pages/Connect";
import {Routes, Route } from "react-router-dom";

function App() {
   return (
      <>
      <NavBar />
      <Routes>
         <Route
            path="/"
            element={<About />}
         />
         <Route
            path="/Connect"
            element={<Connect />}
         />
         <Route
            path="/Dashboard"
            element={<Dashboard />}
         />
      </Routes>
      </>
   );
}

export default App;
