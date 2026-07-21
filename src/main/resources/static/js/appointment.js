// --- Fix for missing addPackageRow function (prevents ReferenceError) ---
function addPackageRow() {
    // Get selected package ID
    const select = document.getElementById('selectServicePackage');
    const selectedId = select.value;
    if (!selectedId) {
        showToast("Please select a service package to add.", "warning");
        return;
    }

    // Get all service packages from backend
    const allPackages = getServiceRequest("/service_package/alldata");

    // Find the selected package object
    const selectedPackage = allPackages.find(pkg => String(pkg.id) === String(selectedId));
    if (!selectedPackage) {
        showToast("Selected package not found.", "error");
        return;
    }

    // Create proper AppointmentHasServicePackage object
    const appointmentHasServicePackage = {
        service_package_id: { id: parseInt(selectedId) },
        service_package_price: parseFloat(selectedPackage.default_price) || 0
    };

    // Prevent duplicate add
    if (appointment.appointmentHasServicePackageList.some(pkg => pkg.service_package_id && String(pkg.service_package_id.id) === String(selectedId))) {
        showToast("This package is already added.", "warning");
        return;
    }

    // Add to the list
    appointment.appointmentHasServicePackageList.push(appointmentHasServicePackage);

    // Refresh the inner table
    refreshAppointmentInnerTable();

    // Update duration and price
    updateDurationFromAddedPackages();
    updateTotalPriceFromAddedPackages();
}

// --- NEW: Function to add individual service ---
function addServiceRow() {
    // Get selected service ID
    const select = document.getElementById('selectService');
    const selectedId = select.value;
    if (!selectedId) {
        showToast("Please select a service to add.", "warning");
        return;
    }

    // Get all services from backend
    const allServices = getServiceRequest("/service/alldata");

    // Find the selected service object
    const selectedService = allServices.find(svc => String(svc.id) === String(selectedId));
    if (!selectedService) {
        showToast("Selected service not found.", "error");
        return;
    }

    // Create proper AppointmentHasService object
    const appointmentHasService = {
        service_id: { id: parseInt(selectedId) },
        service_price: parseFloat(selectedService.price) || 0
    };

    // Prevent duplicate add
    if (appointment.appointmentHasServiceList.some(svc => svc.service_id && String(svc.service_id.id) === String(selectedId))) {
        showToast("This service is already added.", "warning");
        return;
    }

    // Add to the list
    appointment.appointmentHasServiceList.push(appointmentHasService);

    // Refresh the inner table
    refreshAppointmentInnerTable();

    // Update duration and price
    updateDurationFromAddedPackages();
    updateTotalPriceFromAddedPackages();
}
// --- NEW: Helper to sum prices from all added packages and services and update the price field ---
function updateTotalPriceFromAddedPackages() {
    if (!window.appointment) return;
    let totalPrice = 0;

    // Sum from service packages
    if (Array.isArray(appointment.appointmentHasServicePackageList)) {
        appointment.appointmentHasServicePackageList.forEach(pkg => {
            totalPrice += parseFloat(pkg.service_package_price) || 0;
        });
    }

    // Sum from individual services
    if (Array.isArray(appointment.appointmentHasServiceList)) {
        appointment.appointmentHasServiceList.forEach(svc => {
            totalPrice += parseFloat(svc.service_price) || 0;
        });
    }

    const priceInput = document.getElementById('textPrice');
    if (priceInput) {
        priceInput.value = totalPrice > 0 ? totalPrice : '';
    }
}

