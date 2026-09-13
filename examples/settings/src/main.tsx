import React from "react"
import { createRoot } from "react-dom/client"
import "@skiddph/prui/styles.css"
import "./index.css"
import AppShell from "./App"

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>,
)
