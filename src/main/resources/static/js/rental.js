// element refs
const searchCustomerElement = document.querySelector("#searchCustomer");
const hiddenCustomerIdElement = document.querySelector("#selectCustomerId");
const dateAppointmentElement = document.querySelector("#dateAppointment");
const dateFunctionElement = document.querySelector("#dateFunction");
const dateFittonElement = document.querySelector("#dateFitton");
const datePickupElement = document.querySelector("#datePickup");
const dateReturnElement = document.querySelector("#dateReturn");
const textKeyMoneyElement = document.querySelector("#textKeyMoney");
const selectStatusElement = document.querySelector("#selectStatus");
const textTotalChargeElement = document.querySelector("#textTotalCharge");
const textAdvanceElement = document.querySelector("#textAdvance");
const textNotesElement = document.querySelector("#textNotes");

const buttonSubmit = document.getElementById("buttonSubmit");
const buttonUpdate = document.getElementById("buttonUpdate");
const buttonClear = document.getElementById("buttonClear");
const tableBodyElement = document.querySelector("#tableBodyRental");

// item list elements
const searchItemElement = document.querySelector("#searchItem");
const hiddenItemElement = document.querySelector("#selectItem");
const listItemElement = document.querySelector("#listItem");
const selectItemCategoryElement = document.querySelector("#selectItemCategory");
selectItemCategoryElement.addEventListener("change", filterItemsByCategory);

const textItemPriceElement = document.querySelector("#textItemPrice");
const textItemQtyElement = document.querySelector("#textItemQty");
const textAlterationNoteElement = document.querySelector("#textAlterationNote");
const switchAlterationElement = document.querySelector("#switchAlterationRequired");
switchAlterationElement.addEventListener("change", () => {
    if (switchAlterationElement.checked) {
        textAlterationNoteElement.disabled = false;
    } else {
        textAlterationNoteElement.disabled = true;
        textAlterationNoteElement.value = "";
    }
});
const tableBodySelectedItemsInnerForm = document.querySelector("#tableBodySelectedItemsInnerForm");

// panel helpers
function showModal() {
    openPanel('panelRentalForm');
}
function hideModal() {
    closePanel('panelRentalForm');
}

// set form mode
function setRentalFormMode(mode = 'new') {
    const titleEl = document.querySelector('#panelRentalForm .offcanvas-title');
    if (titleEl) titleEl.textContent = mode === 'edit' ? 'Edit Rental' : 'New Rental';
    if (buttonUpdate) buttonUpdate.style.display = mode === 'edit' ? 'inline-block' : 'none';
    if (buttonSubmit) buttonSubmit.style.display = mode === 'edit' ? 'none' : 'inline-block';
}

// init
window.addEventListener("load", () => {
    // Refresh main form and table
    refreshRentalForm();
    refreshRentalTable();
    // Refresh inner form and table
    refreshRentalInnerForm();
    refreshRentalInnerTable();
});
//***********start of the main form area************

// define function for refresh form
function refreshRentalForm() {

    formRental.reset();

    rental = new Object();
    rental.rentalStatus = "Active";
    rental.rentalHasItemList = new Array();

    refreshRentalInnerForm();
    refreshRentalInnerTable();

    buttonUpdate.style.display = "none";
    buttonSubmit.style.display = "block";

    //get all customers as datalist
    let customers = getServiceRequest("/customer/alldata");
    populateDataList(
        document.getElementById("listCustomer"),
        searchCustomerElement,
        hiddenCustomerIdElement,
        customers,
        (c) => c.firstname + " " + (c.lastname || ""),
        "id"
    );

    fillSelectFromEnum(selectStatusElement, "rentalStatus", "Please select status...!");

    selectStatusElement.value = "Active";
    rental.rentalStatus = "Active";

    clearElement([dateAppointmentElement, dateFunctionElement, dateFittonElement, datePickupElement, dateReturnElement, textKeyMoneyElement, textTotalChargeElement, textAdvanceElement, textNotesElement]);
    clearValidation(searchCustomerElement);

    setRentalFormMode('new');

}

