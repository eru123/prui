import React from "react"
import { createRoot } from "react-dom/client"
import { applyTheme } from "@skiddph/prui/theme"
import "@skiddph/prui/styles.css"
import "./index.css"
import AppShell from "./App"

// fixed daylight theme: applied once, no switcher in the shell (theme={false})
applyTheme({ theme: "daylight", storageKey: null })

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>,
)
