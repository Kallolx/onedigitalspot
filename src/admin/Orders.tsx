import React, { useState } from "react";
import { Search, Download, Plus, Filter, Trash2, Edit, Eye } from "lucide-react";

const sampleOrders = [
  { id: "#12459", customer: "Alex Johnson", amount: "$249.99", status: "completed", time: "2 min ago" },
  { id: "#12458", customer: "Sarah Davis", amount: "$189.50", status: "processing", time: "5 min ago" },
  { id: "#12457", customer: "Mike Wilson", amount: "$99.99", status: "completed", time: "12 min ago" },
  { id: "#12456", customer: "Emma Brown", amount: "$299.99", status: "pending", time: "18 min ago" },
];

const Orders = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [viewOrder, setViewOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);

  // Filtered orders
  const filteredOrders = sampleOrders.filter(
    (order) =>
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  // Status badge
  const StatusBadge = ({ status }) => {
    if (status === "completed")
      return (
        <span className="flex items-center gap-1 text-xs font-pixel font-bold text-green-700">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#22c55e"/><path d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Completed
        </span>
      );
    if (status === "processing")
      return (
        <span className="flex items-center gap-1 text-xs font-pixel font-bold text-blue-700">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#3b82f6"/><path d="M10 5v5l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Processing
        </span>
      );
    if (status === "pending")
      return (
        <span className="flex items-center gap-1 text-xs font-pixel font-bold text-yellow-700">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#f59e0b"/><path d="M10 7v3h3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Pending
        </span>
      );
    return null;
  };

  // Bulk actions
  const BulkActions = () => (
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-pixel text-xs">
        <Trash2 className="w-4 h-4" /> Delete
      </button>
      <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-pixel text-xs">
        <Download className="w-4 h-4" /> Export
      </button>
    </div>
  );

  // Order details modal
  const OrderDetailsModal = ({ order, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-retro p-6 w-full max-w-md">
        <h2 className="text-xl font-pixel font-bold text-primary mb-4">Order Details</h2>
        <div className="space-y-2">
          <div><span className="font-pixel text-xs text-muted-foreground">Order ID:</span> <span className="font-mono font-bold text-primary">{order.id}</span></div>
          <div><span className="font-pixel text-xs text-muted-foreground">Customer:</span> <span>{order.customer}</span></div>
          <div><span className="font-pixel text-xs text-muted-foreground">Amount:</span> <span className="font-semibold text-primary">{order.amount}</span></div>
          <div><span className="font-pixel text-xs text-muted-foreground">Status:</span> <StatusBadge status={order.status} /></div>
          <div><span className="font-pixel text-xs text-muted-foreground">Time:</span> <span className="font-mono text-muted-foreground">{order.time}</span></div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-pixel" onClick={onClose}>Close</button>
          <button className="px-4 py-2 rounded-lg bg-blue-500 text-white font-pixel" onClick={() => { setEditOrder(order); onClose(); }}>Edit</button>
        </div>
      </div>
    </div>
  );

  // Edit order modal
  const EditOrderModal = ({ order, onClose, onSave }) => {
    const [status, setStatus] = useState(order.status);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-lg shadow-retro p-6 w-full max-w-md">
          <h2 className="text-xl font-pixel font-bold text-primary mb-4">Edit Order Status</h2>
          <div className="mb-4">
            <label className="font-pixel text-xs text-muted-foreground mb-2 block">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg">
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 rounded-lg bg-muted text-foreground font-pixel" onClick={onClose}>Cancel</button>
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-pixel" onClick={() => onSave(status)}>Save</button>
          </div>
        </div>
      </div>
    );
  };

  // Save status change
  const handleSaveStatus = (newStatus) => {
    if (editOrder) {
      // In real app, update order in backend
      const idx = sampleOrders.findIndex(o => o.id === editOrder.id);
      if (idx !== -1) sampleOrders[idx].status = newStatus;
      setEditOrder(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h1 className="text-2xl font-pixel font-bold text-primary">Order Management</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground w-full"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-pixel hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Order
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 text-primary" />
            <span className="font-pixel text-primary">Export</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 text-primary" />
            <span className="font-pixel text-primary">Import</span>
          </button>
        </div>
      </div>

      {/* Table & Actions */}
      <div className="bg-white border border-border rounded-lg p-0 shadow-retro">
        {/* Bulk Actions */}
        {selected.length > 0 && (
          <div className="px-6 py-3 border-b border-border bg-muted flex items-center justify-between">
            <span className="font-pixel text-xs text-muted-foreground">{selected.length} selected</span>
            <BulkActions />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                <th className="px-4 py-2 font-pixel text-xs">
                  <input type="checkbox" checked={selected.length === paginatedOrders.length && paginatedOrders.length > 0} onChange={e => setSelected(e.target.checked ? paginatedOrders.map(o => o.id) : [])} />
                </th>
                <th className="px-4 py-2 font-pixel text-xs">Order ID</th>
                <th className="px-4 py-2 font-pixel text-xs">Customer</th>
                <th className="px-4 py-2 font-pixel text-xs">Amount</th>
                <th className="px-4 py-2 font-pixel text-xs">Status</th>
                <th className="px-4 py-2 font-pixel text-xs">Time</th>
                <th className="px-4 py-2 font-pixel text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground font-pixel">No orders found.</td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="bg-background border-b border-border hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(order.id)} onChange={e => setSelected(e.target.checked ? [...selected, order.id] : selected.filter(id => id !== order.id))} />
                    </td>
                    <td className="px-4 py-3 font-mono text-primary font-bold">{order.id}</td>
                    <td className="px-4 py-3 text-foreground">{order.customer}</td>
                    <td className="px-4 py-3 font-semibold text-primary">{order.amount}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">{order.time}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1 rounded-lg hover:bg-primary/10" title="View" onClick={() => setViewOrder(order)}><Eye className="w-4 h-4 text-primary" /></button>
                        <button className="p-1 rounded-lg hover:bg-primary/10" title="Edit" onClick={() => setEditOrder(order)}><Edit className="w-4 h-4 text-blue-500" /></button>
                        <button className="p-1 rounded-lg hover:bg-red-100" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-6 py-4 border-t border-border bg-muted gap-2">
          <span className="font-pixel text-xs text-muted-foreground">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredOrders.length)} of {filteredOrders.length} orders</span>
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 rounded-lg bg-white border border-border font-pixel text-xs hover:bg-primary/10"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >Prev</button>
            <span className="font-pixel text-xs">Page {page} of {totalPages}</span>
            <button
              className="px-2 py-1 rounded-lg bg-white border border-border font-pixel text-xs hover:bg-primary/10"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >Next</button>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1 rounded-lg border border-border font-pixel text-xs">
              {[5, 10, 20].map(size => <option key={size} value={size}>{size} / page</option>)}
            </select>
          </div>
        </div>
      </div>
      {/* Modals */}
      {viewOrder && <OrderDetailsModal order={viewOrder} onClose={() => setViewOrder(null)} />}
      {editOrder && <EditOrderModal order={editOrder} onClose={() => setEditOrder(null)} onSave={handleSaveStatus} />}
    </div>
  );
};

export default Orders;
