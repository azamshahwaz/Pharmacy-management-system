import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Invoice from "../components/Invoice";
import API from "../../../services/apiClient";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // ✅ Token nahi chahiye — cookie automatically jayegi
        const { data } = await API.get(`/orders/${id}`);
        setOrder(data.data);
      } catch (err) {
        console.error("Order fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Failed to load order. Please try again.</p>;

  return (
    <div className="w-full">
      <Invoice order={order} />
    </div>
  );
};

export default OrderDetails;