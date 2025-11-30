import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Navbar from "./components/common/Navbar";
import Dashboard from "./components/pages/Dashboard";
import Sidebar from "./components/common/Sidebar";
import NotFound from "./components/pages/NotFound";
import CategoryList from "./components/pages/Category/CategoryList";
import CategoryForm from "./components/pages/Category/CategoryForm";
import BrandList from "./components/pages/Brand/BrandList";
import BrandForm from "./components/pages/Brand/BrandForm";
import ProductList from "./components/pages/Product/ProductList";
import ProductForm from "./components/pages/Product/ProductForm";

import AdminRegisterPage from "./components/pages/SIgnup";
import Login from "./components/pages/Login";
import ProtectedRoute from "./components/common/ProtectedRoute";
import BannersList from "./components/pages/Banners/BannersList";
import BannersForm from "./components/pages/Banners/BannersForm";
import CustomerList from "./components/pages/users/CustomerList";
import UsersList from "./components/pages/users/UsersList";
import ServiceEnquiryList from "./components/pages/portfolio/enquiry/service_enquiry";
import AdmissionEnquiryList from "./components/pages/PlaySchool/AdmissionEnquiry/AdmissionEnquiryList";
import FranchiseEnquiryList from "./components/pages/PlaySchool/Frachise/FranchiseEquiryList";
import OrderList from "./components/pages/Orders/OrderList";
import OrderDetails from "./components/pages/Orders/OrderDetails";
import GalleryList from "./components/pages/portfolio/gallery/galleryList";
import PortFolioGalleryForm from "./components/pages/portfolio/gallery/GalleryForm";
import PlayschoolGalleyList from "./components/pages/PlaySchool/Gallery/GalleryList";
import PlayschoolGalleryForm from "./components/pages/PlaySchool/Gallery/galleryForm";
import Inventory from "./components/pages/Inventory/Inventory";

function AppLayout() {
  const location = useLocation();

  // Routes that don't use Navbar/Sidebar
  const noLayoutRoutes = ["/create-new-admin", "/login"];
  const isNoLayout = noLayoutRoutes.includes(location.pathname);



  return (
    <>
      {!isNoLayout && <Navbar />}
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {!isNoLayout && <Sidebar />}
        <div style={{ flex: 1 }} className={!isNoLayout ? "pt-14" : ""}>
          <Routes>
            {/* Public Routes */}
            <Route path="/create-new-admin" element={<AdminRegisterPage />} />
            <Route path="/edit-admin/:adminId" element={<AdminRegisterPage />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/master/category-list"
              element={
                <ProtectedRoute>
                  <CategoryList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/master/add-category"
              element={
                <ProtectedRoute>
                  <CategoryForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/master/edit-category/:categoryId"
              element={
                <ProtectedRoute>
                  <CategoryForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/master/brand-list"
              element={
                <ProtectedRoute>
                  <BrandList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/master/add-brand"
              element={
                <ProtectedRoute>
                  <BrandForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/master/edit-brand/:brandId"
              element={
                <ProtectedRoute>
                  <BrandForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product-list"
              element={
                <ProtectedRoute>
                  <ProductList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-product"
              element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-product/:productId"
              element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/banners/banner-list"
              element={
                <ProtectedRoute>
                  <BannersList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/banners/add-banner"
              element={
                <ProtectedRoute>
                  <BannersForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/banners/edit-banner/:bannerId"
              element={
                <ProtectedRoute>
                  <BannersForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/customers"
              element={
                <ProtectedRoute>
                  <CustomerList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/admins"
              element={
                <ProtectedRoute>
                  <UsersList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portfolio/serviceEnquiry"
              element={
                <ProtectedRoute>
                  <ServiceEnquiryList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portfolio/gallery"
              element={
                <ProtectedRoute>
                  <GalleryList />

                </ProtectedRoute>
              }
            />
            <Route
              path="/portfolio/gallery/galleryForm"
              element={
                <ProtectedRoute>
                  <PortFolioGalleryForm />

                </ProtectedRoute>
              }
            />
            <Route
              path="/playschool/admissionEnquiry"
              element={
                <ProtectedRoute>
                  <AdmissionEnquiryList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playschool/galley-list"
              element={
                <ProtectedRoute>
                  <PlayschoolGalleyList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playschool/add-gallrey"
              element={
                <ProtectedRoute>
                  <PlayschoolGalleryForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playschool/edit-gallery/:galleryId"
              element={
                <ProtectedRoute>
                  <PlayschoolGalleryForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playschool/franchiseEnquiry"
              element={
                <ProtectedRoute>
                  <FranchiseEnquiryList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/order-list"
              element={
                <ProtectedRoute>
                  <OrderList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/order-list/order-details/:orderId"
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
