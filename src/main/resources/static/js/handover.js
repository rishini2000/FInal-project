window.addEventListener("load", () => {
    refreshHandOverForm();
    refreshHandOverTable();
});

// element refs
const searchRentalElement = document.querySelector("#searchRental");
const selectRentalElement = document.querySelector("#selectRental");
const searchAssignedStaffElement = document.querySelector("#searchAssignedStaff");
const selectAssignedStaffElement = document.querySelector("#selectAssignedStaff");
const dateActualReturnElement = document.querySelector("#dateActualReturn");
const timeActualReturnElement = document.querySelector("#timeActualReturn");
const textReturnPersonElement = document.querySelector("#textReturnPerson");
const selectItemConditionElement = document.querySelector("#selectItemCondition");
const selectStatusElement = document.querySelector("#selectStatus");
const textSecurityDepositElement = document.querySelector("#textSecurityDeposit");
const textDamageChargesElement = document.querySelector("#textDamageCharges");
const textLateReturnFeeElement = document.querySelector("#textLateReturnFee");
const textCleaningChargesElement = document.querySelector("#textCleaningCharges");
const textTotalRefundElement = document.querySelector("#textTotalRefund");
const textReceiptNumberElement = document.querySelector("#textReceiptNumber");
const textDamageDescriptionElement = document.querySelector("#textDamageDescription");
const textReturnNotesElement = document.querySelector("#textReturnNotes");
const formHandOver = document.getElementById("formHandOver");

const tableBodyHandoverItemsElement = document.getElementById("tableBodyHandoverItems");

const buttonSubmit = document.getElementById("buttonSubmit");
const buttonUpdate = document.getElementById("buttonUpdate");
const buttonClear = document.getElementById("buttonClear");
const tableBodyElement = document.querySelector("#tableBodyReturn");

// panel helpers
function showModal() {
    openPanel('panelHandoverForm');
}
function hideModal() {
    closePanel('panelHandoverForm');
}

// define function for refresh form
function refreshHandOverForm() {

    formHandOver.reset();

    handover = new Object();
    handover.handoverHasItemList = new Array();

    buttonUpdate.style.display = "none";
    buttonSubmit.style.display = "block";

    // Populate rental datalist
    let rentals = getServiceRequest("/rental/alldata");
    populateDataList(document.getElementById("listRental"), searchRentalElement, selectRentalElement, rentals, (r) => r.rent_no, "id");

    // Populate staff datalist
    let employees = getServiceRequest("/employee/alldata");
    populateDataList(document.getElementById("listAssignedStaff"), searchAssignedStaffElement, selectAssignedStaffElement, employees, (e) => e.callingname, "id");

    //handover status and item condition options (enum-based)
    fillSelectFromEnum(selectStatusElement, "handoverStatus", "Please select status...!");
    fillSelectFromEnum(selectItemConditionElement, "itemCondition", "Please select condition...!");

    clearElement([searchRentalElement, selectRentalElement, dateActualReturnElement, timeActualReturnElement, textReturnPersonElement, searchAssignedStaffElement, selectAssignedStaffElement, selectItemConditionElement, selectStatusElement, textSecurityDepositElement, textDamageChargesElement, textLateReturnFeeElement, textCleaningChargesElement, textTotalRefundElement, textReceiptNumberElement, textDamageDescriptionElement, textReturnNotesElement]);

    document.querySelector('#panelHandoverForm .offcanvas-title').textContent = 'New Handover';

    // Listen for rental selection to load items
    searchRentalElement.addEventListener("input", () => {
        const hiddenValue = selectRentalElement.value;
        if (hiddenValue) {
            loadRentalItems();
        }
    });

}

// define function for refresh table
function refreshHandOverTable() {
    handovers = getServiceRequest("/handover/alldata");

    if (!Array.isArray(handovers)) {
        handovers = Object.values(handovers || {});
    }
    const propertyList = [
        { propertyName: getRental, dataType: "function" },
        { propertyName: getAssignedStaff, dataType: "function" },
        { propertyName: "actual_return_date", dataType: "date" },
        { propertyName: "actual_return_time", dataType: "string" },
        { propertyName: getHandoverStatus, dataType: "function" },
        { propertyName: getItemCondition, dataType: "function" },
        { propertyName: "damage_charge", dataType: "currency" },
        { propertyName: "cleaning_charge", dataType: "currency" },
        { propertyName: "late_return_fee", dataType: "currency" },
        { propertyName: "total_refund", dataType: "currency" },
    ];
    fillDataIntoTable(tableBodyElement, handovers, propertyList, refillHandOverForm, deleteHandOver, printHandOver);
}