// --- NEW: Helper to sum durations from all added packages and services ---
function updateDurationFromAddedPackages() {
    if (!window.appointment) return;
    let totalDuration = 0;

    // Sum from service packages
    if (Array.isArray(appointment.appointmentHasServicePackageList)) {
        appointment.appointmentHasServicePackageList.forEach(pkg => {
            // Fetch package duration from backend
            const allPackages = getServiceRequest("/service_package/alldata");
            const pkgObj = allPackages.find(p => p.id === pkg.service_package_id?.id);
            totalDuration += parseInt(pkgObj?.duration, 10) || 0;
        });
    }

    // Sum from individual services
    if (Array.isArray(appointment.appointmentHasServiceList)) {
        appointment.appointmentHasServiceList.forEach(svc => {
            // Fetch service duration from backend
            const allServices = getServiceRequest("/service/alldata");
            const svcObj = allServices.find(s => s.id === svc.service_id?.id);
            totalDuration += parseInt(svcObj?.duration, 10) || 0;
        });
    }

    const durationInput = document.getElementById('textDuration');
    if (durationInput) {
        durationInput.value = totalDuration > 0 ? totalDuration : '';
        if (document.getElementById('textStartTime')?.value) {
            autoFillEndTimeFromInputs();
        }
    }
}
// --- Auto duration and end time logic (database-driven, non-intrusive) ---

// Cache service package durations after first load
let servicePackageDurationMap = null;

// Helper: Load and cache all service package durations from backend
function loadServicePackageDurations() {
    if (servicePackageDurationMap) return servicePackageDurationMap;
    servicePackageDurationMap = {};
    const packages = getServiceRequest("/service_package/alldata");
    if (Array.isArray(packages)) {
        packages.forEach(pkg => {
            const id = pkg.id || pkg.package_id;
            servicePackageDurationMap[id] = parseInt(pkg.duration, 10) || 0;
        });
    }
    return servicePackageDurationMap;
}

// Helper: Sum durations for all selected packages
function getTotalSelectedPackagesDurationFromDB() {
    const select = document.getElementById('selectServicePackage');
    if (!select) return 0;
    const durations = loadServicePackageDurations();
    let total = 0;
    Array.from(select.selectedOptions).forEach(opt => {
        total += durations[opt.value] || 0;
    });
    return total;
}

// When service package selection changes, update duration field
document.getElementById('selectServicePackage')?.addEventListener('change', function() {
    const totalDuration = getTotalSelectedPackagesDurationFromDB();
    const durationInput = document.getElementById('textDuration');
    if (durationInput) {
        durationInput.value = totalDuration > 0 ? totalDuration : '';
        if (document.getElementById('textStartTime')?.value) {
            autoFillEndTimeFromInputs();
        }
    }
});

// When duration or start time changes, update end time
document.getElementById('textDuration')?.addEventListener('input', autoFillEndTimeFromInputs);
document.getElementById('textStartTime')?.addEventListener('input', autoFillEndTimeFromInputs);

// --- NEW: Employee availability check ---
// Check availability when employee, date, or time changes
document.getElementById('searchBeautician')?.addEventListener('change', checkEmployeeAvailability);
document.getElementById('dateAppointmentDate')?.addEventListener('change', checkEmployeeAvailability);
document.getElementById('textStartTime')?.addEventListener('change', checkEmployeeAvailability);
document.getElementById('textEndTime')?.addEventListener('change', checkEmployeeAvailability);

function checkEmployeeAvailability() {
    const employeeId = document.getElementById('selectBeauticianId')?.value;
    const date = document.getElementById('dateAppointmentDate')?.value;
    const startTime = document.getElementById('textStartTime')?.value;
    const endTime = document.getElementById('textEndTime')?.value;

    // Clear previous availability message
    const existingMsg = document.getElementById('availabilityMessage');
    if (existingMsg) {
        existingMsg.remove();
    }

    // Check if all required fields are filled
    if (!employeeId || !date || !startTime || !endTime) {
        return;
    }

    // Call availability endpoint
    const url = `/appointment/check-availability?employeeId=${employeeId}&date=${date}&startTime=${startTime}&endTime=${endTime}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Create availability message element
            const msgDiv = document.createElement('div');
            msgDiv.id = 'availabilityMessage';
            msgDiv.className = data.available ? 'alert alert-success mt-2' : 'alert alert-danger mt-2';
            msgDiv.innerHTML = `<i class="fa-solid ${data.available ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${data.message}`;

            // Insert after the end time input
            const endTimeInput = document.getElementById('textEndTime');
            endTimeInput.parentNode.parentNode.parentNode.insertBefore(msgDiv, endTimeInput.parentNode.parentNode.nextSibling);
        })
        .catch(error => {
            console.error('Error checking availability:', error);
        });
}

