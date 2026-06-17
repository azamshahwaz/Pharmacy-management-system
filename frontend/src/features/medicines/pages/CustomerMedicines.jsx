import { useEffect, useState } from "react";
import { Filter, ShoppingCart } from "lucide-react";
import API from "../../../services/apiClient";
import { toast } from "react-toastify";

export default function CustomerMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cartQty, setCartQty] = useState({});

  const categories = [
    "tablet", "capsule", "syrup", "injection", "ointment", "drops",
    "iv_fluid", "medical_device", "surgical", "personal_care",
    "nutrition", "baby_care", "veterinary", "ayurvedic", "others",
  ];

  useEffect(() => { fetchMedicines(); }, []);

  const fetchMedicines = async () => {
    try {
      // ✅ Token nahi — cookie jayegi
      const { data } = await API.get("/medicines");
      setMedicines(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
        "Failed to load medicines"
      );
    }
  };

  const filtered = medicines
    .filter((m) => m.productName?.toLowerCase().includes(search.toLowerCase()))
    .filter((m) => selectedCategory ? m.productCategory === selectedCategory : true);

  const handleQty = (id, value) => setCartQty({ ...cartQty, [id]: value });

  const handleAddToCart = (medicine) => {
    const qty =
      Number(cartQty[medicine._id]) || 1;

    if (qty < 1) {
      toast.error(
        "Quantity must be at least 1"
      );
      return;
    }
    toast.success(
      `${medicine.productName} added (${qty})`
    );
  };

  return (
    <div className="p-6 bg-base-100 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-emerald-800">Shop Medicines</h1>
          <div className="w-24 h-1 bg-emerald-600 rounded mt-1" />
        </div>
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search medicines..."
            className="input input-bordered w-full md:w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn bg-emerald-800 hover:bg-emerald-900 border-0 text-white"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} /> Filter
          </button>
        </div>
      </div>

      {/* FILTERS */}
      {showFilters && (
        <div className="card bg-base-100 shadow-md border border-base-200 mb-6">
          <div className="card-body">
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                  className={`btn btn-sm rounded-full capitalize ${selectedCategory === cat ? "bg-emerald-800 text-white border-0" : "btn-outline"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="bg-emerald-800 text-white">
                  <th>Medicine</th><th>Category</th><th>Price</th>
                  <th>Expiry</th><th>Quantity</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((med) => (
                  <tr key={med._id}>
                    <td>
                      <p className="font-bold text-emerald-800">{med.productName}</p>
                      <p className="text-xs opacity-70">{med.manufacturer || "No Manufacturer"}</p>
                    </td>
                    <td className="capitalize">{med.productCategory}</td>
                    <td className="font-bold text-emerald-700">₹{med.price}</td>
                    <td>{med.expiryDate?.slice(0, 10) || "-"}</td>
                    <td>
                      <input
                        type="number" min="1"
                        value={cartQty[med._id] || 1}
                        onChange={(e) => handleQty(med._id, e.target.value)}
                        className="input input-bordered w-20"
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => handleAddToCart(med)}
                        className="btn bg-emerald-800 hover:bg-emerald-900 border-0 text-white rounded-xl"
                      >
                        <ShoppingCart size={18} /> Add
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}