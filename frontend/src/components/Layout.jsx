import { useLocation } from "react-router";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import AdminNavbar from "./AdminNavbar";

const Layout = ({ children, showSidebar = false }) => {
  const location = useLocation();
  const isAdminPage = location.pathname?.startsWith("/admin");

  return (
    <div className="min-h-screen">
      <div className="flex">
        {showSidebar && !isAdminPage && <Sidebar />}

        <div className="flex-1 flex flex-col">
          {isAdminPage ? <AdminNavbar /> : <Navbar />}

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};
export default Layout;
