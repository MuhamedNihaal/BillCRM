import { memo, useState, useCallback, useEffect } from "react";
import moment from "moment";
import Modal from "components/Modal.jsx";
import { toast } from "sonner";
import { get } from "utility";
import { Button } from "components/ui";

const SupplierDetailModal = ({ isOpen, onClose, supplierId }) => {
  const [supplierDetail, setSupplierDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSupplierDetail = useCallback(async (id) => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await get(`supplier/details?id=${id}`);
      setSupplierDetail(response.data);
    } catch (error) {
      console.error("Error fetching supplier detail:", error);
      toast.error("Failed to fetch supplier details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && supplierId) {
      fetchSupplierDetail(supplierId);
    }
  }, [isOpen, supplierId, fetchSupplierDetail]);

  return (
    <Modal title="Supplier Details" isOpen={isOpen} close={onClose}>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      ) : !supplierDetail ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No data available</p>
        </div>
      ) : (
        <div className="max-h-[70vh] space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
            <div className="space-y-4">
              <div className="flex">
                <span className="min-w-[140px] font-medium text-gray-700 dark:text-gray-300">
                  Date
                </span>
                <span className="mx-2">:</span>
                <span className="text-gray-900 dark:text-white">
                  {moment(supplierDetail.date).format("DD-MM-YYYY") || "----"}
                </span>
              </div>
              <div className="flex">
                <span className="min-w-[140px] font-medium text-gray-700 dark:text-gray-300">
                  Supplier ID
                </span>
                <span className="mx-2">:</span>
                <span className="text-gray-900 dark:text-white">
                  {supplierDetail.uniqueId || "----"}
                </span>
              </div>
              <div className="flex">
                <span className="min-w-[140px] font-medium text-gray-700 dark:text-gray-300">
                  Supplier Name
                </span>
                <span className="mx-2">:</span>
                <span className="text-gray-900 dark:text-white">
                  {supplierDetail.name || "----"}
                </span>
              </div>
              <div className="flex">
                <span className="min-w-[140px] font-medium text-gray-700 dark:text-gray-300">
                  Company Name
                </span>
                <span className="mx-2">:</span>
                <span className="text-gray-900 dark:text-white">
                  {supplierDetail.company || "----"}
                </span>
              </div>
              <div className="flex">
                <span className="min-w-[140px] font-medium text-gray-700 dark:text-gray-300">
                  Mobile
                </span>
                <span className="mx-2">:</span>
                <span className="text-gray-900 dark:text-white">
                  {supplierDetail.mobile || "----"}
                </span>
              </div>
              <div className="flex">
                <span className="min-w-[140px] font-medium text-gray-700 dark:text-gray-300">
                  Email
                </span>
                <span className="mx-2">:</span>
                <span className="text-gray-900 dark:text-white">
                  {supplierDetail.email || "----"}
                </span>
              </div>
              <div className="flex">
                <span className="min-w-[140px] font-medium text-gray-700 dark:text-gray-300">
                  Address
                </span>
                <span className="mx-2">:</span>
                <span className="text-gray-900 dark:text-white">
                  {supplierDetail.address || "----"}
                </span>
              </div>
              <div className="flex">
                <span className="min-w-[140px] font-medium text-gray-700 dark:text-gray-300">
                  State
                </span>
                <span className="mx-2">:</span>
                <span className="text-gray-900 dark:text-white">
                  {supplierDetail.state?.name || "----"}
                </span>
              </div>
              <div className="flex">
                <span className="min-w-[140px] font-medium text-gray-700 dark:text-gray-300">
                  Branch
                </span>
                <span className="mx-2">:</span>
                <span className="text-gray-900 dark:text-white">
                  {supplierDetail.branch || "----"}
                </span>
              </div>
              <div className="flex">
                <span className="min-w-[140px] font-medium text-gray-700 dark:text-gray-300">
                  GST
                </span>
                <span className="mx-2">:</span>
                <span className="text-gray-900 dark:text-white">
                  {supplierDetail.gstIn || "----"}
                </span>
              </div>
            </div>

            <div className="col-span-2 space-y-4 max-sm:col-span-1">
              <div className="flex">
                <span className="min-w-[140px] font-medium text-gray-700 dark:text-gray-300">
                  Bank
                </span>
                <span className="mx-2">:</span>
                <span className="text-gray-900 dark:text-white">
                  {supplierDetail.bank || "----"}
                </span>
              </div>
              <div className="flex">
                <span className="min-w-[140px] font-medium text-gray-700 dark:text-gray-300">
                  Account No
                </span>
                <span className="mx-2">:</span>
                <span className="text-gray-900 dark:text-white">
                  {supplierDetail.accountNo || "----"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outlined" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default memo(SupplierDetailModal);
