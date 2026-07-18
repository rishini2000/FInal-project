//  management JS modeled after user.js style
window.addEventListener("load", () => {

    refreshPickupForm();
    refreshPickupTable();

});


// element refs
const searchCustomerElement = document.querySelector("#searchCustomer");
const hiddenCustomerElement = document.querySelector("#selectCustomer");
const searchRentalElement = document.querySelector("#searchRental");
const hiddenRentalElement = document.querySelector("#selectRental");
const textContactNumberElement = document.querySelector("#textContactNumber");
const selectPickupStatusElement = document.querySelector("#selectPickupStatus");
const dateScheduledPickupElement = document.querySelector("#dateScheduledPickup");
const datetimeActualPickupElement = document.querySelector("#datetimeActualPickup");
const textPickupPersonElement = document.querySelector("#textPickupPerson");
const radioActualCustomerElement = document.querySelector("#radioActualCustomer");
radioActualCustomerElement.addEventListener("change", function () {

    if (radioActualCustomerElement.checked) {

        textPickupPersonElement.value =
            searchCustomerElement.value;
        pickup.pickup_person = textPickupPersonElement.value;

        textPickupPersonElement.readOnly = true;
    }

});
const radioOtherPersonElement = document.querySelector("#radioOtherPerson");
radioOtherPersonElement.addEventListener("change", function () {

    if (radioOtherPersonElement.checked) {

        textPickupPersonElement.value = "";
        textContactNumberElement.value = "";
        dateScheduledPickupElement.value = "";
        datetimeActualPickupElement.value = "";

        textPickupPersonElement.readOnly = false;
        textContactNumberElement.readOnly = false;
        dateScheduledPickupElement.readOnly = false;
        datetimeActualPickupElement.readOnly = false;

    }

});
const tableBodyPickupItemsElement = document.querySelector("#tableBodyPickupItems");
const formPickup = document.querySelector("#formPickup");
searchRentalElement.addEventListener("input", loadRentalDetails);

const buttonSubmit = document.getElementById("buttonSubmit");
const buttonUpdate = document.getElementById("buttonUpdate");
const buttonClear = document.getElementById("buttonClear");
const tableBodyElement = document.querySelector("#tableBodyPickup");


// panel helpers
function showModal() {
    openPanel('panelPickupForm');
}
function hideModal() {
    closePanel('panelPickupForm');
}

// set form mode
function setPickupFormMode(mode = 'new') {
    const titleEl = document.querySelector('#panelPickupForm .offcanvas-title');
    if (titleEl) titleEl.textContent = mode === 'edit' ? 'Edit Pickup' : 'New Pickup';
    if (buttonUpdate) buttonUpdate.style.display = mode === 'edit' ? 'inline-block' : 'none';
    if (buttonSubmit) buttonSubmit.style.display = mode === 'edit' ? 'none' : 'inline-block';
}


