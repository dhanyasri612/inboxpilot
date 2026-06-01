import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import CareerTrackerPage from "./pages/CareerTrackerPage";
import CategoriesPage from "./pages/CategoriesPage";
import CleanupPage from "./pages/CleanupPage";
import DailyBriefPage from "./pages/DailyBriefPage";
import DeadlinesPage from "./pages/DeadlinesPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/career-tracker" element={<CareerTrackerPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/deadlines" element={<DeadlinesPage />} />
        <Route path="/cleanup" element={<CleanupPage />} />
        <Route path="/daily-brief" element={<DailyBriefPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
