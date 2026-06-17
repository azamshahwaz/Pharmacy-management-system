import { useAuth } from "../context/AuthContext"; // path apne structure ke hisaab se adjust karo
import AdminMedicine from "./AdminMedicine";
import CustomerMedicine from "./CustomerMedicines";

export default function Medicines() {
  const { user, loading } = useAuth();

  if (loading) return null; // ya spinner

  const isAdmin = user?.role === "admin" || user?.role === "staff";

  return isAdmin ? <AdminMedicine /> : <CustomerMedicine />;
}