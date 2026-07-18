window.addEventListener("load", () => {
    refreshHandOverForm();
    refreshHandOverTable();
});

// element refs
const searchCustomerElement = document.querySelector("#searchCustomer");
const selectCustomerElement = document.querySelector("#selectCustomer");
const searchRentalElement = document.querySelector("#searchRental");
const selectRentalElement = document.querySelector("#selectRental");
const radioActualCustomerElement = document.querySelector("#radioActualCustomer");
const radioOtherPersonElement = document.querySelector("#radioOtherPerson");

const textReturnPersonElement = document.querySelector("#textReturnPerson");
const textContactNumberElement = document.querySelector("#textContactNumber");
const dateScheduledReturnElement = document.querySelector("#dateScheduledReturn");
const dateActualReturnElement = document.querySelector("#dateActualReturn");
const timeActualReturnElement = document.querySelector("#timeActualReturn");

const selectItemConditionElement = document.querySelector("#selectItemCondition");
const selectStatusElement = document.querySelector("#selectStatus");
const textSecurityDepositElement = document.querySelector("#textSecurityDeposit");
const textDamageChargesElement = document.querySelector("#textDamageCharges");
const textLateReturnFeeElement = document.querySelector("#textLateReturnFee");
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

let customers = [];
let rentals = [];

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

    // Auto load current date
    const today = new Date();

    dateActualReturnElement.value = today.toISOString().split("T")[0];
    handover.actual_return_date = dateActualReturnElement.value;

    // Auto load current time
    timeActualReturnElement.value = today.toTimeString().slice(0, 5);
    handover.actual_return_time = timeActualReturnElement.value;

    buttonUpdate.style.display = "none";
    buttonSubmit.style.display = "block";

    customers = getServiceRequest("/customer/alldata");

    populateDataList(
        document.getElementById("listCustomer"),
        searchCustomerElement,
        selectCustomerElement,
        customers,
        (c) => c.firstname + " " + c.lastname,
        "id"
    );

    // Populate rental datalist
    rentals = getServiceRequest("/rental/alldata");
    populateDataList(document.getElementById("listRental"), searchRentalElement, selectRentalElement, rentals, (r) => r.rent_no, "id");
    //handover status and item condition options (enum-based)
    fillSelectFromEnum(selectStatusElement, "handoverStatus", "Please select status...!");
    selectStatusElement.value = "Pending";
    handover.handoverStatus = "Pending";

    fillSelectFromEnum(selectItemConditionElement, "itemCondition", "Please select condition...!");
    selectItemConditionElement.value = "Good";
    handover.itemCondition = "Good";

    clearElement([searchRentalElement, selectRentalElement, dateActualReturnElement, timeActualReturnElement, textReturnPersonElement, selectItemConditionElement, selectStatusElement, textSecurityDepositElement, textDamageChargesElement, textLateReturnFeeElement, textTotalRefundElement, textReceiptNumberElement, textDamageDescriptionElement, textReturnNotesElement]);

    document.querySelector('#panelHandoverForm .offcanvas-title').textContent = 'New Handover';

}

searchCustomerElement.addEventListener("input", () => {
    const customer = customers.find(c =>
        (c.firstname + " " + c.lastname) === searchCustomerElement.value
    );

    if (!customer) return;

    const rental = rentals.find(r => r.customer_id.id === customer.id);

    if (!rental) return;

    selectRentalElement.value = rental.id;
    searchRentalElement.value = rental.rent_no;

    handover.rental_id = rental;

    dateScheduledReturnElement.value = rental.return_date;

    textSecurityDepositElement.value = rental.keymoney;

    calculateLateReturnFee();

    // Auto fill customer details
    textReturnPersonElement.value =
        customer.firstname + " " + customer.lastname;

    textContactNumberElement.value = customer.mobile;

    setValid(textReturnPersonElement);
    setValid(textContactNumberElement);

    handover.return_person = textReturnPersonElement.value;

    textReturnPersonElement.readOnly = true;
    textContactNumberElement.readOnly = true;

    loadRentalItems();

});

radioActualCustomerElement.addEventListener("change", () => {

    if (radioActualCustomerElement.checked) {

        const customer = customers.find(c =>
            c.id == selectCustomerElement.value
        );

        if (customer) {

            textReturnPersonElement.value =
                customer.firstname + " " + customer.lastname;

            textContactNumberElement.value =
                customer.mobile;

            setValid(textReturnPersonElement);
            setValid(textContactNumberElement);

            handover.return_person =
                textReturnPersonElement.value;
        }

        textReturnPersonElement.readOnly = true;
        textContactNumberElement.readOnly = true;
    }

});