// define function for refresh table
function refreshRentalTable() {
    rentals = getServiceRequest("/rental/alldata");

    if (!Array.isArray(rentals)) {
        rentals = Object.values(rentals || {});
    }
    const propertyList = [
        { propertyName: getCustomer, dataType: "function" },
        { propertyName: "appointment_date", dataType: "date" },
        { propertyName: "function_date", dataType: "date" },
        { propertyName: "fitton_date", dataType: "date" },
        { propertyName: "pickup_date", dataType: "date" },
        { propertyName: "return_date", dataType: "date" },
        { propertyName: "keymoney", dataType: "currency" },
        { propertyName: getStatus, dataType: "function" },
        { propertyName: "total_charge", dataType: "currency" },
        { propertyName: "advance", dataType: "currency" },
    ];
    fillDataIntoTable(tableBodyElement, rentals, propertyList, refillRentalForm, deleteRental, printRental);
}


// Defensive override to prevent TypeError if customer_id or firstname is missing
const getCustomer = (obj) => {
    return (obj && obj.customer_id && obj.customer_id.firstname) ? obj.customer_id.firstname : "";
}

const getStatus = (obj) => {
    return getEnumDisplayName("rentalStatus", obj.rentalStatus);
}

// Defensive override to prevent TypeError if rental. is undefined
function checkRentalFormErrors() {

    let errors = "";

    if (!hiddenCustomerIdElement.value) {
        errors += "Please select customer..!\n";
        setInvalid(searchCustomerElement);
    } else {
        setValid(searchCustomerElement);
    }

    //********appointment date check errors and validation
    if (!dateAppointmentElement.value) {
        errors += "Appointment date is required.\n";
        setInvalid(dateAppointmentElement);
    } else {
        setValid(dateAppointmentElement);
    }

    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let appointmentDate = new Date(dateAppointmentElement.value);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
        errors += "Appointment Date cannot be in the past.\n";
        setInvalid(dateAppointmentElement);
    } else {
        setValid(dateAppointmentElement);
    }


//********function date check errors and validation
    if (!rental.function_date) {
        errors += "Function date is required.\n";
        setInvalid(dateFunctionElement);
    } else {
        setValid(dateFunctionElement);
    }

    // Function Date must be after Appointment Date
    if (dateAppointmentElement.value && dateFunctionElement.value) {

        let appointmentDate = new Date(dateAppointmentElement.value);
        let functionDate = new Date(dateFunctionElement.value);

        if (functionDate < appointmentDate) {
            errors += "Function Date cannot be before the Appointment Date.\n";
            setInvalid(dateFunctionElement);
        }
    }

//**************** Fitton Date Validation ****************

//**************** Fitton Date Validation ****************

if (!rental.fitton_date) {

    errors += "Fitton Date is required.\n";
    setInvalid(dateFittonElement);

} else {

    let appointmentDate = new Date(dateAppointmentElement.value);
    let fittonDate = new Date(dateFittonElement.value);
    let functionDate = new Date(dateFunctionElement.value);

    appointmentDate.setHours(0,0,0,0);
    fittonDate.setHours(0,0,0,0);
    functionDate.setHours(0,0,0,0);

    let fittonError = false;

    // Fitton cannot be before Appointment
    if (fittonDate < appointmentDate) {
        errors += "Fitton Date cannot be before the Appointment Date.\n";
        fittonError = true;
    }

    // Fitton cannot be after Function
    if (fittonDate > functionDate) {
        errors += "Fitton Date cannot be after the Function Date.\n";
        fittonError = true;
    }

    // Alteration
    if (switchAlterationElement.checked) {

        let minimumFunctionDate = new Date(fittonDate);
        minimumFunctionDate.setDate(minimumFunctionDate.getDate() + 5);

        if (functionDate < minimumFunctionDate) {
            errors += "When alteration is required, the Function Date must be at least 5 days after the Fitton Date.\n";
            fittonError = true;
        }

    }

    if (fittonError) {
        setInvalid(dateFittonElement);
    } else {
        setValid(dateFittonElement);
    }

}

// ******************* Pickup Date Validation ***********************

