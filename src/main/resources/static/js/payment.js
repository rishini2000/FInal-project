//access browser onload event
window.addEventListener("load", () => {
    refreshPaymentForm();
    refreshPaymentTable();
});

// element refs
const searchAppointmentElement = document.querySelector("#searchAppointment");
const textAppointmentIdElement = document.querySelector("#textAppointmentId");
const textAppointmentAmountElement = document.querySelector("#textAppointmentAmount");
const textPayAmountElement = document.querySelector("#textPayAmount");
const textPayBalanceAmountElement = document.querySelector("#textPayBalanceAmount");
const selectPaymentMethodElement = document.querySelector("#selectPaymentMethod");
const textPaymentNoteElement = document.querySelector("#textPaymentNote");

const buttonSubmit = document.getElementById("buttonSubmit");
const buttonUpdate = document.getElementById("buttonUpdate");
const buttonClear = document.getElementById("buttonClear");
const tableBodyElement = document.querySelector("#tableBodyPayment");

// helper to show/hide panel
function showModal() {
    openPanel('panelPaymentForm');
}
function hideModal() {
    closePanel('panelPaymentForm');
}

// set form mode (new | edit)
function setPaymentFormMode(mode = 'new') {
    const titleEl = document.querySelector('#panelPaymentForm .offcanvas-title');
    if (titleEl) titleEl.textContent = mode === 'edit' ? 'Edit Payment' : 'New Payment';
    if (buttonUpdate) buttonUpdate.style.display = mode === 'edit' ? 'inline-block' : 'none';
    if (buttonSubmit) buttonSubmit.style.display = mode === 'edit' ? 'none' : 'inline-block';
}

// define function for refresh payment form
function refreshPaymentForm() {

    formPayment.reset();

    payment = new Object();

    //payment method generate
    fillSelectFromEnum(selectPaymentMethodElement, "paymentMethod", "Please select payment method...!");

    // Populate appointment datalist
    let appointments = getServiceRequest("/appointment/alldata");
    populateDataList(document.getElementById("listAppointment"), searchAppointmentElement, textAppointmentIdElement, appointments, "appointment_no", "id");

    buttonUpdate.style.display = "none";
    buttonSubmit.style.display = "block";

    clearElement([searchAppointmentElement, textAppointmentIdElement, textAppointmentAmountElement, textPayAmountElement, textPayBalanceAmountElement, selectPaymentMethodElement, textPaymentNoteElement]);

    // Auto-fill appointment amount when appointment is selected
    searchAppointmentElement.addEventListener("input", () => {
        const hiddenId = textAppointmentIdElement.value;
        if (hiddenId) {
            let allAppointments = getServiceRequest("/appointment/alldata");
            let selected = allAppointments.find(a => a.id == hiddenId);
            if (selected) {
                textAppointmentAmountElement.value = selected.total_amount || selected.amount || 0;
                payment.appointment_amount = parseFloat(textAppointmentAmountElement.value);
                // Recalculate balance
                const amt = parseFloat(textAppointmentAmountElement.value) || 0;
                const pay = parseFloat(textPayAmountElement.value) || 0;
                textPayBalanceAmountElement.value = (amt - pay).toFixed(2);
                payment.paybalance_amount = amt - pay;
            }
        }
    });

    // Auto-calculate balance on pay amount change
    textPayAmountElement.addEventListener("input", () => {
        const amt = parseFloat(textAppointmentAmountElement.value) || 0;
        const pay = parseFloat(textPayAmountElement.value) || 0;
        textPayBalanceAmountElement.value = (amt - pay).toFixed(2);
        payment.paybalance_amount = amt - pay;
    });

    setPaymentFormMode('new');
}

// define function to Refresh Payment Table
function refreshPaymentTable() {

    let payments = getServiceRequest("/payment/alldata");

    if (!Array.isArray(payments)) {
        payments = Object.values(payments || {});
    }

    let propertyList = [
        { propertyName: getAppointment, dataType: "function" },
        { propertyName: "appointment_amount", dataType: "currency" },
        { propertyName: "pay_amount", dataType: "currency" },
        { propertyName: "paybalance_amount", dataType: "currency" },
        { propertyName: getPaymentMethod, dataType: "function" },
        { propertyName: "note", dataType: "string" }
    ];
    fillDataIntoTable(tableBodyElement, payments, propertyList, refillPaymentForm, deletePayment, printPayment);
}

const getAppointment = (obj) => {
    return obj.appointment_id.appointment_no;
}

const getPaymentMethod = (obj) => {
    return getEnumDisplayName("paymentMethod", obj.paymentMethod);
}

// check form errors
function checkPaymentFormErrors() {

    let errors = "";

    if (textAppointmentIdElement.value === "") {
        errors += "Appointment is required.\n";
    }
    if (textPayAmountElement.value === "") {
        errors += "Pay Amount is required.\n";
    }
    if (textPayBalanceAmountElement.value === "") {
        errors += "Balance Amount is required.\n";
    }
    if (selectPaymentMethodElement.value === "") {
        errors += "Payment method is required.\n";
    }
    return errors;
}

