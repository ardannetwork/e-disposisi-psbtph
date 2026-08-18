import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { DisposisiSurat } from '../types/disposisi';
import { jsPDF } from 'jspdf';

// Generate raw docx XML content - Single unified table layout for A5
const createDocxXmlTemplate = () => {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <!-- HEADER LEMBAR DISPOSISI -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="10" w:space="0" w:color="000000"/>
          <w:left w:val="single" w:sz="10" w:space="0" w:color="000000"/>
          <w:bottom w:val="single" w:sz="10" w:space="0" w:color="000000"/>
          <w:right w:val="single" w:sz="10" w:space="0" w:color="000000"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:tc>
          <w:p>
            <w:pPr>
              <w:jc w:val="center"/>
              <w:spacing w:before="20" w:after="20"/>
            </w:pPr>
            <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>L E M B A R   D I S P O S I S I</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>

    <w:p><w:pPr><w:spacing w:before="0" w:after="40"/></w:pPr></w:p>

    <!-- METADATA SURAT -->
    <w:p><w:pPr><w:spacing w:before="0" w:after="20"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Surat Dari         : {surat_dari}</w:t></w:r></w:p>
    <w:p><w:pPr><w:spacing w:before="0" w:after="20"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>No. Surat         : {nomor_surat}</w:t></w:r></w:p>
    <w:p><w:pPr><w:spacing w:before="0" w:after="20"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Tgl. Surat         : {tanggal_surat}</w:t></w:r></w:p>
    <w:p><w:pPr><w:spacing w:before="0" w:after="20"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Diterima Tgl    : {diterima_tanggal}</w:t></w:r></w:p>
    <w:p><w:pPr><w:spacing w:before="0" w:after="20"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>No. Agenda     : {nomor_agenda}</w:t></w:r></w:p>
    <w:p><w:pPr><w:spacing w:before="0" w:after="20"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Sifat                 : {sifat}</w:t></w:r></w:p>
    <w:p><w:pPr><w:spacing w:before="0" w:after="40"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Hal                   : {hal}</w:t></w:r></w:p>

    <!-- TABEL DISPOSISI DAN CATATAN DALAM 1 TABEL UTUH -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:insideH w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:insideV w:val="single" w:sz="6" w:space="0" w:color="000000"/>
        </w:tblBorders>
      </w:tblPr>

      <!-- HEADER TABEL -->
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="pct"/></w:tcPr>
          <w:p><w:pPr><w:spacing w:before="10" w:after="10"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Diteruskan kepada Sdr :</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="pct"/></w:tcPr>
          <w:p><w:pPr><w:spacing w:before="10" w:after="10"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Dengan hormat harap :</w:t></w:r></w:p>
        </w:tc>
      </w:tr>

      <!-- CONTENT PETUGAS DAN INSTRUKSI -->
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="pct"/></w:tcPr>
          <w:p><w:pPr><w:spacing w:before="10" w:after="10"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>1. {pic_1} (PIC)</w:t></w:r></w:p>
          <w:p><w:pPr><w:spacing w:before="10" w:after="10"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>2. {petugas}</w:t></w:r></w:p>
          <w:p><w:pPr><w:spacing w:before="10" w:after="10"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>3. {pic_3}</w:t></w:r></w:p>
          <w:p><w:pPr><w:spacing w:before="10" w:after="10"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>4. {pic_4}</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="pct"/></w:tcPr>
          <w:p><w:pPr><w:spacing w:before="10" w:after="10"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>{chk_tanggapan} Tanggapan dan saran</w:t></w:r></w:p>
          <w:p><w:pPr><w:spacing w:before="10" w:after="10"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>{chk_periksa} Periksa dan Proses lebih lanjut</w:t></w:r></w:p>
          <w:p><w:pPr><w:spacing w:before="10" w:after="10"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>{chk_koordinasi} Koordinasi/Konfirmasikan</w:t></w:r></w:p>
          <w:p><w:pPr><w:spacing w:before="10" w:after="10"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>{chk_arsipkan} Arsipkan</w:t></w:r></w:p>
          <w:p><w:pPr><w:spacing w:before="10" w:after="10"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>{chk_lain} {catatan_lain_text}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>

      <!-- BARIS CATATAN (Gunakan gridSpan="2" agar gabung 2 kolom & langsung menempel) -->
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="5000" w:type="pct"/>
            <w:gridSpan w:val="2"/>
          </w:tcPr>
          <w:p><w:pPr><w:spacing w:before="10" w:after="10"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Catatan :</w:t></w:r></w:p>
          <w:p><w:pPr><w:spacing w:before="10" w:after="10"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>{catatan_text}</w:t></w:r></w:p>
          <w:p></w:p>
          <w:p></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>

    <w:p><w:pPr><w:spacing w:before="0" w:after="40"/></w:pPr></w:p>

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
        <w:tc><w:tcPr><w:tcW w:w="2500" w:type="pct"/></w:tcPr><w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p></w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="pct"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="0"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Koordinator</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="0"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Wilayah Kerja IV Malang</w:t></w:r></w:p>
          <w:p><w:pPr><w:spacing w:before="200" w:after="0"/></w:pPr></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="0"/></w:pPr><w:r><w:rPr><w:b/><w:u w:val="single"/><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>Avianita Agustianti, S. TP.</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="0"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>NIP. 19720809 199903 2 007</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>

    <!-- KONFIGURASI HALAMAN A5 -->
    <w:sectPr>
      <w:pgSz w:w="8390" w:h="11907"/>
      <w:pgMar w:top="432" w:right="576" w:bottom="432" w:left="576" w:header="288" w:footer="288"/>
      <w:cols w:num="1"/>
    </w:sectPr>
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

    const p1 = disposisi.pic || '…………………………………………….';
    const p2 = '…………………………………………….';
    const p3 = '…………………………………………….';
    const p4 = '…………………………………………….';

    const catatanList = disposisi.catatan || [];
    const hasCatatan = (keyword: string) =>
      catatanList.some((c) => c.toLowerCase().includes(keyword.toLowerCase()));

    const chkTanggapan = hasCatatan('tanggapan') ? '☑' : '☐';
    const chkPeriksa = hasCatatan('periksa') || hasCatatan('proses') ? '☑' : '☐';
    const chkKoordinasi = hasCatatan('koordinasi') || hasCatatan('konfirmasi') ? '☑' : '☐';
    const chkArsipkan = hasCatatan('arsip') ? '☑' : '☐';
    const chkLain = disposisi.catatan_lain || hasCatatan('lain') ? '☑' : '☐';
    const catatanLainText = disposisi.catatan_lain ? disposisi.catatan_lain : '……………………………...';

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

    const dots = (len = 30) => '…'.repeat(len);

    doc.render({
      surat_dari: disposisi.surat_dari || dots(30),
      nomor_surat: disposisi.nomor_surat || dots(30),
      tanggal_surat: disposisi.tanggal_surat || dots(30),
      diterima_tanggal: disposisi.diterima_tanggal || dots(30),
      nomor_agenda: disposisi.nomor_agenda || dots(30),
      sifat: disposisi.sifat || dots(30),
      hal: disposisi.hal || dots(30),
      pic_1: p1,
      pic_2: p2,
      pic_3: p3,
      pic_4: p4,
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
  const pdf = new jsPDF("p", "mm", "a5");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("LEMBAR DISPOSISI", 74, 12, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);

  let y = 20;

  pdf.text(`Surat Dari : ${disposisi.surat_dari}`, 12, y); y += 5;
  pdf.text(`No. Surat : ${disposisi.nomor_surat}`, 12, y); y += 5;
  pdf.text(`Tanggal Surat : ${disposisi.tanggal_surat}`, 12, y); y += 5;
  pdf.text(`Diterima : ${disposisi.diterima_tanggal}`, 12, y); y += 5;
  pdf.text(`No. Agenda : ${disposisi.nomor_agenda}`, 12, y); y += 5;
  pdf.text(`Sifat : ${disposisi.sifat}`, 12, y); y += 5;
  pdf.text(`Hal : ${disposisi.hal}`, 12, y); y += 7;

  pdf.setFont("helvetica", "bold");
  pdf.text("Petugas:", 12, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(disposisi.pic || "-", 32, y);
  y += 6;

  pdf.setFont("helvetica", "bold");
  pdf.text("Instruksi:", 12, y);
  y += 5;

  pdf.setFont("helvetica", "normal");

  if (disposisi.catatan?.length) {
    disposisi.catatan.forEach((c) => {
      pdf.text("- " + c, 16, y);
      y += 4.5;
    });
  }

  if (disposisi.catatan_lain) {
    pdf.text("- " + disposisi.catatan_lain, 16, y);
    y += 4.5;
  }

  y += 8;

  pdf.text("Koordinator", 95, y);
  y += 14;

  pdf.text(disposisi.disposisi_oleh || "Avianita Agustina, S.TP.", 95, y);
  y += 4.5;

  pdf.text(disposisi.nip_oleh || "NIP. 19720809 199903 2 007", 95, y);

  pdf.save(`Disposisi_${disposisi.nomor_agenda}.pdf`);
};