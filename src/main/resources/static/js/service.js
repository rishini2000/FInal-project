window.addEventListener("load", () => {
    refreshServiceForm();
    refreshServiceTable();
});

let selectCategoryElement = document.querySelector("#selectCategory");
let textServiceNameElement = document.querySelector("#textServiceName");
let textDurationMinutesElement = document.querySelector("#textDurationMinutes");
let textDescriptionElement = document.querySelector("#textDescription");
let selectStatusElement = document.querySelector("#selectStatus");
let textPriceElement = document.querySelector("#textPrice");

let buttonUpdate = document.getElementById("buttonUpdate");
let buttonSubmit = document.getElementById("buttonSubmit");
let tableBodyService = document.querySelector("#tableBodyService");

function refreshServiceForm() {

    formService.reset();

    service = new Object();

    document.querySelector('#panelServiceForm .offcanvas-title').textContent = 'New Service';
    document.getElementById("serviceCodeDisplay").style.display = "none";

    fillSelectFromEnum(selectCategoryElement, "serviceCategory", "Please select category...!");
    fillSelectFromEnum(selectStatusElement, "serviceStatus", "Please select status...!");

    buttonUpdate.style.display = "none";
    buttonSubmit.style.display = "inline-block";

    clearValidation(selectCategoryElement);
    clearValidation(selectStatusElement);
    clearValidation(textServiceNameElement);
    clearValidation(textDurationMinutesElement);
    clearValidation(textPriceElement);
    clearElement([textDescriptionElement]);
}

function refreshServiceTable() {

    services = getServiceRequest("/service/alldata");
    if (!Array.isArray(services)) {
        services = Object.values(services || {});
    }
    let propertyList = [
        { propertyName: "name", dataType: "string" },
        { propertyName: getService_Category, dataType: "function" },
        { propertyName: "duration", dataType: "string" },
        { propertyName: "price", dataType: "currency" },
        { propertyName: getService_Status, dataType: "function" }
    ];
    fillDataIntoTable(tableBodyService, services, propertyList, formRefill, serviceDelete, printService, true, 'SERVICE_UPDATE', 'SERVICE_DELETE', null);
}

const getService_Category = (dataObject) => {
    return getEnumDisplayName("serviceCategory", dataObject.serviceCategory);
}

const getService_Status = (dataObject) => {
    return getEnumDisplayName("serviceStatus", dataObject.serviceStatus);
};

// bind inputs to object
document.querySelector("#textServiceName").addEventListener("input", function() { service.name = this.value; });
document.querySelector("#textDurationMinutes").addEventListener("input", function() { service.duration = this.value; });
document.querySelector("#textDescription").addEventListener("input", function() { service.description = this.value; });
document.querySelector("#textPrice").addEventListener("input", function() { service.price = this.value; });
document.querySelector("#selectCategory").addEventListener("change", function() { service.serviceCategory = this.value; setValid(this); });
document.querySelector("#selectStatus").addEventListener("change", function() { service.serviceStatus = this.value; setValid(this); });

function checkServiceFormError() {
    let errors = "";

    if (!service.name) {
        errors += "Service name is required..!\n";
        setInvalid(textServiceNameElement);
    } else {
        setValid(textServiceNameElement);
    }
    if (!service.serviceCategory) {
        errors += "Category is required..!\n";
        setInvalid(selectCategoryElement);
    } else {
        setValid(selectCategoryElement);
    }
    if (!service.duration) {
        errors += "Duration is required..!\n";
        setInvalid(textDurationMinutesElement);
    } else {
        setValid(textDurationMinutesElement);
    }
    if (!service.serviceStatus) {
        errors += "Status is required..!\n";
        setInvalid(selectStatusElement);
    } else {
        setValid(selectStatusElement);
    }
    if (!service.price) {
        errors += "Price is required..!\n";
        setInvalid(textPriceElement);
    } else {
        setValid(textPriceElement);
    }

    return errors;
}

