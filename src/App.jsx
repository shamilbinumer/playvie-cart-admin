import {
  BrowserRouter as Router,
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
import CategoryList from "./components/pages/AgeBasedCategory/AgeBasedCategoryList";
import CategoryForm from "./components/pages/AgeBasedCategory/AgeBasedCategoryForm";
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
import CustomerDetails from "./components/pages/CustomerDetails/CustomerDetails";
import BlogForm from "./components/pages/portfolio/blog/blog";
import BlogList from "./components/pages/portfolio/blog/BlogList";
import ServiceForm from "./components/pages/portfolio/services/ServiceForm";
import ServiceList from "./components/pages/portfolio/services/ServiceList";
import MainCategoryList from "./components/pages/MainCategory/MainCategoryList";
import MainCategoryForm from "./components/pages/MainCategory/MainCategoryForm";
import RecomentedForYouForm from "./components/pages/Offers/RecomentedForYou/RecomentedForYouForm";
import RecomentedForYouList from "./components/pages/Offers/RecomentedForYou/RecomentedForYouList";
import PortfolioBannerList from "./components/pages/portfolio/banner/PortfolioBannerList";
import PortfolioBannersForm from "./components/pages/portfolio/banner/PortfolioBannersForm";
import CouponManageList from "./components/pages/CouponManagement/CouponManageList";
import CancelledOrders from "./components/pages/Orders/CancelledOrders";
import ReturnOrdersList from "./components/pages/Orders/ReturnedOrders/ReturnOrdersList";
import ReturnedOrderDetailPage from "./components/pages/Orders/ReturnedOrders/ReturnedOrderDetailPage";
import SizeUnit from "./components/pages/SizeUnit/SizeUnit";


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
            <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            {/* Category */}
            <Route path="/master/age-based-category-list" element={<ProtectedRoute><CategoryList /></ProtectedRoute>} />
            <Route path="/master/add-age-based-category" element={<ProtectedRoute><CategoryForm /></ProtectedRoute>} />
            <Route path="/master/edit-age-based-category/:categoryId" element={<ProtectedRoute><CategoryForm /></ProtectedRoute>} />
            {/* Main Category */}
            <Route path="/master/category-list" element={<ProtectedRoute><MainCategoryList /></ProtectedRoute>} />
            <Route path="/master/add-category" element={<ProtectedRoute><MainCategoryForm /></ProtectedRoute>} />
            <Route path="/master/edit-category/:categoryId" element={<ProtectedRoute><MainCategoryForm /></ProtectedRoute>} />
            {/* Brand */}
            <Route path="/master/brand-list" element={<ProtectedRoute><BrandList /></ProtectedRoute>} />
            <Route path="/master/add-brand" element={<ProtectedRoute><BrandForm /></ProtectedRoute>} />
            <Route path="/master/edit-brand/:brandId" element={<ProtectedRoute><BrandForm /></ProtectedRoute>} />
            {/* Size Unit */}
            <Route path="/master/size-unit-list" element={<ProtectedRoute><SizeUnit /></ProtectedRoute>} />
            {/* Product */}
            <Route path="/product-list" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
            <Route path="/add-product" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
            <Route path="/view-product/:productId" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
            <Route path="/edit-product/:productId" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
            {/* Banners */}
            <Route path="/banners/banner-list" element={<ProtectedRoute><BannersList /></ProtectedRoute>} />
            <Route path="/banners/add-banner" element={<ProtectedRoute><BannersForm /></ProtectedRoute>} />
            <Route path="/banners/edit-banner/:bannerId" element={<ProtectedRoute><BannersForm /></ProtectedRoute>} />
            {/* Users */}
            <Route path="/users/customers" element={<ProtectedRoute><CustomerList /></ProtectedRoute>} />
            <Route path="/users/customers/:customerName/:customerId" element={<ProtectedRoute><CustomerDetails /></ProtectedRoute>} />
            <Route path="/users/admins" element={<ProtectedRoute><UsersList /></ProtectedRoute>} />
            {/* Portfolio */}
            <Route path="/portfolio/serviceEnquiry" element={<ProtectedRoute><ServiceEnquiryList /></ProtectedRoute>} />
            <Route path="/portfolio/gallery" element={<ProtectedRoute><GalleryList /></ProtectedRoute>} />
            <Route path="/portfolio/gallery/galleryForm" element={<ProtectedRoute><PortFolioGalleryForm /></ProtectedRoute>} />
            <Route path="/portfolio/blog/Blog" element={<ProtectedRoute><BlogList /></ProtectedRoute>} />
            <Route path="/portfolio/blog/BlogForm" element={<ProtectedRoute><BlogForm /></ProtectedRoute>} />
            <Route path="/portfolio/service/ServiceForm" element={<ProtectedRoute><ServiceForm /></ProtectedRoute>} />
            <Route path="/portfolio/service/ServiceList" element={<ProtectedRoute><ServiceList /></ProtectedRoute>} />
            <Route path="/portfolio/Banner/PortfolioBannerList" element={<ProtectedRoute><PortfolioBannerList/></ProtectedRoute>} />
            <Route path="/portfolio/Banner/PortfolioBannerForm" element={<ProtectedRoute><PortfolioBannersForm/></ProtectedRoute>} />
            {/* PlaySchool Website */}
            <Route path="/playschool/admissionEnquiry" element={<ProtectedRoute><AdmissionEnquiryList /></ProtectedRoute>} />
            <Route path="/playschool/galley-list" element={<ProtectedRoute><PlayschoolGalleyList /></ProtectedRoute>} />
            <Route path="/playschool/add-gallrey" element={<ProtectedRoute><PlayschoolGalleryForm /></ProtectedRoute>} />
            <Route path="/playschool/edit-gallery/:galleryId" element={<ProtectedRoute><PlayschoolGalleryForm /></ProtectedRoute>} />
            <Route path="/playschool/franchiseEnquiry" element={<ProtectedRoute><FranchiseEnquiryList /></ProtectedRoute>} />
            {/* Orders */}
            <Route path="/orders/order-list" element={<ProtectedRoute><OrderList /></ProtectedRoute>} />
            <Route path="/orders/order-list/order-details/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path="/orders/cancelled-orders" element={<ProtectedRoute><CancelledOrders /></ProtectedRoute>} />
            <Route path="/orders/return-orders" element={<ProtectedRoute><ReturnOrdersList /></ProtectedRoute>} />
            <Route path="/orders/return-order-details/:orderId" element={<ProtectedRoute><ReturnedOrderDetailPage /></ProtectedRoute>} />
            {/* Inventory */}
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            {/* Offers */}
            <Route path="/offers/recommended-for-you" element={<ProtectedRoute><RecomentedForYouList/></ProtectedRoute>} />
            <Route path="/offers/add-recommended-for-you" element={<ProtectedRoute><RecomentedForYouForm /></ProtectedRoute>} />
            <Route path="/recommended-for-you/edit-recommended-for-you/:recomentedForYouId" element={<ProtectedRoute><RecomentedForYouForm /></ProtectedRoute>} />

          
            <Route path="/offers/coupon-management" element={<ProtectedRoute><CouponManageList /></ProtectedRoute>} />

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