// Helper: Calculate and set end time based on start time and duration
function autoFillEndTimeFromInputs() {
    const start = document.getElementById('textStartTime')?.value;
    const duration = parseInt(document.getElementById('textDuration')?.value, 10);
    const endInput = document.getElementById('textEndTime');
    if (!start || isNaN(duration) || duration <= 0 || !endInput) {
        if (endInput) endInput.value = '';
        return;
    }
    const [h, m] = start.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) {
        endInput.value = '';
        return;
    }
    const now = new Date();
    now.setHours(h, m, 0, 0);
    const end = new Date(now.getTime() + duration * 60000);
    const hh = String(end.getHours()).padStart(2, '0');
    const mm = String(end.getMinutes()).padStart(2, '0');
    endInput.value = `${hh}:${mm}`;
}


//main basic form element refs
const searchCustomerElement = document.querySelector("#searchCustomer");
const hiddenCustomerIdElement = document.querySelector("#selectCustomerId");
const searchBeauticianElement = document.querySelector("#searchBeautician");
const hiddenBeauticianIdElement = document.querySelector("#selectBeauticianId");
const dateAppointmentDateElement = document.querySelector("#dateAppointmentDate");
const textStartTimeElement = document.querySelector("#textStartTime");
const textEndTimeElement = document.querySelector("#textEndTime");
const textDurationElement = document.querySelector("#textDuration");
const textPriceElement = document.querySelector("#textPrice");
const selectStatusElement = document.querySelector("#selectStatus");
const selectBookingMethodElement = document.querySelector("#selectBookingMethod");
const textNotesElement = document.querySelector("#textNotes");
const buttonSubmit = document.getElementById("buttonSubmit");
const buttonUpdate = document.getElementById("buttonUpdate");
const buttonClear = document.getElementById("buttonClear");
const tableBodyElement = document.querySelector("#tableBodyAppointment");
//inner table element refs
const selectServicePackageElement = document.querySelector("#selectServicePackage");
const selectServiceElement = document.querySelector("#selectService");
const tableBodySelectedPackagesInnerForm = document.querySelector("#tableBodySelectedPackagesInnerForm");

//access browser onload event
window.addEventListener("load", () => {
    // Refresh main form and table
    refreshAppointmentForm();
    refreshAppointmentTable();
    // Refresh inner form and table
    refreshAppointmentInnerForm();
    refreshAppointmentInnerTable();
});

// helper to show/hide panel
function showModal() {
    openPanel('panelAppointmentForm');
}
function hideModal() {
    closePanel('panelAppointmentForm');
}

//***********start of the main form area************

function refreshAppointmentForm() {

    formAppointment.reset();

    appointment = new Object();
    appointment.appointmentHasServicePackageList = new Array();
    appointment.appointmentHasServiceList = new Array();

    buttonUpdate.style.display = "none";
    buttonSubmit.style.display = "block";

    //beautician datalist
    let beauticians = getServiceRequest("/employee/alldata");
    populateDataList(
        document.getElementById("listBeautician"),
        searchBeauticianElement,
        hiddenBeauticianIdElement,
        beauticians,
        (e) => e.callingname || e.fullname,
        "id"
    );

    //customer datalist
    let customers = getServiceRequest("/customer/alldata");
    populateDataList(
        document.getElementById("listCustomer"),
        searchCustomerElement,
        hiddenCustomerIdElement,
        customers,
        (c) => c.firstname + " " + (c.lastname || ""),
        "id"
    );

    //appointment status and booking method options
    fillSelectFromEnum(selectStatusElement, "appointmentStatus", "Please select status...!");
    fillSelectFromEnum(selectBookingMethodElement, "bookingMethod", "Please select booking method...!");

    //service package and service options
    refreshAppointmentInnerForm();

    document.querySelector('#panelAppointmentForm .offcanvas-title').textContent = 'New Appointment';

    clearElement([
        dateAppointmentDateElement, textStartTimeElement,
        textEndTimeElement, textDurationElement, textPriceElement,
        selectStatusElement, selectBookingMethodElement, textNotesElement
    ]);
    clearValidation(searchCustomerElement);
    clearValidation(searchBeauticianElement);
}