//define function Submit new payment
function buttonPaymentSubmit() {

    let errors = checkPaymentFormErrors();

    if (errors == "") {
        showConfirm("Confirm Submission", "Are you sure to submit the form?", "Submit", "primary").then(confirmed => {
            if (!confirmed) return;
            let serviceResponse = getHTTPServicesRequest("/payment/insert", "POST", payment);
            if (serviceResponse == "OK") {

                showToast("Form submitted successfully!", "success");

                refreshPaymentForm();
                refreshPaymentTable();

                closePanel('panelPaymentForm');
            } else {
                showToast("Form submission cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
            }
        });
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
    }

}

//define function for delete payment
function deletePayment(obj) {

    showConfirm("Confirm Deletion", "Are you sure to delete payment for " + obj.appointment_id.appointment_no + " (Amount: " + obj.pay_amount + ")?", "Delete", "danger").then(confirmed => {
        if (!confirmed) return;
        let deleteResponse = getHTTPServicesRequest("/payment/delete", "DELETE", obj);
        if (deleteResponse == "OK") {

            showToast("Payment deleted successfully!", "success");

            refreshPaymentForm();
            refreshPaymentTable();
            closePanel('panelPaymentForm');
        } else {
            showToast("Payment deletion cancelled..! \n Have some errors.. \n" + deleteResponse, "error");
        }
    });
}

//define function for print payment details
function printPayment(obj) {
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
            <tr><th>Appointment Amount</th><td>Rs. ${formatCurrency(obj.appointment_amount)}</td></tr>
            <tr><th>Pay Amount</th><td>Rs. ${formatCurrency(obj.pay_amount)}</td></tr>
            <tr><th>Balance</th><td>Rs. ${formatCurrency(obj.paybalance_amount)}</td></tr>
            <tr><th>Method</th><td>${escapeHtml(getEnumDisplayName("paymentMethod", obj.paymentMethod))}</td></tr>
            <tr><th>Note</th><td>${escapeHtml(obj.note || "N/A")}</td></tr>
        </table></div>
        <div class="print-footer">Printed on ${new Date().toLocaleDateString("en-LK")} | Salon DEEN</div>
        </div></body></html>`);
    setTimeout(() => { newTab.print(); newTab.close(); }, 500);
}

//define function for refill payment form
function refillPaymentForm(obj) {

    payment = getServiceRequest("/payment/byid/" + obj.id);
    oldPayment = JSON.parse(JSON.stringify(payment));

    // Re-populate appointment datalist and set value
    let appointments = getServiceRequest("/appointment/alldata");
    populateDataList(document.getElementById("listAppointment"), searchAppointmentElement, textAppointmentIdElement, appointments, "appointment_no", "id");
    setSelectedByHiddenId(searchAppointmentElement, textAppointmentIdElement, appointments, "appointment_no", "id", payment.appointment_id?.id);

    //payment method generate
    fillSelectFromEnum(selectPaymentMethodElement, "paymentMethod", "Please select payment method...!");

    selectPaymentMethodElement.value = payment.paymentMethod;

    textAppointmentAmountElement.value = payment.appointment_amount;
    textPayAmountElement.value = payment.pay_amount;
    textPayBalanceAmountElement.value = payment.paybalance_amount;
    textPaymentNoteElement.value = payment.note;

    // Re-attach auto-calculate listener
    textPayAmountElement.addEventListener("input", () => {
        const amt = parseFloat(textAppointmentAmountElement.value) || 0;
        const pay = parseFloat(textPayAmountElement.value) || 0;
        textPayBalanceAmountElement.value = (amt - pay).toFixed(2);
        payment.paybalance_amount = amt - pay;
    });

    setPaymentFormMode('edit');

    openPanel('panelPaymentForm');

}

//define function for check form updates
const checkFormUpdates = () => {

    let updates = "";

    if (payment.appointment_id !== oldPayment.appointment_id) {
        updates += "Appointment changed from " + oldPayment.appointment_id + " to " + payment.appointment_id + "\n";
    }
    if (payment.paymentMethod !== oldPayment.paymentMethod) {
        updates += "Payment method changed from " + oldPayment.paymentMethod + " to " + payment.paymentMethod + "\n";
    }
    if (payment.pay_amount !== oldPayment.pay_amount) {
        updates += "Pay Amount changed from " + oldPayment.pay_amount + " to " + payment.pay_amount + "\n";
    }
    if (payment.paybalance_amount !== oldPayment.paybalance_amount) {
        updates += "Balance Amount changed from " + oldPayment.paybalance_amount + " to " + payment.paybalance_amount + "\n";
    }
    if (payment.note !== oldPayment.note) {
        updates += "Note changed from " + oldPayment.note + " to " + payment.note + "\n";
    }
    return updates;

}

//define function for update payment
function buttonPaymentUpdate() {

    let errors = checkPaymentFormErrors();
    if (errors == "") {
        let updates = checkFormUpdates();
        if (updates == "") {
            showToast("No changes detected to update.", "info");
        } else {
            showConfirm("Confirm Update", "Are you sure to update the payment with following changes..? \n" + updates, "Update", "primary").then(confirmed => {
                if (!confirmed) return;
                let serviceResponse = getHTTPServicesRequest("/payment/update", "PUT", payment);
                if (serviceResponse == "OK") {

                    showToast("Payment updated successfully!", "success");

                    refreshPaymentForm();
                    refreshPaymentTable();
                    closePanel('panelPaymentForm');
                } else {
                    showToast("Payment update cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
                }
            });
        }
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
    }

}
