import { memo } from "react";
import { Card } from "components/ui";
import { amountFormatter } from "utility";

const TotalsCard = ({ totals }) => {
  return (
    <Card className="sticky top-20 p-4">
      <h4 className="mb-4 border-b pb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
        Order Summary
      </h4>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Subtotal:
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
          {amountFormatter(totals.total, true).formatAmount}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Taxable Amount:
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
          {amountFormatter(totals.taxableAmount, true).formatAmount}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            GST Amount:
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
          {amountFormatter(totals.gstAmount, true).formatAmount}
          </span>
        </div>
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Grand Total:
            </span>
            <span className="text-primary text-xl font-bold">
              {amountFormatter(totals.grandTotal, true).formatAmount}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default memo(TotalsCard);
