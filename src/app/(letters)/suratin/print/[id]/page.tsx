"use client";

import { useParams } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLetterByAgenda } from '@/services/disposisi';
import { useDisposisiByLetterId } from '@/services/disposisi'; // Add this import
import { getCurrentUser } from '@/services/auth';

interface LetterData {
  letterIn_id: string;
  noSurat: string;
  suratDari: string;
  perihal: string;
  tanggalSurat: Date | null;
  diterimaTanggal: Date | null;
  kodeKlasifikasi: string;
  jenisSurat: string;
}

interface DisposisiData {
  noDisposisi: number;
  tanggalDisposisi: Date;
  tujuanDisposisi: string[];
  isiDisposisi: string;
  createdBy: string;
  departmentName: string;
}

export default function PrintPage() {
  const { id } = useParams();
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  const [searchAgenda, setSearchAgenda] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [enableSearch, setEnableSearch] = useState(false);
  const [user, setUser] = useState({ userName: "Guest", departmentName: "Unknown Department" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [letterData, setLetterData] = useState<LetterData>({
    letterIn_id: '',
    noSurat: '',
    suratDari: '',
    perihal: '',
    tanggalSurat: null,
    diterimaTanggal: null,
    kodeKlasifikasi: '',
    jenisSurat: '',
  });

  const [disposisiData, setDisposisiData] = useState<DisposisiData>({
    noDisposisi: 0,
    tanggalDisposisi: new Date(),
    tujuanDisposisi: [],
    isiDisposisi: '',
    createdBy: '',
    departmentName: '',
  });

  // Parse ID parameter to extract agenda number and year
  useEffect(() => {
    if (id) {
      const idStr = Array.isArray(id) ? id[0] : id;
      const parts = idStr.split('-');

      if (parts.length >= 2) {
        setSearchAgenda(parts[0]);
        setSelectedYear(parts[1]);
      } else {
        setSearchAgenda(idStr);
        setSelectedYear(new Date().getFullYear().toString());
      }

      setEnableSearch(true);
    }
  }, [id]);

  // Load user data
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  // Fetch letter data
  const {
    data: apiLetterData,
    isLoading: isLetterLoading,
    error: letterError,
    refetch: refetchLetter
  } = useLetterByAgenda(selectedYear, searchAgenda, enableSearch && !!searchAgenda);

  // Fetch disposisi data
  const {
    data: apiDisposisiData,
    isLoading: isDisposisiLoading,
    error: disposisiError
  } = useDisposisiByLetterId(letterData.letterIn_id, !!letterData.letterIn_id);

  // Handle letter data when found
  useEffect(() => {
    if (apiLetterData && enableSearch) {
      console.log('📝 Setting letter data for PDF:', apiLetterData);

      setLetterData({
        letterIn_id: apiLetterData.id || '',
        noSurat: apiLetterData.noSurat || '',
        suratDari: apiLetterData.suratDari || '',
        perihal: apiLetterData.perihal || '',
        tanggalSurat: apiLetterData.tglSurat ? new Date(apiLetterData.tglSurat) : null,
        diterimaTanggal: apiLetterData.diterimaTgl ? new Date(apiLetterData.diterimaTgl) : null,
        kodeKlasifikasi: apiLetterData.Classification?.name || '',
        jenisSurat: apiLetterData.LetterType?.name || '',
      });

      setLoading(false);
    }
  }, [apiLetterData, enableSearch]);

  // Handle disposisi data
  useEffect(() => {
    if (apiDisposisiData && apiDisposisiData.length > 0) {
      console.log('📝 Setting disposisi data for PDF:', apiDisposisiData);

      // Ambil disposisi terbaru (index 0)
      const latestDisposisi = apiDisposisiData[0];

      setDisposisiData({
        noDisposisi: latestDisposisi.noDispo || 0,
        tanggalDisposisi: latestDisposisi.tglDispo ? new Date(latestDisposisi.tglDispo) : new Date(),
        tujuanDisposisi: Array.isArray(latestDisposisi.dispoKe)
          ? latestDisposisi.dispoKe
          : JSON.parse(latestDisposisi.dispoKe || '[]'),
        isiDisposisi: latestDisposisi.isiDispo || '',
        createdBy: user.userName,
        departmentName: user.departmentName,
      });
    } else if (letterData.letterIn_id && !isDisposisiLoading) {
      // Jika tidak ada data disposisi tapi letter ID ada
      console.log('⚠️ No disposisi data found for letter:', letterData.letterIn_id);
      setDisposisiData({
        noDisposisi: 0,
        tanggalDisposisi: new Date(),
        tujuanDisposisi: [],
        isiDisposisi: 'Tidak ada data disposisi',
        createdBy: user.userName,
        departmentName: user.departmentName,
      });
    }
  }, [apiDisposisiData, letterData.letterIn_id, isDisposisiLoading, user]);

  // Handle loading and error states
  useEffect(() => {
    if (letterError && enableSearch) {
      console.error('❌ Letter not found for PDF:', letterError);
      setError('Surat tidak ditemukan');
      setLoading(false);
    }

    if (disposisiError) {
      console.error('❌ Disposisi error:', disposisiError);
      // Tidak set error karena mungkin tidak ada disposisi
    }

    // Set loading false jika semua data sudah selesai loading
    if (!isLetterLoading && !isDisposisiLoading) {
      setLoading(false);
    }
  }, [letterError, disposisiError, isLetterLoading, isDisposisiLoading, enableSearch]);

  // ... (fungsi handleDownload, handleBack, formatDate, getDepartmentList tetap sama)

  const handleDownload = async () => {
    if (contentRef.current && !isDownloading) {
      setIsDownloading(true);
      try {
        const html2pdf = (await import('html2pdf.js')).default;

        const filename = `Lembar-Disposisi-${searchAgenda}-${selectedYear}.pdf`;

        await html2pdf()
          .set({
            margin: 1,
            filename: filename,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              letterRendering: true
            },
            jsPDF: { unit: "cm", format: "a4", orientation: "portrait" },
          })
          .from(contentRef.current)
          .save();
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Gagal membuat PDF. Silakan coba lagi.');
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleBack = () => {
    router.push('/suratin');
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDepartmentList = () => {
    const departments = [
      { key: 'SEKRETARIAT', label: '1. SEKRETARIS' },
      { key: 'BIDANG PERENCANAAN DAN PENGEMBANGAN', label: '2. KABID PERBANG' },
      { key: 'BIDANG PAJAK DAERAH', label: '3. KABID PAJAK' },
      { key: 'BIDANG RETRIBUSI DAN PENDAPATAN LAIN-LAIN', label: '4. KABID PLL' },
      { key: 'BIDANG PENGENDALIAN DAN PEMBINAAN', label: '5. KABID DALBIN' },
    ];

    return departments.map(dept => ({
      ...dept,
      isChecked: disposisiData.tujuanDisposisi.includes(dept.key)
    }));
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div>Memuat data surat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ color: "red", marginBottom: "20px" }}>
          Error: {error}
        </div>
        <button
          onClick={handleBack}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          style={{
            padding: "8px 16px",
            backgroundColor: isDownloading ? "#6c757d" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isDownloading ? "not-allowed" : "pointer",
          }}
        >
          {isDownloading ? "Generating PDF..." : "Download PDF"}
        </button>

        <button
          onClick={handleBack}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Kembali
        </button>
      </div>

      <div
        ref={contentRef}
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "40px",
          maxWidth: "800px",
          margin: "auto",
          border: "1px solid black",
          backgroundColor: "white",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "14px" }}>
            PEMERINTAH PROVINSI JAWA TIMUR
          </div>
          <div
            style={{
              fontWeight: "bold",
              textDecoration: "underline",
              fontSize: "16px",
            }}
          >
            DINAS PENDAPATAN
          </div>
          <div
            style={{ fontWeight: "bold", fontSize: "18px", marginTop: "10px" }}
          >
            LEMBAR DISPOSISI
          </div>
        </div>

        {/* Nomor Disposisi */}
        <div style={{ textAlign: "right", marginBottom: "10px", fontSize: "12px" }}>
          <strong>No. Disposisi: {disposisiData.noDisposisi || '-'}</strong>
        </div>

        {/* Tabel utama */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "10px",
            fontSize: "12px",
          }}
        >
          <tbody>
            <tr>
              <td style={{ width: "20%", padding: "4px 0", verticalAlign: "top" }}>Surat Dari</td>
              <td style={{ width: "1%", padding: "4px 0", verticalAlign: "top" }}>:</td>
              <td style={{ width: "30%", padding: "4px 0", verticalAlign: "top" }}>
                <strong>{letterData.suratDari || '-'}</strong>
              </td>
              <td style={{ width: "20%", padding: "4px 0", verticalAlign: "top" }}>Diterima tanggal</td>
              <td style={{ width: "1%", padding: "4px 0", verticalAlign: "top" }}>:</td>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>
                <strong>{formatDate(letterData.diterimaTanggal)}</strong>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>Tanggal Surat</td>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>:</td>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>
                <strong>{formatDate(letterData.tanggalSurat)}</strong>
              </td>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>Nomor Agenda</td>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>:</td>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>
                <strong>{searchAgenda}</strong>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>Nomor Surat</td>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>:</td>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>
                <strong>{letterData.noSurat || '-'}</strong>
              </td>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>Diteruskan kepada</td>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>:</td>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>
                <table style={{ margin: 0, width: "100%" }}>
                  <tbody>
                    {getDepartmentList().map((item, index) => (
                      <tr key={index}>
                        <td style={{ whiteSpace: "nowrap", fontSize: "11px", padding: "2px 0" }}>
                          {item.label}
                        </td>
                        <td style={{ paddingLeft: "10px", padding: "2px 0" }}>
                          <div
                            style={{
                              width: "15px",
                              height: "15px",
                              border: "1px solid black",
                              display: "inline-block",
                              backgroundColor: item.isChecked ? "#000" : "transparent",
                              position: "relative",
                            }}
                          >
                            {item.isChecked && (
                              <div
                                style={{
                                  color: "white",
                                  fontSize: "10px",
                                  fontWeight: "bold",
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                }}
                              >
                                ✓
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>Perihal</td>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>:</td>
              <td colSpan={4} style={{ padding: "4px 0", verticalAlign: "top" }}>
                <strong>{letterData.perihal || '-'}</strong>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>Klasifikasi</td>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>:</td>
              <td colSpan={4} style={{ padding: "4px 0", verticalAlign: "top" }}>
                <strong>{letterData.kodeKlasifikasi || '-'}</strong>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>Jenis Surat</td>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>:</td>
              <td colSpan={4} style={{ padding: "4px 0", verticalAlign: "top" }}>
                <strong>{letterData.jenisSurat || '-'}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Isi Disposisi */}
        <div
          style={{
            fontWeight: "bold",
            textAlign: "center",
            marginTop: "20px",
            borderTop: "1px solid black",
            paddingTop: "10px",
            fontSize: "14px",
            marginBottom: "10px",
          }}
        >
          ISI DISPOSISI
        </div>

        <div
          style={{
            border: "1px solid black",
            minHeight: "150px",
            padding: "10px",
            fontSize: "12px",
            whiteSpace: "pre-wrap",
            lineHeight: "1.5",
          }}
        >
          {disposisiData.isiDisposisi || ''}
        </div>

        {/* Footer dengan tanggal dan pembuat disposisi */}
        <div style={{ marginTop: "30px", display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: "12px" }}>
            <div>Tanggal Disposisi:</div>
            <div><strong>{formatDate(disposisiData.tanggalDisposisi)}</strong></div>
          </div>

          <div style={{ fontSize: "12px", textAlign: "right" }}>
            <div>{disposisiData.departmentName}</div>
            <div style={{ marginTop: "40px", borderTop: "1px solid black", paddingTop: "5px" }}>
              <strong>{disposisiData.createdBy}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
