import { memo, useMemo } from "react";
import { Table, THead, TBody, Th, Tr, Td, Button } from "components/ui";
import { Eraser, X, PlusCircleIcon } from "lucide-react";
import InputBundle from "components/Inputs";

const Products = ({
  products,
  onProductSelect,
  onProductChange,
  onAddProduct,
  onRemoveProduct,
  onClearProduct,
  productOptions,
}) => {
  const transformedProductOptions =
    productOptions?.map((option) => ({
      value: option.value,
      label: option.label,
    })) || [];

  const columns = useMemo(
    () => [
      "#",
      "Product Name",
      "Qty",
      "Unit",
      "MRP",
      "Rate",
      "GST",
      "Amount",
      "Actions",
    ],
    [],
  );

  // const handleProductSelect = ({ value }) => {
  //     if (value === null || value === undefined) {
  //         // Handle clear action - when close button is clicked in InputBundle
  //         const idx = arguments[1]; // This won't work, need different approach
  //         onProductChange(idx, 'product', null);
  //     } else {
  //         onProductSelect(value, arguments[1]);
  //     }
  // };

  const handleIncreaseField = (idx, type) => {
    if (type === "add") {
      onAddProduct();
    } else if (type === "clean") {
      onClearProduct(idx);
    } else if (type === "remove") {
      onRemoveProduct(idx);
    }
  };

  return (
    <div className="mt-3 w-full">
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Products
      </label>
      <div className="dark:border-dark-500 mt-1 min-w-full overflow-x-auto rounded-lg border border-gray-200">
        <Table className="w-full text-left rtl:text-right">
          <THead>
            <Tr className="dark:border-b-dark-500 border-y border-transparent border-b-gray-200">
              {columns.map((title, idx) => (
                <Th
                  key={idx}
                  className="dark:text-dark-100 p-2 font-semibold text-gray-800 capitalize"
                >
                  {title}
                </Th>
              ))}
            </Tr>
          </THead>
          <TBody>
            {products?.map((product, idx) => (
              <Tr
                key={idx}
                className="dark:border-b-dark-500 border-y border-transparent border-b-gray-200"
              >
                <Td className="p-2">{idx + 1}</Td>

                {/* Product Name */}
                <Td className="p-2">
                  <InputBundle
                    type="select"
                    name={`products[${idx}].product`}
                    defaultValue={
                      product.product
                        ? {
                            value: product.product,
                            label:
                              productOptions.find(
                                (opt) => opt.value === product.product,
                              )?.label || product.product,
                          }
                        : null
                    }
                    placeholder="Select Product"
                    options={transformedProductOptions}
                    handleOnChange={({ value }) => {
                      if (
                        value === null ||
                        value === undefined ||
                        value === ""
                      ) {
                        // When close/clear button is clicked in the select, clear all fields
                        onClearProduct(idx);
                      } else {
                        onProductSelect(value, idx);
                      }
                    }}
                    emptyMessage="No products available"
                    searchFields={["label"]}
                    className="min-w-[200px]"
                    isClearable={true}
                  />
                </Td>

                {/* Quantity */}
                <Td className="p-2">
                  <input
                    type="number"
                    value={product.quantity || ""}
                    onChange={(e) =>
                      onProductChange(idx, "quantity", e.target.value)
                    }
                    className="focus:ring-primary w-full min-w-[80px] rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-transparent focus:ring-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                    min="1"
                    placeholder="Qty"
                  />
                </Td>

                {/* Unit */}
                <Td className="p-2">
                  <input
                    type="text"
                    value={
                      {
                        1: "Litre",
                        2: "Box",
                        3: "Number",
                        4: "Unit",
                        5: "Packet",
                      }[product.unit] || "Unit"
                    }
                    className="w-full min-w-[80px] rounded-md border border-gray-300 bg-gray-50 px-2 py-2 text-sm dark:bg-gray-600"
                    readOnly
                  />
                </Td>

                {/* MRP */}
                <Td className="p-2">
                  <input
                    type="number"
                    value={product.mrp || ""}
                    className="w-full min-w-[100px] rounded-md border border-gray-300 bg-gray-50 px-2 py-2 text-sm dark:bg-gray-600"
                    readOnly
                    placeholder="MRP"
                  />
                </Td>

                {/* Rate */}
                <Td className="p-2">
                  <input
                    type="number"
                    value={product.price || ""}
                    onChange={(e) =>
                      onProductChange(idx, "rate", e.target.value)
                    }
                    className="focus:ring-primary w-full min-w-[100px] rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-transparent focus:ring-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                    step="0.01"
                    placeholder="Rate"
                  />
                </Td>

                {/* GST */}
                <Td className="p-2">
                  <input
                    type="number"
                    value={product.gst || ""}
                    className="w-full min-w-[80px] rounded-md border border-gray-300 bg-gray-50 px-2 py-2 text-sm dark:bg-gray-600"
                    readOnly
                    placeholder="GST"
                  />
                </Td>

                {/* Amount */}
                <Td className="p-2">
                  <input
                    type="number"
                    value={product.amount || ""}
                    className="w-full min-w-[120px] rounded-md border border-gray-300 bg-gray-50 px-2 py-2 text-sm font-semibold dark:bg-gray-600"
                    readOnly
                    placeholder="Amount"
                  />
                </Td>

                {/* Expiry Date */}
                {/* <Td className="p-2">
                                    <input
                                        type="date"
                                        value={product.expiry || ''}
                                        className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-600 font-semibold min-w-[120px]"
                                        readOnly
                                        placeholder="Expiry"
                                    />
                                </Td> */}

                {/* Actions */}
                <Td className="p-2">
                  <div className="flex items-center justify-center space-x-1">
                    <div className="flex items-center justify-center gap-2">
                      {products.length > 1 && (
                        <Button
                          isIcon
                          variant="text"
                          onClick={() => handleIncreaseField(idx, "remove")}
                        >
                          <X className="size-4.5" />
                        </Button>
                      )}

                      <Button
                        isIcon
                        variant="text"
                        onClick={() => handleIncreaseField(idx, "clean")}
                      >
                        <Eraser className="size-4.5" />
                      </Button>
                    </div>
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>
      <Button
        variant="outlined"
        className="my-1 h-8 space-x-2 rounded-md px-3 text-xs"
        onClick={() => handleIncreaseField(0, "add")}
      >
        <PlusCircleIcon className="size-4" />
        <span>Add New Product</span>
      </Button>
    </div>
  );
};

export default memo(Products);
