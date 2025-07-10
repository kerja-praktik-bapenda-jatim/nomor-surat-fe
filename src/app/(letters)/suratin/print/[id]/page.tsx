"use client";
import { useParams } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLetterByAgenda } from '@/services/disposisi';
import { useDisposisiByLetterId } from '@/services/disposisi';
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
  const [isBlank, setIsBlank] = useState(false);
  const [paperSize, setPaperSize] = useState<'a4' | 'f4'>('a4');

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

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const {
    data: apiLetterData,
    isLoading: isLetterLoading,
    error: letterError,
    refetch: refetchLetter
  } = useLetterByAgenda(selectedYear, searchAgenda, enableSearch && !!searchAgenda);

  const {
    data: apiDisposisiData,
    isLoading: isDisposisiLoading,
    error: disposisiError
  } = useDisposisiByLetterId(letterData.letterIn_id, !!letterData.letterIn_id);

  useEffect(() => {
    if (apiLetterData && enableSearch) {
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

  useEffect(() => {
    if (apiDisposisiData && apiDisposisiData.length > 0) {
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

  useEffect(() => {
    if (letterError && enableSearch) {
      setError('Surat tidak ditemukan');
      setLoading(false);
    }
    if (!isLetterLoading && !isDisposisiLoading) {
      setLoading(false);
    }
  }, [letterError, isLetterLoading, isDisposisiLoading, enableSearch]);

  const handleDownload = async () => {
    if (contentRef.current && !isDownloading) {
      setIsDownloading(true);
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        const filename = `Lembar-Disposisi-${searchAgenda}-${selectedYear}.pdf`;

        const pdfOptions = {
          margin: 1,
          filename: filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: false,
            letterRendering: false,
            logging: true,
            allowTaint: true,
            text: true
          },
          jsPDF: {
            unit: "cm",
            format: paperSize === 'a4' ? "a4" : [21, 33],
            orientation: "portrait"
          },
        };

        await html2pdf()
          .set(pdfOptions)
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
    if (!date) return '';
    return new Date(date)
      .toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-');
  };

  const getDepartmentId = (departmentName: string) => {
    const mapping: { [key: string]: number } = {
      'SEKRETARIAT': 3701,
      'BIDANG PERENCANAAN DAN PENGEMBANGAN': 3702,
      'BIDANG PAJAK DAERAH': 3703,
      'BIDANG RETRIBUSI DAN PENDAPATAN LAIN-LAIN': 3704,
      'BIDANG PENGENDALIAN DAN PEMBINAAN': 3706,
    };
    return mapping[departmentName] || 0;
  };

  const getDispKe = () => {
    return disposisiData.tujuanDisposisi.length > 0 ? getDepartmentId(disposisiData.tujuanDisposisi[0]) : 0;
  };

  const renderStaticText = (text: string) => {
    return !isBlank ? text : "\u00A0";
  };

  const renderData = (data: string) => {
    return data || "\u00A0";
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
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
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

        <button
          onClick={() => setIsBlank(!isBlank)}
          style={{
            padding: "8px 16px",
            backgroundColor: isBlank ? "#28a745" : "#ffc107",
            color: isBlank ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {isBlank ? "Normal Mode" : "Blank Mode"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label htmlFor="paperSize" style={{ fontSize: "14px", fontWeight: "500" }}>
            Ukuran Kertas:
          </label>
          <select
            id="paperSize"
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value as 'a4' | 'f4')}
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            aria-label="Pilih ukuran kertas"
          >
            <option value="a4">A4</option>
            <option value="f4">F4</option>
          </select>
        </div>
      </div>

      <div ref={contentRef} style={{
        width: '750px',
        margin: '0px',
        color: '#000',
        fontFamily: '"Times New Roman", Times, serif',
        lineHeight: '1.2'
      }}>
        {/* Header */}
        <div style={{
          marginTop: '0px',
          textAlign: 'center',
          marginBottom: '5px',
          fontFamily: '"Times New Roman", Times, serif'
        }}>
          <div style={{
            fontSize: '18px',
            fontFamily: '"Times New Roman", Times, serif'
          }}>
            {renderStaticText("PEMERINTAH PROVINSI JAWA TIMUR")}
          </div>
          <div style={{
            fontSize: '22px',
            fontWeight: 'bold',
            textDecoration: 'underline',
            margin: '2px',
            fontFamily: '"Times New Roman", Times, serif'
          }}>
            {renderStaticText("DINAS PENDAPATAN")}
          </div>
          <div style={{
            fontSize: '27px',
            fontWeight: 'bold',
            fontFamily: '"Times New Roman", Times, serif',
            padding: '5px 0'
          }}>
            {renderStaticText("LEMBAR DISPOSISI")}
          </div>
        </div>

        {/* Body */}
        <div style={{
          fontSize: '13px',
          fontFamily: '"Times New Roman", Times, serif',
          width: '100%',
          margin: '5px 0'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <tbody>
              <tr style={{ height: '20px' }}>
                <td style={{
                  padding: '4px 6px',
                  width: '18%',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`
                }}>
                  {renderStaticText("Surat Dari")}
                </td>
                <td style={{
                  padding: '4px 2px',
                  width: '2%',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`
                }}>
                  {renderStaticText(":")}
                </td>
                <td style={{
                  padding: '4px 6px',
                  width: '30%',
                  borderRight: `1.5px solid ${isBlank ? '#fff' : '#000'}` ,
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                  fontSize: '12px'
                }}>
                  {renderData(letterData.suratDari)}
                </td>
                <td style={{
                  padding: '4px 6px',
                  width: '21%',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`
                }}>
                  {renderStaticText("Diterima tanggal")}
                </td>
                <td style={{
                  padding: '4px 2px',
                  width: '2%',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`
                }}>
                  {renderStaticText(":")}
                </td>
                <td style={{
                  padding: '4px 6px',
                  width: '27%',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                  fontSize: '12px'
                }}>
                  {renderData(formatDate(letterData.diterimaTanggal))}
                </td>
              </tr>

              <tr style={{ height: '20px' }}>
                <td style={{
                  padding: '4px 6px',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`
                }}>
                  {renderStaticText("Tanggal Surat")}
                </td>
                <td style={{
                  padding: '4px 2px',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`
                }}>
                  {renderStaticText(":")}
                </td>
                <td style={{
                  padding: '4px 6px',
                  borderRight: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                  fontSize: '12px'
                }}>
                  {renderData(formatDate(letterData.tanggalSurat))}
                </td>
                <td style={{
                  padding: '4px 6px',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`
                }}>
                  {renderStaticText("Nomor Agenda")}
                </td>
                <td style={{
                  padding: '4px 2px',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`
                }}>
                  {renderStaticText(":")}
                </td>
                <td style={{
                  padding: '4px 6px',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                  fontSize: '12px'
                }}>
                  {renderData(letterData.noSurat && searchAgenda ? `${letterData.noSurat.split('/')[0]}/${searchAgenda}` : "")}
                </td>
              </tr>

              <tr style={{ height: '20px' }}>
                <td style={{
                  padding: '4px 6px',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`
                }}>
                  {renderStaticText("Nomor Surat")}
                </td>
                <td style={{
                  padding: '4px 2px',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`
                }}>
                  {renderStaticText(":")}
                </td>
                <td style={{
                  padding: '4px 6px',
                  borderRight: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                  fontSize: '12px'
                }}>
                  {renderData(letterData.noSurat)}
                </td>
                <td style={{
                  padding: '4px 6px',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`
                }}>
                  {renderStaticText("Diteruskan kepada")}
                </td>
                <td style={{
                  padding: '4px 2px',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`
                }}>
                  {renderStaticText(":")}
                </td>
                <td style={{
                  padding: '4px 6px',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                  fontSize: '12px'
                }}>
                  {"\u00A0"}
                </td>
              </tr>

              <tr style={{ height: '20px' }}>
                <td style={{
                  padding: '4px 6px',
                  verticalAlign: 'top',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`
                }}>
                  {renderStaticText("Perihal")}
                </td>
                <td style={{
                  padding: '4px 2px',
                  verticalAlign: 'top',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`
                }}>
                  {renderStaticText(":")}
                </td>
                <td style={{
                  padding: '4px 6px',
                  verticalAlign: 'top',
                  borderTop: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                  borderRight: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                  fontSize: '12px'
                }}>
                  {renderData(letterData.perihal)}
                </td>
                <td style={{
                  padding: '2px 6px 2px 8px',
                  borderBottom: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                  fontSize: '12px'
                }} rowSpan={2} colSpan={3}>
                  <table style={{ width: '100%', borderSpacing: '0' }}>
                    <tbody>
                      <tr style={{ verticalAlign: 'top', textAlign: 'justify' }}>
                        <td style={{ width: '4%', padding: '0' }}>{renderStaticText("1.")}</td>
                        <td style={{ width: '71%', padding: '0' }}>{renderStaticText("Sekretaris (Sekt)")}</td>
                        <td style={{ width: '25%', textAlign: 'center', verticalAlign: 'middle', padding: '0' }}>
                          <div style={{
                            border: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                            width: '35px',
                            height: '20px',
                            display: 'inline-block',
                            lineHeight: '20px'
                          }}>
                           {!isBlank && getDispKe() === 3701 ? "V" : ""}
                          </div>
                        </td>
                      </tr>
                      <tr style={{ verticalAlign: 'top', textAlign: 'justify' }}>
                        <td style={{ padding: '0' }}>{renderStaticText("2.")}</td>
                        <td style={{ padding: '0' }}>{renderStaticText("Ka. Bidang Perencanaan dan Pengembangan (PERBANG)")}</td>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0' }}>
                          <div style={{
                            border: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                            width: '35px',
                            height: '20px',
                            display: 'inline-block',
                            lineHeight: '20px'
                          }}>
                           {!isBlank && getDispKe() === 3702 ? "V" : ""}
                          </div>
                        </td>
                      </tr>
                      <tr style={{ verticalAlign: 'top', textAlign: 'justify' }}>
                        <td style={{ padding: '0' }}>{renderStaticText("3.")}</td>
                        <td style={{ padding: '0' }}>{renderStaticText("Ka. Bidang Pajak Daerah (PD)")}</td>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0' }}>
                          <div style={{
                            border: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                            width: '35px',
                            height: '20px',
                            display: 'inline-block',
                            lineHeight: '20px'
                          }}>
                           {!isBlank && getDispKe() === 3703 ? "V" : ""}
                          </div>
                        </td>
                      </tr>
                      <tr style={{ verticalAlign: 'top', textAlign: 'justify' }}>
                        <td style={{ padding: '0' }}>{renderStaticText("4.")}</td>
                        <td style={{ padding: '0' }}>{renderStaticText("Ka. Bidang Retribusi dan Penerimaan Lain-Lain (PLL)")}</td>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0' }}>
                          <div style={{
                            border: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                            width: '35px',
                            height: '20px',
                            display: 'inline-block',
                            lineHeight: '20px'
                          }}>
                           {!isBlank && getDispKe() === 3704 ? "V" : ""}
                          </div>
                        </td>
                      </tr>
                      <tr style={{ verticalAlign: 'top', textAlign: 'justify' }}>
                        <td style={{ padding: '0' }}>{renderStaticText("5.")}</td>
                        <td style={{ padding: '0' }}>{renderStaticText("Ka. Bidang Pengendalian dan Pembinaan (DALBIN)")}</td>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0' }}>
                          <div style={{
                            border: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                            width: '35px',
                            height: '20px',
                            display: 'inline-block',
                            lineHeight: '20px'
                          }}>
                           {!isBlank && getDispKe() === 3706 ? "V" : ""}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              <tr style={{ height: '20px' }}>
                <td style={{
                  padding: '4px 6px',
                  borderBottom: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                  borderRight: `1.5px solid ${isBlank ? '#fff' : '#000'}`,
                  verticalAlign: 'top'
                }} colSpan={3}>
                  {"\u00A0"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '10px',
          fontFamily: '"Times New Roman", Times, serif'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '5px'
          }}>
            {renderStaticText("ISI DISPOSISI")}
          </div>
          <div style={{
            marginLeft: '20px',
            textAlign: 'left',
            fontSize: '12px',
            minHeight: '60px'
          }}>
            {(disposisiData.isiDisposisi && disposisiData.isiDisposisi !== 'Tidak ada data disposisi') ? (
              <div>
                <h4 style={{ margin: '5px 0' }}>
                  {!isBlank && `DARI ${disposisiData.departmentName} KE ${disposisiData.tujuanDisposisi.join(", ")}`}
                </h4>
                <i style={{ display: 'block', marginBottom: '5px' }}>
                  {!isBlank && `tgl disposisi : ${formatDate(disposisiData.tanggalDisposisi)}`}
                </i>
                <p style={{ margin: 0 }}>{disposisiData.isiDisposisi}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
