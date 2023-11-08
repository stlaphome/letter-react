import "./App.css";

import { Routes, Route, Navigate } from "react-router-dom";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import TextEditor from "./components/DynamicReport/TextEditor";
import TriggerView from "./components/DynamicReport/TriggerView";

function App() {
  return (
    <>
      <div className="App">
        <Routes>
          <Route path="/stlap/home/letterGeneration" element={<TextEditor />} />
          <Route
            path="/stlap/home/letterGenerationTrigger"
            element={<TriggerView />}
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
