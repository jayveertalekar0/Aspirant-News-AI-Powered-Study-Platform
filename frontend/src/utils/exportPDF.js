import { jsPDF } from 'jspdf';

export function exportArticlePDF(article) {
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(article.title, pageWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 10 + 10;

  // Meta
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`${article.source} • ${article.published || 'Unknown'}`, margin, y);
  y += 10;

  // Divider
  doc.setDrawColor(200);
  doc.line(margin, y, margin + pageWidth, y);
  y += 10;

  // Content
  if (article.content) {
    doc.setFontSize(12);
    doc.setTextColor(50);
    const contentLines = doc.splitTextToSize(article.content, pageWidth);
    // Handle page breaks
    for (let i = 0; i < contentLines.length; i++) {
      if (y + 7 > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(contentLines[i], margin, y);
      y += 7;
    }
  }

  // Summary (if exists and is not already part of content)
  if (article.summary && !article.content.includes(article.summary)) {
    // Add page if needed
    if (y + 20 > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Summary', margin, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const summaryLines = doc.splitTextToSize(article.summary, pageWidth);
    for (let i = 0; i < summaryLines.length; i++) {
      if (y + 7 > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(summaryLines[i], margin, y);
      y += 7;
    }
  }

  // Save
  const filename = `${article.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.pdf`;
  doc.save(filename);
}