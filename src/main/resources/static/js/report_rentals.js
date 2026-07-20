window.addEventListener("load", () => {
    loadData();
    fillSelectFromEnum(document.getElementById("filterStatus"), "rentalStatus", "All");
});

let allRentals = [];

function loadData() {
    allRentals = getServiceRequest("/reports/rentals/data");
    if (!Array.isArray(allRentals)) allRentals = Object.values(allRentals || {});
    applyFilters();
}

function applyFilters() {
    let filtered = [...allRentals];
    const fromDate = document.getElementById("filterDateFrom").value;
    const toDate = document.getElementById("filterDateTo").value;
    const status = document.getElementById("filterStatus").value;

    if (fromDate) filtered = filtered.filter(r => r.function_date >= fromDate);
    if (toDate) filtered = filtered.filter(r => r.function_date <= toDate);
    if (status) filtered = filtered.filter(r => r.rentalStatus === status);

    renderTable(filtered);
    updateSummary(filtered);
}

function clearFilters() {
    document.getElementById("filterDateFrom").value = "";
    document.getElementById("filterDateTo").value = "";
    document.getElementById("filterStatus").value = "";
    applyFilters();
}

function renderTable(data) {
    const propertyList = [
        { propertyName: "rent_no", dataType: "string" },
        { propertyName: getCustomer, dataType: "function" },
        { propertyName: "function_date", dataType: "date" },
        { propertyName: "return_date", dataType: "date" },
        { propertyName: getItemCount, dataType: "function" },
        { propertyName: "total_charge", dataType: "currency" },
        { propertyName: getStatus, dataType: "function" },
    ];
    fillDataIntoTable(document.getElementById("tableBodyRentals"), data, propertyList, null, null, printRentalRow);
}

const printRentalRow = (obj) => {
    const items = obj.rentalHasItemList || [];
    let itemRows = items.map(item =>
        `<tr><td>${escapeHtml(item.item_id ? item.item_id.itemcode : "")}</td><td>${escapeHtml(item.item_id ? item.item_id.item_name : "")}</td></tr>`
    ).join("");
    const newTab = window.open();
    newTab.document.write(`<!DOCTYPE html><html><head><title>Rental ${escapeHtml(obj.rent_no || "")}</title>
        <link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="/Resources/fontawesome-7.0.0/css/all.min.css">
        <link rel="stylesheet" href="/Resources/css/common.css">
        </head><body><div class="print-card">
        <div class="print-header">
            <h3><i class="fa-solid fa-truck me-2"></i>Rental Details</h3>
            <p>${escapeHtml(obj.rent_no || "")}</p>
        </div>
        <div class="print-body"><table>
            <tr><th>Rent No</th><td>${escapeHtml(obj.rent_no || "N/A")}</td></tr>
            <tr><th>Customer</th><td>${escapeHtml(obj.customer_id ? obj.customer_id.firstname + " " + (obj.customer_id.lastname || "") : "N/A")}</td></tr>
            <tr><th>Function Date</th><td>${formatDate(obj.function_date)}</td></tr>
            <tr><th>Return Date</th><td>${formatDate(obj.return_date)}</td></tr>
            <tr><th>Total Charge</th><td>Rs. ${formatCurrency(obj.total_charge)}</td></tr>
            <tr><th>Status</th><td>${escapeHtml(getEnumDisplayName("rentalStatus", obj.rentalStatus))}</td></tr>
        </table>
        ${items.length > 0 ? `<h6 class="mt-3 mb-2">Items</h6>
        <table class="table table-bordered"><thead><tr><th>Code</th><th>Name</th><th>Qty</th></tr></thead>
        <tbody>${itemRows}</tbody></table>` : ""}
        </div>
        <div class="print-footer">Printed on ${new Date().toLocaleDateString("en-LK")} | Salon DEEN</div>
        </div></body></html>`);
    setTimeout(() => { newTab.print(); newTab.close(); }, 500);
};

const getCustomer = (obj) => obj.customer_id ? obj.customer_id.firstname + " " + (obj.customer_id.lastname || "") : "N/A";
const getItemCount = (obj) => obj.rentalHasItemList ? obj.rentalHasItemList.length : 0;
const getStatus = (obj) => getEnumDisplayName("rentalStatus", obj.rentalStatus);

function updateSummary(data) {
    const active = data.filter(r => r.rentalStatus === "ACTIVE").length;
    const completed = data.filter(r => r.rentalStatus === "COMPLETED").length;
    const revenue = data.reduce((sum, r) => sum + (parseFloat(r.total_charge) || 0), 0);
    document.getElementById("totalRentals").textContent = data.length;
    document.getElementById("activeRentals").textContent = active;
    document.getElementById("completedRentals").textContent = completed;
    document.getElementById("totalRentalRevenue").textContent = "Rs. " + formatCurrency(revenue);
}

function printReport() { window.print(); }

function exportCSV() {
    let csv = "Rent No,Customer,Function Date,Return Date,Items,Total,Status\n";
    allRentals.forEach(r => {
        csv += `${r.rent_no || ""},${r.customer_id ? r.customer_id.firstname : ""},${r.function_date || ""},${r.return_date || ""},${r.rentalHasItemList ? r.rentalHasItemList.length : 0},${r.total_charge || 0},${r.rentalStatus || ""}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const el = document.createElement("a");
    el.href = URL.createObjectURL(blob);
    el.download = "rental_report.csv";
    el.click();
}
