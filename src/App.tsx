import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import AuthGate from "./components/AuthGate/AuthGate";
import AppLayout from "./components/AppLayout/AppLayout";
import StoreRoute from "./components/StoreRoute/StoreRoute";
import FormPage from "./pages/FormPage";
import TablePage from "./pages/TablePage";
import { getLastStore } from "./lib/store";

const App: React.FC = () => (
  <AuthGate>
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="/:store"
            element={<StoreRoute>{(store) => <TablePage key={store} store={store} />}</StoreRoute>}
          />
          <Route
            path="/:store/new"
            element={<StoreRoute>{(store) => <FormPage store={store} />}</StoreRoute>}
          />
          {/* Köhnə ünvan: /table əvvəllər Shein cədvəli idi */}
          <Route path="/table" element={<Navigate to="/shein" replace />} />
          <Route path="*" element={<Navigate to={`/${getLastStore()}`} replace />} />
        </Route>
      </Routes>
    </Router>
  </AuthGate>
);

export default App;