function getRental(rowObject) {
    if (rowObject.rental_id) {
        return rowObject.rental_id.rent_no;
    }
    return "";
}

function getAssignedStaff(rowObject) {
    if (rowObject.employee_id) {
        return rowObject.employee_id.callingname;
    }
    return "";
}

function getHandoverStatus(rowObject) {
    return getEnumDisplayName("handoverStatus", rowObject.handoverStatus);
}

function getItemCondition(rowObject) {
    return getEnumDisplayName("itemCondition", rowObject.itemCondition);
}

// print
function printHandOver(r) {
    if (!r) return;
    const newTab = window.open();
    newTab.document.write(`<html><head><title>${escapeHtml(r.return_id)}</title><link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css"></head><body>
        <div class="card"><div class="card-header bg-primary text-light text-center"><h3>Return: ${escapeHtml(r.return_id)}</h3></div>
        <div class="card-body"><table class="table table-bordered">
        <tr><th>Return ID</th><td>${escapeHtml(r.return_id)}</td></tr>
        <tr><th>Customer</th><td>${escapeHtml(r.customer_id ? r.customer_id.firstname : '')}</td></tr>
        <tr><th>Rental ID</th><td>${escapeHtml(r.rental_id ? r.rental_id.rent_no : '')}</td></tr>
        <tr><th>Pickup ID</th><td>${escapeHtml(r.pickup_id ? r.pickup_id.pickup_id : '')}</td></tr>
        <tr><th>Expected Date</th><td>${escapeHtml(formatDate(r.expected_return_date))}</td></tr>
        <tr><th>Expected Time</th><td>${escapeHtml(r.expected_return_time)}</td></tr>
        <tr><th>Actual Date</th><td>${escapeHtml(r.actual_return_date ? formatDate(r.actual_return_date) : 'Pending')}</td></tr>
        <tr><th>Actual Time</th><td>${escapeHtml(r.actual_return_time || 'Pending')}</td></tr>
        <tr><th>Return Person</th><td>${escapeHtml(r.return_person || 'N/A')}</td></tr>
        <tr><th>Assigned Staff</th><td>${escapeHtml(r.assigned_staff)}</td></tr>
        <tr><th>Item Condition</th><td>${escapeHtml(capitalize(r.item_condition))}</td></tr>
        <tr><th>Status</th><td>${escapeHtml(capitalize(r.status))}</td></tr>
        <tr><th>Security Deposit</th><td>Rs. ${escapeHtml(formatCurrency(r.security_deposit))}</td></tr>
        <tr><th>Damage Charges</th><td>Rs. ${escapeHtml(formatCurrency(r.damage_charges))}</td></tr>
        <tr><th>Late Return Fee</th><td>Rs. ${escapeHtml(formatCurrency(r.late_return_fee))}</td></tr>
        <tr><th>Cleaning Charges</th><td>Rs. ${escapeHtml(formatCurrency(r.cleaning_charges))}</td></tr>
        <tr><th>Total Refund</th><td>Rs. ${escapeHtml(formatCurrency(r.total_refund))}</td></tr>
        <tr><th>Receipt Number</th><td>${escapeHtml(r.receipt_number || 'N/A')}</td></tr>
        <tr><th>Damage Description</th><td>${escapeHtml(r.damage_description || 'None')}</td></tr>
        <tr><th>Return Notes</th><td>${escapeHtml(r.return_notes)}</td></tr>
        </table></div></div></body></html>`);
    setTimeout(() => { newTab.print(); newTab.close(); }, 400);
}

