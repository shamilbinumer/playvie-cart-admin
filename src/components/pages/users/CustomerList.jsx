import React, { useState, useEffect } from 'react'
import BreadCrumb from '../../layout/BreadCrumb'
import { useNavigate } from 'react-router-dom';
import DataTable from '../../layout/DataTable';
import { PageHeader } from '../../common/PageHeader';
import { Switch, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import AddButton from '../../layout/AddButton';
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import Preloader from '../../common/Preloader';
import Swal from 'sweetalert2';
import { ShoppingCart } from 'lucide-react';
import * as XLSX from "xlsx";


const CustomerList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedCart, setSelectedCart] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');

  // Fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const querySnapshot = await getDocs(collection(db, "users"));
        const userList = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          ...doc.data(),
          index: index + 1,
        }));

        setUsers(userList);
        console.log(userList);

      } catch (error) {
        console.error("Error fetching users: ", error);
        setError("Failed to load users. Please try again.");
        Swal.fire("Error!", "Failed to load users.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    { key: "index", title: "#" },
    { key: "fullName", title: "Name" },
    { key: "email", title: "Email" },
    { key: "phone", title: "Phone" },
    { key: "cart", title: "Cart" },
    { key: "isActive", title: "Active/Inactive" }
  ];

  // Fetch cart products from Firebase
  const handleViewCart = async (user) => {
    if (!user.cart || user.cart.length === 0) {
      Swal.fire("Info", "This user has no items in cart", "info");
      return;
    }

    try {
      setLoadingCart(true);
      setCartModalOpen(true);
      setSelectedCart([]);
      setSelectedUserEmail(user.email || '');

      const cartWithProducts = await Promise.all(
        user.cart.map(async (cartItem) => {
          try {
            const productDoc = await getDoc(doc(db, "products", cartItem.productId));
            if (productDoc.exists()) {
              return {
                ...cartItem,
                productData: productDoc.data(),
                productName: productDoc.data().name || productDoc.data().productName || "Unknown Product",
                productPrice: Number(productDoc.data().salesPrice) || 0,
                productImage: productDoc.data().image || productDoc.data().thumbnail || null
              };
            } else {
              return {
                ...cartItem,
                productData: null,
                productName: "Product Not Found",
                productPrice: 0,
                productImage: null
              };
            }
          } catch (err) {
            console.error(`Error fetching product ${cartItem.productId}:`, err);
            return {
              ...cartItem,
              productData: null,
              productName: "Error Loading Product",
              productPrice: 0,
              productImage: null
            };
          }
        })
      );

      setSelectedCart(cartWithProducts);
    } catch (error) {
      console.error("Error fetching cart details: ", error);
      Swal.fire("Error!", "Failed to load cart details.", "error");
      setCartModalOpen(false);
    } finally {
      setLoadingCart(false);
    }
  };

  // Handle toggle status - updates Firebase
  const handleStatusToggle = async (user) => {
    try {
      const newStatus = !user.isActive;

      await updateDoc(doc(db, "users", user.id), {
        isActive: newStatus
      });

      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id
            ? { ...u, isActive: newStatus }
            : u
        )
      );
    } catch (error) {
      console.error("Error updating user status: ", error);
      Swal.fire("Error!", "Failed to update user status.", "error");
    }
  };

  const renderCell = (item, column, index) => {
    if (column.key === "index") return index + 1;

    if (column.key === "fullName") {
      return `${item.firstName || ''} ${item.lastName || ''}`.trim() || "-";
    }

    if (column.key === "cart") {
      const cartCount = item.cart?.length || 0;
      return (
        <div className="flex items-center gap-2">
          <IconButton
            onClick={() => handleViewCart(item)}
            disabled={cartCount === 0}
            size="small"
            sx={{
              color: cartCount > 0 ? '#81184e' : '#ccc',
              '&:hover': {
                backgroundColor: 'rgba(129, 24, 78, 0.1)',
              },
            }}
          >
            <ShoppingCart fontSize="small" />
          </IconButton>
          <span className="text-sm text-gray-600">
            ({cartCount})
          </span>
        </div>
      );
    }

    if (column.key === "avatar") {
      return (
        <div className="w-15 h-8 bg-gray-100 rounded-xs flex items-center justify-center">
          {item[column.key] ? (
            <img
              src={item[column.key]}
              alt="thumbnail"
              className="w-full h-full object-cover rounded-sm"
              loading="lazy"
            />
          ) : (
            <span className="text-gray-400 text-xs">No Image</span>
          )}
        </div>
      );
    }

    if (column.key === "isActive") {
      return (
        <Switch
          checked={item.isActive || false}
          onChange={() => handleStatusToggle(item)}
          size="small"
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#81184e',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#81184e',
            },
          }}
        />
      );
    }

    return item[column.key] || "-";
  };

  const handleCloseModal = () => {
    setCartModalOpen(false);
    setSelectedCart([]);
    setSelectedUserEmail('');
  };

  const calculateTotal = () => {
    return selectedCart.reduce((total, item) => {
      return total + (item.productPrice * (item.qty || 1));
    }, 0);
  };
  const handleDownloadExcel = () => {
    if (!users || users.length === 0) {
      Swal.fire("No Data", "No users available to download", "info");
      return;
    }

    // Prepare the data
    const excelData = users.map(user => ({
      Name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      Email: user.email || "-",
      Phone: user.phone || "-"
    }));

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // Download file
    XLSX.writeFile(workbook, "Customer_List.xlsx");
  };

  const generateEmailContent = () => {
    const subject = 'Complete Your Purchase - Items in Your Cart';

    let productDetails = selectedCart.map((item, idx) =>
      `${idx + 1}. ${item.productName}\n   - Quantity: ${item.qty || 1}\n   - Price: ₹${item.productPrice.toFixed(2)}\n   - Subtotal: ₹${(item.productPrice * (item.qty || 1)).toFixed(2)}`
    ).join('\n\n');

    const totalAmount = calculateTotal();

    const body = `Dear Customer,

We noticed you have the following items in your cart:

${productDetails}

Total Amount: ₹${totalAmount.toFixed(2)}

Would you like to complete your purchase?

If you have any questions or need assistance, please feel free to contact us.

Best regards,
Playvie Cart Team`;

    return {
      subject: encodeURIComponent(subject),
      body: encodeURIComponent(body)
    };
  };

  const handleSendEmail = () => {
    if (!selectedUserEmail) {
      Swal.fire("Error", "Customer email not found", "error");
      return;
    }

    const { subject, body } = generateEmailContent();
    const mailtoLink = `mailto:${selectedUserEmail}?subject=${subject}&body=${body}`;

    window.location.href = mailtoLink;
  };

  if (loading) {
    return <div><Preloader /></div>
  }

  return (
    <div>
      <BreadCrumb
        items={[
          { label: "Users", path: "#" },
          { label: "Customer List", path: "#" },
        ]}
      />
      <div className="p-2">
        <PageHeader
          title="Customer List"
          className="border-b border-gray-200 pb-4"
          actionButton={
             <Button
            onClick={handleDownloadExcel}
            sx={{
              backgroundColor: '#217346',   // Excel green
              color: 'white',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#1b5e38' }, // darker Excel green
            }}
          >
            Download Details Excel 
          </Button>
          }
        />
        {/* <div className="flex justify-end mb-4">
          <Button
            onClick={handleDownloadExcel}
            sx={{
              backgroundColor: '#217346',   // Excel green
              color: 'white',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#1b5e38' }, // darker Excel green
            }}
          >
            Download Excel
          </Button>
        </div> */}


        {/* Data Table */}
        {!loading && !error && users.length > 0 && (
          <DataTable
            columns={columns}
            data={users}
            renderCell={renderCell}
          />
        )}

        {/* No data message */}
        {!loading && !error && users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found
          </div>
        )}
      </div>

      {/* Cart Details Modal */}
      <Dialog
        open={cartModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Cart Details</DialogTitle>
        <DialogContent>
          {loadingCart ? (
            <div className="flex justify-center items-center py-8">
              <Preloader />
            </div>
          ) : selectedCart.length > 0 ? (
            <div className="space-y-4">
              {selectedCart.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 border rounded-lg">
                  {item.productImage && (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{item.productName}</h4>
                    <p className="text-sm text-gray-600">Product ID: {item.productId}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.qty || 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      ₹{item.productPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: ₹{(item.productPrice * (item.qty || 1)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-lg font-bold text-[#81184e]">
                    ₹{calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No items in cart
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
          {selectedCart.length > 0 && (
            <Button
              onClick={handleSendEmail}
              sx={{
                backgroundColor: '#81184e',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#5d1138',
                },
              }}
            >
              Send Email to Customer
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default CustomerList