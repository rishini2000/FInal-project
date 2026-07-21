window.addEventListener("load", () => {
    refreshPaymentForm();
    refreshPaymentTable();
});

const searchAppointmentElement = document.querySelector("#searchAppointment");
const textAppointmentIdElement = document.querySelector("#textAppointmentId");
const textCustomerNameElement = document.querySelector("#textCustomerName");
const textCustomerPhoneElement = document.querySelector("#textCustomerPhone");
const textAppointmentDateElement = document.querySelector("#textAppointmentDate");
const customerInfoSection = document.querySelector("#customerInfoSection");
const paymentSummaryElement = document.querySelector("#paymentSummary");
const summaryTotalElement = document.querySelector("#summaryTotal");
const summaryPaidElement = document.querySelector("#summaryPaid");
const summaryRemainingElement = document.querySelector("#summaryRemaining");
const textAppointmentAmountElement = document.querySelector("#textAppointmentAmount");
const textPayAmountElement = document.querySelector("#textPayAmount");
const textPayBalanceAmountElement = document.querySelector("#textPayBalanceAmount");
const textPaymentNoteElement = document.querySelector("#textPaymentNote");

const buttonSubmit = document.getElementById("buttonSubmit");
const buttonUpdate = document.getElementById("buttonUpdate");
const buttonClear = document.getElementById("buttonClear");
const tableBodyElement = document.querySelector("#tableBodyPayment");

window.currentRemaining = 0;

function showModal() {
    openPanel('panelPaymentForm');
}
function hideModal() {
    closePanel('panelPaymentForm');
}

function setPaymentFormMode(mode = 'new') {
    const titleEl = document.querySelector('#panelPaymentForm .offcanvas-title');
    if (titleEl) titleEl.textContent = mode === 'edit' ? 'Edit Payment' : 'New Payment';
    if (buttonUpdate) buttonUpdate.style.display = mode === 'edit' ? 'inline-block' : 'none';
    if (buttonSubmit) buttonSubmit.style.display = mode === 'edit' ? 'none' : 'inline-block';
}

function getSelectedPaymentMethod() {
    const checked = document.querySelector('input[name="paymentMethod"]:checked');
    return checked ? checked.value : "";
}

function setSelectedPaymentMethod(value) {
    const radios = document.querySelectorAll('input[name="paymentMethod"]');
    radios.forEach(r => {
        r.checked = (r.value === value);
    });
    payment.paymentMethod = value;
}

function clearPaymentMethodRadios() {
    const radios = document.querySelectorAll('input[name="paymentMethod"]');
    radios.forEach(r => r.checked = false);
    payment.paymentMethod = null;
}

// Sync radio button changes to payment object
document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener("change", function () {
        payment.paymentMethod = this.value;
    });
});

// SINGLE global pay amount listener — never re-attached
textPayAmountElement.addEventListener("input", function () {
    const pay = parseFloat(this.value) || 0;
    const bal = window.currentRemaining - pay;
    textPayBalanceAmountElement.value = bal.toFixed(2);
    payment.paybalance_amount = bal;
});

let appointmentInputHandler = null;

function refreshPaymentForm() {
    formPayment.reset();
    payment = new Object();

    // Remove old appointment search listener to prevent stacking
    if (appointmentInputHandler) {
        searchAppointmentElement.removeEventListener("input", appointmentInputHandler);
    }

    // Populate appointment datalist (exclude CANCELLED)
    let appointments = getServiceRequest("/appointment/alldata");
    let payableAppointments = appointments.filter(a => a.appointmentStatus !== 'CANCELLED');
    populateAppointmentDataList(payableAppointments);

    buttonUpdate.style.display = "none";
    buttonSubmit.style.display = "block";

    clearElement([searchAppointmentElement, textAppointmentIdElement, textAppointmentAmountElement, textPayAmountElement, textPayBalanceAmountElement, textPaymentNoteElement]);
    clearPaymentMethodRadios();

    textPayAmountElement.disabled = false;
    textPayAmountElement.placeholder = "0.00";

    // Hide customer info and summary sections
    if (customerInfoSection) customerInfoSection.style.display = "none";
    if (paymentSummaryElement) paymentSummaryElement.style.display = "none";

    window.currentRemaining = 0;

    setPaymentFormMode('new');
}

