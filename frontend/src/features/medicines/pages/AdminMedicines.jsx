import { useEffect, useState } from "react";
import { Pencil, Trash2, Filter } from "lucide-react";
import { toast } from "react-toastify";
import {
  getAllMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
} from "../../../services/medicineService";

const categories = [
  "tablet",
  "capsule",
  "syrup",
  "injection",
  "ointment",
  "drops",
  "iv_fluid",
  "medical_device",
  "surgical",
  "personal_care",
  "nutrition",
  "baby_care",
  "veterinary",
  "ayurvedic",
  "others",
];

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryStats, setShowCategoryStats] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [filters, setFilters] = useState({
    name: "",
    manufacturer: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    discount: "",
    expiry: "",
  });

  const [form, setForm] = useState({
    productName: "",
    manufacturer: "",
    productCategory: "tablet",
    mrp: "",
    discount: "",
    expiryDate: "",
  });

  // =========================================
  // FETCH — no token arg needed, cookie is sent automatically
  // =========================================
  const fetchMedicines = async () => {
    try {
      const res = await getAllMedicines();
      setMedicines(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // =========================================
  // INPUT CHANGE
  // =========================================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =========================================
  // CHECK EXPIRED
  // =========================================
  const isExpired = (date) => {
    if (!date) return false;
    const expiry = new Date(date);
    if (isNaN(expiry)) return false;
    return expiry < new Date();
  };

  // =========================================
  // PRICE
  // =========================================
  const price = form.mrp
  ? (Number(form.mrp) - (Number(form.mrp) * Number(form.discount || 0)) / 100).toFixed(2)
  : "0.00";

  // =========================================
  // SUBMIT — no token arg needed
  // =========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalData = {
      productName: form.productName,
      manufacturer: form.manufacturer,
      productCategory: form.productCategory,
      mrp: Number(form.mrp),
      discount: Number(form.discount || 0),
      // handleSubmit mein
      price: Number((Number(form.mrp) - (Number(form.mrp) * Number(form.discount || 0)) / 100).toFixed(2)),
      expiryDate: form.expiryDate,
    };

    try {
      if (editId) {
        await updateMedicine(editId, finalData);
      } else {
        await addMedicine(finalData);
      }

      setForm({
        productName: "",
        manufacturer: "",
        productCategory: "tablet",
        mrp: "",
        discount: "",
        expiryDate: "",
      });

      setEditId(null);
      fetchMedicines();
    } catch (err) {
      console.log(err);
      toast.error("Failed to save medicine");
    }
  };

  // EDIT
  const handleEdit = (med) => {
    setForm({
      productName: med.productName || "",
      manufacturer: med.manufacturer || "",
      productCategory: med.productCategory || "tablet",
      mrp: med.mrp || "",
      discount: med.discount || "",
      expiryDate: med.expiryDate?.slice(0, 10) || "",
    });
    setEditId(med._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // =========================================
  // DELETE — no token arg needed
  // =========================================
  const handleDelete = async (id) => {
    if (window.confirm("Delete this medicine?")) {
      try {
        await deleteMedicine(id);
        fetchMedicines();
      } catch (err) {
        console.log(err);
      }
    }
  };

  // =========================================
  // CATEGORY COUNT
  // =========================================
  const categoryCountMap = medicines.reduce((acc, med) => {
    const cat = med.productCategory || "others";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // =========================================
  // FILTER
  // =========================================
  const filtered = medicines
    .filter((m) => m.productName?.toLowerCase().includes(search.toLowerCase()))
    .filter((m) => (filters.name ? m.productName?.toLowerCase().includes(filters.name.toLowerCase()) : true))
    .filter((m) => (filters.manufacturer ? m.manufacturer?.toLowerCase().includes(filters.manufacturer.toLowerCase()) : true))
    .filter((m) => (filters.category ? m.productCategory === filters.category : true))
    .filter((m) => (selectedCategory ? m.productCategory === selectedCategory : true))
    .filter((m) => (filters.minPrice ? m.price >= Number(filters.minPrice) : true))
    .filter((m) => (filters.maxPrice ? m.price <= Number(filters.maxPrice) : true))
    .filter((m) => (filters.discount ? m.discount >= Number(filters.discount) : true))
    .filter((m) => (filters.expiry ? m.expiryDate?.slice(0, 10) === filters.expiry : true))
    .filter((m) => {
      if (filterType === "expired") return isExpired(m.expiryDate);
      if (filterType === "active") return !isExpired(m.expiryDate);
      return true;
    })
    .sort((a, b) => a.productName.localeCompare(b.productName));

  // =========================================
  // RESET
  // =========================================
  const resetFilters = () => {
    setFilters({ name: "", manufacturer: "", category: "", minPrice: "", maxPrice: "", discount: "", expiry: "" });
    setSelectedCategory("");
    setFilterType("all");
  };

  return (
    <div style={{ padding: "20px", background: "#f8fafc" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", gap: "12px", flexWrap: "wrap" }}>
        <h2 className="pageTitle">Medicines</h2>
        <input
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* STATS */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
        <StatCard title="All Medicines" value={medicines.length} onClick={() => setFilterType("all")} />
        <StatCard title="Expired" value={medicines.filter((m) => isExpired(m.expiryDate)).length} color="#ef4444" onClick={() => setFilterType("expired")} />
        <StatCard title="Active" value={medicines.filter((m) => !isExpired(m.expiryDate)).length} color="#22c55e" onClick={() => setFilterType("active")} />
        <StatCard title="Categories" value={categories.length} color="#3b82f6" onClick={() => setShowCategoryStats(!showCategoryStats)} />
      </div>

      {/* CATEGORY BREAKDOWN */}
      {showCategoryStats && (
        <div className="card">
          <h3>Category Breakdown</h3>
          <div className="catWrap">
            {categories.map((cat) => (
              <div
                key={cat}
                className={`catBadge ${selectedCategory === cat ? "activeCat" : ""}`}
                onClick={() => setSelectedCategory(cat === selectedCategory ? "" : cat)}
              >
                {cat} ({categoryCountMap[cat] || 0})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FORM */}
      <div className="card">
        <h3 className="formTitle">{editId ? "Update Medicine" : "Add Medicine"}</h3>
        <form onSubmit={handleSubmit} className="grid">
          <input required name="productName" placeholder="Product Name" value={form.productName} onChange={handleChange} />
          <input name="manufacturer" placeholder="Manufacturer" value={form.manufacturer} onChange={handleChange} />
          <select name="productCategory" value={form.productCategory} onChange={handleChange}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input required type="number" name="mrp" placeholder="MRP" value={form.mrp} onChange={handleChange} />
          <input type="number" name="discount" placeholder="Discount %" value={form.discount} onChange={handleChange} />
          <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} />
          <div className="priceBox">₹ {price}</div>
          <button className="btn">{editId ? "Update" : "Add"}</button>
        </form>
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="tableTop">
          <h3>All Medicines</h3>
          <button className="filterBtn" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            Filter
          </button>
        </div>

        {/* FILTERS */}
        {showFilters && (
          <div className="filterBox">
            <input placeholder="Name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
            <input placeholder="Manufacturer" value={filters.manufacturer} onChange={(e) => setFilters({ ...filters, manufacturer: e.target.value })} />
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              <option value="">All Category</option>
              {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
            <input type="number" placeholder="Min ₹" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
            <input type="number" placeholder="Max ₹" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
            <input type="number" placeholder="Discount %" value={filters.discount} onChange={(e) => setFilters({ ...filters, discount: e.target.value })} />
            <input type="date" value={filters.expiry} onChange={(e) => setFilters({ ...filters, expiry: e.target.value })} />
            <button className="resetBtn" onClick={resetFilters}>Reset</button>
          </div>
        )}

        {/* TABLE */}
        <table className="table">
          <thead className="tableHead">
            <tr>
              <th>SL</th>
              <th>Medicine</th>
              <th>Category</th>
              <th>Manufacturer</th>
              <th>MRP</th>
              <th>Disc%</th>
              <th>Price</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((med, i) => (
                <tr key={med._id}>
                  <td>{i + 1}</td>
                  <td>{med.productName}</td>
                  <td>{med.productCategory}</td>
                  <td>{med.manufacturer || "-"}</td>
                  <td>₹{med.mrp}</td>
                  <td>{med.discount || 0}%</td>
                  <td>₹{Number(med.price).toFixed(2)}</td>
                  <td>{med.expiryDate?.slice(0, 10) || "-"}</td>
                  <td>
                    <span className={isExpired(med.expiryDate) ? "badge red" : "badge green"}>
                      {isExpired(med.expiryDate) ? "Expired" : "Active"}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(med)} className="iconBtn">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(med._id)} className="iconBtn red">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
                  No medicines found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* STYLES */}
      <style>{`
        .card { background: #ffffff; padding: 20px; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 6px 18px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; transition: 0.25s ease; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.08); }
        .pageTitle { font-size: 20px; font-weight: 700; color: #064e3b; position: relative; display: inline-block; }
        .pageTitle::after { content: ""; position: absolute; left: 0; bottom: -4px; width: 50%; height: 3px; background: #22c55e; border-radius: 4px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
        .formTitle { font-size: 22px; font-weight: 700; color: #064e3b; background: linear-gradient(90deg, #ecfdf5, #f0fdf4, transparent); padding: 8px 14px; border-radius: 10px; position: relative; width: fit-content; margin-bottom: 20px; }
        .formTitle::after { content: ""; position: absolute; left: 14px; bottom: -5px; width: 50%; height: 3px; background: linear-gradient(90deg, #22c55e, #4ade80); border-radius: 4px; }
        input, select { padding: 10px 12px; border-radius: 10px; border: 1px solid #e2e8f0; background: #f9fafb; transition: 0.2s; }
        input:focus, select:focus { outline: none; border-color: #86efac; background: #fff; }
        .btn { background: linear-gradient(135deg, #1f7a63, #14532d); color: white; border: none; padding: 10px; border-radius: 10px; font-weight: 600; cursor: pointer; }
        .btn:hover { background: linear-gradient(135deg, #166534, #064e3b); }
        .filterBtn { display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #1f7a63, #14532d); color: white; border: none; padding: 8px 14px; border-radius: 10px; cursor: pointer; }
        .filterBox { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 12px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
        .resetBtn { background: #ef4444; color: white; border: none; padding: 8px 14px; border-radius: 10px; cursor: pointer; }
        .table { width: 100%; border-collapse: separate; border-spacing: 0; overflow: hidden; border-radius: 12px; margin-top: 10px; }
        .table th, .table td { padding: 12px 14px; text-align: left; }
        .tableHead { background: linear-gradient(135deg, #14532d, #1f7a63); color: white; }
        .table tbody tr { border-bottom: 1px solid #f1f5f9; transition: 0.2s; }
        .table tbody tr:hover { background: #f0fdf4; }
        .badge { padding: 5px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
        .green { background: #dcfce7; color: #16a34a; }
        .red { background: #fee2e2; color: #dc2626; }
        .iconBtn { border: none; background: #f1f5f9; padding: 6px; border-radius: 8px; cursor: pointer; margin-right: 8px; }
        .iconBtn svg { color: #2563eb; }
        .iconBtn.red svg { color: #ef4444; }
        .catWrap { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
        .catBadge { padding: 8px 14px; background: #f1f5f9; border-radius: 999px; cursor: pointer; transition: 0.2s; }
        .catBadge:hover { background: #e2e8f0; }
        .activeCat { background: #22c55e; color: white; }
        .tableTop { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; background: #f0fdf4; padding: 12px 16px; border-radius: 10px; border: 1px solid #dcfce7; }
        .priceBox { background: #ecfdf5; padding: 10px; border-radius: 10px; font-weight: 600; color: #065f46; display: flex; align-items: center; justify-content: center; }
        .tableTop h3 { font-size: 18px; font-weight: 700; color: #064e3b; position: relative; }
        .tableTop h3::after { content: ""; position: absolute; left: 0; bottom: -4px; width: 40px; height: 3px; background: #22c55e; border-radius: 4px; }
        @media (max-width: 768px) { .table { display: block; overflow-x: auto; } .tableTop { flex-direction: column; gap: 12px; align-items: flex-start; } }
      `}</style>
    </div>
  );
};

const StatCard = ({ title, value, color = "#22c55e", onClick }) => (
  <div
    onClick={onClick}
    style={{
      flex: 1, minWidth: "180px", background: "#ffffff", padding: "16px",
      borderRadius: "14px", cursor: "pointer", border: "1px solid #e2e8f0",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderLeft: `5px solid ${color}`, transition: "0.25s",
    }}
  >
    <p style={{ fontWeight: 500, color: "#334155" }}>{title}</p>
    <h2 style={{ color, fontWeight: 700, fontSize: "20px" }}>{value}</h2>
  </div>
);

export default Medicines;