function submitServiceForm() {

    let errors = checkServiceFormError();

    if (errors == "") {
        showConfirm("Confirm Submission", "Are you sure to submit the form ?", "Submit", "primary").then(confirmed => {
            if (!confirmed) return;
            let serviceResponse = getHTTPServicesRequest("/service/insert", "POST", service);
            if (serviceResponse == "OK") {
                showToast("Form submitted successfully!", "success");
                closePanel('panelServiceForm');
                refreshServiceForm();
                refreshServiceTable();
            } else {
                showToast("Form submission cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
            }
        });
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
    }
}

const serviceDelete = (dataObject) => {
    showConfirm("Delete Service", "Are you sure to delete service : " + dataObject.name + " ?", "Delete", "danger").then(confirmed => {
        if (!confirmed) return;
        let serviceResponse = getHTTPServicesRequest("/service/delete", "DELETE", dataObject);
        if (serviceResponse == "OK") {
            showToast("Service deleted successfully!", "success");
            refreshServiceForm();
            refreshServiceTable();
            closePanel('panelServiceForm');
        } else {
            showToast("Service deletion cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
        }
    });
};

const printService = (dataObject) => {
    const svc = dataObject;
    const newTab = window.open();
    newTab.document.write(`<!DOCTYPE html><html><head><title>Service ${escapeHtml(svc.servicecode || svc.name)}</title>
        <link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="/Resources/fontawesome-7.0.0/css/all.min.css">
        <link rel="stylesheet" href="/Resources/css/common.css">
        </head><body><div class="print-card">
        <div class="print-header">
            <h3><i class="fa-solid fa-hand-sparkles me-2"></i>Service Details</h3>
            <p>${escapeHtml(svc.name)}</p>
        </div>
        <div class="print-body"><table>
            <tr><th>Service Code</th><td>${escapeHtml(svc.servicecode || "N/A")}</td></tr>
            <tr><th>Name</th><td>${escapeHtml(svc.name)}</td></tr>
            <tr><th>Category</th><td>${escapeHtml(getEnumDisplayName("serviceCategory", svc.serviceCategory))}</td></tr>
            <tr><th>Duration</th><td>${escapeHtml(svc.duration)} min</td></tr>
            <tr><th>Price</th><td>Rs. ${formatCurrency(svc.price)}</td></tr>
            <tr><th>Status</th><td>${escapeHtml(getEnumDisplayName("serviceStatus", svc.serviceStatus))}</td></tr>
            <tr><th>Description</th><td>${escapeHtml(svc.description || "N/A")}</td></tr>
        </table></div>
        <div class="print-footer">Printed on ${new Date().toLocaleDateString("en-LK")} | Salon DEEN</div>
        </div></body></html>`);
    setTimeout(() => { newTab.print(); newTab.close(); }, 500);
};

const formRefill = (dataObject) => {

    service = JSON.parse(JSON.stringify(dataObject));
    oldService = JSON.parse(JSON.stringify(dataObject));

    textServiceNameElement.value = service.name;
    textDurationMinutesElement.value = service.duration;
    textDescriptionElement.value = service.description || "";
    textPriceElement.value = service.price;

    fillSelectFromEnum(selectCategoryElement, "serviceCategory", "Please select category...!");
    fillSelectFromEnum(selectStatusElement, "serviceStatus", "Please select status...!");
    selectCategoryElement.value = service.serviceCategory;
    selectStatusElement.value = service.serviceStatus;

    document.getElementById("serviceCodeDisplay").style.display = "flex";
    document.getElementById("serviceCodeValue").textContent = service.servicecode;

    buttonUpdate.style.display = "inline-block";
    buttonSubmit.style.display = "none";
    openPanel('panelServiceForm');
    document.querySelector('#panelServiceForm .offcanvas-title').textContent = 'Edit Service';
};

const checkFormUpdates = () => {

    let updates = "";

    if (service.name != oldService.name) {
        updates += "Name changed from " + oldService.name + " to " + service.name + "\n";
    }
    if (service.serviceCategory != oldService.serviceCategory) {
        updates += "Category changed from " + oldService.serviceCategory + " to " + service.serviceCategory + "\n";
    }
    if (service.duration != oldService.duration) {
        updates += "Duration changed from " + oldService.duration + " to " + service.duration + "\n";
    }
    if (service.price != oldService.price) {
        updates += "Price changed from " + oldService.price + " to " + service.price + "\n";
    }
    if (service.description != oldService.description) {
        updates += "Description changed from " + oldService.description + " to " + service.description + "\n";
    }
    if (service.serviceStatus != oldService.serviceStatus) {
        updates += "Status changed from " + oldService.serviceStatus + " to " + service.serviceStatus + "\n";
    }
    return updates;
};

const updateServiceForm = () => {

    let errors = checkServiceFormError();
    if (errors == "") {
        let updates = checkFormUpdates();
        if (updates == "") {
            showToast("No changes detected to update.", "info");
        } else {
            showConfirm("Confirm Update", "Are you sure to update the service details with following changes ?\n" + updates, "Update", "primary").then(confirmed => {
                if (!confirmed) return;
                let serviceResponse = getHTTPServicesRequest("/service/update", "PUT", service);
                if (serviceResponse == "OK") {
                    showToast("Service details updated successfully!", "success");
                    refreshServiceTable();
                    refreshServiceForm();
                    closePanel('panelServiceForm');
                } else {
                    showToast("Service update cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
                }
            });
        }
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
    }
};