function populateAppointmentDataList(appointments) {
    const datalist = document.getElementById("listAppointment");
    datalist.innerHTML = "";

    if (!Array.isArray(appointments)) return;

    appointments.forEach(appt => {
        const option = document.createElement("option");
        const customerName = appt.customer_id
            ? (appt.customer_id.firstname + " " + (appt.customer_id.lastname || "")).trim()
            : "Unknown";
        const phone = appt.customer_id ? (appt.customer_id.mobile || "") : "";
        const date = appt.date || "";

        const label = appt.appointment_no + " - " + customerName + " - " + phone + " - " + date;
        option.value = label;
        option.dataset.appointmentId = appt.id;
        datalist.appendChild(option);
    });

    // Single named handler — removed before re-adding to prevent stacking
    appointmentInputHandler = function () {
        const inputVal = this.value;
        const match = appointments.find(a => {
            const customerName = a.customer_id
                ? (a.customer_id.firstname + " " + (a.customer_id.lastname || "")).trim()
                : "Unknown";
            const phone = a.customer_id ? (a.customer_id.mobile || "") : "";
            const label = a.appointment_no + " - " + customerName + " - " + phone + " - " + (a.date || "");
            return label === inputVal;
        });

        if (match) {
            textAppointmentIdElement.value = match.id;
            onAppointmentSelected(match);
        } else {
            textAppointmentIdElement.value = "";
        }
    };
    searchAppointmentElement.addEventListener("input", appointmentInputHandler);
}

function onAppointmentSelected(appointment) {
    payment.appointment_id = { id: appointment.id };

    const customerName = appointment.customer_id
        ? (appointment.customer_id.firstname + " " + (appointment.customer_id.lastname || "")).trim()
        : "";
    const phone = appointment.customer_id ? (appointment.customer_id.mobile || "") : "";
    const date = appointment.date || "";

    if (customerInfoSection) customerInfoSection.style.display = "flex";
    if (textCustomerNameElement) textCustomerNameElement.value = customerName;
    if (textCustomerPhoneElement) textCustomerPhoneElement.value = phone;
    if (textAppointmentDateElement) textAppointmentDateElement.value = date;

    const amount = parseFloat(appointment.price) || 0;
    textAppointmentAmountElement.value = amount.toFixed(2);
    payment.appointment_amount = amount;

    const totalPaidData = getServiceRequest("/payment/total-paid/" + appointment.id);
    const totalPaid = parseFloat(totalPaidData.totalPaid) || 0;
    const remaining = amount - totalPaid;

    // Set global remaining for the single pay-amount listener
    window.currentRemaining = remaining;

    if (paymentSummaryElement) paymentSummaryElement.style.display = "block";
    if (summaryTotalElement) summaryTotalElement.textContent = "Rs. " + amount.toFixed(2);
    if (summaryPaidElement) summaryPaidElement.textContent = "Rs. " + totalPaid.toFixed(2);
    if (summaryRemainingElement) summaryRemainingElement.textContent = "Rs. " + remaining.toFixed(2);

    if (remaining <= 0) {
        textPayAmountElement.value = "";
        textPayBalanceAmountElement.value = "";
        payment.pay_amount = null;
        payment.paybalance_amount = null;
        textPayAmountElement.disabled = true;
        showToast("This appointment is fully paid. No further payment allowed.", "info");
    } else {
        textPayAmountElement.disabled = false;
        textPayAmountElement.value = "";
        textPayAmountElement.placeholder = "Enter amount (max Rs. " + remaining.toFixed(2) + ")";
        textPayBalanceAmountElement.value = "";
        payment.pay_amount = null;
        payment.paybalance_amount = null;
    }
}

function refreshPaymentTable() {
    let payments = getServiceRequest("/payment/alldata");

    if (!Array.isArray(payments)) {
        payments = Object.values(payments || {});
    }

    let propertyList = [
        { propertyName: getAppointment, dataType: "function" },
        { propertyName: getCustomer, dataType: "function" },
        { propertyName: "appointment_amount", dataType: "currency" },
        { propertyName: getTotalPaidForAppointment, dataType: "function" },
        { propertyName: getRemainingForAppointment, dataType: "function" },
        { propertyName: getPaymentMethod, dataType: "function" },
        { propertyName: "note", dataType: "string" }
    ];
    fillDataIntoTable(tableBodyElement, payments, propertyList, refillPaymentForm, deletePayment, printPayment, true, 'PAYMENT_UPDATE', 'PAYMENT_DELETE', null);
}

const getAppointment = (obj) => {
    return obj.appointment_id ? obj.appointment_id.appointment_no : "N/A";
}

const getCustomer = (obj) => {
    if (obj.appointment_id && obj.appointment_id.customer_id) {
        const c = obj.appointment_id.customer_id;
        return (c.firstname + " " + (c.lastname || "")).trim();
    }
    return "N/A";
}

