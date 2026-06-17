import API from "./apiClient";

// GET ALL
export const getAllMedicines = async () => {
  const { data } = await API.get("/medicines");
  return data;
};

// ADD
export const addMedicine = async (medicineData) => {
  const { data } = await API.post(
    "/medicines",
    medicineData
  );

  return data;
};

// UPDATE
export const updateMedicine = async (
  id,
  medicineData
) => {
  const { data } = await API.put(
    `/medicines/${id}`,
    medicineData
  );

  return data;
};

// DELETE
export const deleteMedicine = async (id) => {
  const { data } = await API.delete(
    `/medicines/${id}`
  );

  return data;
};