function loadRentalItems() {
    let rentalId = selectRentalElement.value;
    let rentals = getServiceRequest("/rental/alldata");
    let selectedRental = rentals.find(r => r.id == rentalId);

    console.log(selectedRental);
    tableBodyHandoverItemsElement.innerHTML = "";

    if (selectedRental) {
        selectedRental.rentalHasItemList.forEach(function (itemRow) {
            let row = document.createElement("tr");
            row.innerHTML = `
<td>${itemRow.item_id.item_name}</td>
<td>${itemRow.quantity}</td>
<td>
    <input type="number" min="0" max="${itemRow.quantity}" value="${itemRow.quantity}" class="form-control">
</td>
<td>
    <input type="checkbox" checked class="form-check-input">
</td>
<td>
    <select class="form-select">
        <option>Excellent</option>
        <option>Good</option>
        <option>Fair</option>
        <option>Damaged</option>
        <option>Missing</option>
    </select>
</td>
`;
            tableBodyHandoverItemsElement.appendChild(row);
        });
    }
}

// Refresh form - reset all fields and re-populate dropdowns
const refreshHandOverForm2 = () => {
    handover = {};
    oldHandover = null;
    formHandOver.reset();

    // Re-populate rental datalist
    let rentals = getServiceRequest("/rental/alldata");
    populateDataList(document.getElementById("listRental"), searchRentalElement, selectRentalElement, rentals, (r) => r.rent_no, "id");

    // Re-populate staff datalist
    let employees = getServiceRequest("/employee/alldata");
    populateDataList(document.getElementById("listAssignedStaff"), searchAssignedStaffElement, selectAssignedStaffElement, employees, (e) => e.callingname, "id");

    // Re-populate enum selects
    fillSelectFromEnum(selectStatusElement, "handoverStatus", "Please select status...!");
    fillSelectFromEnum(selectItemConditionElement, "itemCondition", "Please select condition...!");

    buttonUpdate.style.display = "none";
    buttonSubmit.style.display = "block";
    document.querySelector('#panelHandoverForm .offcanvas-title').textContent = 'New Handover';
};

// Form refill for edit
const refillHandOverForm = (obj) => {
    handover = getServiceRequest("/handover/alldata").find(h => h.id === obj.id);
    oldHandover = JSON.parse(JSON.stringify(handover));

    // Re-populate rental datalist and set value
    let rentals = getServiceRequest("/rental/alldata");
    populateDataList(document.getElementById("listRental"), searchRentalElement, selectRentalElement, rentals, (r) => r.rent_no, "id");
    setSelectedByHiddenId(searchRentalElement, selectRentalElement, rentals, (r) => r.rent_no, "id", handover.rental_id?.id);

    // Re-populate staff datalist and set value
    let employees = getServiceRequest("/employee/alldata");
    populateDataList(document.getElementById("listAssignedStaff"), searchAssignedStaffElement, selectAssignedStaffElement, employees, (e) => e.callingname, "id");
    setSelectedByHiddenId(searchAssignedStaffElement, selectAssignedStaffElement, employees, (e) => e.callingname, "id", handover.employee_id?.id);

    fillSelectFromEnum(selectStatusElement, "handoverStatus", "Please select status...!");
    fillSelectFromEnum(selectItemConditionElement, "itemCondition", "Please select condition...!");

    // Set form fields
    if (handover.actual_return_date) dateActualReturnElement.value = handover.actual_return_date;
    if (handover.actual_return_time) timeActualReturnElement.value = handover.actual_return_time;
    if (handover.return_person) textReturnPersonElement.value = handover.return_person;
    if (handover.itemCondition) selectItemConditionElement.value = handover.itemCondition;
    if (handover.handoverStatus) selectStatusElement.value = handover.handoverStatus;
    if (handover.security_deposit) textSecurityDepositElement.value = handover.security_deposit;
    if (handover.damage_charge) textDamageChargesElement.value = handover.damage_charge;
    if (handover.cleaning_charge) textCleaningChargesElement.value = handover.cleaning_charge;
    if (handover.late_return_fee) textLateReturnFeeElement.value = handover.late_return_fee;
    if (handover.total_refund) textTotalRefundElement.value = handover.total_refund;
    if (handover.receipt_number) textReceiptNumberElement.value = handover.receipt_number;
    if (handover.damage_description) textDamageDescriptionElement.value = handover.damage_description;
    if (handover.return_note) textReturnNotesElement.value = handover.return_note;

    buttonUpdate.style.display = "block";
    buttonSubmit.style.display = "none";
    document.querySelector('#panelHandoverForm .offcanvas-title').textContent = 'Edit Handover';
    openPanel('panelHandoverForm');
};

