import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { SquarePen, Trash2 } from "lucide-react";
import { db } from "../../../../firebase";
import Preloader from "../../../common/Preloader";
import BreadCrumb from "../../../layout/BreadCrumb";
import { PageHeader } from "../../../common/PageHeader";
import AddButton from "../../../layout/AddButton";
import DataTable from "../../../layout/DataTable";

// Mock components - Replace with your actual imports


const BlogList = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories and blog posts - Optimized: Only 2 reads on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories first
        const categoriesSnapshot = await getDocs(collection(db, "blogCategories"));
        const categoriesMap = {};
        categoriesSnapshot.docs.forEach((doc) => {
          categoriesMap[doc.id] = doc.data().categoryName;
        });
        setCategories(categoriesMap);

        // Fetch blog posts
        const blogsSnapshot = await getDocs(collection(db, "blogs"));
        const blogsList = blogsSnapshot.docs.map((doc, index) => ({
          id: doc.id,
          ...doc.data(),
          index: index + 1,
        }));

        setBlogs(blogsList);
      } catch (error) {
        console.error("Error fetching blogs: ", error);
        setError("Failed to load blogs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { key: "index", title: "#" },
    { key: "image", title: "Image" },
    { key: "title", title: "Title" },
    { key: "isActive", title: "Status" },
    { key: "actions", title: "Actions" },
  ];

  const handleEdit = (item) => {
    navigate(`/blog/edit-blog/${item.id}`, {
      state: {
        blogData: {
          title: item.title,
          excerpt: item.excerpt,
          category: item.category,
          author: item.author,
          image: item.image,
          readTime: item.readTime,
          isActive: item.isActive,
          id: item.id
        }
      }
    });
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${item.title}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        // Single delete operation
        await deleteDoc(doc(db, "blogs", item.id));

        // Update local state without refetching
        setBlogs((prev) => prev.filter((b) => b.id !== item.id));

        Swal.fire("Deleted!", "Blog post has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting blog post: ", error);
        Swal.fire("Error!", "Failed to delete blog post.", "error");
      }
    }
  };

  const actions = [
    {
      label: "Edit",
      handler: handleEdit,
      icon: SquarePen,
    },
    {
      label: "Delete",
      handler: handleDelete,
      icon: Trash2,
    },
  ];

  const renderCell = (item, column, index) => {
    if (column.key === "index") return index + 1;

    if (column.key === "category") {
      return categories[item.category] || "Unknown Category";
    }

    if (column.key === "image") {
      return (
        <div className="w-20 h-14 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {item[column.key] ? (
            <img
              src={item[column.key]}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-gray-400 text-xs">No Image</span>
          )}
        </div>
      );
    }

    if (column.key === "title") {
      return (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate">{item.title}</p>
          {item.excerpt && (
            <p className="text-xs text-gray-500 truncate mt-1">{item.excerpt}</p>
          )}
        </div>
      );
    }

    if (column.key === "isActive") {
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item[column.key] === true
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item[column.key] ? "Active" : "Inactive"}
        </span>
      );
    }

    if (column.key === "actions" && actions) {
      return (
        <div className="flex space-x-2">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => action.handler(item)}
              className={`flex items-center justify-center rounded transition-colors ${
                action.label === "Edit" ? "text-green-600 hover:text-green-700" : ""
              } ${action.label === "Delete" ? "text-red-600 hover:text-red-700" : ""}`}
              title={action.label}
            >
              {action.icon && (
                <span>
                  <action.icon width={20} />
                </span>
              )}
            </button>
          ))}
        </div>
      );
    }

    return item[column.key] || "-";
  };

  if (loading) {
    return (
      <div>
        <Preloader />
      </div>
    );
  }

  return (
    <>
      <BreadCrumb
        items={[
          { label: "Content Management", path: "#" },
          { label: "Blog List", path: "#" },
        ]}
      />
      <div className="px-2">
        <div className="mt-6">
          <PageHeader
            title="Blog List"
            actionButton={
              <AddButton
                title="Create New Post"
                onClick={() => navigate("/portfolio/blog/BlogForm")}
                disabled={loading}
              />
            }
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!loading && !error && (
            <DataTable
              columns={columns}
              data={blogs}
              renderCell={renderCell}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default BlogList;