// define function for Refreshing the pickup form
function refreshPickupForm() {

    formPickup.reset();
    pickup = new Object();

    buttonUpdate.style.display = "none";
    buttonSubmit.style.display = "block";

    // Auto fill current date & time
    const now = new Date();

    datetimeActualPickupElement.value =
        now.toISOString().slice(0, 16);

    pickup.actualpickupdateandtime =
        now.toISOString().slice(0, 19);

    selectPickupStatusElement.value = "Scheduled";
    pickup.pickupStatus = "Scheduled";

    let customers = getServiceRequest("/customer/alldata");

    populateDataList(
        document.getElementById("listCustomer"),
        searchCustomerElement,
        hiddenCustomerElement,
        customers,
        (c) => c.firstname + " " + c.lastname,
        "id"
    );

    searchCustomerElement.addEventListener("input", () => {

        const customer = customers.find(c =>
            (c.firstname + " " + c.lastname) === searchCustomerElement.value
        );

        if (!customer) {
            return;
        }

        hiddenCustomerElement.value = customer.id;

        let rentals = getServiceRequest("/rental/alldata");

        const rental = rentals.find(r => r.customer_id.id === customer.id);

        if (!rental) {
            showToast("No rental found for this customer.", "warning");
            return;
        }
        hiddenRentalElement.value = rental.id;
        searchRentalElement.value = rental.rent_no;

        dateScheduledPickupElement.value = rental.pickup_date;
        pickup.schedulepickup_date = rental.pickup_date;

        console.log(rental);
        refreshPickupItemsTable(rental);
        if (radioActualCustomerElement.checked) {

            textPickupPersonElement.value =
                customer.firstname + " " + customer.lastname;

            pickup.pickup_person = textPickupPersonElement.value;

            // Auto load contact number
            textContactNumberElement.value = customer.mobile;
            pickup.contact_no = customer.mobile;

            textPickupPersonElement.readOnly = true;
        }

    });

    //contact number valdation
    textContactNumberElement.addEventListener("input", function () {

        // Allow only numbers
        this.value = this.value.replace(/[^0-9]/g, "");

        // Maximum 10 digits
        if (this.value.length > 10) {
            this.value = this.value.substring(0, 10);
        }

        pickup.contact_no = this.value;

        // Validate Sri Lankan mobile number
        if (/^(070|071|072|074|075|076|077|078)\d{7}$/.test(this.value)) {

            setValid(textContactNumberElement);

        } else {

            setInvalid(textContactNumberElement);

        }

    });
    radioActualCustomer.checked = true;
    textPickupPersonElement.readOnly = true;

    clearElement([
        searchCustomerElement,
        searchRentalElement,
        textPickupPersonElement,
        textContactNumberElement,
        dateScheduledPickupElement,
        datetimeActualPickupElement,
    ]);
    clearValidation(searchRentalElement);

    setPickupFormMode('new');
}


radioActualCustomer.addEventListener("change", () => {

    textPickupPersonElement.value = searchCustomerElement.value;
    pickup.pickup_person = textPickupPersonElement.value;

    textPickupPersonElement.readOnly = true;

});

radioOtherPerson.addEventListener("change", () => {

    textPickupPersonElement.value = "";
    pickup.pickup_person = "";

    textPickupPersonElement.readOnly = false;
    textPickupPersonElement.focus();

});
// define function for Refresh the pickup table
function refreshPickupTable() {

    let pickups = getServiceRequest("/pickup/alldata");

    console.log("Pickups =", pickups);

    if (!Array.isArray(pickups)) {
        pickups = Object.values(pickups || {});
    }

    let propertyList = [
        { propertyName: "id", dataType: "number" },
        { propertyName: getCustomer, dataType: "function" },
        { propertyName: getRental, dataType: "function" },
        { propertyName: "pickup_person", dataType: "string" },
        { propertyName: "contact_no", dataType: "string" },
        { propertyName: "schedulepickup_date", dataType: "date" },
        { propertyName: displayPickup_Status, dataType: "function" }
    ];

    console.log(pickups);

    fillDataIntoTable(
        tableBodyElement,
        pickups,
        propertyList,
        refillPickupForm,
        pickupDelete,
        printPickup
    );

    console.log("Table Filled");
}

const getCustomer = (obj) => {
    return (obj.rental_id && obj.rental_id.customer_id) ?
        obj.rental_id.customer_id.firstname : "";
}

const getRental = (obj) => {
    return obj.rental_id ?
        obj.rental_id.rent_no : "";
}
const displayPickup_Status = (dataObject) => {
    return getEnumDisplayName("pickUpStatus", dataObject.pickupStatus);
}

// Check form errors
function checkFormError() {
    let errors = "";
    if (!hiddenRentalElement.value) {
        errors += "Rental is required..!\n";
        setInvalid(searchRentalElement);
    } else {
        setValid(searchRentalElement);
    }
    if (!searchCustomerElement.value) {
        errors += "Customer is required..!\n";
    }
    if (!dateScheduledPickupElement.value) {
        errors += "Scheduled Pickup Date is required..!\n";
        setInvalid(dateScheduledPickupElement);
    } else {
        setValid(dateScheduledPickupElement);
    }
    if (!textContactNumberElement.value) {
        errors += "Contact Number is required..!\n";
        setInvalid(textContactNumberElement);
    } else {
        setValid(textContactNumberElement);
    }

    return errors;
}

