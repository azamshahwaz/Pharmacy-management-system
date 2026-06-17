import API from "./apiClient";

export const getReports = async () => {
  try {

    const res = await API.get("/admin/reports");

    return res.data;

  } catch (error) {

    console.log(
      "REPORT FETCH ERROR =>",
      error.response?.data || error.message
    );

    throw error;
  }
};