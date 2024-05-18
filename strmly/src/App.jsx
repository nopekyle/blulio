import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Pages/Login";
import "./App.css";
import Register from "./Pages/Register";
import Home from "./Pages/Home";
import Profile from "./Pages/Profile";
import Notifications from "./Pages/Notifications";
import Settings from "./Pages/Settings";
import Subscriptions from "./Pages/Subscriptions";
import Upload from "./Pages/Upload";
import Edit from "./Pages/Edit";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Terms from "./Pages/Terms";
import Privacy from "./Pages/Privacy";
import Failed from "./Pages/Failed";

const stripePromise = loadStripe("your stripe key");

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/:username",
      element: <Profile />,
    },
    {
      path: "/notifications",
      element: <Notifications />,
    },
    {
      path: "/settings",
      element: <Settings />,
    },
    {
      path: "/subscriptions",
      element: <Subscriptions />,
    },
    {
      path: "/upload",
      element: <Upload />,
    },
    {
      path: "/edit",
      element: <Edit />,
    },
    {
      path: '/terms',
      element: <Terms/>
    },
    {
      path: '/privacy',
      element: <Privacy/>
    },
    {
      path: '/failed',
      element: <Failed/>
    }
  ]);

  return (
    <Elements stripe={stripePromise}>
      <RouterProvider router={router}></RouterProvider>
    </Elements>
  );
}

export default App;