if (!rental.pickup_date) {

    errors += "Please select the Pickup Date.\n";
    setInvalid(datePickupElement);

} else {

    let pickupDate = new Date(datePickupElement.value);
    let appointmentDate = new Date(dateAppointmentElement.value);
    let fittonDate = new Date(dateFittonElement.value);
    let functionDate = new Date(dateFunctionElement.value);

    pickupDate.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    fittonDate.setHours(0, 0, 0, 0);
    functionDate.setHours(0, 0, 0, 0);

    let pickupError = false;

    // Pickup cannot be before Appointment Date
    if (pickupDate < appointmentDate) {
        errors += "Pickup Date cannot be before the Appointment Date.\n";
        pickupError = true;
    }

    // Pickup cannot be before Fitton Date
    if (pickupDate < fittonDate) {
        errors += "Pickup Date cannot be before the Fitton Date.\n";
        pickupError = true;
    }

    // Pickup cannot be after Function Date
    if (pickupDate > functionDate) {
        errors += "Pickup Date cannot be after the Function Date.\n";
        pickupError = true;
    }

    // **************** Alteration Validation ****************
    if (switchAlterationElement.checked) {

        // Function Date must be at least 5 days after Fitton Date
        let minimumFunctionDate = new Date(fittonDate);
        minimumFunctionDate.setDate(minimumFunctionDate.getDate() + 5);

        if (functionDate < minimumFunctionDate) {
            errors += "At least 5 days are required between the Fitton Date and the Function Date for alteration.\n";
            pickupError = true;
        }

        // Pickup cannot be the same as Appointment Date
        if (pickupDate.getTime() === appointmentDate.getTime()) {
            errors += "Pickup Date cannot be the same as the Appointment Date when alteration is required.\n";
            pickupError = true;
        }

        // Pickup cannot be the same as Fitton Date
        if (pickupDate.getTime() === fittonDate.getTime()) {
            errors += "Pickup Date cannot be the same as the Fitton Date when alteration is required.\n";
            pickupError = true;
        }

        // Pickup cannot be the same as Function Date
        if (pickupDate.getTime() === functionDate.getTime()) {
            errors += "Pickup Date cannot be the same as the Function Date when alteration is required.\n";
            pickupError = true;
        }

    }
}
    // Final Validation
    if (pickupError) {
        setInvalid(datePickupElement);
    } else {
        setValid(datePickupElement);
    }

    if (!rental.return_date) {
        errors += "Please enter valid return date..!\n";
        setInvalid(dateReturnElement);
    } else {
        setValid(dateReturnElement);
    }
    if (!rental.keymoney) {
        errors += "Please enter valid key money amount..!\n";
        setInvalid(textKeyMoneyElement);
    } else {
        setValid(textKeyMoneyElement);
    }
    if (!rental.rentalStatus) {
        errors += "Please select status..!\n";
        setInvalid(selectStatusElement);
    } else {
        setValid(selectStatusElement);
    }
    if (!rental.total_charge) {
        errors += "Please enter valid total charge amount..!\n";
        setInvalid(textTotalChargeElement);
    } else {
        setValid(textTotalChargeElement);
    }
    if (!rental.advance) {
        errors += "Please enter valid advance amount..!\n";
        setInvalid(textAdvanceElement);
    } else {
        setValid(textAdvanceElement);
    }
    if (!Array.isArray(rental.rentalHasItemList) || rental.rentalHasItemList.length === 0) {
        errors += "Please add at least one rental item..!\n";
    }

    return errors;
}
//define function for submit new rental form
function submitRentalForm() {

    // Map hidden ID to rental object
    rental.customer_id = hiddenCustomerIdElement.value ? { id: parseInt(hiddenCustomerIdElement.value) } : null;
    rental.appointment_date = dateAppointmentElement.value;
    rental.function_date = dateFunctionElement.value;
    rental.fitton_date = dateFittonElement.value;
    rental.pickup_date = datePickupElement.value;
    rental.return_date = dateReturnElement.value;
    rental.keymoney = textKeyMoneyElement.value;
    rental.total_charge = textTotalChargeElement.value;
    rental.advance = textAdvanceElement.value;
    rental.rentalStatus = selectStatusElement.value;
    rental.note = textNotesElement.value;

    const errors = checkRentalFormErrors();

    if (errors == "") {
        showConfirm("Submit Rental", "Are you sure to submit the form ?", "Submit", "primary").then(confirmed => {
            if (!confirmed) return;

            let serviceResponse = getHTTPServicesRequest("/rental/insert", "POST", rental);
            if (serviceResponse == "OK") {

                showToast("Form submitted successfully!", "success");

                refreshRentalForm();
                refreshRentalTable();
                closePanel('panelRentalForm');
            } else {
                showToast("Form submission cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
            }
        });
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
    }
}

//define function for delete rental
function deleteRental(obj) {

    showConfirm("Delete Rental", "Are you sure to delete rental : " + obj.rent_no + " ?", "Delete", "danger").then(confirmed => {
        if (!confirmed) return;

        let serviceResponse = getHTTPServicesRequest("/rental/delete", "DELETE", obj);
        if (serviceResponse == "OK") {

            showToast("Rental deleted successfully!", "success");

            refreshRentalForm();
            refreshRentalTable();
            closePanel('panelRentalForm');
        } else {
            showToast("Rental deletion cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
        }
    });
}

//define function for print rental details
function printRental(obj) {
    const items = obj.rentalHasItemList || [];
    let itemRows = items.map(item =>
        `<tr>
            <td>${escapeHtml(item.item_id ? item.item_id.itemcode : "")}</td>
            <td>${escapeHtml(item.item_id ? item.item_id.item_name : "")}</td>
            <td>Rs. ${formatCurrency(item.item_price)}</td>
            <td>${escapeHtml(item.quantity)}</td>
            <td>Rs. ${formatCurrency(item.item_price * item.quantity)}</td>
        </tr>`
    ).join("");

    if (!itemRows) {
        itemRows = `<tr><td colspan="5" class="text-center text-muted">No items</td></tr>`;
    }

    const newTab = window.open();
    newTab.document.write(`<!DOCTYPE html><html><head><title>Rental ${escapeHtml(obj.rent_no || "")}</title>
        <link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="/Resources/fontawesome-7.0.0/css/all.min.css">
        <link rel="stylesheet" href="/Resources/css/common.css">
        </head><body><div class="print-card">
        <div class="print-header">
            <h3><i class="fa-solid fa-shirt me-2"></i>Rental Details</h3>
            <p>${escapeHtml(obj.rent_no || "")}</p>
        </div>
        <div class="print-body">
        <table>
            <tr><th>Rental No</th><td>${escapeHtml(obj.rent_no || "N/A")}</td></tr>
            <tr><th>Customer</th><td>${escapeHtml(getCustomer(obj))}</td></tr>
            <tr><th>Appointment Date</th><td>${formatDate(obj.appointment_date)}</td></tr>
            <tr><th>Function Date</th><td>${formatDate(obj.function_date)}</td></tr>
            <tr><th>Fitton Date</th><td>${formatDate(obj.fitton_date)}</td></tr>
            <tr><th>Pickup Date</th><td>${formatDate(obj.pickup_date)}</td></tr>
            <tr><th>Return Date</th><td>${formatDate(obj.return_date)}</td></tr>
            <tr><th>Key Money</th><td>Rs. ${formatCurrency(obj.keymoney)}</td></tr>
            <tr><th>Status</th><td>${escapeHtml(capitalize(getStatus(obj)))}</td></tr>
            <tr><th>Total Charge</th><td>Rs. ${formatCurrency(obj.total_charge)}</td></tr>
            <tr><th>Advance</th><td>Rs. ${formatCurrency(obj.advance)}</td></tr>
            <tr><th>Note</th><td>${escapeHtml(obj.note || "N/A")}</td></tr>
        </table>
        ${items.length > 0 ? `<h6 class="mt-3 mb-2"><i class="fa-solid fa-box-open me-2"></i>Rental Items</h6>
        <table class="table table-bordered">
            <thead><tr><th>Item Code</th><th>Item Name</th><th>Price</th><th>Quantity</th><th>Line Total</th></tr></thead>
            <tbody>${itemRows}</tbody>
        </table>` : ""}
        </div>
        <div class="print-footer">Printed on ${new Date().toLocaleDateString("en-LK")} | Salon DEEN</div>
        </div></body></html>`);
    setTimeout(() => { newTab.print(); newTab.close(); }, 500);
}

//define function for refill rental form for update
function refillRentalForm(obj) {

    rental = getServiceRequest("/rental/byid/" + obj.id);
    oldRental = JSON.parse(JSON.stringify(rental));

    //customer options as datalist
    let customers = getServiceRequest("/customer/alldata");
    populateDataList(
        document.getElementById("listCustomer"),
        searchCustomerElement,
        hiddenCustomerIdElement,
        customers,
        (c) => c.firstname + " " + (c.lastname || ""),
        "id"
    );
    setSelectedByHiddenId(searchCustomerElement, hiddenCustomerIdElement, customers, (c) => c.firstname + " " + (c.lastname || ""), "id", rental.customer_id?.id);

    //rental status genarate karana function
    fillSelectFromEnum(selectStatusElement, "rentalStatus", "Please select status...!");
    selectStatusElement.value = rental.rentalStatus;

    dateAppointmentElement.value = rental.appointment_date;
    dateFunctionElement.value = rental.function_date;
    dateFittonElement.value = rental.fitton_date;
    datePickupElement.value = rental.pickup_date;
    dateReturnElement.value = rental.return_date;
    textKeyMoneyElement.value = rental.keymoney;
    textTotalChargeElement.value = rental.total_charge;
    textAdvanceElement.value = rental.advance;
    textNotesElement.value = rental.note;

    buttonUpdate.style.display = "block";
    buttonSubmit.style.display = "none";

    setRentalFormMode('edit');

    openPanel('panelRentalForm');
}

////define function for check form updates
const checkFormUpdates = () => {

    let updates = "";

    if (rental.customer_id !== oldRental.customer_id) {
        updates += "Customer changed from " + oldRental.customer_id + " to " + rental.customer_id + "\n";
    }
    if (rental.appointment_date !== oldRental.appointment_date) {
        updates += "Appointment date changed from " + oldRental.appointment_date + " to " + rental.appointment_date + "\n";
    }
    if (rental.function_date !== oldRental.function_date) {
        updates += "Function date changed from " + oldRental.function_date + " to " + rental.function_date + "\n";
    }
    if (rental.fitton_date !== oldRental.fitton_date) {
        updates += "Fitton date changed from " + oldRental.fitton_date + " to " + rental.fitton_date + "\n";
    }
    if (rental.pickup_date !== oldRental.pickup_date) {
        updates += "Pickup date changed from " + oldRental.pickup_date + " to " + rental.pickup_date + "\n";
    }
    if (rental.return_date !== oldRental.return_date) {
        updates += "Return date changed from " + oldRental.return_date + " to " + rental.return_date + "\n";
    }
    if (rental.keymoney !== oldRental.keymoney) {
        updates += "Key money changed from " + oldRental.keymoney + " to " + rental.keymoney + "\n";
    }
    if (rental.rental_status !== oldRental.rental_status) {
        updates += "Status changed from " + oldRental.rental_status + " to " + rental.rental_status + "\n";
    }
    if (rental.total_charge !== oldRental.total_charge) {
        updates += "Total charge changed from " + oldRental.total_charge + " to " + rental.total_charge + "\n";
    }
    if (rental.advance !== oldRental.advance) {
        updates += "Advance changed from " + oldRental.advance + " to " + rental.advance + "\n";
    }
    if (rental.note !== oldRental.note) {
        updates += "Notes changed from " + oldRental.note + " to " + rental.note + "\n";
    }

    return updates;
}

//define function for update rental details
function buttonRentalUpdate() {

    // Map hidden ID to rental object
    rental.customer_id = hiddenCustomerIdElement.value ? { id: parseInt(hiddenCustomerIdElement.value) } : null;
    rental.appointment_date = dateAppointmentElement.value;
    rental.function_date = dateFunctionElement.value;
    rental.fitton_date = dateFittonElement.value;
    rental.pickup_date = datePickupElement.value;
    rental.return_date = dateReturnElement.value;
    rental.keymoney = textKeyMoneyElement.value;
    rental.total_charge = textTotalChargeElement.value;
    rental.advance = textAdvanceElement.value;
    rental.rental_status = selectStatusElement.value;
    rental.note = textNotesElement.value;

    let errors = checkRentalFormErrors();
    if (errors == "") {
        let updates = checkFormUpdates();
        if (updates == "") {
            showToast("No changes detected to update.", "info");
        } else {
            showConfirm("Update Rental", "Are you sure to update the rental with following changes..? \n" + updates, "Update", "primary").then(confirmed => {
                if (!confirmed) return;

                let serviceResponse = getHTTPServicesRequest("/rental/update", "PUT", rental);
                if (serviceResponse == "OK") {

                    showToast("Rental updated successfully!", "success");

                    refreshRentalForm();
                    refreshRentalTable();
                    closePanel('panelRentalForm');
                } else {
                    showToast("Rental update cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
                }
            });
        }
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
    }

}
//***********end of the main form area*************

//***********start of the inner form area************
function checkFormError() {
    let errors = "";
    if (!hiddenItemElement.value) errors += "Item is required.\n";
    if (!textItemPriceElement.value || textItemPriceElement.value <= 0) errors += "Item price is required.\n";
    if (!textItemQtyElement.value || textItemQtyElement.value <= 0) errors += "Quantity is required.\n";
    return errors;
}

function refreshRentalInnerForm() {

    rentalInner = new Object();

    textAlterationNoteElement.disabled = true;
    switchAlterationElement.checked = false;

    let categories = getServiceRequest("/itemcategory/alldata");;

    console.log(categories);

    fillDataIntoSelect(selectItemCategoryElement, "Select Category", categories, "name");

    //item options as datalist
    let items = getServiceRequest("/item/alldata");
    populateDataList(
        listItemElement,
        searchItemElement,
        hiddenItemElement,
        items,
        (item) => item.item_name + " (" + item.itemcode + ")",
        "id"
    );

    clearElement([selectItemCategoryElement, textItemPriceElement, textItemQtyElement, textAlterationNoteElement]);
    textItemQtyElement.value = 1;
    textTotalChargeElement.value = rental.total_charge;
    clearValidation(searchItemElement);

    // Clear hidden item id
    hiddenItemElement.value = "";

    // Reset quantity
    textItemQtyElement.value = 1;

    // Reset alteration switch
    switchAlterationElement.checked = false;

    // Disable and clear alteration note
    textAlterationNoteElement.value = "";
    textAlterationNoteElement.disabled = true;

    // Clear item search
    searchItemElement.value = "";

    // Clear total price field of inner form
    textItemPriceElement.value = "";
}

//define function for refresh inner table
function refreshRentalInnerTable() {

    const propertyList = [
        { propertyName: getItemCode, dataType: "function" },
        { propertyName: getItemName, dataType: "function" },
        { propertyName: "item_price", dataType: "string" },
        { propertyName: "quantity", dataType: "string" },
        { propertyName: getTotal, dataType: "function" }
    ];
    fillDataIntoInnerTable(tableBodySelectedItemsInnerForm, rental.rentalHasItemList, propertyList, refillRentalInnerForm, deleteRentalItem);

}

const getAlteration = (obj) => {
    return obj.alteration_required ? "Yes" : "No";
}

const getItem = (obj) => {
    return obj.item_id.itemcode + " - " + obj.item_id.item_name;
}

const getItemCode = (obj) => {
    return obj.item_id.itemcode;
}

const getItemName = (obj) => {
    return obj.item_id.item_name;
}

const getTotal = (obj) => {
    return obj.item_price * obj.quantity;
}

//define function for submit new rental item detail
function buttonInnerRentalSubmit() {

    let errors = checkFormError();
    if (errors == "") {
        showConfirm("Submit Item", "Are you sure to submit the form ?", "Submit", "primary").then(confirmed => {
            if (!confirmed) return;

            // Capture alteration fields
            rentalInner.alteration_required = switchAlterationElement.checked;
            rentalInner.alteration_note = textAlterationNoteElement ? textAlterationNoteElement.value : "";

            rentalInner.item_price = Number(textItemPriceElement.value);
            rentalInner.quantity = Number(textItemQtyElement.value);

            rental.rentalHasItemList.push(rentalInner);

            let total = 0;

            rental.rentalHasItemList.forEach(item => {
                total += Number(item.item_price) * Number(item.quantity);
            });

            textTotalChargeElement.value = total;
            rental.total_charge = total;
            showToast("Form submitted successfully!", "success");

            refreshRentalInnerForm();
            refreshRentalInnerTable();

            textTotalChargeElement.value = total;
            rental.total_charge = total;
        });
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
    }
}

//define function for delete rental item detail
function deleteRentalItem(obj) {
    showConfirm("Delete Item", "Are you sure to delete this item from rental?", "Delete", "danger").then(confirmed => {
        if (!confirmed) return;

        const idx = rental.rentalHasItemList.indexOf(obj);
        if (idx > -1) {
            rental.rentalHasItemList.splice(idx, 1);
        }
        showToast("Item removed from rental successfully!", "success");

        refreshRentalInnerForm();
        refreshRentalInnerTable();
    });
}

//define function for refill inner form for edit
function refillRentalInnerForm(obj) {

    innerRental = JSON.parse(JSON.stringify(obj));
    oldInnerRental = JSON.parse(JSON.stringify(obj));

    let items = getServiceRequest("/item/alldata");
    populateDataList(
        listItemElement,
        searchItemElement,
        hiddenItemElement,
        items,
        (item) => item.item_name + " (" + item.itemcode + ")",
        "id"
    );
    setSelectedByHiddenId(searchItemElement, hiddenItemElement, items, (item) => item.item_name + " (" + item.itemcode + ")", "id", innerRental.item_id?.id);

    textItemPriceElement.value = innerRental.item_price || "";
    textItemQtyElement.value = innerRental.quantity || 1;

    // Set alteration fields if present
    if (switchAlterationElement) switchAlterationElement.checked = !!innerRental.alteration_required;
    if (textAlterationNoteElement) {
        textAlterationNoteElement.value = innerRental.alteration_note || "";
        textAlterationNoteElement.disabled = !innerRental.alteration_required;
    }

    setRentalFormMode('edit');
}

//define function for check form updates for inner form
const checkFormUpdate = () => {
    let updates = "";

    if (hiddenItemElement.value != (oldInnerRental.item_id?.id)) {
        updates += "Item changed\n";
    }
    if (textItemPriceElement.value != oldInnerRental.item_price) {
        updates += "Price changed from " + oldInnerRental.item_price + " to " + textItemPriceElement.value + "\n";
    }
    if (textItemQtyElement.value != oldInnerRental.quantity) {
        updates += "Quantity changed from " + oldInnerRental.quantity + " to " + textItemQtyElement.value + "\n";
    }
    return updates;
}

// define function for update existing rental item detail
function buttonInnerUpdate() {

    let errors = checkFormError();

    if (errors == "") {
        let updates = checkFormUpdate();
        if (updates == "") {
            showToast("No changes detected to update.", "info");
        } else {
            showConfirm("Update Item", "Are you sure to update the rental item detail with following changes ?\n" + updates, "Update", "primary").then(confirmed => {
                if (!confirmed) return;

                const idx = rental.rentalHasItemList.indexOf(innerRental);
                if (idx > -1) {
                    innerRental.item_id = { id: parseInt(hiddenItemElement.value) };
                    innerRental.item_price = textItemPriceElement.value;
                    innerRental.quantity = textItemQtyElement.value;
                    innerRental.alteration_required = switchAlterationElement.checked;
                    innerRental.alteration_note = textAlterationNoteElement.value;
                    rental.rentalHasItemList[idx] = innerRental;
                }

                showToast("Rental item detail updated successfully!", "success");

                refreshRentalInnerForm();
                refreshRentalInnerTable();
            });
        }
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
    }
}

function addSelectedItem() {

    rentalInner = new Object();

    let allItems = getServiceRequest("/item/alldata");

    let selectedItem = allItems.find(item => item.id == hiddenItemElement.value);

    rentalInner.item_id = selectedItem;

    rentalInner.item_price = textItemPriceElement.value;

    rentalInner.quantity = textItemQtyElement.value;

    console.log(rentalInner);

    rentalInner.alteration_required = switchAlterationElement.checked;

    rentalInner.alteration_note =
        textAlterationNoteElement.value;

    rental.rentalHasItemList.push(rentalInner);

    // Calculate Total Charge
    let total = 0;

    rental.rentalHasItemList.forEach(item => {
        total += Number(item.item_price) * Number(item.quantity);
    });

    textTotalChargeElement.value = total;
    rental.total_charge = total;

    refreshRentalInnerTable();
    refreshRentalInnerForm();
}

function filterItemsByCategory() {

    let allItems = getServiceRequest("/item/alldata");

    let selectedCategory = selectItemCategoryElement.value;

    let filteredItems = allItems.filter(item =>
        item.itemCategory === selectedCategory
    );

    populateDataList(
        listItemElement,
        searchItemElement,
        hiddenItemElement,
        filteredItems,
        (item) => item.item_name + " (" + item.itemcode + ")",
        "id"
    );

    // Wait until user selects an item
    searchItemElement.onchange = function () {

        console.log("Hidden ID:", hiddenItemElement.value);

        let selectedItem = allItems.find(item =>
            item.id == Number(hiddenItemElement.value)
        );

        if (selectedItem) {

            rentalInner.item_id = selectedItem;
            rentalInner.item_price = Number(selectedItem.rental_price);
            textItemPriceElement.value = Number(selectedItem.rental_price);

            console.log("Selected Item =", selectedItem);
        }

    };
}
