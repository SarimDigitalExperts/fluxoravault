import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceItem { title: string; quantity: number; price: number; }
interface InvoiceData {
  orderId: string;
  date: string;
  customer: { name?: string; email?: string; phone?: string };
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  total: number;
  paymentMethod?: string;
  couponCode?: string;
}

export function generateInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF();
  const primary: [number, number, number] = [40, 93, 255];

  // Header bar
  doc.setFillColor(...primary);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Fluxora Mart", 14, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("INVOICE", 196, 18, { align: "right" });

  // Meta
  doc.setTextColor(33, 33, 32);
  doc.setFontSize(10);
  doc.text(`Invoice #: ${data.orderId.slice(0, 8).toUpperCase()}`, 14, 40);
  doc.text(`Date: ${data.date}`, 14, 46);
  doc.text(`Payment: ${data.paymentMethod || "—"}`, 14, 52);

  // Customer
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 130, 40);
  doc.setFont("helvetica", "normal");
  doc.text(data.customer.name || "—", 130, 46);
  if (data.customer.email) doc.text(data.customer.email, 130, 52);
  if (data.customer.phone) doc.text(data.customer.phone, 130, 58);

  // Items table
  autoTable(doc, {
    startY: 70,
    head: [["Product", "Qty", "Price (PKR)", "Total (PKR)"]],
    body: data.items.map((i) => [i.title, i.quantity, i.price.toLocaleString(), (i.price * i.quantity).toLocaleString()]),
    theme: "striped",
    headStyles: { fillColor: primary, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 4 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Subtotal: PKR ${data.subtotal.toLocaleString()}`, 196, finalY, { align: "right" });
  if (data.discount && data.discount > 0) {
    doc.text(`Discount${data.couponCode ? ` (${data.couponCode})` : ""}: -PKR ${data.discount.toLocaleString()}`, 196, finalY + 6, { align: "right" });
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...primary);
  doc.text(`TOTAL: PKR ${data.total.toLocaleString()}`, 196, finalY + (data.discount ? 16 : 10), { align: "right" });

  // Footer
  doc.setTextColor(120, 120, 120);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Thank you for your purchase! For support, contact support@fluxoramart.com", 105, 285, { align: "center" });
  doc.text("This is a computer-generated invoice.", 105, 290, { align: "center" });

  doc.save(`invoice-${data.orderId.slice(0, 8)}.pdf`);
}