// Define function for Submit pickup form
function submitPickupForm() {

    pickup.rental_id = hiddenRentalElement.value ? { id: parseInt(hiddenRentalElement.value) } : null;
    pickup.pickup_person = textPickupPersonElement.value;
    pickup.contact_no = textContactNumberElement.value;

    pickup.schedulepickup_date = dateScheduledPickupElement.value;

    pickup.actualpickupdateandtime =
        datetimeActualPickupElement.value
            ? datetimeActualPickupElement.value + ":00"
            : null;

    let errors = checkFormError();

    if (errors == "") {
        showConfirm("Submit Pickup", "Are you sure to submit the form?", "Submit", "primary").then(confirmed => {
            if (!confirmed) return;
            let serviceResponse = getHTTPServicesRequest("/pickup/insert", "POST", pickup);
            if (serviceResponse == "OK") {

                showToast("Form submitted successfully!", "success");

                refreshPickupForm();
                refreshPickupTable();
                closePanel('panelPickupForm');
            } else {
                showToast("Form submission cancelled..! Have some errors.. " + serviceResponse, "error");
            }
        });
    } else {
        showToast("Please fill all required fields correctly..! " + errors, "error");
    }
}

// Define function for Delete pickup
const pickupDelete = (dataObject) => {
    showConfirm("Delete Pickup", "Are you sure to delete pickup #" + dataObject.id + " ?", "Delete", "danger").then(confirmed => {
        if (!confirmed) return;
        let deleteResponse = getHTTPServicesRequest("/pickup/delete", "DELETE", dataObject);
        if (deleteResponse == "OK") {

            showToast("Pickup deleted successfully!", "success");

            refreshPickupForm();
            refreshPickupTable();
            closePanel('panelPickupForm');
        } else {
            showToast("Pickup deletion cancelled..! Have some errors.. " + deleteResponse, "error");
        }
    });
};

// define function for print
function printPickup(p) {
    if (!p) return;
    const customerName = (p.rental_id && p.rental_id.customer_id)
        ? p.rental_id.customer_id.firstname + " " + (p.rental_id.customer_id.lastname || "")
        : "";
    const newTab = window.open();
    newTab.document.write(`<html><head><title>Pickup #${escapeHtml(p.id)}</title><link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css"></head><body>
        <div class="card"><div class="card-header bg-primary text-light text-center"><h3>Pickup #${escapeHtml(p.id)}</h3></div>
        <div class="card-body"><table class="table table-bordered">
        <tr><th>Pickup ID</th><td>${escapeHtml(p.id)}</td></tr>
        <tr><th>Customer</th><td>${escapeHtml(customerName)}</td></tr>
        <tr><th>Rental ID</th><td>${escapeHtml(p.rental_id ? p.rental_id.rent_no : '')}</td></tr>
        <tr><th>Scheduled Date</th><td>${escapeHtml(formatDate(p.scheduled_pickup_date))}</td></tr>
        <tr><th>Actual Date</th><td>${escapeHtml(p.actual_pickup_date ? formatDate(p.actual_pickup_date) : 'Pending')}</td></tr>
        <tr><th>Actual Time</th><td>${escapeHtml(p.actual_pickup_time || 'Pending')}</td></tr>
        <tr><th>Pickup Person</th><td>${escapeHtml(p.pickup_person || 'N/A')}</td></tr>
        <tr><th>Contact Number</th><td>${escapeHtml(p.contact_number || 'N/A')}</td></tr>
        <tr><th>Status</th><td>${escapeHtml(getEnumDisplayName("pickUpStatus", p.pickupStatus))}</td></tr>
        <tr><th>Outstanding Balance</th><td>Rs. ${escapeHtml(formatCurrency(p.outstanding_balance))}</td></tr>
        <tr><th>Security Deposit</th><td>Rs. ${escapeHtml(formatCurrency(p.security_deposit))}</td></tr>
        <tr><th>Receipt Number</th><td>${escapeHtml(p.receipt_number || 'N/A')}</td></tr>
        <tr><th>Pickup Notes</th><td>${escapeHtml(p.pickup_notes || '')}</td></tr>
        </table></div></div></body></html>`);
    setTimeout(() => { newTab.print(); newTab.close(); }, 400);
}

