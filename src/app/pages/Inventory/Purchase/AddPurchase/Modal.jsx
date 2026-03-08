import { memo, useState, useCallback, useEffect } from "react";
import Modal from "components/Modal.jsx";
import moment from "moment";
import { PrinterIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { get } from "utility"
import { Button } from "components/ui";
import { API_URL } from "constants/app.constant.js";

const PurchaseModal = ({ isOpen, onClose, purchaseId }) => {
	const URL = API_URL;
	const [purchase, setPurchase] = useState(null);
	const [loading, setLoading] = useState(false);

	const fetchPurchaseDetail = useCallback(async (id) => {
		if (!id) return;
		
		setLoading(true);
		try {
			const response = await get(`purchase/details?id=${id}`);
			setPurchase(response.data);
		} catch (error) {
			console.error("Error fetching purchase request detail:", error);
			toast.error("Failed to fetch purchase request details");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (isOpen && purchaseId) {
			fetchPurchaseDetail(purchaseId);
		}
	}, [isOpen, purchaseId, fetchPurchaseDetail]);

	const handlePrint = () => {
		if (purchaseId) {
			window.open(`${URL}purchase/render?id=${purchaseId}`, '_blank');
		}
	};

	return (
		<Modal
			title="Purchase Details"
			isOpen={isOpen}
			close={onClose}
			className="!min-w-10/12"
		>
			{loading ? (
				<div className="flex justify-center items-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>
			) : !purchase ? (
				<div className="text-center py-8">
					<p className="text-gray-500">No data available</p>
				</div>
			) : (
			<div className="space-y-6 max-h-[70vh] overflow-y-auto">
				{/* Header Information */}
				<div className="bg-primary p-4 rounded-lg">
					<div className="grid grid-cols-2 gap-8 mb-4">
						<div className="space-y-2">
							<div className="flex">
								<span className="text-sm font-semibold text-gray-800 dark:text-gray-200 w-24">Purchase ID:</span>
								<span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{purchase.uniqueId}</span>
							</div>
							<div className="flex">
								<span className="text-sm text-gray-600 dark:text-gray-400 w-24">Bill Date:</span>
								<span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{moment(purchase.billDate).format("DD-MM-YYYY")}</span>
							</div>
							<div className="flex">
								<span className="text-sm text-gray-600 dark:text-gray-400 w-24">Bill Number:</span>
								<span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{purchase.billNum}</span>
							</div>
							<div className="flex gap-2">
								<span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">Supplier Name:</span>
								<span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{purchase.supplier?.name}</span>
							</div>
							<div className="flex">
								<span className="text-sm text-gray-600 dark:text-gray-400 w-24">Supplier ID:</span>
								<span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{purchase.supplier?.uniqueId}</span>
							</div>
							<div className="flex items-center">
								<span className="text-sm text-gray-600 dark:text-gray-400 w-24">Status:</span>
								<span className={`px-2 py-1 rounded text-xs ${
									purchase.paymentStatus === 1 
										? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
										: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
								}`}>
									{purchase.paymentStatus === 0 ? 'Unpaid' : 'Paid'}
								</span>
							</div>
						</div>
						<div className="space-y-2">
							<div className="flex justify-end">
								<div className="text-right">
									<span className="text-sm text-gray-600 dark:text-gray-400">Taxable Amount: </span>
									<span className="font-semibold text-gray-900 dark:text-gray-100">{purchase.taxableAmount}</span>
								</div>
							</div>
							<div className="flex justify-end">
								<div className="text-right">
									<span className="text-sm text-gray-600 dark:text-gray-400">GST Amount: </span>
									<span className="font-semibold text-gray-900 dark:text-gray-100">{purchase.gstAmount}</span>
								</div>
							</div>
							<div className="flex justify-end">
								<div className="text-right">
									<span className="text-sm text-gray-600 dark:text-gray-400">Grand Total: </span>
									<span className="font-semibold text-gray-900 dark:text-gray-100">{purchase.grandTotal}</span>
								</div>
							</div>
							{/* <div className="flex justify-end">
								<div className="text-right">
									<span className="text-sm text-gray-600 dark:text-gray-400">Paid Amount: </span>
									<span className="font-semibold text-gray-900 dark:text-gray-100">{purchase.paidAmount}</span>
								</div>
							</div> */}
							<div className="flex justify-end">
								<div className="text-right">
									<span className="text-sm text-gray-600 dark:text-gray-400">Added By: </span>
									<span className="font-semibold text-gray-900 dark:text-gray-100">{purchase.addedBy?.name}</span>
								</div>
							</div>
							<div className="flex justify-end items-center">
								<span className={`px-2 py-1 rounded text-xs ${
									purchase.status === 0 
										? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
										: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
								}`}>
									{purchase.status === 0 ? 'Accepted' : 'Pending'}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Items Table */}
				<div>
					<h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Products</h4>
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										#
									</th>
									<th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Product
									</th>
									<th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Qty
									</th>
									<th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Unit
									</th>
									<th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										MRP
									</th>
									<th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Rate
									</th>
									<th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										GST(%)
									</th>
									<th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Amount
									</th>
								</tr>
							</thead>
							<tbody className="bg-primary divide-y divide-gray-200 dark:divide-gray-700">
								{purchase.items?.map((item, index) => (
									<tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900">
										<td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
											{index + 1}
										</td>
										<td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
											{item.product?.name}
										</td>
										<td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-100">
											{item.quantity}
										</td>
										<td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-100">
											{item.unit}
										</td>
										<td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-100">
											₹{item.mrp}
										</td>
										<td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-100">
											₹{item.rate}
										</td>
										<td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-100">
											{item.gst}%
										</td>
										<td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100 font-semibold">
											₹{item.amount}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* GST Table */}
				<div>
					<h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">GST Details</h4>
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										#
									</th>
									<th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Percentage
									</th>
									<th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Amount
									</th>
									<th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										CGST Percentage
									</th>
									<th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										CGST Amount
									</th>
									<th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										SCGST Percentage
									</th>
									<th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										SCGST Amount
									</th>
								</tr>
							</thead>
							<tbody className="bg-primary divide-y divide-gray-200 dark:divide-gray-700">
								{purchase.gst?.map((item, index) => (
									<tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900">
										<td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
											{index + 1}
										</td>
										<td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
											{item.percentage}
										</td>
										<td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-100">
											{item.amount}
										</td>
										<td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-100">
											{item.cgstPercentage}
										</td>
										<td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-100">
											{item.cgstAmount}
										</td>
										<td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-100">
											{item.scgstPercentage}
										</td>
										<td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-100">
											₹{item.scgstAmount}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Totals */}
				<div className="bg-primary p-4 rounded-lg">
					<div className="space-y-1 text-right max-w-xs ml-auto">
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
							<span className="font-semibold text-gray-900 dark:text-gray-100">₹{purchase.taxableAmount}</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600 dark:text-gray-400">GST:</span>
							<span className="font-semibold text-gray-900 dark:text-gray-100">₹{purchase.gstAmount}</span>
						</div>
						<div className="flex justify-between items-center border-t pt-1 mt-1">
							<span className="font-semibold text-gray-900 dark:text-gray-100">Grand Total:</span>
							<span className="font-bold text-lg text-gray-900 dark:text-gray-100">₹{purchase.grandTotal}</span>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-end gap-3 pt-4 border-t">
					<Button variant="outlined" onClick={onClose}>
						Close
					</Button>
					<Button color="primary" onClick={handlePrint}>
						<PrinterIcon className="w-4 h-4 mr-2" />
						Print Report
					</Button>
				</div>
				</div>
			)}
		</Modal>
	);
};

export default memo(PurchaseModal);