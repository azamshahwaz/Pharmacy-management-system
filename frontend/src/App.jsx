import {
  BrowserRouter,
} from "react-router-dom";

import {
  ToastContainer,
} from "react-toastify";

import AppRoutes
from "./routes/AppRoutes";

import
"react-toastify/dist/ReactToastify.css";

function App() {

  return (

<div data-theme="forest">
    <BrowserRouter>

      <ToastContainer
  position="top-right"
  autoClose={3000}
  theme="colored"
  toastStyle={{
    borderRadius: "16px",
  }}
/>
      <AppRoutes />

    </BrowserRouter>
    </div>
  );
}

export default App;