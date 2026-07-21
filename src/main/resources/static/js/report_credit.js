window.addEventListener("load", () => {
    loadData();
});

let allCreditData = [];

function loadData() {
    allCreditData = getServiceRequest("/reports/credit/data");
    if (!Array.isArray(allCreditData)) allCreditData = Object.values(allCreditData || {});
    renderTable(allCreditData);
    updateSummary(allCreditData);
}

function renderTable(data) {
    const propertyList = [
        { propertyName: "customerName", dataType: "string" },
        { propertyName: "customerMobile", dataType: "string" },
        { propertyName: "totalCredit", dataType: "currency" },
        { propertyName: getLastPaymentDate, dataType: "function" },
        { propertyName: "appointmentCount", dataType: "string" },
    ];
    fillDataIntoTable(document.getElementById("tableBodyCredit"), data, propertyList, null, null, printCreditRow);
}

const getLastPaymentDate = (obj) => obj.lastPaymentDate ? obj.lastPaymentDate.substring(0, 10) : "N/A";

const printCreditRow = (obj) => {
    const newTab = window.open();
    newTab.document.write(`<!DOCTYPE html><html><head><title>Credit Report - ${escapeHtml(obj.customerName || "")}</title>
        <link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="/Resources/fontawesome-7.0.0/css/all.min.css">
        <link rel="stylesheet" href="/Resources/css/common.css">
        </head><body><div class="print-card">
        <div class="print-header">
            <h3><i class="fa-solid fa-credit-card me-2"></i>Customer Credit Details</h3>
            <p>${escapeHtml(obj.customerName || "")}</p>
        </div>
        <div class="print-body"><table>
            <tr><th>Customer</th><td>${escapeHtml(obj.customerName || "N/A")}</td></tr>
            <tr><th>Mobile</th><td>${escapeHtml(obj.customerMobile || "N/A")}</td></tr>
            <tr><th>Total Credit</th><td>Rs. ${formatCurrency(obj.totalCredit)}</td></tr>
            <tr><th>Last Payment Date</th><td>${escapeHtml(obj.lastPaymentDate ? obj.lastPaymentDate.substring(0, 10) : "N/A")}</td></tr>
            <tr><th>Appointment Count</th><td>${obj.appointmentCount || 0}</td></tr>
        </table></div>
        <div class="print-footer">Printed on ${new Date().toLocaleDateString("en-LK")} | Salon DEEN</div>
        </div></body></html>`);
    setTimeout(() => { newTab.print(); newTab.close(); }, 500);
};

function updateSummary(data) {
    const totalCredit = data.reduce((sum, c) => sum + (parseFloat(c.totalCredit) || 0), 0);
    const totalAppointments = data.reduce((sum, c) => sum + (parseInt(c.appointmentCount) || 0), 0);
    document.getElementById("totalCustomers").textContent = data.length;
    document.getElementById("totalCredit").textContent = "Rs. " + formatCurrency(totalCredit);
    document.getElementById("avgCredit").textContent = data.length > 0 ? "Rs. " + formatCurrency(totalCredit / data.length) : "Rs. 0";
    document.getElementById("totalAppointments").textContent = totalAppointments;
}

function printReport() { window.print(); }

function exportCSV() {
    let csv = "Customer,Mobile,Total Credit,Last Payment Date,Appointment Count\n";
    allCreditData.forEach(c => {
        csv += `${c.customerName || ""},${c.customerMobile || ""},${c.totalCredit || 0},${c.lastPaymentDate ? c.lastPaymentDate.substring(0, 10) : ""},${c.appointmentCount || 0}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "credit_report.csv";
    a.click();
}
