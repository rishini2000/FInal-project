window.addEventListener("load", () => {
    loadData();
    fillSelectFromEnum(document.getElementById("filterMethod"), "paymentMethod", "All Methods");
});

let allPayments = [];

function loadData() {
    allPayments = getServiceRequest("/reports/revenue/data");
    if (!Array.isArray(allPayments)) allPayments = Object.values(allPayments || {});
    applyFilters();
}

function applyFilters() {
    let filtered = [...allPayments];
    const fromDate = document.getElementById("filterDateFrom").value;
    const toDate = document.getElementById("filterDateTo").value;
    const method = document.getElementById("filterMethod").value;

    if (fromDate) filtered = filtered.filter(p => p.addeddatetime && p.addeddatetime.substring(0, 10) >= fromDate);
    if (toDate) filtered = filtered.filter(p => p.addeddatetime && p.addeddatetime.substring(0, 10) <= toDate);
    if (method) filtered = filtered.filter(p => p.paymentMethod === method);

    renderTable(filtered);
    updateSummary(filtered);
}

function clearFilters() {
    document.getElementById("filterDateFrom").value = "";
    document.getElementById("filterDateTo").value = "";
    document.getElementById("filterMethod").value = "";
    applyFilters();
}

function renderTable(data) {
    const propertyList = [
        { propertyName: "bill_no", dataType: "string" },
        { propertyName: getAppointmentNo, dataType: "function" },
        { propertyName: "appointment_amount", dataType: "currency" },
        { propertyName: "pay_amount", dataType: "currency" },
        { propertyName: "paybalance_amount", dataType: "currency" },
        { propertyName: getMethod, dataType: "function" },
    ];
    fillDataIntoTable(document.getElementById("tableBodyRevenue"), data, propertyList, null, null, printRevenueRow);
}

const printRevenueRow = (obj) => {
    const newTab = window.open();
    newTab.document.write(`<!DOCTYPE html><html><head><title>Payment ${escapeHtml(obj.bill_no || "")}</title>
        <link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="/Resources/fontawesome-7.0.0/css/all.min.css">
        <link rel="stylesheet" href="/Resources/css/common.css">
        </head><body><div class="print-card">
        <div class="print-header">
            <h3><i class="fa-solid fa-credit-card me-2"></i>Payment Details</h3>
            <p>${escapeHtml(obj.bill_no || "")}</p>
        </div>
        <div class="print-body"><table>
            <tr><th>Bill No</th><td>${escapeHtml(obj.bill_no || "N/A")}</td></tr>
            <tr><th>Appointment</th><td>${escapeHtml(obj.appointment_id ? obj.appointment_id.appointment_no : "N/A")}</td></tr>
            <tr><th>Amount</th><td>Rs. ${formatCurrency(obj.appointment_amount)}</td></tr>
            <tr><th>Paid</th><td>Rs. ${formatCurrency(obj.pay_amount)}</td></tr>
            <tr><th>Balance</th><td>Rs. ${formatCurrency(obj.paybalance_amount)}</td></tr>
            <tr><th>Method</th><td>${escapeHtml(obj.paymentMethod ? getEnumDisplayName("paymentMethod", obj.paymentMethod) : "N/A")}</td></tr>
        </table></div>
        <div class="print-footer">Printed on ${new Date().toLocaleDateString("en-LK")} | Salon DEEN</div>
        </div></body></html>`);
    setTimeout(() => { newTab.print(); newTab.close(); }, 500);
};

const getAppointmentNo = (obj) => obj.appointment_id ? obj.appointment_id.appointment_no : "N/A";
const getMethod = (obj) => obj.paymentMethod ? getEnumDisplayName("paymentMethod", obj.paymentMethod) : "N/A";

function updateSummary(data) {
    const total = data.reduce((sum, p) => sum + (parseFloat(p.pay_amount) || 0), 0);
    const outstanding = data.reduce((sum, p) => sum + (parseFloat(p.paybalance_amount) || 0), 0);
    document.getElementById("totalRevenue").textContent = "Rs. " + formatCurrency(total);
    document.getElementById("totalPayments").textContent = data.length;
    document.getElementById("totalOutstanding").textContent = "Rs. " + formatCurrency(outstanding);
    document.getElementById("avgPayment").textContent = data.length > 0 ? "Rs. " + formatCurrency(total / data.length) : "Rs. 0";
}

function printReport() { window.print(); }

function exportCSV() {
    let csv = "Bill No,Appointment,Amount,Paid,Balance,Method\n";
    allPayments.forEach(p => {
        csv += `${p.bill_no || ""},${p.appointment_id ? p.appointment_id.appointment_no : ""},${p.appointment_amount || 0},${p.pay_amount || 0},${p.paybalance_amount || 0},${p.paymentMethod || ""}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "revenue_report.csv";
    a.click();
}
