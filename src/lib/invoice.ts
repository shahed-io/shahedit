// Invoice / Receipt generator — opens a print-ready HTML invoice in a new window.

export interface InvoiceData {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  service?: string | null;
  amount: number;
  payment_method: string;
  transaction_id: string;
  status: string;
  created_at: string;
}

import { BRAND } from "./brand";

const COMPANY = {
  name: BRAND.fullName,
  tagline: BRAND.tagline,
  address: BRAND.address,
  phone: BRAND.phone,
  email: BRAND.email,
  website: BRAND.website,
  logoUrl: BRAND.logoUrl,
};


const fmtBDT = (n: number) =>
  "৳ " + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 });

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" });

const invoiceNo = (p: InvoiceData) =>
  "INV-" + new Date(p.created_at).toISOString().slice(2, 10).replace(/-/g, "") + "-" + p.id.slice(0, 6).toUpperCase();

const statusBadge = (s: string) => {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    verified:  { label: "PAID",     bg: "#dcfce7", color: "#15803d" },
    confirmed: { label: "PAID",     bg: "#dcfce7", color: "#15803d" },
    pending:   { label: "PENDING",  bg: "#fef3c7", color: "#a16207" },
    rejected:  { label: "REJECTED", bg: "#fee2e2", color: "#b91c1c" },
  };
  return map[s] || map.pending;
};