// define function for refresh table
const refreshAppointmentTable = () => {

    appointments = getServiceRequest("/appointment/alldata");

    if (!Array.isArray(appointments)) {
        appointments = Object.values(appointments || {});
    }
    const propertyList = [
        { propertyName: getCustomer, dataType: "function" },
        { propertyName: "date", dataType: "date" },
        { propertyName: "start_time", dataType: "string" },
        { propertyName: "duration", dataType: "string" },
        { propertyName: "end_time", dataType: "string" },
        { propertyName: "price", dataType: "currency" },
        { propertyName: getStatus, dataType: "function" },
        { propertyName: getBookingMethod, dataType: "function" },
        { propertyName: getBeautician, dataType: "function" },
        { propertyName: "notes", dataType: "string" }
    ];
    fillDataIntoTable(tableBodyElement, appointments, propertyList, refillAppointmentForm, deleteAppointment, printAppointment, true, 'APPOINTMENT_UPDATE', 'APPOINTMENT_DELETE', null);
}
// Defensive override to prevent TypeError if customer_id or firstname is missing
const getCustomer = (obj) => {
    return (obj && obj.customer_id && obj.customer_id.firstname) ? obj.customer_id.firstname : "";
}
const getBeautician = (obj) => {
    return (obj && obj.employee_id && obj.employee_id.callingname) ? obj.employee_id.callingname : "";
}
const getStatus = (obj) => {
    return getEnumDisplayName("appointmentStatus", obj.appointmentStatus);
}
const getBookingMethod = (obj) => {
    return getEnumDisplayName("bookingMethod", obj.bookingMethod);
}

// Defensive override to prevent TypeError if appointment.servicepackage_list is undefined
function checkAppointmentFormErrors() {
    let errors = "";
    if (!hiddenCustomerIdElement.value) {
        errors += "Please select customer..!\n";
        setInvalid(searchCustomerElement);
    } else {
        setValid(searchCustomerElement);
    }
    if (!hiddenBeauticianIdElement.value) {
        errors += "Please select beautician..!\n";
        setInvalid(searchBeauticianElement);
    } else {
        setValid(searchBeauticianElement);
    }
    if (!appointment.date) {
        errors += "Appointment date is required.\n";
        setInvalid(dateAppointmentDateElement);
    } else {
        setValid(dateAppointmentDateElement);
    }
    if (!appointment.start_time) {
        errors += "Start time is required.\n";
        setInvalid(textStartTimeElement);
    } else {
        setValid(textStartTimeElement);
    }
    if (!appointment.end_time) {
        errors += "End time is required.\n";
    }
    if ((!Array.isArray(appointment.appointmentHasServicePackageList) || appointment.appointmentHasServicePackageList.length === 0) &&
        (!Array.isArray(appointment.appointmentHasServiceList) || appointment.appointmentHasServiceList.length === 0)) {
        errors += "Please select at least one service package or service item..!\n";
    }
    if (!appointment.duration || isNaN(appointment.duration) || appointment.duration <= 0) {
        errors += "Please enter a valid duration in minutes..!\n";
    }
    if (!appointment.price || isNaN(appointment.price) || appointment.price < 0) {
        errors += "Please enter a valid price..!\n";
    }
    if (appointment.appointmentStatus == null) {
        errors += "Please select status..!\n";
        setInvalid(selectStatusElement);
    } else {
        setValid(selectStatusElement);
    }
    if (appointment.bookingMethod == null) {
        errors += "Please select booking method..!\n";
        setInvalid(selectBookingMethodElement);
    } else {
        setValid(selectBookingMethodElement);
    }
    return errors;
}

