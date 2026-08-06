import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { DisposisiSurat } from '../types/disposisi';
import { jsPDF } from 'jspdf';

// Generate raw docx XML content - Single full page layout matching PDF reference exactly
const createDocxXmlTemplate = () => {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <!-- KOTAK JUDUL LEMBAR DISPOSISI -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="12" w:space="0" w:color="000000"/>
          <w:left w:val="single" w:sz="12" w:space="0" w:color="000000"/>
          <w:bottom w:val="single" w:sz="12" w:space="0" w:color="000000"/>
          <w:right w:val="single" w:sz="12" w:space="0" w:color="000000"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:tc>
          <w:p>
            <w:pPr><w:jc w:val="center"/></w:pPr>
            <w:r><w:rPr><w:b/><w:sz w:val="28"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>L E M B A R   D I S P O S I S I</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>

    <w:p><w:pPr><w:spacing w:after="160"/></w:pPr></w:p>

    <!-- METADATA SURAT -->
    <w:p><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Surat Dari         : {surat_dari}</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>No. Surat         : {nomor_surat}</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Tgl. Surat         : {tanggal_surat}</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Diterima Tgl    : {diterima_tanggal}</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>No. Agenda     : {nomor_agenda}</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Sifat                 : {sifat}</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Hal                   : {hal}</w:t></w:r></w:p>

    <w:p><w:pPr><w:spacing w:after="160"/></w:pPr></w:p>

    <!-- TABEL 2 KOLOM DISPOSISI -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="8" w:space="0" w:color="000000"/>
          <w:left w:val="single" w:sz="8" w:space="0" w:color="000000"/>
          <w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/>
          <w:right w:val="single" w:sz="8" w:space="0" w:color="000000"/>
          <w:insideH w:val="single" w:sz="8" w:space="0" w:color="000000"/>
          <w:insideV w:val="single" w:sz="8" w:space="0" w:color="000000"/>
        </w:tblBorders>
      </w:tblPr>
      
      <!-- HEADER TABEL -->
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="pct"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Diteruskan kepada Sdr :</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="pct"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Dengan hormat harap :</w:t></w:r></w:p>
        </w:tc>
      </w:tr>

      <!-- CONTENT TABEL -->
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="pct"/></w:tcPr>
          <w:p><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>1. {petugas_1}</w:t></w:r></w:p>
          <w:p><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>2. {petugas_2}</w:t></w:r></w:p>
          <w:p><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>3. {petugas_3}</w:t></w:r></w:p>
          <w:p><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>4. {petugas_4}</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="pct"/></w:tcPr>
          <w:p><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>{chk_tanggapan} Tanggapan dan saran</w:t></w:r></w:p>
          <w:p><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>{chk_periksa} Periksa dan Proses lebih lanjut</w:t></w:r></w:p>
          <w:p><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>{chk_koordinasi} Koordinasi/Konfirmasikan</w:t></w:r></w:p>
          <w:p><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>{chk_arsipkan} Arsipkan</w:t></w:r></w:p>
          <w:p><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>{chk_lain} {catatan_lain_text}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>

    <!-- KOTAK CATATAN -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="8" w:space="0" w:color="000000"/>
          <w:left w:val="single" w:sz="8" w:space="0" w:color="000000"/>
          <w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/>
          <w:right w:val="single" w:sz="8" w:space="0" w:color="000000"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="5000" w:type="pct"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Catatan :</w:t></w:r></w:p>
          <w:p><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>{catatan_text}</w:t></w:r></w:p>
          <w:p/>
          <w:p/>
          <w:p/>
        </w:tc>
      </w:tr>
    </w:tbl>

    <w:p><w:pPr><w:spacing w:after="280"/></w:pPr></w:p>

    <!-- TANDA TANGAN KOORDINATOR -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/>
          <w:insideH w:val="none"/><w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:tc><w:tcPr><w:tcW w:w="2500" w:type="pct"/></w:tcPr><w:p/></w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="pct"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Koordinator</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Wilayah Kerja IV Malang</w:t></w:r></w:p>
          <w:p/>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:u w:val="single"/><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>{disposisi_oleh}</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>{nip_oleh}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>`;
};

// Build a fully functional .docx zip archive in memory
const buildDocxZip = () => {
  const zip = new PizZip();
  
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

  zip.file('word/document.xml', createDocxXmlTemplate());

  return zip;
};

export const exportDisposisiToDocx = (disposisi: DisposisiSurat) => {
  try {
    const zip = buildDocxZip();
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Formatting Petugas: Nama dimasukkan seluruhnya pada nomor 1 (tidak berpindah ke nomor 2)
    const p1 = disposisi.petugas || '…………………………………………….';
    const p2 = '…………………………………………….';
    const p3 = '…………………………………………….';
    const p4 = '…………………………………………….';

    // Checkbox Instruksi / Catatan
    const catatanList = disposisi.catatan || [];
    const hasCatatan = (keyword: string) =>
      catatanList.some((c) => c.toLowerCase().includes(keyword.toLowerCase()));

    const chkTanggapan = hasCatatan('tanggapan') ? '☑' : '☐';
    const chkPeriksa = hasCatatan('periksa') || hasCatatan('proses') ? '☑' : '☐';
    const chkKoordinasi = hasCatatan('koordinasi') || hasCatatan('konfirmasi') ? '☑' : '☐';
    const chkArsipkan = hasCatatan('arsip') ? '☑' : '☐';
    const chkLain = disposisi.catatan_lain || hasCatatan('lain') ? '☑' : '☐';
    const catatanLainText = disposisi.catatan_lain ? disposisi.catatan_lain : '……………………………...';

    // Format catatan: Setiap 1 kalimat / item dilanjutkan ke baris bawahnya (\n)
    let catatanFormatted = '';
    if (disposisi.catatan_text) {
      catatanFormatted = disposisi.catatan_text
        .split(/(?<=\.)\s+/)
        .join('\n');
    } else if (catatanList.length > 0) {
      catatanFormatted = catatanList
        .map((c) => (c === 'Lain-lain' && disposisi.catatan_lain ? `Lain-lain: ${disposisi.catatan_lain}` : c))
        .join('\n');
    }

    // Pastikan Nama Koordinator di bawah tanda tangan SELALU tercetak: Avianita Agustina, S.TP.
    let namaKoordinator = 'Avianita Agustina, S.TP.';
    if (disposisi.disposisi_oleh && disposisi.disposisi_oleh.trim()) {
      let cleaned = disposisi.disposisi_oleh
        .replace(/Agustianti/gi, 'Agustina')
        .replace(/\s*\([^)]*\)/g, '')
        .trim();
      if (cleaned && cleaned !== 'Admin UPT' && cleaned !== 'Koordinator Admin UPT') {
        namaKoordinator = cleaned;
      }
    }

    const dots = (len = 45) => '…'.repeat(len);

    doc.render({
      surat_dari: disposisi.surat_dari || dots(45),
      nomor_surat: disposisi.nomor_surat || dots(45),
      tanggal_surat: disposisi.tanggal_surat || dots(45),
      diterima_tanggal: disposisi.diterima_tanggal || dots(45),
      nomor_agenda: disposisi.nomor_agenda || dots(45),
      sifat: disposisi.sifat || dots(45),
      hal: disposisi.hal || dots(45),
      petugas_1: p1,
      petugas_2: p2,
      petugas_3: p3,
      petugas_4: p4,
      chk_tanggapan: chkTanggapan,
      chk_periksa: chkPeriksa,
      chk_koordinasi: chkKoordinasi,
      chk_arsipkan: chkArsipkan,
      chk_lain: chkLain,
      catatan_lain_text: catatanLainText,
      catatan_text: catatanFormatted,
      disposisi_oleh: namaKoordinator,
      nip_oleh: disposisi.nip_oleh || 'NIP. 19720809 199903 2 007',
    });

    const out = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const agendaClean = (disposisi.nomor_agenda || 'Lembar').replace(/[/\\?%*:|"<>]/g, '_');
    const sanitizedFilename = `Disposisi_${agendaClean}.docx`;
    saveAs(out, sanitizedFilename);
  } catch (error) {
    console.error('Failed to export docx disposisi', error);
    alert('Gagal mendownload lembar disposisi .docx: ' + (error as Error).message);
  }
};

export const exportDisposisiToPdf = (disposisi: DisposisiSurat) => {
  const pdf = new jsPDF("p", "mm", "a4");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("LEMBAR DISPOSISI", 105, 20, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  let y = 35;

  pdf.text(`Surat Dari : ${disposisi.surat_dari}`, 20, y); y += 8;
  pdf.text(`No. Surat : ${disposisi.nomor_surat}`, 20, y); y += 8;
  pdf.text(`Tanggal Surat : ${disposisi.tanggal_surat}`, 20, y); y += 8;
  pdf.text(`Diterima : ${disposisi.diterima_tanggal}`, 20, y); y += 8;
  pdf.text(`No. Agenda : ${disposisi.nomor_agenda}`, 20, y); y += 8;
  pdf.text(`Sifat : ${disposisi.sifat}`, 20, y); y += 8;
  pdf.text(`Hal : ${disposisi.hal}`, 20, y); y += 12;

  pdf.setFont("helvetica", "bold");
  pdf.text("Petugas:", 20, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(disposisi.petugas || "-", 45, y);
  y += 10;

  pdf.setFont("helvetica", "bold");
  pdf.text("Instruksi:", 20, y);
  y += 7;

  pdf.setFont("helvetica", "normal");

  if (disposisi.catatan?.length) {
    disposisi.catatan.forEach((c) => {
      pdf.text("- " + c, 25, y);
      y += 6;
    });
  }

  if (disposisi.catatan_lain) {
    pdf.text("- " + disposisi.catatan_lain, 25, y);
    y += 6;
  }

  y += 15;

  pdf.text("Koordinator", 145, y);
  y += 25;

  pdf.text(disposisi.disposisi_oleh || "Avianita Agustina, S.TP.", 145, y);
  y += 6;

  pdf.text(disposisi.nip_oleh || "NIP. 19720809 199903 2 007", 145, y);

  pdf.save(`Disposisi_${disposisi.nomor_agenda}.pdf`);
};