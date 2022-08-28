import { useState } from "react";
import "./App.css";
import ColorPalette from "./UI/ColorPalette/ColorPalette";

function App() {
  const [light, setLight] = useState(true);

  return (
    <div className={`colorpicker ${light ? `light` : `dark`}`}>
      <button onClick={() => setLight(!light)} className="mode_button">
        Light Mode
      </button>
      <ColorPalette />
    </div>
  );
}

export default App;