//define function for submit new appointment form
function submitAppointmentForm() {

    // Map hidden IDs to appointment object
    appointment.customer_id = hiddenCustomerIdElement.value ? { id: parseInt(hiddenCustomerIdElement.value) } : null;
    appointment.employee_id = hiddenBeauticianIdElement.value ? { id: parseInt(hiddenBeauticianIdElement.value) } : null;
    appointment.date = dateAppointmentDateElement.value;
    appointment.start_time = textStartTimeElement.value;
    appointment.end_time = textEndTimeElement.value;
    appointment.duration = textDurationElement.value;
    appointment.price = textPriceElement.value;
    appointment.appointmentStatus = selectStatusElement.value;
    appointment.bookingMethod = selectBookingMethodElement.value;
    appointment.notes = textNotesElement.value;

    let errors = checkAppointmentFormErrors();

    if (errors == "") {
        let message = "Are you sure to submit the form ?";
        showConfirm("Confirm Submit", message, "Submit", "primary").then(confirmed => {
            if (!confirmed) return;
            let serviceResponse = getHTTPServicesRequest("/appointment/insert", "POST", appointment);
            if (serviceResponse == "OK") {

                showToast("Form submitted successfully!", "success");

                refreshAppointmentForm();
                refreshAppointmentTable();
                closePanel('panelAppointmentForm');
            } else {
                showToast("Form submission cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
            }
        });
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
    }
}

//define function for delete appointment
function deleteAppointment(obj) {

    let message = "Are you sure to delete appointment : " + obj.appointment_no + " ?";
    showConfirm("Confirm Delete", message, "Delete", "danger").then(confirmed => {
        if (!confirmed) return;
        let serviceResponse = getHTTPServicesRequest("/appointment/delete", "DELETE", obj);
        if (serviceResponse == "OK") {

            showToast("Appointment deleted successfully!", "success");

            refreshAppointmentForm();
            refreshAppointmentTable();
            closePanel('panelAppointmentForm');
        } else {
            showToast("Appointment deletion cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
        }
    });
}

//define function for print appointment
function printAppointment(obj) {
    const customerName = (obj.customer_id && obj.customer_id.firstname && obj.customer_id.lastname)
        ? obj.customer_id.firstname + " " + obj.customer_id.lastname
        : "";
    const beauticianName = (obj.employee_id && obj.employee_id.fullname)
        ? obj.employee_id.fullname
        : (obj.employee_id && obj.employee_id.callingname) ? obj.employee_id.callingname : "";
    const packageNames = Array.isArray(obj.appointmentHasServicePackageList)
        ? obj.appointmentHasServicePackageList.map(pkg => pkg.package_name || pkg.name || "").filter(Boolean).join(", ")
        : "";

    const newTab = window.open();
    newTab.document.write(`<html><head><title>${escapeHtml(obj.appointment_no)}</title><link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css"></head><body>
        <div class="card"><div class="card-header bg-primary text-light text-center"><h3>Appointment: ${escapeHtml(obj.appointment_no)}</h3></div>
        <div class="card-body"><table class="table table-bordered">
        <tr><th>Customer</th><td>${escapeHtml(customerName)}</td></tr>
        <tr><th>Beautician</th><td>${escapeHtml(beauticianName)}</td></tr>
        <tr><th>Date</th><td>${escapeHtml(obj.date)}</td></tr>
        <tr><th>Start</th><td>${escapeHtml(obj.start_time)}</td></tr>
        <tr><th>End</th><td>${escapeHtml(obj.end_time)}</td></tr>
        <tr><th>Service Packages</th><td>${escapeHtml(packageNames)}</td></tr>
        <tr><th>Duration</th><td>${escapeHtml(obj.duration)}</td></tr>
        <tr><th>Price</th><td>${escapeHtml(obj.price)}</td></tr>
        <tr><th>Status</th><td>${escapeHtml(getEnumDisplayName("appointmentStatus", obj.appointmentStatus))}</td></tr>
        <tr><th>Booking Method</th><td>${escapeHtml(getEnumDisplayName("bookingMethod", obj.bookingMethod))}</td></tr>
        <tr><th>Notes</th><td>${escapeHtml(obj.notes)}</td></tr>
        </table></div></div></body></html>`);
    setTimeout(() => {
        newTab.print();
        newTab.close();
    }, 400);
}

//define function for refill appointment form for update
function refillAppointmentForm(obj) {

    appointment = getServiceRequest("/appointment/byid/" + obj.id);
    oldAppointment = JSON.parse(JSON.stringify(appointment));

    //re-populate beautician and customer datalists
    let beauticians = getServiceRequest("/employee/alldata");
    populateDataList(
        document.getElementById("listBeautician"),
        searchBeauticianElement,
        hiddenBeauticianIdElement,
        beauticians,
        (e) => e.callingname || e.fullname,
        "id"
    );

    let customers = getServiceRequest("/customer/alldata");
    populateDataList(
        document.getElementById("listCustomer"),
        searchCustomerElement,
        hiddenCustomerIdElement,
        customers,
        (c) => c.firstname + " " + (c.lastname || ""),
        "id"
    );

    // Set selected values using hidden IDs
    setSelectedByHiddenId(searchCustomerElement, hiddenCustomerIdElement, customers, (c) => c.firstname + " " + (c.lastname || ""), "id", appointment.customer_id?.id);
    setSelectedByHiddenId(searchBeauticianElement, hiddenBeauticianIdElement, beauticians, (e) => e.callingname || e.fullname, "id", appointment.employee_id?.id);

    //appointment status and booking method options
    fillSelectFromEnum(selectStatusElement, "appointmentStatus", "Please select status...!");
    fillSelectFromEnum(selectBookingMethodElement, "bookingMethod", "Please select booking method...!");

    selectStatusElement.value = appointment.appointmentStatus;
    selectBookingMethodElement.value = appointment.bookingMethod;

    dateAppointmentDateElement.value = appointment.date;
    textStartTimeElement.value = appointment.start_time;
    textEndTimeElement.value = appointment.end_time;
    textDurationElement.value = appointment.duration;
    textPriceElement.value = appointment.price;
    textNotesElement.value = appointment.notes;

    buttonUpdate.style.display = "block";
    buttonSubmit.style.display = "none";

    document.querySelector('#panelAppointmentForm .offcanvas-title').textContent = 'Edit Appointment';
    openPanel('panelAppointmentForm');
}

////define function for check form updates
const checkFormUpdates = () => {

    let updates = "";

        if (appointment.customer_id !== oldAppointment.customer_id) {
        updates += "Customer changed from " + oldAppointment.customer_id + " to " + appointment.customer_id + "\n";
    }
        if (appointment.employee_id !== oldAppointment.employee_id) {
        updates += "Beautician changed from " + oldAppointment.employee_id + " to " + appointment.employee_id + "\n";
    }

        if (appointment.date !== oldAppointment.date) {
        updates += "Date changed from " + oldAppointment.date + " to " + appointment.date + "\n";
    }
        if (appointment.start_time !== oldAppointment.start_time) {
        updates += "Start time changed from " + oldAppointment.start_time + " to " + appointment.start_time + "\n";
    }
        if (appointment.end_time !== oldAppointment.end_time) {
        updates += "End time changed from " + oldAppointment.end_time + " to " + appointment.end_time + "\n";
    }
        if (JSON.stringify(appointment.appointmentHasServicePackageList) !==
    JSON.stringify(oldAppointment.appointmentHasServicePackageList)) {
        updates += "Service packages changed from " + JSON.stringify(oldAppointment.appointmentHasServicePackageList) + " to " + JSON.stringify(appointment.appointmentHasServicePackageList) + "\n";
    }
        if (appointment.duration !== oldAppointment.duration) {
        updates += "Duration changed from " + oldAppointment.duration + " to " + appointment.duration + "\n";
    }
        if (appointment.price !== oldAppointment.price) {
        updates += "Price changed from " + oldAppointment.price + " to " + appointment.price + "\n";
    }
        if (appointment.appointmentStatus !== oldAppointment.appointmentStatus) {
        updates += "Status changed from " + oldAppointment.appointmentStatus + " to " + appointment.appointmentStatus + "\n";
    }
        if (appointment.bookingMethod !== oldAppointment.bookingMethod) {
        updates += "Booking method changed from " + oldAppointment.bookingMethod + " to " + appointment.bookingMethod + "\n";
    }

        if (appointment.notes !== oldAppointment.notes) {
        updates += "Notes changed from " + oldAppointment.notes + " to " + appointment.notes + "\n";
    }

    return updates;

}
//define function for update appointment
function buttonAppointmentUpdate() {

    // Map hidden IDs to appointment object
    appointment.customer_id = hiddenCustomerIdElement.value ? { id: parseInt(hiddenCustomerIdElement.value) } : null;
    appointment.employee_id = hiddenBeauticianIdElement.value ? { id: parseInt(hiddenBeauticianIdElement.value) } : null;
    appointment.date = dateAppointmentDateElement.value;
    appointment.start_time = textStartTimeElement.value;
    appointment.end_time = textEndTimeElement.value;
    appointment.duration = textDurationElement.value;
    appointment.price = textPriceElement.value;
    appointment.appointmentStatus = selectStatusElement.value;
    appointment.bookingMethod = selectBookingMethodElement.value;
    appointment.notes = textNotesElement.value;

    let errors = checkAppointmentFormErrors();
    if (errors == "") {
        let updates = checkFormUpdates();
        if (updates == "") {
            showToast("No changes detected to update.", "info");
        } else {
            showConfirm("Confirm Update", "Are you sure to update the appointment with following changes..? \n" + updates, "Update", "primary").then(confirmed => {
                if (!confirmed) return;
                let serviceResponse = getHTTPServicesRequest("/appointment/update", "PUT", appointment);
                if (serviceResponse == "OK") {

                    showToast("Appointment updated successfully!", "success");

                    refreshAppointmentForm();
                    refreshAppointmentTable();
                    closePanel('panelAppointmentForm');
                } else {
                    showToast("Appointment update cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
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
    if (!selectServicePackageElement.value) errors += "Service package is required.\n";
    return errors;
}

function refreshAppointmentInnerForm() {

    appointmentInner = new Object();

    //service package options
    let service_packages = getServiceRequest("/service_package/alldata");
    fillDataIntoSelectById(selectServicePackageElement, "Select Service Package", service_packages, "id", "package_name");

    //individual service options
    let services = getServiceRequest("/service/alldata");
    fillDataIntoSelectById(selectServiceElement, "Select Service", services, "id", "name");

    clearElement([selectServicePackageElement, selectServiceElement]);
}

//define function for refresh inner table
function refreshAppointmentInnerTable() {
    // Combine both packages and services into a single display array
    const displayList = [];

    // Add service packages
    if (Array.isArray(appointment.appointmentHasServicePackageList)) {
        appointment.appointmentHasServicePackageList.forEach(pkg => {
            displayList.push({
                type: 'package',
                data: pkg,
                package_name: pkg.service_package_id?.package_name || 'Package',
                price: pkg.service_package_price,
                duration: pkg.service_package_id?.duration
            });
        });
    }

    // Add individual services
    if (Array.isArray(appointment.appointmentHasServiceList)) {
        appointment.appointmentHasServiceList.forEach(svc => {
            displayList.push({
                type: 'service',
                data: svc,
                service_name: svc.service_id?.name || 'Service',
                price: svc.service_price,
                duration: svc.service_id?.duration
            });
        });
    }

    const propertyList = [
        { propertyName: getItemType, dataType: "function" },
        { propertyName: getItemName, dataType: "function" },
        { propertyName: getItemDuration, dataType: "function" },
        { propertyName: getItemPrice, dataType: "function" },
        { propertyName: getActions, dataType: "function" }
    ];

    fillDataIntoInnerTable(tableBodySelectedPackagesInnerForm, displayList, propertyList, refillAppointmentInnerForm, deleteAppointment);
}

const getItemType = (obj) => {
    return obj.type === 'package' ? 'Package' : 'Service';
}

const getItemName = (obj) => {
    if (obj.type === 'package') {
        return obj.package_name || obj.data.service_package_id?.package_name || "";
    } else {
        return obj.service_name || obj.data.service_id?.name || "";
    }
}

const getItemDuration = (obj) => {
    if (obj.type === 'package') {
        // Fetch package duration
        const allPackages = getServiceRequest("/service_package/alldata");
        const pkg = allPackages.find(p => p.id === obj.data.service_package_id?.id);
        return pkg?.duration || obj.duration || "";
    } else {
        // Fetch service duration
        const allServices = getServiceRequest("/service/alldata");
        const svc = allServices.find(s => s.id === obj.data.service_id?.id);
        return svc?.duration || obj.duration || "";
    }
}

const getItemPrice = (obj) => {
    return obj.price || "";
}

const getActions = (obj) => {
    return `<button class="btn btn-sm btn-danger" onclick="deleteAppointmentDetail(${JSON.stringify(obj.data)}, '${obj.type}')">Remove</button>`;
}

//define function for submit new service package detail
function buttonInnerAppointmentSubmit() {

    let errors = checkFormError();
    if (errors == "") {
        let message = "Are you sure to submit the form ?";
        showConfirm("Confirm Submit", message, "Submit", "primary").then(confirmed => {
            if (!confirmed) return;
           appointment.appointmentHasServicePackageList.push(appointmentInner);
                showToast("Form submitted successfully!", "success");

                refreshAppointmentInnerForm();
                refreshAppointmentInnerTable();
        });
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
    }
}

//define function for delete appointment detail
function deleteAppointmentDetail(obj, type) {
    let message = "Are you sure to delete this service from appointment?";
    showConfirm("Confirm Delete", message, "Delete", "danger").then(confirmed => {
        if (!confirmed) return;

        let serviceResponse;
        if (type === 'package') {
            // Remove service package
            serviceResponse = getHTTPServicesRequest("/appointment/remove-package", "DELETE", obj);
        } else {
            // Remove individual service
            serviceResponse = getHTTPServicesRequest("/appointment/remove-service", "DELETE", obj);
        }

        if (serviceResponse == "OK") {
            showToast("Service removed successfully!", "success");
            refreshAppointmentInnerTable();
            updateDurationFromAddedPackages();
            updateTotalPriceFromAddedPackages();
        } else {
            showToast("Service deletion cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
        }
    });
}

//define function for refill inner form for edit
function refillAppointmentInnerForm(obj) {

     innerAppointment = getServiceRequest("/appointment/byid/" + obj.id);
    oldInnerAppointment = getServiceRequest("/appointment/byid/" + obj.id);

    let service_packages = getServiceRequest("/service_package/alldata");
    fillDataIntoSelect(selectServiceElement, "Select Service", service_packages, "id", "package_name");

    selectServicePackageElement.value = JSON.stringify(innerAppointment.servicePackages?.service_package_id);

    buttonUpdate.style.display = "block";
    buttonSubmit.style.display = "none";
}

//define function for check form updates for inner form
const checkFormUpdate = () => {
    let updates = "";

    if (selectServicePackageElement.value != (oldInnerServicePackage.service_packages?.service_package_id)) {
        updates += "Service changed from " + oldInnerServicePackage.service_id.name + " to " + selectServiceElement.options[selectServiceElement.selectedIndex].text + "\n";
    }
    return updates;
}

// define function for update existing service package detail
function buttonInnerUpdate() {

    let errors = checkFormError();

    if (errors == "") {
        let updates = checkFormUpdate();
        if (updates == "") {
            showToast("No changes detected to update.", "info");
        } else {
            showConfirm("Confirm Update", "Are you sure to update the service package detail with following changes ?\n" + updates + "\n Are you sure to update ?", "Update", "primary").then(confirmed => {
                if (!confirmed) return;
                innerAppointment.servicePackages = JSON.parse(selectServicePackageElement.value);

                let serviceResponse = getHTTPServicesRequest("/appointment/update", "PUT", innerAppointment);
                if (serviceResponse == "OK") {
                    showToast("Service package detail updated successfully!", "success");

                    refreshAppointmentInnerForm();
                    refreshAppointmentInnerTable();
                } else {
                    showToast("Service package detail update cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
                }
            });
        }
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
    }
}

//*********** end of the inner form area************
