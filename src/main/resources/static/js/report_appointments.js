window.addEventListener("load", () => {
    loadData();
    fillSelectFromEnum(document.getElementById("filterStatus"), "appointmentStatus", "All");
    fillSelectFromEnum(document.getElementById("filterMethod"), "bookingMethod", "All");
});

let allAppointments = [];

function loadData() {
    allAppointments = getServiceRequest("/reports/appointments/data");
    if (!Array.isArray(allAppointments)) allAppointments = Object.values(allAppointments || {});
    applyFilters();
}

function applyFilters() {
    let filtered = [...allAppointments];
    const fromDate = document.getElementById("filterDateFrom").value;
    const toDate = document.getElementById("filterDateTo").value;
    const status = document.getElementById("filterStatus").value;
    const method = document.getElementById("filterMethod").value;

    if (fromDate) filtered = filtered.filter(a => a.date >= fromDate);
    if (toDate) filtered = filtered.filter(a => a.date <= toDate);
    if (status) filtered = filtered.filter(a => a.appointmentStatus === status);
    if (method) filtered = filtered.filter(a => a.bookingMethod === method);

    renderTable(filtered);
    updateSummary(filtered);
}

function clearFilters() {
    document.getElementById("filterDateFrom").value = "";
    document.getElementById("filterDateTo").value = "";
    document.getElementById("filterStatus").value = "";
    document.getElementById("filterMethod").value = "";
    applyFilters();
}

function renderTable(data) {
    const propertyList = [
        { propertyName: "appointment_no", dataType: "string" },
        { propertyName: "date", dataType: "date" },
        { propertyName: getEmployee, dataType: "function" },
        { propertyName: "duration", dataType: "string" },
        { propertyName: "price", dataType: "currency" },
        { propertyName: getStatus, dataType: "function" },
        { propertyName: getMethod, dataType: "function" },
    ];
    fillDataIntoTable(document.getElementById("tableBodyAppointments"), data, propertyList, null, null, printAppointmentRow);
}

const printAppointmentRow = (obj) => {
    const newTab = window.open();
    newTab.document.write(`<!DOCTYPE html><html><head><title>Appointment ${escapeHtml(obj.appointment_no || "")}</title>
        <link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="/Resources/fontawesome-7.0.0/css/all.min.css">
        <link rel="stylesheet" href="/Resources/css/common.css">
        </head><body><div class="print-card">
        <div class="print-header">
            <h3><i class="fa-solid fa-calendar-check me-2"></i>Appointment Details</h3>
            <p>${escapeHtml(obj.appointment_no || "")}</p>
        </div>
        <div class="print-body"><table>
            <tr><th>Appointment No</th><td>${escapeHtml(obj.appointment_no || "N/A")}</td></tr>
            <tr><th>Date</th><td>${formatDate(obj.date)}</td></tr>
            <tr><th>Employee</th><td>${escapeHtml(obj.employee_id ? obj.employee_id.fullname : "N/A")}</td></tr>
            <tr><th>Duration</th><td>${escapeHtml(obj.duration || "N/A")} min</td></tr>
            <tr><th>Price</th><td>Rs. ${formatCurrency(obj.price)}</td></tr>
            <tr><th>Status</th><td>${escapeHtml(getEnumDisplayName("appointmentStatus", obj.appointmentStatus))}</td></tr>
            <tr><th>Booking Method</th><td>${escapeHtml(getEnumDisplayName("bookingMethod", obj.bookingMethod))}</td></tr>
        </table></div>
        <div class="print-footer">Printed on ${new Date().toLocaleDateString("en-LK")} | Salon DEEN</div>
        </div></body></html>`);
    setTimeout(() => { newTab.print(); newTab.close(); }, 500);
};

const getEmployee = (obj) => obj.employee_id ? obj.employee_id.fullname : "N/A";
const getStatus = (obj) => getEnumDisplayName("appointmentStatus", obj.appointmentStatus);
const getMethod = (obj) => getEnumDisplayName("bookingMethod", obj.bookingMethod);

function updateSummary(data) {
    const completed = data.filter(a => a.appointmentStatus === "COMPLETED").length;
    const cancelled = data.filter(a => a.appointmentStatus === "CANCELLED").length;
    const revenue = data.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0);
    document.getElementById("totalAppointments").textContent = data.length;
    document.getElementById("completedCount").textContent = completed;
    document.getElementById("cancelledCount").textContent = cancelled;
    document.getElementById("totalApptRevenue").textContent = "Rs. " + formatCurrency(revenue);
}

function printReport() { window.print(); }

function exportCSV() {
    let csv = "Appt No,Date,Employee,Duration,Price,Status,Method\n";
    allAppointments.forEach(a => {
        csv += `${a.appointment_no || ""},${a.date || ""},${a.employee_id ? a.employee_id.fullname : ""},${a.duration || 0},${a.price || 0},${a.appointmentStatus || ""},${a.bookingMethod || ""}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const el = document.createElement("a");
    el.href = URL.createObjectURL(blob);
    el.download = "appointment_report.csv";
    el.click();
}
