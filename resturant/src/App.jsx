import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import MenuManagementPage from "./pages/MenuManagementPage";
import CreateOrderPage from "./pages/CreateOrderPage";
import OrderManagementPage from "./pages/OrderManagementPage";
import KitchenQueuePage from "./pages/KitchenQueuePage";
import DeliveredOrdersPage from "./pages/DeliveredOrdersPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import SettingsPage from "./pages/SettingsPage";

// Role-based page access guard
const ADMIN_PAGES = ["dashboard","menu","create-order","orders","delivered","history","settings"];
const CHEF_PAGES  = ["kitchen","settings"];

function getDefaultPage(role) {
  return role === "chef" ? "kitchen" : "dashboard";
}

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  const handleLogin = (userData) => {
    setUser(userData);
    setPage(getDefaultPage(userData.role));
  };

  const handleLogout = () => {
    setUser(null);
    setPage("dashboard");
  };

  const handleNavigate = (newPage) => {
    const allowed = user?.role === "chef" ? CHEF_PAGES : ADMIN_PAGES;
    if (allowed.includes(newPage)) setPage(newPage);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard":    return <DashboardPage onNavigate={handleNavigate} />;
      case "menu":         return <MenuManagementPage />;
      case "create-order": return <CreateOrderPage onNavigate={handleNavigate} />;
      case "orders":       return <OrderManagementPage />;
      case "kitchen":      return <KitchenQueuePage />;
      case "delivered":    return <DeliveredOrdersPage />;
      case "history":      return <OrderHistoryPage />;
      case "settings":     return <SettingsPage user={user} />;
      default:             return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  // Create Order page needs full height (POS layout), skip inner padding
  const isFullHeight = page === "create-order";

  return (
    <Layout user={user} onLogout={handleLogout} currentPage={page} onNavigate={handleNavigate}>
      {isFullHeight
        ? <div className="-m-4 lg:-m-6 h-[calc(100vh-3.5rem)] p-4 lg:p-6">{renderPage()}</div>
        : renderPage()
      }
    </Layout>
  );
}