export function openInvoice(p: InvoiceData) {
  const sb = statusBadge(p.status);
  const inv = invoiceNo(p);
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${inv} — ${COMPANY.name}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',-apple-system,Segoe UI,Roboto,sans-serif;background:#f5f3ff;padding:32px;color:#1a1233;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .sheet{max-width:820px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(80,50,140,0.12)}
  .head{padding:28px 36px;background:linear-gradient(135deg,#1a0b2e 0%,#2d1454 50%,#3d1a6b 100%);color:#fff;display:flex;justify-content:space-between;align-items:center;gap:16px;border-bottom:1px solid rgba(168,85,247,0.25)}
  .brand-logo{width:54px;height:54px;border-radius:50%;background:radial-gradient(circle at 30% 25%,#a78bfa,#7c3aed 55%,#4c1d95);display:flex;align-items:center;justify-content:center;padding:8px;box-shadow:0 6px 20px rgba(124,58,237,0.55),inset 0 1px 0 rgba(255,255,255,0.25)}
  .brand-logo img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))}
  .brand-name{font-size:26px;font-weight:800;letter-spacing:0.5px;background:linear-gradient(135deg,#ffffff 0%,#e9d5ff 35%,#c4b5fd 60%,#f0abfc 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;line-height:1}
  .brand-tag{display:flex;align-items:center;gap:8px;margin-top:6px;font-size:10px;letter-spacing:3px;font-weight:600;color:#c4b5fd;text-transform:uppercase}
  .brand-tag::before,.brand-tag::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(196,181,253,0.4),transparent);min-width:14px}
  .head .right{text-align:right}
  .head .right .label{font-size:11px;opacity:.75;text-transform:uppercase;letter-spacing:1.5px;color:#c4b5fd}
  .head .right .num{font-size:22px;font-weight:800;margin-top:4px;color:#fff}
  .badge{display:inline-block;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.5px;margin-top:8px;background:${sb.bg};color:${sb.color}}

  .meta{display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:28px 36px;border-bottom:1px solid #ece6f8}
  .meta h3{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#9b8fb5;margin-bottom:8px;font-weight:700}
  .meta p{font-size:14px;line-height:1.55;color:#2a1f4a}
  .meta strong{font-weight:700}
  table{width:100%;border-collapse:collapse;margin:0}
  th{text-align:left;padding:14px 36px;font-size:11px;color:#9b8fb5;text-transform:uppercase;letter-spacing:1.2px;background:#faf7ff;border-bottom:1px solid #ece6f8}
  td{padding:18px 36px;font-size:14px;color:#2a1f4a;border-bottom:1px solid #f3eefa;vertical-align:top}
  td.amt,th.amt{text-align:right;font-weight:700}
  .totals{padding:18px 36px;display:flex;justify-content:flex-end}
  .totals table{max-width:320px}
  .totals td{padding:8px 0;border:none;font-size:14px}
  .totals .grand td{padding-top:14px;border-top:2px solid #1a1233;font-size:18px;font-weight:800;color:#1a1233}
  .totals .grand td:last-child{color:#7c3aed}
  .pay{margin:0 36px 24px;padding:16px;border-radius:12px;background:#faf7ff;border:1px solid #ece6f8;display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .pay .it .l{font-size:10px;text-transform:uppercase;color:#9b8fb5;letter-spacing:1.2px;font-weight:700}
  .pay .it .v{font-size:13px;color:#2a1f4a;font-weight:600;margin-top:3px;word-break:break-all}
  .foot{padding:22px 36px;background:#1a1233;color:#fff;display:flex;justify-content:space-between;align-items:center;font-size:12px}
  .foot a{color:#c9b6ff;text-decoration:none}
  .actions{max-width:820px;margin:18px auto 0;display:flex;gap:10px;justify-content:center}
  .actions button{padding:10px 22px;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit}
  .actions .print{background:linear-gradient(135deg,#6366f1,#a855f7,#ec4899);color:#fff}
  .actions .close{background:#fff;color:#7c3aed;border:1px solid #ece6f8}
  @media print{body{background:#fff;padding:0}.sheet{box-shadow:none;border-radius:0}.actions{display:none}}
</style>
</head>
<body>
  <div class="sheet">
    <div class="head">
      <div class="brand" style="display:flex;align-items:center;gap:14px">
        <div class="brand-logo"><img src="${COMPANY.logoUrl}" alt="${COMPANY.name}" /></div>
        <div>
          <div class="brand-name">${COMPANY.name}</div>
          <div class="brand-tag">SHAHEDIT.COM</div>
        </div>
      </div>
      <div class="right">


        <div class="label">Invoice / Receipt</div>
        <div class="num">${inv}</div>
        <div class="badge">${sb.label}</div>
      </div>
    </div>

    <div class="meta">
      <div>
        <h3>Billed To</h3>
        <p><strong>${escapeHtml(p.name)}</strong></p>
        ${p.email ? `<p>${escapeHtml(p.email)}</p>` : ""}
        ${p.phone ? `<p>${escapeHtml(p.phone)}</p>` : ""}
      </div>
      <div style="text-align:right">
        <h3>Invoice Details</h3>
        <p><strong>Date:</strong> ${fmtDate(p.created_at)}</p>
        <p><strong>Status:</strong> ${sb.label}</p>
        <p><strong>Method:</strong> ${escapeHtml(p.payment_method)}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr><th>Description</th><th class="amt">Amount</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>${escapeHtml(p.service || "Service Payment")}</td>
          <td class="amt">${fmtBDT(p.amount)}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <table>
        <tr><td>Subtotal</td><td class="amt">${fmtBDT(p.amount)}</td></tr>
        <tr><td>Tax / VAT</td><td class="amt">৳ 0</td></tr>
        <tr class="grand"><td>Total Paid</td><td class="amt">${fmtBDT(p.amount)}</td></tr>
      </table>
    </div>

    <div class="pay">
      <div class="it"><div class="l">Payment Method</div><div class="v">${escapeHtml(p.payment_method)}</div></div>
      <div class="it"><div class="l">Transaction ID</div><div class="v">${escapeHtml(p.transaction_id)}</div></div>
      <div class="it"><div class="l">Invoice No</div><div class="v">${inv}</div></div>
    </div>

    <div class="foot">
      <div>Thank you for your business! • ${COMPANY.phone} • ${COMPANY.email}</div>
      <a href="https://${COMPANY.website}">${COMPANY.website}</a>
    </div>
  </div>

  <div class="actions">
    <button class="print" onclick="window.print()">🖨️ Print / Save as PDF</button>
    <button class="close" onclick="window.close()">Close</button>
  </div>
</body>
</html>`;

  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) {
    alert("Popup blocked. Please allow popups to view the invoice.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
