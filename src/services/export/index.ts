import ky from "ky";
import Cookies from "js-cookie";

const token = Cookies.get("authToken");
const BASE_URL = "http://localhost:5000/api/export"; // Endpoint untuk ekspor data surat

export const exportLetters = async (values: { startDate: string, endDate: string, departmentId: string }) => {
    // Kirim request ke API untuk ekspor data
    const response = await ky.get(BASE_URL, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        searchParams: {
            startDate: values.startDate,
            endDate: values.endDate,
            departmentId: values.departmentId,
        },
    });

    // Mengonversi respons menjadi Blob untuk file
    const blob = await response.blob();

    // Membuat link untuk mengunduh file
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'letters.xlsx');
    document.body.appendChild(link);
    link.click(); // Memicu klik untuk mengunduh file
    document.body.removeChild(link);

    return { message: 'File berhasil diunduh.' };
};