radioOtherPersonElement.addEventListener("change", () => {

    if (radioOtherPersonElement.checked) {

        textReturnPersonElement.value = "";
        textContactNumberElement.value = "";

        handover.return_person = "";

        textReturnPersonElement.readOnly = false;
        textContactNumberElement.readOnly = false;

        textReturnPersonElement.focus();
    }

});

dateActualReturnElement.addEventListener("change", () => {

    handover.actual_return_date = dateActualReturnElement.value;

    calculateLateReturnFee();

});
textDamageChargesElement.addEventListener("keyup", () => {

    let damage = parseFloat(textDamageChargesElement.value) || 0;

    handover.damage_charge = damage;

    calculateTotalRefund();

});


// define function for refresh table
function refreshHandOverTable() {
    handovers = getServiceRequest("/handover/alldata");

    console.log(handovers);

    if (!Array.isArray(handovers)) {
        handovers = Object.values(handovers || {});
    }

    const propertyList = [

        { propertyName: getCustomer, dataType: "function" },

        { propertyName: getRental, dataType: "function" },

        { propertyName: "return_person", dataType: "string" },

        { propertyName: "actual_return_date", dataType: "date" },

        { propertyName: "actual_return_time", dataType: "string" },

        { propertyName: getHandoverStatus, dataType: "function" },

        { propertyName: getItemCondition, dataType: "function" },

        { propertyName: "damage_charge", dataType: "currency" },

        { propertyName: "late_return_fee", dataType: "currency" },

        { propertyName: "total_refund", dataType: "currency" }

    ];

    fillDataIntoTable(tableBodyElement, handovers, propertyList, refillHandOverForm, deleteHandOver, printHandOver);
}

function getRental(rowObject) {
    if (rowObject.rental_id) {
        return rowObject.rental_id.rent_no;
    }
    return "";
}
function getCustomer(rowObject) {

    if (rowObject.rental_id && rowObject.rental_id.customer_id) {

        return rowObject.rental_id.customer_id.firstname + " " +
            rowObject.rental_id.customer_id.lastname;

    }

    return "";

}
function getHandoverStatus(rowObject) {
    return getEnumDisplayName("handoverStatus", rowObject.handoverStatus);
}

function getItemCondition(rowObject) {
    return getEnumDisplayName("itemCondition", rowObject.itemCondition);
}

//validation //
textReturnPersonElement.addEventListener("keyup", () => {

    let returnPerson = textReturnPersonElement.value.trim();

    let regPattern = /^[A-Za-z ]{3,50}$/;

    if (regPattern.test(returnPerson)) {

        setValid(textReturnPersonElement);
        handover.return_person = returnPerson;

    } else {

        setInvalid(textReturnPersonElement);
        handover.return_person = null;

    }

});

textContactNumberElement.addEventListener("keyup", () => {

    let contact = textContactNumberElement.value.trim();

    let regPattern = /^07[01245678][0-9]{7}$/;

    if (regPattern.test(contact)) {

        setValid(textContactNumberElement);

    } else {

        setInvalid(textContactNumberElement);

    }

});

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
        <tr><th>Item Condition</th><td>${escapeHtml(capitalize(r.item_condition))}</td></tr>
        <tr><th>Status</th><td>${escapeHtml(capitalize(r.status))}</td></tr>
        <tr><th>Security Deposit</th><td>Rs. ${escapeHtml(formatCurrency(r.security_deposit))}</td></tr>
        <tr><th>Damage Charges</th><td>Rs. ${escapeHtml(formatCurrency(r.damage_charges))}</td></tr>
        <tr><th>Late Return Fee</th><td>Rs. ${escapeHtml(formatCurrency(r.late_return_fee))}</td></tr>
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
    <option>Good</option>
    <option>Damaged</option>
    <option>Lost</option>
