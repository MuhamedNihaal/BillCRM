import { memo } from "react";
import { Card } from "components/ui";
import { amountFormatter } from "utility";

const GstCard = ({ gstBreakdown = [] }) => {
    // Calculate totals from the gstBreakdown array
    const totalTaxableAmount = gstBreakdown.reduce((sum, gst) => sum + (gst.taxableAmount || 0), 0);
    const totalGstAmount = gstBreakdown.reduce((sum, gst) => sum + (gst.gstAmount || 0), 0);
    const totalCgstAmount = gstBreakdown.reduce((sum, gst) => sum + (gst.cgstAmount || 0), 0);
    const totalSgstAmount = gstBreakdown.reduce((sum, gst) => sum + (gst.sgstAmount || 0), 0);

    if (gstBreakdown.length === 0) {
        return (
            <Card className="p-4">
                <h4 className="mb-4 border-b pb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                    GST Summary
                </h4>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No GST data available</p>
                    <p className="text-sm">Add products with GST to see breakdown</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-4">
            <h4 className="mb-4 border-b pb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                GST Summary
            </h4>
            
            {/* GST Breakdown Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-xs text-gray-600 dark:text-gray-400">
                            <th className="text-left py-2">GST %</th>
                            <th className="text-right py-2">Taxable Amount ₹</th>
                            <th className="text-right py-2">CGST %</th>
                            <th className="text-right py-2">CGST ₹</th>
                            <th className="text-right py-2">SGST %</th>
                            <th className="text-right py-2">SGST ₹</th>
                            <th className="text-right py-2">Total GST ₹</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gstBreakdown.map((gst, index) => (
                            <tr key={index} className="text-gray-800 dark:text-gray-200 border-b last:border-b-0">
                                <td className="py-2 font-medium">{gst.percentage}%</td>
                                <td className="text-right py-2">
                                    {amountFormatter(gst.taxableAmount, true).formatAmount}
                                </td>
                                <td className="text-right py-2 font-medium">{gst.cgstPercentage}%</td>
                                <td className="text-right py-2">
                                    {amountFormatter(gst.cgstAmount, true).formatAmount}
                                </td>
                                <td className="text-right py-2 font-medium">{gst.sgstPercentage}%</td>
                                <td className="text-right py-2">
                                    {amountFormatter(gst.sgstAmount, true).formatAmount}
                                </td>
                                <td className="text-right py-2 font-semibold">
                                    {amountFormatter(gst.gstAmount, true).formatAmount}
                                </td>
                            </tr>
                        ))}
                        
                        {/* Total Row - only show if there are multiple GST rates */}
                        {gstBreakdown.length > 1 && (
                            <tr className="text-gray-900 dark:text-gray-100 font-semibold border-t-2 bg-gray-50 dark:bg-gray-800">
                                <td className="py-2 font-bold">Total</td>
                                <td className="text-right py-2 font-bold">
                                    {amountFormatter(totalTaxableAmount, true).formatAmount}
                                </td>
                                <td className="py-2 text-right">-</td>
                                <td className="text-right py-2 font-bold">
                                    {amountFormatter(totalCgstAmount, true).formatAmount}
                                </td>
                                <td className="py-2 text-right">-</td>
                                <td className="text-right py-2 font-bold">
                                    {amountFormatter(totalSgstAmount, true).formatAmount}
                                </td>
                                <td className="text-right py-2 font-bold text-primary">
                                    {amountFormatter(totalGstAmount, true).formatAmount}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary Section */}
            {/* <div className="mt-4 space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total Taxable Amount:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {amountFormatter(totals?.taxableAmount || totalTaxableAmount, true).formatAmount}
                    </span>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total CGST:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {amountFormatter(totalCgstAmount, true).formatAmount}
                    </span>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total SGST:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {amountFormatter(totalSgstAmount, true).formatAmount}
                    </span>
                </div>
                
                <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Total GST:
                        </span>
                        <span className="text-primary text-xl font-bold">
                            {amountFormatter(totals?.gstAmount || totalGstAmount, true).formatAmount}
                        </span>
                    </div>
                </div>
                
                <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Grand Total:
                        </span>
                        <span className="text-primary text-xl font-bold">
                            {amountFormatter(totals?.grandTotal || (totalTaxableAmount + totalGstAmount), true).formatAmount}
                        </span>
                    </div>
                </div>
            </div> */}
        </Card>
    );
};

export default memo(GstCard);