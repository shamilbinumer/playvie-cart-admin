import React, { useState, useEffect } from 'react';
import BreadCrumb from '../../layout/BreadCrumb';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp, setDoc } from 'firebase/firestore';
import { Pencil, Trash2, Plus, Copy, Eye } from 'lucide-react';
import CouponModal from './CouponModal';
import { db } from '../../../firebase';
import Swal from 'sweetalert2';
import { PageHeader } from '../../common/PageHeader';
import AddButton from '../../layout/AddButton';
import DataTable from '../../layout/DataTable';

const CouponManageList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch coupons from Firestore
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const couponsRef = collection(db, 'coupons');
      const snapshot = await getDocs(couponsRef);
      const couponsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCoupons(couponsList);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Handle add coupon
  const handleAddCoupon = () => {
    setModalMode('add');
    setSelectedCoupon(null);
    setIsModalOpen(true);
  };

  // Handle edit coupon
  const handleEditCoupon = (coupon) => {
    setModalMode('edit');
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  // Handle view coupon
  const handleViewCoupon = (coupon) => {
    setModalMode('view');
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  // Handle delete coupon
  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteDoc(doc(db, 'coupons', couponId));
        setCoupons(coupons.filter(c => c.id !== couponId));
        alert('Coupon deleted successfully');
      } catch (error) {
        console.error('Error deleting coupon:', error);
        alert('Failed to delete coupon');
      }
    }
  };

  // Handle save coupon
  const handleSaveCoupon = async (couponData) => {
    try {
      if (modalMode === 'add') {
        const couponRef = doc(db, 'coupons', couponData.code.toUpperCase());
        await setDoc(couponRef, {
          ...couponData,
          code: couponData.code.toUpperCase(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          usedCount: 0,
          usersUsed: []
        });
        Swal.fire('Success', 'Coupon added successfully', 'success');
      } else if (modalMode === 'edit') {
        const couponRef = doc(db, 'coupons', selectedCoupon.id);
        await updateDoc(couponRef, {
          ...couponData,
          updatedAt: serverTimestamp()
        });
        alert('Coupon updated successfully');
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert('Failed to save coupon: ' + error.message);
    }
  };

  // Filter coupons based on search
  const filteredCoupons = coupons.filter(coupon =>
    coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status badge
  const getStatusBadge = (coupon) => {
    const now = new Date();
    const expiryDate = coupon.expiryDate?.toDate();
    
    if (!coupon.active) {
      return <span className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-800">Inactive</span>;
    }
    if (expiryDate && expiryDate < now) {
      return <span className="px-2 py-1 text-xs rounded bg-red-200 text-red-800">Expired</span>;
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return <span className="px-2 py-1 text-xs rounded bg-orange-200 text-orange-800">Limit Reached</span>;
    }
    return <span className="px-2 py-1 text-xs rounded bg-green-200 text-green-800">Active</span>;
  };

  // Define table columns
  const columns = [
    { key: 'code', title: 'Code' },
    { key: 'discount', title: 'Discount' },
    { key: 'minPurchase', title: 'Min Purchase' },
    { key: 'usage', title: 'Usage' },
    { key: 'expiryDate', title: 'Expiry Date' },
    { key: 'status', title: 'Status' },
    { key: 'actions', title: 'Actions' }
  ];

  // Custom cell renderer
  const renderCell = (coupon, column) => {
    switch (column.key) {
      case 'code':
        return (
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{coupon.code}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(coupon.code);
                  alert('Coupon code copied!');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Copy size={14} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>
          </div>
        );

      case 'discount':
        return coupon.discountType === 'percentage' ? (
          <div>
            <span className="font-medium text-gray-900">{coupon.discountValue}%</span>
            {coupon.maxDiscount && (
              <p className="text-xs text-gray-500">Max: ₹{coupon.maxDiscount}</p>
            )}
          </div>
        ) : (
          <span className="font-medium text-gray-900">₹{coupon.discountValue}</span>
        );

      case 'minPurchase':
        return coupon.minPurchase ? `₹${coupon.minPurchase}` : '-';

      case 'usage':
        return (
          <div className="text-sm">
            <span className="text-gray-900">{coupon.usedCount || 0}</span>
            <span className="text-gray-500"> / </span>
            <span className="text-gray-500">{coupon.usageLimit || '∞'}</span>
          </div>
        );

      case 'expiryDate':
        return coupon.expiryDate
          ? new Date(coupon.expiryDate.toDate()).toLocaleDateString()
          : 'No expiry';

      case 'status':
        return getStatusBadge(coupon);

      case 'actions':
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewCoupon(coupon)}
              className="text-blue-600 hover:text-blue-800"
              title="View"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => handleEditCoupon(coupon)}
              className="text-green-600 hover:text-green-800"
              title="Edit"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => handleDeleteCoupon(coupon.id)}
              className="text-red-600 hover:text-red-800"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        );

      default:
        return coupon[column.key] || '-';
    }
  };

  return (
    <div>
      <BreadCrumb
        items={[
          { label: "Offers", path: "#" },
          { label: "Coupon Management", path: "#" },
        ]}
      />

      <div className="p-1">
        {/* Header Section */}
        <PageHeader
          title="Coupon Management"
          className="border-b border-gray-200 pb-4"
          actionButton={
            <AddButton
              title="Create New"
              onClick={handleAddCoupon}
              disabled={loading}
            />
          }
        />

        {/* Search Bar */}
        <div className="my-6">
          <input
            type="text"
            placeholder="Search by coupon code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Loading coupons...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No coupons found</p>
            <button
              onClick={handleAddCoupon}
              className="mt-4 text-blue-600 hover:underline"
            >
              Create your first coupon
            </button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredCoupons}
            renderCell={renderCell}
            pagination={true}
            itemsPerPage={10}
          />
        )}
      </div>

      {/* Coupon Modal */}
      {isModalOpen && (
        <CouponModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mode={modalMode}
          couponData={selectedCoupon}
          onSave={handleSaveCoupon}
        />
      )}
    </div>
  );
};

export default CouponManageList;