import React, { useEffect, useState } from "react";
import { PageHeader } from "../../common/PageHeader";
import AddButton from "../../layout/AddButton";
import BreadCrumb from "../../layout/BreadCrumb";
import DataTable from "../../layout/DataTable";
import { SquarePen, Trash2 } from "lucide-react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";
import Preloader from "../../common/Preloader";
import Swal from "sweetalert2";
import SizeUnitFormModal from "./SIzeUnitFormModal";

const SizeUnit = () => {
  const [sizeUnits, setSizeUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  const fetchSizeUnits = async () => {
    try {
      setLoading(true);
      setError(null);

      const querySnapshot = await getDocs(collection(db, "size-unit-master"));
      const sizeUnitList = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        index: index + 1,
      }));

      setSizeUnits(sizeUnitList);
    } catch (error) {
      console.error("Error fetching size units: ", error);
      setError("Failed to load size units. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizeUnits();
  }, []);

  const columns = [
    { key: "index", title: "#" },
    { key: "unitName", title: "Unit Name" },
    { key: "description", title: "Description" },
    { key: "actions", title: "Actions" },
  ];

  const handleEdit = (unit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingUnit(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (unit) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${unit.unitName}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "size-unit-master", unit.id));

        // update state without re-fetching
        setSizeUnits((prev) => prev.filter((u) => u.id !== unit.id));

        Swal.fire("Deleted!", "Size unit has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting size unit: ", error);
        Swal.fire("Error!", "Failed to delete size unit.", "error");
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

    if (column.key === "actions" && actions) {
      return (
        <div className="flex space-x-2">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => action.handler(item)}
              className={`flex items-center justify-center rounded transition-colors ${
                action.label === "Edit" ? "text-green-600" : ""
              } ${action.label === "Delete" ? "text-red-600" : ""}`}
            >
              {action.icon && (
                <span className="mr-1">
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
          { label: "Master Data", path: "#" },
          { label: "Size Unit List", path: "#" },
        ]}
      />
      <div className="p-2">
        <PageHeader
          title="Size Unit List"
          className="border-b border-gray-200 pb-4"
          actionButton={
            <AddButton
              title="Create New"
              onClick={handleAddNew}
              disabled={loading}
            />
          }
        />

        {/* Data Table */}
        {!loading && !error && (
          <DataTable
            columns={columns}
            data={sizeUnits}
            actions={actions}
            renderCell={renderCell}
          />
        )}
      </div>

      {/* Size Unit Form Modal */}
      <SizeUnitFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editData={editingUnit}
        onSuccess={fetchSizeUnits}
      />
    </>
  );
};

export default SizeUnit;