// Refill pickup form for update
const refillPickupForm = (dataObject) => {

    pickup = getServiceRequest("/pickup/byid/" + dataObject.id);
    oldPickup = JSON.parse(JSON.stringify(pickup));

    //re-populate rental datalist
    let rentals = getServiceRequest("/rental/alldata");
    populateDataList(
        document.getElementById("listRental"),
        searchRentalElement,
        hiddenRentalElement,
        rentals,
        (r) => r.rent_no,
        "id"
    );
    setSelectedByHiddenId(searchRentalElement, hiddenRentalElement, rentals, (r) => r.rent_no, "id", pickup.rental_id?.id);


    //setSelectedByHiddenId(searchAssignedStaffElement, hiddenAssignedStaffElement, staff, (s) => s.employee_id + " - " + s.fullname, "id", pickup.assigned_staff);

    // Customer
    searchCustomerElement.value =
        pickup.rental_id.customer_id.firstname + " " +
        pickup.rental_id.customer_id.lastname;

    // Rental
    searchRentalElement.value = pickup.rental_id.rent_no;
    hiddenRentalElement.value = pickup.rental_id.id;
    // ADD THIS LINE
    refreshPickupItemsTable(pickup.rental_id);

    // Pickup Person
    textPickupPersonElement.value = pickup.pickup_person;

    // Contact Number
    textContactNumberElement.value = pickup.contact_no;

    // Scheduled Pickup Date
    dateScheduledPickupElement.value = pickup.schedulepickup_date;

    // Actual Pickup Date & Time
    if (pickup.actualpickupdateandtime != null) {
        datetimeActualPickupElement.value =
            pickup.actualpickupdateandtime.substring(0, 16);
    }

    // Pickup Status
    selectPickupStatusElement.value = pickup.pickupStatus;
    buttonUpdate.style.display = "block";
    buttonSubmit.style.display = "none";

    setPickupFormMode('edit');

    openPanel('panelPickupForm');

};

// Check form updates for update confirmation message
const checkFormUpdates = () => {

    let updates = "";

    if (pickup.customer_id != oldPickup.customer_id) {
        updates += "Customer changed from " + oldPickup.customer_id + " to " + pickup.customer_id + "\n";
    }
    if (pickup.rental_id != oldPickup.rental_id) {
        updates += "Rental ID changed from " + oldPickup.rental_id + " to " + pickup.rental_id + "\n";
    }
    if (pickup.scheduled_pickup_date != oldPickup.scheduled_pickup_date) {
        updates += "Scheduled Pickup Date changed from " + oldPickup.scheduled_pickup_date + " to " + pickup.scheduled_pickup_date + "\n";
    }
    if (pickup.scheduled_pickup_time != oldPickup.scheduled_pickup_time) {
        updates += "Scheduled Pickup Time changed from " + oldPickup.scheduled_pickup_time + " to " + pickup.scheduled_pickup_time + "\n";
    }
    if (pickup.actual_pickup_date != oldPickup.actual_pickup_date) {
        updates += "Actual Pickup Date changed from " + oldPickup.actual_pickup_date + " to " + pickup.actual_pickup_date + "\n";
    }
    if (pickup.actual_pickup_time != oldPickup.actual_pickup_time) {
        updates += "Actual Pickup Time changed from " + oldPickup.actual_pickup_time + " to " + pickup.actual_pickup_time + "\n";
    }
    if (pickup.pickup_person != oldPickup.pickup_person) {
        updates += "Pickup Person changed from " + oldPickup.pickup_person + " to " + pickup.pickup_person + "\n";
    }
    if (pickup.contact_number != oldPickup.contact_number) {
        updates += "Contact Number changed from " + oldPickup.contact_number + " to " + pickup.contact_number + "\n";
    }
    if (pickup.pickup_location != oldPickup.pickup_location) {
        updates += "Pickup Location changed from " + oldPickup.pickup_location + " to " + pickup.pickup_location + "\n";
    }
    if (pickup.outstanding_balance != oldPickup.outstanding_balance) {
        updates += "Outstanding Balance changed from " + oldPickup.outstanding_balance + " to " + pickup.outstanding_balance + "\n";
    }
    if (pickup.security_deposit != oldPickup.security_deposit) {
        updates += "Security Deposit changed from " + oldPickup.security_deposit + " to " + pickup.security_deposit + "\n";
    }
    if (pickup.receipt_number != oldPickup.receipt_number) {
        updates += "Receipt Number changed from " + oldPickup.receipt_number + " to " + pickup.receipt_number + "\n";
    }
    if (pickup.status != oldPickup.status) {
        updates += "Status changed from " + oldPickup.status + " to " + pickup.status + "\n";
    }
    if (pickup.notes != oldPickup.notes) {
        updates += "Notes changed from " + oldPickup.notes + " to " + pickup.notes + "\n";
    }
    return updates;
};

