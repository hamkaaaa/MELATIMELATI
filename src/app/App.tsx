import React from "react";
import { RouterProvider } from "react-router-dom";
import { AppProvider } from "./context";
import { router } from "./routes";

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
