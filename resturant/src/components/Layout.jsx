import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const PAGE_TITLES = {
  dashboard:     "Dashboard",
  menu:          "Menu Management",
  "create-order":"New Order",
  orders:        "Order Management",
  kitchen:       "Kitchen Queue",
  delivered:     "Delivered Orders",
  history:       "Order History",
  settings:      "Settings",
};

export default function Layout({ user, onLogout, children, currentPage, onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F5F0E6] font-sans overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        userRole={user?.role || "admin"}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          user={user}
          onLogout={onLogout}
          onMobileMenuOpen={() => setMobileOpen(true)}
          pageTitle={PAGE_TITLES[currentPage] || ""}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