// Update pickup details
const updatePickupForm = () => {

    pickup.rental_id = hiddenRentalElement.value ? { id: parseInt(hiddenRentalElement.value) } : null;
    pickup.pickup_person = textPickupPersonElement.value;
    pickup.contact_number = textContactNumberElement.value;
    pickup.scheduled_pickup_date = dateScheduledPickupElement.value;
    pickup.actual_pickup_date = datetimeActualPickupElement.value ? datetimeActualPickupElement.value.split("T")[0] : null;
    pickup.actual_pickup_time = datetimeActualPickupElement.value ? datetimeActualPickupElement.value.split("T")[1] : null;

    let errors = checkFormError();
    if (errors == "") {
        let updates = checkFormUpdates();
        if (updates == "") {
            showToast("No changes detected to update.", "warning");
        } else {
            showConfirm("Update Pickup", "Are you sure to update the pickup details with following changes?\n" + updates, "Update", "primary").then(confirmed => {
                if (!confirmed) return;
                let updateResponse = getHTTPServicesRequest("/pickup/update", "PUT", pickup);
                if (updateResponse == "OK") {
                    showToast("Pickup details updated successfully!", "success");

                    refreshPickupForm();
                    refreshPickupTable();

                    closePanel('panelPickupForm');
                } else {
                    showToast("Pickup update cancelled..! Have some errors.. " + updateResponse, "error");
                }
            });
        }
    } else {
        showToast("Please fill all required fields correctly..! " + errors, "error");
        return;
    }
};

function loadRentalDetails() {

    const val = searchRentalElement.value;
    let rentals = getServiceRequest("/rental/alldata");
    const match = rentals.find(r => r.rent_no === val);

    if (match) {
        hiddenRentalElement.value = match.id;

        let customerName =
            match.customer_id.firstname + " " +
            match.customer_id.lastname;

        searchCustomerElement.value = customerName;

        textContactNumberElement.value =
            match.customer_id.mobile;

        refreshPickupItemsTable(match);

        if (radioActualCustomerElement.checked) {

            textPickupPersonElement.value = customerName;

            dateScheduledPickupElement.value =
                match.pickup_date.split("T")[0];

            textContactNumberElement.value =
                match.customer_id.mobile;

        }
    }
}

function refreshPickupItemsTable(selectedRental) {

    tableBodyPickupItemsElement.innerHTML = "";

    selectedRental.rentalHasItemList.forEach(function (itemRow) {

        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${itemRow.item_id.item_name}</td>
            <td>${itemRow.quantity}</td>
            <td>
                <input type="checkbox" class="form-check-input">
            </td>
        `;

        tableBodyPickupItemsElement.appendChild(row);

    });

}
