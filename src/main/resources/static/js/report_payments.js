window.addEventListener("load", () => {
    loadCustomers();
    loadData();
    fillSelectFromEnum(document.getElementById("filterMethod"), "paymentMethod", "All Methods");
});

let allPayments = [];
let allCustomers = [];

function loadCustomers() {
    allCustomers = getServiceRequest("/customer/alldata");
    if (!Array.isArray(allCustomers)) allCustomers = Object.values(allCustomers || {});
    const select = document.getElementById("filterCustomer");
    allCustomers.forEach(c => {
        const option = document.createElement("option");
        option.value = c.id;
        option.textContent = c.fullname || "Unknown";
        select.appendChild(option);
    });
}

function loadData() {
    allPayments = getServiceRequest("/reports/payments/data");
    if (!Array.isArray(allPayments)) allPayments = Object.values(allPayments || {});
    applyFilters();
}

function applyFilters() {
    let filtered = [...allPayments];
    const fromDate = document.getElementById("filterDateFrom").value;
    const toDate = document.getElementById("filterDateTo").value;
    const method = document.getElementById("filterMethod").value;
    const customerId = document.getElementById("filterCustomer").value;

    if (fromDate) filtered = filtered.filter(p => p.addeddatetime && p.addeddatetime.substring(0, 10) >= fromDate);
    if (toDate) filtered = filtered.filter(p => p.addeddatetime && p.addeddatetime.substring(0, 10) <= toDate);
    if (method) filtered = filtered.filter(p => p.paymentMethod === method);
    if (customerId) filtered = filtered.filter(p => p.appointment_id && p.appointment_id.customer_id && p.appointment_id.customer_id.id == customerId);

    renderTable(filtered);
    updateSummary(filtered);
}

function clearFilters() {
    document.getElementById("filterDateFrom").value = "";
    document.getElementById("filterDateTo").value = "";
    document.getElementById("filterMethod").value = "";
    document.getElementById("filterCustomer").value = "";
    applyFilters();
}

function renderTable(data) {
    const propertyList = [
        { propertyName: "bill_no", dataType: "string" },
        { propertyName: getAppointmentNo, dataType: "function" },
        { propertyName: getCustomerName, dataType: "function" },
        { propertyName: "appointment_amount", dataType: "currency" },
        { propertyName: "pay_amount", dataType: "currency" },
        { propertyName: "paybalance_amount", dataType: "currency" },
        { propertyName: getMethod, dataType: "function" },
        { propertyName: getDate, dataType: "function" },
    ];
    fillDataIntoTable(document.getElementById("tableBodyPayments"), data, propertyList, null, null, printPaymentRow);
}

const getAppointmentNo = (obj) => obj.appointment_id ? obj.appointment_id.appointment_no : "N/A";
const getCustomerName = (obj) => {
    if (obj.appointment_id && obj.appointment_id.customer_id) {
        const c = obj.appointment_id.customer_id;
        return (c.firstname || "") + " " + (c.lastname || "");
    }
    return "N/A";
};
const getMethod = (obj) => obj.paymentMethod ? getEnumDisplayName("paymentMethod", obj.paymentMethod) : "N/A";
const getDate = (obj) => obj.addeddatetime ? obj.addeddatetime.substring(0, 10) : "N/A";

const printPaymentRow = (obj) => {
    const newTab = window.open();
    newTab.document.write(`<!DOCTYPE html><html><head><title>Payment ${escapeHtml(obj.bill_no || "")}</title>
        <link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="/Resources/fontawesome-7.0.0/css/all.min.css">
        <link rel="stylesheet" href="/Resources/css/common.css">
        </head><body><div class="print-card">
        <div class="print-header">
            <h3><i class="fa-solid fa-money-bill-wave me-2"></i>Payment Details</h3>
            <p>${escapeHtml(obj.bill_no || "")}</p>
        </div>
        <div class="print-body"><table>
            <tr><th>Bill No</th><td>${escapeHtml(obj.bill_no || "N/A")}</td></tr>
            <tr><th>Appointment</th><td>${escapeHtml(obj.appointment_id ? obj.appointment_id.appointment_no : "N/A")}</td></tr>
            <tr><th>Customer</th><td>${escapeHtml(obj.appointment_id && obj.appointment_id.customer_id ? obj.appointment_id.customer_id.fullname : "N/A")}</td></tr>
            <tr><th>Amount</th><td>Rs. ${formatCurrency(obj.appointment_amount)}</td></tr>
            <tr><th>Paid</th><td>Rs. ${formatCurrency(obj.pay_amount)}</td></tr>
            <tr><th>Balance</th><td>Rs. ${formatCurrency(obj.paybalance_amount)}</td></tr>
            <tr><th>Method</th><td>${escapeHtml(obj.paymentMethod ? getEnumDisplayName("paymentMethod", obj.paymentMethod) : "N/A")}</td></tr>
            <tr><th>Date</th><td>${escapeHtml(obj.addeddatetime ? obj.addeddatetime.substring(0, 10) : "N/A")}</td></tr>
        </table></div>
        <div class="print-footer">Printed on ${new Date().toLocaleDateString("en-LK")} | Salon DEEN</div>
        </div></body></html>`);
    setTimeout(() => { newTab.print(); newTab.close(); }, 500);
};

function updateSummary(data) {
    const totalAmount = data.reduce((sum, p) => sum + (parseFloat(p.appointment_amount) || 0), 0);
    const totalPaid = data.reduce((sum, p) => sum + (parseFloat(p.pay_amount) || 0), 0);
    const totalBalance = data.reduce((sum, p) => sum + (parseFloat(p.paybalance_amount) || 0), 0);
    document.getElementById("totalPayments").textContent = data.length;
    document.getElementById("totalAmount").textContent = "Rs. " + formatCurrency(totalAmount);
    document.getElementById("totalPaid").textContent = "Rs. " + formatCurrency(totalPaid);
    document.getElementById("totalBalance").textContent = "Rs. " + formatCurrency(totalBalance);
}

function printReport() { window.print(); }

function exportCSV() {
    let csv = "Bill No,Appointment,Customer,Amount,Paid,Balance,Method,Date\n";
    allPayments.forEach(p => {
        csv += `${p.bill_no || ""},${p.appointment_id ? p.appointment_id.appointment_no : ""},${p.appointment_id && p.appointment_id.customer_id ? p.appointment_id.customer_id.fullname : ""},${p.appointment_amount || 0},${p.pay_amount || 0},${p.paybalance_amount || 0},${p.paymentMethod || ""},${p.addeddatetime ? p.addeddatetime.substring(0, 10) : ""}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "payment_report.csv";
    a.click();
}