</select>
</td>
`;
            const conditionSelect = row.querySelector("select");

            conditionSelect.addEventListener("change", () => {

                updateOverallItemCondition();

            });

            tableBodyHandoverItemsElement.appendChild(row);

        });
    }
}

function updateOverallItemCondition() {

    let overall = "Good";

    const allConditions = tableBodyHandoverItemsElement.querySelectorAll("select");

    allConditions.forEach(select => {

        let value = select.value;

        if (value === "Lost") {

            overall = "Lost";

        } else if (value === "Damaged" && overall !== "Lost") {

            overall = "Damaged";

        }

    });

    selectItemConditionElement.value = overall;
    handover.itemCondition = overall;
}

// Form refill for edit
const refillHandOverForm = (obj) => {
    handover = getServiceRequest("/handover/alldata").find(h => h.id === obj.id);
    oldHandover = JSON.parse(JSON.stringify(handover));

    // Re-populate rental datalist and set value
    let rentals = getServiceRequest("/rental/alldata");
    populateDataList(document.getElementById("listRental"),
        searchRentalElement,
        selectRentalElement,
        rentals,
        (r) => r.rent_no,
        "id"
    );

    setSelectedByHiddenId(
        searchRentalElement,
        selectRentalElement,
        rentals,
        (r) => r.rent_no,
        "id",
        handover.rental_id?.id
    );
    // Fill customer
    searchCustomerElement.value =
        handover.rental_id.customer_id.firstname + " " +
        handover.rental_id.customer_id.lastname;

    selectCustomerElement.value =
        handover.rental_id.customer_id.id;

    // Fill scheduled return date
    dateScheduledReturnElement.value =
        handover.rental_id.return_date;

    // Fill contact number
    textContactNumberElement.value =
        handover.rental_id.customer_id.mobile;

    // Fill key money
    textSecurityDepositElement.value =
        handover.rental_id.keymoney;

    // Load returned items
    loadRentalItems();

    fillSelectFromEnum(selectStatusElement, "handoverStatus", "Please select status...!");
    fillSelectFromEnum(selectItemConditionElement, "itemCondition", "Please select condition...!");

    // Set form fields
    if (handover.actual_return_date) dateActualReturnElement.value = handover.actual_return_date;
    if (handover.actual_return_time) timeActualReturnElement.value = handover.actual_return_time;
    if (handover.return_person) textReturnPersonElement.value = handover.return_person;
    if (handover.itemCondition) selectItemConditionElement.value = handover.itemCondition;
    if (handover.handoverStatus) selectStatusElement.value = handover.handoverStatus;
    if (handover.damage_charge) textDamageChargesElement.value = handover.damage_charge;
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
    if (!selectStatusElement.value) errors += "Status is required.\n";
    return errors;
};

// Check form updates
const checkHandOverFormUpdates = () => {
    let updates = "";
    if (handover.rental_id?.id != oldHandover.rental_id?.id) updates += "Rental changed\n";
    if (handover.handoverStatus != oldHandover.handoverStatus) updates += "Status changed\n";
    if (handover.actual_return_date != oldHandover.actual_return_date) updates += "Return date changed\n";
    if (handover.actual_return_time != oldHandover.actual_return_time) updates += "Return time changed\n";
    if (handover.return_person != oldHandover.return_person) updates += "Return person changed\n";
    if (handover.itemCondition != oldHandover.itemCondition) updates += "Item condition changed\n";
    if (handover.security_deposit != oldHandover.security_deposit) updates += "Security deposit changed\n";
    if (handover.damage_charge != oldHandover.damage_charge) updates += "Damage charges changed\n";
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

        handover.damage_description = textDamageDescriptionElement.value.trim();
        handover.return_note = textReturnNotesElement.value.trim();
        handover.handoverStatus = selectStatusElement.value;

        if (selectItemConditionElement.value !== "") {
            handover.itemCondition = selectItemConditionElement.value;
        }

        handover.damage_charge = parseFloat(textDamageChargesElement.value) || 0;
        handover.late_return_fee = parseFloat(textLateReturnFeeElement.value) || 0;
        handover.total_refund = parseFloat(textTotalRefundElement.value) || 0;
        handover.cleaning_charge = 0;

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

function calculateLateReturnFee() {

    if (!dateScheduledReturnElement.value || !dateActualReturnElement.value) {
        return;
    }

    let scheduledDate = new Date(dateScheduledReturnElement.value);
    let actualDate = new Date(dateActualReturnElement.value);

    let difference = actualDate - scheduledDate;

    let lateDays = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (lateDays < 0) {
        lateDays = 0;
    }

    let lateFee = lateDays * 500;

    textLateReturnFeeElement.value = lateFee;
    handover.late_return_fee = lateFee;

    calculateTotalRefund();
}

function calculateTotalRefund() {

    let keyMoney = parseFloat(textSecurityDepositElement.value) || 0;
    let damage = parseFloat(textDamageChargesElement.value) || 0;
    let lateFee = parseFloat(textLateReturnFeeElement.value) || 0;

    let refund = keyMoney - damage - lateFee;

    if (refund < 0) {
        refund = 0;
    }

    textTotalRefundElement.value = refund.toFixed(2);
    handover.total_refund = refund;
}

