import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Navbar from "./components/common/Navbar";
import Dashboard from "./components/pages/Dashboard";
import Sidebar from "./components/layout/Sidebar";
import NotFound from "./components/pages/NotFound";
import CategoryList from "./components/pages/Category/CategoryList";
import CategoryForm from "./components/pages/Category/CategoryForm";
import BrandList from "./components/pages/Brand/BrandList";
import BrandForm from "./components/pages/Brand/BrandForm";
import ProductList from "./components/pages/Product/ProductList";
import ProductForm from "./components/pages/Product/ProductForm";
import UsersList from "./components/pages/UsersList";

export default function App() {
  return (
    <Router>
      <Navbar />

      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />

        <div style={{ flex: 1 }} className="pt-16">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/master/category-list" element={<CategoryList />} />
            <Route path="/master/add-category" element={<CategoryForm />} />
            <Route path="/master/brand-list" element={<BrandList />} />
            <Route path="/master/add-brand" element={<BrandForm />} />
            <Route path="/master/edit-brand/:brandId" element={<BrandForm />} />
            <Route path="/product-list" element={<ProductList />} />
            <Route path="/add-product" element={<ProductForm />} />
            <Route path="/users" element={<UsersList />} />


            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