// Check form errors
const checkHandOverFormErrors = () => {
    let errors = "";
    if (!selectRentalElement.value) errors += "Rental is required.\n";
    if (!selectAssignedStaffElement.value) errors += "Assigned staff is required.\n";
    if (!selectStatusElement.value) errors += "Status is required.\n";
    return errors;
};

// Check form updates
const checkHandOverFormUpdates = () => {
    let updates = "";
    if (handover.rental_id?.id != oldHandover.rental_id?.id) updates += "Rental changed\n";
    if (handover.employee_id?.id != oldHandover.employee_id?.id) updates += "Staff changed\n";
    if (handover.handoverStatus != oldHandover.handoverStatus) updates += "Status changed\n";
    if (handover.actual_return_date != oldHandover.actual_return_date) updates += "Return date changed\n";
    if (handover.actual_return_time != oldHandover.actual_return_time) updates += "Return time changed\n";
    if (handover.return_person != oldHandover.return_person) updates += "Return person changed\n";
    if (handover.itemCondition != oldHandover.itemCondition) updates += "Item condition changed\n";
    if (handover.security_deposit != oldHandover.security_deposit) updates += "Security deposit changed\n";
    if (handover.damage_charge != oldHandover.damage_charge) updates += "Damage charges changed\n";
    if (handover.cleaning_charge != oldHandover.cleaning_charge) updates += "Cleaning charges changed\n";
    if (handover.late_return_fee != oldHandover.late_return_fee) updates += "Late return fee changed\n";
    if (handover.total_refund != oldHandover.total_refund) updates += "Total refund changed\n";
    if (handover.damage_description != oldHandover.damage_description) updates += "Damage description changed\n";
    if (handover.return_note != oldHandover.return_note) updates += "Return notes changed\n";
    return updates;
};

// Submit form
const submitHandOverForm = () => {
    let errors = checkHandOverFormErrors();
    if (errors) {
        showToast("Please fix the following errors:\n" + errors, "error");
        return;
    }
    showConfirm("Confirm Submit", "Are you sure you want to create this handover?", "Submit", "success").then(confirmed => {
        if (!confirmed) return;
        let serverResponse = getHTTPServicesRequest("/handover/insert", "POST", handover);
        if (serverResponse === "OK") {
            showToast("Handover created successfully!", "success");
            refreshHandOverForm();
            refreshHandOverTable();
            closePanel('panelHandoverForm');
        } else {
            showToast("Failed to create handover. " + serverResponse, "error");
        }
    });
};

// Update form
const updateHandOverForm = () => {
    let errors = checkHandOverFormErrors();
    if (errors) {
        showToast("Please fix the following errors:\n" + errors, "error");
        return;
    }
    let updates = checkHandOverFormUpdates();
    if (!updates) {
        showToast("No changes detected.", "info");
        return;
    }
    showConfirm("Confirm Update", "Are you sure you want to update this handover?\n" + updates, "Update", "primary").then(confirmed => {
        if (!confirmed) return;
        let serverResponse = getHTTPServicesRequest("/handover/update", "PUT", handover);
        if (serverResponse === "OK") {
            showToast("Handover updated successfully!", "success");
            refreshHandOverForm();
            refreshHandOverTable();
            closePanel('panelHandoverForm');
        } else {
            showToast("Failed to update handover. " + serverResponse, "error");
        }
    });
};

// Delete handover
const deleteHandOver = (obj) => {
    showConfirm("Confirm Delete", "Are you sure you want to delete this handover?", "Delete", "danger").then(confirmed => {
        if (!confirmed) return;
        let serverResponse = getHTTPServicesRequest("/handover/delete", "DELETE", obj);
        if (serverResponse === "OK") {
            showToast("Handover deleted successfully!", "success");
            refreshHandOverTable();
        } else {
            showToast("Failed to delete handover. " + serverResponse, "error");
        }
    });
};