const getTotalPaidForAppointment = (obj) => {
    if (!obj.appointment_id) return "Rs. 0";
    const totalPaidData = getServiceRequest("/payment/total-paid/" + obj.appointment_id.id);
    const totalPaid = parseFloat(totalPaidData.totalPaid) || 0;
    return "Rs. " + totalPaid.toFixed(2);
}

const getRemainingForAppointment = (obj) => {
    if (!obj.appointment_id) return "Rs. 0";
    const totalPaidData = getServiceRequest("/payment/total-paid/" + obj.appointment_id.id);
    const totalPaid = parseFloat(totalPaidData.totalPaid) || 0;
    const appointmentAmount = parseFloat(obj.appointment_amount) || 0;
    const remaining = appointmentAmount - totalPaid;
    return "Rs. " + remaining.toFixed(2);
}

const getPaymentMethod = (obj) => {
    return getEnumDisplayName("paymentMethod", obj.paymentMethod);
}

function checkPaymentFormErrors() {
    let errors = "";

    if (textAppointmentIdElement.value === "") {
        errors += "Appointment is required.\n";
    }
    if (textPayAmountElement.value === "" || parseFloat(textPayAmountElement.value) <= 0) {
        errors += "Pay Amount is required and must be greater than 0.\n";
    }
    if (!getSelectedPaymentMethod()) {
        errors += "Payment method is required.\n";
    }
    const payAmount = parseFloat(textPayAmountElement.value) || 0;
    if (payAmount > window.currentRemaining) {
        errors += "Pay amount (Rs. " + payAmount.toFixed(2) + ") exceeds remaining balance (Rs. " + window.currentRemaining.toFixed(2) + ").\n";
    }
    return errors;
}

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
            <tr><th>Customer</th><td>${escapeHtml(obj.appointment_id && obj.appointment_id.customer_id ? obj.appointment_id.customer_id.firstname + " " + (obj.appointment_id.customer_id.lastname || "") : "N/A")}</td></tr>
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

function refillPaymentForm(obj) {

    payment = getServiceRequest("/payment/byid/" + obj.id);
    oldPayment = JSON.parse(JSON.stringify(payment));

    // Remove old appointment search listener to prevent stacking
    if (appointmentInputHandler) {
        searchAppointmentElement.removeEventListener("input", appointmentInputHandler);
    }

    let appointments = getServiceRequest("/appointment/alldata");
    let payableAppointments = appointments.filter(a => a.appointmentStatus !== 'CANCELLED');
    populateAppointmentDataList(payableAppointments);

    const selectedAppt = payableAppointments.find(a => a.id === payment.appointment_id?.id);
    if (selectedAppt) {
        const customerName = selectedAppt.customer_id
            ? (selectedAppt.customer_id.firstname + " " + (selectedAppt.customer_id.lastname || "")).trim()
            : "Unknown";
        const phone = selectedAppt.customer_id ? (selectedAppt.customer_id.mobile || "") : "";
        searchAppointmentElement.value = selectedAppt.appointment_no + " - " + customerName + " - " + phone + " - " + (selectedAppt.date || "");
        textAppointmentIdElement.value = selectedAppt.id;

        if (customerInfoSection) customerInfoSection.style.display = "flex";
        if (textCustomerNameElement) textCustomerNameElement.value = customerName;
        if (textCustomerPhoneElement) textCustomerPhoneElement.value = phone;
        if (textAppointmentDateElement) textAppointmentDateElement.value = selectedAppt.date || "";
    }

    setSelectedPaymentMethod(payment.paymentMethod);

    textAppointmentAmountElement.value = payment.appointment_amount;
    textPayAmountElement.value = payment.pay_amount;
    textPayBalanceAmountElement.value = payment.paybalance_amount;
    textPaymentNoteElement.value = payment.note;

    // Compute and set remaining for the global pay-amount listener
    const amount = parseFloat(payment.appointment_amount) || 0;
    const totalPaidData = getServiceRequest("/payment/total-paid/" + payment.appointment_id?.id);
    const totalPaid = parseFloat(totalPaidData.totalPaid) || 0;
    const remaining = amount - totalPaid;
    window.currentRemaining = remaining;

    if (paymentSummaryElement) paymentSummaryElement.style.display = "block";
    if (summaryTotalElement) summaryTotalElement.textContent = "Rs. " + amount.toFixed(2);
    if (summaryPaidElement) summaryPaidElement.textContent = "Rs. " + totalPaid.toFixed(2);
    if (summaryRemainingElement) summaryRemainingElement.textContent = "Rs. " + remaining.toFixed(2);

    setPaymentFormMode('edit');

    openPanel('panelPaymentForm');

}

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