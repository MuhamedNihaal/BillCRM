/* eslint-disable */
import { memo, useState, useMemo, useCallback, useEffect } from "react";
import { AddPurchaseSchema } from "./AddPurchaseSchema";
import TwdTable from "components/TwdTable";
import PurchaseModal from "./Modal.jsx";
import TotalsCard from "./TotalsCard.jsx";
import GstCard from "./GstCard.jsx";
import ProductRow from "./ProductRow.jsx";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Plus, Minus } from "lucide-react";
import { get, post, put, del, toTop, queryString } from "utility";
import { Button, Card, Collapse } from "components/ui";
import { useDidUpdate, useDisclosure } from "hooks";
import { useForm } from "react-hook-form";
import Inputs from "components/Inputs";
import { Page } from "components/shared/Page";
import Breadcrumb from "components/Breadcrumb";
import { API_URL } from "constants/app.constant.js";
import { useConfirm } from "components/ConfirmModal";

const AddPurchase = () => {
  const URL = API_URL;
  const confirm = useConfirm();
  const [isExpanded, { toggle, open }] = useDisclosure();
  const [tableData, setTableData] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [refresh, setRefresh] = useState(0);
  const [filter, setFilter] = useState({});
  const [productOptions, setProductOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [update, setUpdate] = useState({ _id: null, name: "" });
  const [billDate, setBillDate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState([
    {
      product: "",
      quantity: 1,
      unit: "",
      mrp: 0,
      price: 0,
      rate: 0,
      gst: 0,
      amount: 0,
    },
  ]);
  const [totals, setTotals] = useState({
    total: 0,
    taxableAmount: 0,
    gstAmount: 0,
    grandTotal: 0,
  });
  const [gstBreakdown, setGstBreakdown] = useState([]);

  const {
    handleSubmit,
    setValue,
    reset,
    register,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(AddPurchaseSchema),
    defaultValues: {
      supplier: "",
      supplierAddress: "",
      supplierState: "",
      supplierGstin: "",
      billDate: "",
      billNum: "",
    },
  });

  // Fetch products for dropdown
  const fetchProducts = useCallback(async () => {
    try {
      const response = await get("/purchase/options/product");
      setProductOptions(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, []);

  // Fetch suppliers for dropdown
  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await get("/purchase/options/supplier");
      setSupplierOptions(response.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setSupplierOptions([]);
    }
  }, []);

  // Calculate totals based on products
  const calculateTotals = useCallback(() => {
    let taxableAmount = 0;
    let gstAmount = 0;

    products.forEach((product) => {
      if (product.quantity && product.price) {
        const itemTaxableAmount =
          parseFloat(product.quantity) * parseFloat(product.price);
        const itemGst = (itemTaxableAmount * parseFloat(product.gst)) / 100;

        taxableAmount += itemTaxableAmount;
        gstAmount += itemGst;
      }
    });

    const grandTotal = taxableAmount + gstAmount;

    setTotals({
      total: parseFloat(taxableAmount.toFixed(2)),
      taxableAmount: parseFloat(taxableAmount.toFixed(2)),
      gstAmount: parseFloat(gstAmount.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    });
  }, [products]);

  // Generate GST breakdown
  const generateGstBreakup = useCallback(() => {
    const gstMap = new Map();

    products.forEach((p) => {
      const gstRate = parseFloat(p.gst) || 0;
      const quantity = parseFloat(p.quantity) || 0;
      const rate = parseFloat(p.price) || 0;
      const taxableAmount = quantity * rate;

      if (taxableAmount > 0) {
        if (!gstMap.has(gstRate)) {
          gstMap.set(gstRate, 0);
        }
        gstMap.set(gstRate, gstMap.get(gstRate) + taxableAmount);
      }
    });

    const gstArr = [];

    for (let [percentage, taxableAmount] of gstMap.entries()) {
      const gstAmount = (taxableAmount * percentage) / 100;
      const totalAmount = taxableAmount + gstAmount;
      const cgstAmount = gstAmount / 2;
      const sgstAmount = gstAmount / 2;

      gstArr.push({
        percentage: percentage,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        taxableAmount: parseFloat(taxableAmount.toFixed(2)),
        gstAmount: parseFloat(gstAmount.toFixed(2)),
        cgstPercentage: percentage / 2,
        cgstAmount: parseFloat(cgstAmount.toFixed(2)),
        sgstPercentage: percentage / 2,
        sgstAmount: parseFloat(sgstAmount.toFixed(2)),
      });
    }

    gstArr.sort((a, b) => a.percentage - b.percentage);
    setGstBreakdown(gstArr);
  }, [products]);

  // Handle supplier selection
  const handleSupplierChange = useCallback(
    (supplierId) => {
      const supplier = supplierOptions.find((s) => s.value === supplierId);
      if (supplier) {
        setSelectedSupplier(supplier);
        setTimeout(() => {
          setValue("supplierAddress", supplier.address || "");
          setValue("supplierState", supplier.state?.name || "");
          setValue("supplierGstin", supplier.gstIn || "");
          setValue("supplier", supplierId);
        }, 0);
      } else {
        setSelectedSupplier(null);
        setTimeout(() => {
          setValue("supplierAddress", "");
          setValue("supplierState", "");
          setValue("supplierGstin", "");
        }, 0);
      }
    },
    [supplierOptions, setValue],
  );

  // Handle product selection
  const handleProductSelect = useCallback(
    (productId, index) => {
      const selectedProduct = productOptions.find((p) => p.value === productId);
      if (selectedProduct) {
        const updatedProducts = [...products];
        updatedProducts[index] = {
          ...updatedProducts[index],
          product: productId,
          unit: selectedProduct.primaryUnit || "",
          mrp: parseFloat(selectedProduct.mrp) || 0,
          price: parseFloat(selectedProduct.price) || 0,
          rate: parseFloat(selectedProduct.rate) || 0,
          gst: parseFloat(selectedProduct.gst) || 0,
        };

        const quantity = parseFloat(updatedProducts[index].quantity) || 0;
        const rate = parseFloat(updatedProducts[index].rate) || 0;
        updatedProducts[index].amount = parseFloat(
          (quantity * rate).toFixed(2),
        );

        setProducts(updatedProducts);
      }
    },
    [productOptions, products],
  );

  // Handle product field changes
  const handleProductChange = useCallback(
    (index, field, value) => {
      const updatedProducts = [...products];
      updatedProducts[index][field] = value;

      if (field === "quantity" || field === "rate") {
        const quantity = parseFloat(updatedProducts[index].quantity) || 0;
        const rate = parseFloat(updatedProducts[index].rate) || 0;
        updatedProducts[index].amount = parseFloat(
          (quantity * rate).toFixed(2),
        );
      }

      setProducts(updatedProducts);
    },
    [products],
  );

  // Add new product row
  const handleAddProduct = useCallback(() => {
    setProducts((prev) => [
      ...prev,
      {
        product: "",
        quantity: 1,
        unit: "",
        mrp: 0,
        price: 0,
        rate: 0,
        gst: 0,
        amount: 0,
      },
    ]);
  }, []);

  // Remove product row
  const handleRemoveProduct = useCallback(
    (index) => {
      if (products.length > 1) {
        const updatedProducts = products.filter((_, i) => i !== index);
        setProducts(updatedProducts);
      }
    },
    [products],
  );

  // Clear product row
  const handleClearProduct = (index) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      product: "",
      quantity: 1,
      unit: "",
      mrp: "",
      price: "",
      gst: "",
      amount: "",
    };
    setProducts(updatedProducts);
  };

  // Recalculate totals when products change
  useEffect(() => {
    calculateTotals();
    generateGstBreakup();
  }, [products, calculateTotals, generateGstBreakup]);

  // Load initial data
  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, [fetchProducts, fetchSuppliers]);

  // Load purchase details for editing
  useEffect(() => {
    if (update._id) {
      setIsEditing(true);
      fetchPurchaseDetails(update._id);
    } else {
      setIsEditing(false);
    }
  }, [update._id]);

  // Fetch purchase details
  const fetchPurchaseDetails = useCallback(
    async (id) => {
      try {
        setLoading(true);
        const response = await get(`purchase/details?id=${id}`);
        const data = response.data;

        if (data) {
          setValue("billDate", data.billDate || "");
          setValue("billNum", data.billNum || "");
          setBillDate(data.billDate || "");

          if (data.supplier) {
            setValue("supplier", data.supplier._id);
            setTimeout(() => {
              setValue("supplierAddress", data.supplier.address || "");
              setValue("supplierState", data.supplier.state?.name || "");
              setValue("supplierGstin", data.supplier.gstIn || "");
            }, 10);

            const supplier = supplierOptions.find(
              (s) => s.value === data.supplier._id,
            );
            if (supplier) {
              setSelectedSupplier(supplier);
            }
          }

          if (data.gst && data.gst.length > 0) {
            const formattedGst = data.gst.map((gst) => ({
              percentage: parseFloat(gst.percentage) || 0,
              taxableAmount: parseFloat(gst.taxableAmount) || 0,
              gstAmount: parseFloat(gst.amount) || 0,
              cgstPercentage: parseFloat(gst.cgstPercentage) || 0,
              cgstAmount: parseFloat(gst.cgstAmount) || 0,
              sgstPercentage: parseFloat(gst.scgstPercentage) || 0,
              sgstAmount: parseFloat(gst.scgstAmount) || 0,
            }));
            setGstBreakdown(formattedGst);
          }

          if (data.items && data.items.length > 0) {
            const formattedProducts = data.items.map((item) => ({
              product: item.product?._id || "",
              quantity: item.quantity || 1,
              unit: item.unit || "",
              mrp: item.mrp || 0,
              price: item.price || 0,
              rate: item.rate || 0,
              gst: item.gst || 0,
              amount: item.amount || 0,
            }));
            setProducts(formattedProducts);
          }

          setTotals({
            total: data.totalAmount || 0,
            taxableAmount: data.taxableAmount || 0,
            gstAmount: data.gstAmount || 0,
            grandTotal: data.grandTotal || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching purchase details:", error);
        toast.error("Failed to fetch purchase details");
      } finally {
        setLoading(false);
      }
    },
    [setValue, supplierOptions],
  );

  // Handle view details
  const handleViewDetails = useCallback((id) => {
    setSelectedPurchaseId(id);
    setModalOpen(true);
  }, []);

  // Handle update click
  const handleUpdate = useCallback(
    ({ _id = null, ...data } = {}) => {
      setUpdate({
        _id,
        ...data,
      });
      open();
      toTop();
    },
    [open],
  );

  // Handle print
  const handlePrint = (id) => {
    window.open(`${URL}purchase/render?id=${id}`, "_blank");
  };

  // Refresh table on changes
  useDidUpdate(() => {
    fetchTableList(filter, page, limit);
  }, [refresh]);

  // Fetch table data
  const fetchTableList = useCallback(
    async (filterProps = filter, pageCount = 1, limitCount = 50) => {
      try {
        const pageNum = Number(pageCount) || 1;
        const limitNum = Number(limitCount) || 50;

        let { data, count } = await get(
          `purchase?page=${pageNum}&limit=${limitNum}&${queryString(filterProps)}`,
        );

        let dataFormatted = data?.map((doc) => {
          let extra_actions = [
            {
              label: "View",
              icon: (
                <EyeIcon className="size-4.5 cursor-pointer transition-transform duration-200 hover:scale-125" />
              ),
              onClick: (item) => {
                handleViewDetails(item._id || item.id);
              },
            },
            {
              label: "Print",
              icon: (
                <PrinterIcon className="size-4.5 cursor-pointer transition-transform duration-200 hover:scale-125" />
              ),
              onClick: (item) => {
                handlePrint(item._id || item.id);
              },
            },
            {
              label: "Edit",
              icon: (
                <PencilIcon className="size-4.5 cursor-pointer transition-transform duration-200 hover:scale-125" />
              ),
              onClick: (item) => {
                handleUpdate({
                  _id: item._id || item.id,
                });
                setBillDate(item.doc.billDate);
              },
            },
            {
              label: "Delete",
              icon: (
                <TrashIcon className="size-4.5 cursor-pointer transition-transform duration-200 hover:scale-125" />
              ),
              onClick: ({ id, action }) => handleDelete(id, action),
              dialog: {
                pending: {
                  title: "Are you sure?",
                  description: "Are you sure you want to delete this purchase?",
                  actionText: "Delete",
                },
                success: {
                  title: "Purchase deleted",
                  description: "The purchase has been successfully deleted.",
                },
                error: {
                  title: "Error deleting purchase",
                  description:
                    "An error occurred while deleting the purchase. Please try again later.",
                },
              },
            },
          ];

          return {
            ...doc,
            id: doc._id || doc.id,
            date: doc?.date || "",
            addedBy:
              typeof doc?.addedBy === "object"
                ? doc?.addedBy?.name || ""
                : doc?.addedBy || "",
            taxableAmount: parseFloat(doc?.taxableAmount || 0),
            billDate: doc?.billDate,
            billNum: doc?.billNum,
            supplier: doc?.supplier?.name || "",
            gstAmount: parseFloat(doc?.gstAmount || 0),
            grandTotal: parseFloat(doc?.grandTotal || 0),
            uniqueId: doc?.uniqueId || doc?.id || "",
            extra_actions,
          };
        });

        setTableData(dataFormatted);
        setCount(count);
      } catch (error) {
        console.error("Purchase fetching error:", error?.message);
        toast.error("Failed to fetch purchases");
      }
    },
    [handleViewDetails, handleUpdate, filter],
  );

  // Handle table changes (filter, pagination)
  const handleTableChange = useCallback(
    (filterProps, newPage, newLimit) => {
      let payload = { ...filterProps };

      setPage(newPage);
      if (newLimit !== limit) {
        setLimit(newLimit);
      }

      if (payload.date) {
        payload.from = payload.date?.from;
        if (payload.date?.to) {
          payload.to = payload.date?.to;
        }
        delete payload.date;
      }

      fetchTableList(payload, newPage, newLimit);
      setFilter(payload);
    },
    [fetchTableList, limit],
  );

  // Close modal
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedPurchaseId(null);
  }, []);

  // Cancel edit
  const handleCancelEdit = useCallback(() => {
    setUpdate({ _id: null, name: "" });
    setIsEditing(false);
    setSelectedSupplier(null);
    reset();
    setProducts([
      {
        product: "",
        quantity: 1,
        unit: "",
        mrp: 0,
        price: 0,
        rate: 0,
        gst: 0,
        amount: 0,
      },
    ]);
    setGstBreakdown([]);
    setBillDate(null);
  }, [reset]);

  // Submit form
  const onSubmit = async (data) => {
    try {
      const validProducts = products.filter((p) => p.product && p.quantity > 0);
      if (validProducts.length === 0) {
        toast.error("Please add at least one product");
        return;
      }

      const requestData = {
        ...data,
        billDate: data.billDate || billDate || "",
        items: validProducts.map((p) => ({
          product: p.product,
          quantity: parseFloat(p.quantity),
          unit: p.unit,
          mrp: parseFloat(p.mrp),
          price: parseFloat(p.price),
          rate: parseFloat(p.rate),
          gst: parseFloat(p.gst),
          amount: parseFloat(p.amount),
        })),
        totalAmount: totals.total,
        taxableAmount: totals.taxableAmount,
        gstAmount: totals.gstAmount,
        grandTotal: totals.grandTotal,
        gst: gstBreakdown.map((g) => ({
          percentage: g.percentage,
          amount: g.gstAmount,
          taxableAmount: g.taxableAmount,
          cgstPercentage: g.cgstPercentage,
          cgstAmount: g.cgstAmount,
          scgstPercentage: g.sgstPercentage,
          scgstAmount: g.sgstAmount,
        })),
      };

      if (isEditing && update._id) {
        await put(`purchase?id=${update._id}`, {
          ...requestData,
          id: update._id,
        });
        toast.success("Purchase updated successfully!");
        handleCancelEdit();
        setBillDate(null);
      } else {
        await post("purchase", requestData);
        toast.success("Purchase created successfully!");
        reset();
        setBillDate(null);
      }

      reset();
      setProducts([
        {
          product: "",
          quantity: 1,
          unit: "",
          mrp: 0,
          price: 0,
          rate: 0,
          gst: 0,
          amount: 0,
        },
      ]);
      setGstBreakdown([]);
      setRefresh((prev) => prev + 1);
    } catch (error) {
      toast.error(
        error?.message ??
          `An error occurred while ${isEditing ? "updating" : "creating"} the purchase.`,
      );
    }
  };

  // Delete purchase
  const handleDelete = useCallback(
    async (id, action) => {
      try {
        await del(`purchase?id=${id}`);
        action?.setConfirmLoading(false);
        action?.setSuccess(true);
        toast.success("Purchase deleted successfully!");
        fetchTableList(filter, page, limit);
      } catch (error) {
        action?.setConfirmLoading(false);
        action?.setError(true);
        console.error("Error deleting purchase:", error?.message);
        toast.error("Failed to delete purchase");
      }
    },
    [filter, page, limit, fetchTableList],
  );

  // Table configuration
  const tableConfig = useMemo(() => {
    return {
      columns: [
        {
          field: "date",
          label: "Purchase Date",
          type: "date",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "uniqueId",
          label: "Purchase ID",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "billNum",
          label: "Bill Number",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "billDate",
          label: "Bill Date",
          type: "date",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "supplier",
          label: "Supplier Name",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "taxableAmount",
          label: "Taxable Amount",
          type: "amount",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "gstAmount",
          label: "GST",
          type: "amount",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "grandTotal",
          label: "Grand Total",
          type: "amount",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "addedBy",
          label: "Added By",
          enableSorting: true,
          enableHiding: true,
        },
        {
          label: "Actions",
          field: "extra_actions",
          dropdown: false,
          actions: [],
          enableSorting: false,
          enableHiding: false,
        },
      ],
      rows: tableData,
      loading: loading,
    };
  }, [tableData, loading]);

  // Form input fields
  const inputFields = [
    {
      field: "supplier",
      name: "Supplier",
      type: "select",
      required: true,
      options: supplierOptions,
      handleOnChange: ({ value }) => {
        setValue("supplier", value);
        handleSupplierChange(value);
      },
    },
    ...(selectedSupplier
      ? [
          {
            field: "supplierAddress",
            name: "Supplier Address",
            type: "text",
            disabled: true,
          },
          {
            field: "supplierState",
            name: "Supplier State",
            type: "text",
            required: true,
            disabled: true,
          },
          {
            field: "supplierGstin",
            name: "Supplier GSTIN",
            type: "text",
            required: true,
            disabled: true,
          },
        ]
      : []),
    {
      field: "billDate",
      name: "Bill Date",
      type: "date",
      required: true,
      defaultValue: billDate || "",
    },
    {
      field: "billNum",
      name: "Bill Number",
      type: "text",
      required: true,
    },
  ];

  // Filter actions
  const filterActions = useMemo(
    () => [
      {
        name: "search",
        title: "Search",
        placeholder: "Search...",
        type: "text",
      },
      {
        title: "Date",
        type: "date",
        name: "date",
        options: {
          mode: "range",
          maxDate: new Date(),
        },
      },
      {
        name: "supplier",
        title: "Supplier",
        placeholder: "Select Supplier",
        type: "select",
        options: supplierOptions,
      },
    ],
    [supplierOptions],
  );

  return (
    <Page title="Purchase">
      <div className="p-5">
        <Breadcrumb
          title={"Purchase"}
          options={[
            {
              label: "Add Purchase",
              SwapOn: Minus,
              SwapOff: Plus,
              onClick: toggle,
              active: isExpanded,
            },
          ]}
        />
        <Collapse in={isExpanded}>
          <form
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}
            id="purchase-form"
            className="mt-4"
          >
            <Card className="gap-4 p-4 sm:px-5">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Form Fields */}
                <div className="space-y-4 lg:col-span-2">
                  <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {inputFields.map((input, idx) => (
                      <Inputs
                        type={input.type}
                        name={input.field}
                        key={idx}
                        control={control}
                        label={input.name}
                        required={input.required}
                        disabled={input.disabled}
                        defaultValue={input.defaultValue}
                        placeholder={
                          input.type === "select"
                            ? `Select ${input.name?.toLowerCase()}`
                            : `Enter the ${input.name?.toLowerCase()}`
                        }
                        options={input.options}
                        handleOnChange={input.handleOnChange}
                        {...(!["select"].includes(input.type) &&
                          register(input.field))}
                        error={errors[input?.field]?.message}
                      />
                    ))}
                  </div>

                  {/* Products Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <ProductRow
                        products={products}
                        onProductSelect={handleProductSelect}
                        onProductChange={handleProductChange}
                        onAddProduct={handleAddProduct}
                        onRemoveProduct={handleRemoveProduct}
                        onClearProduct={handleClearProduct}
                        productOptions={productOptions}
                      />
                    </div>
                  </div>
                </div>

                {/* Totals Card */}
                <div className="lg:col-span-1">
                  <TotalsCard totals={totals} />
                </div>

                {/* GST Card */}
                {gstBreakdown.length > 0 && (
                  <div className="lg:col-span-3">
                    <GstCard gstBreakdown={gstBreakdown} />
                  </div>
                )}
              </div>

              <div className="mt-5 flex gap-2">
                <Button
                  className="min-w-[7rem]"
                  color="primary"
                  type="submit"
                  form="purchase-form"
                >
                  {isEditing ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    reset();
                    handleCancelEdit();
                    setBillDate(null);
                  }}
                  className="min-w-[7rem]"
                  variant="outlined"
                >
                  {isEditing ? "Cancel" : "Reset"}
                </Button>
              </div>
            </Card>
          </form>
        </Collapse>

        <TwdTable
          data={tableConfig}
          selectable={false}
          facedFilter={filterActions}
          count={count}
          page={page}
          limit={limit}
          handleFilterChange={handleTableChange}
        />

        <PurchaseModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          purchaseId={selectedPurchaseId}
        />
      </div>
    </Page>
  );
};

export default memo(AddPurchase);
