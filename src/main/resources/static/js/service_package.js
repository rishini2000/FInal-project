window.addEventListener("load", () => {
    refreshServicePackageForm();
    refreshServicePackageTable();
});

// Form element refs
const textPackageNameElement = document.querySelector("#textPackageName");
const textDurationElement = document.querySelector("#textDuration");
const selectPackageStatusElement = document.querySelector("#selectPackageStatus");
const textNotesElement = document.querySelector("#textNotes");
const textDefaultPriceElement = document.querySelector("#textDefaultPrice");

// Inner form elements
const selectServiceCategoryElement = document.querySelector("#selectServiceCategory");
const searchServiceItemElement = document.querySelector("#searchServiceItem");
const selectServiceItemElement = document.querySelector("#selectServiceItem");
const listServiceItemElement = document.querySelector("#listServiceItem");
const tableBodySelectedServicesElement = document.querySelector("#tableBodySelectedServicesInnerForm");

// Discount display elements
const discountDisplayElement = document.querySelector("#discountDisplay");
const totalServiceValueElement = document.querySelector("#totalServiceValue");
const discountAmountElement = document.querySelector("#discountAmount");

// Promo pricing elements
const textPromoPriceElement = document.querySelector("#textPromoPrice");
const datePromoStartElement = document.querySelector("#datePromoStart");
const datePromoEndElement = document.querySelector("#datePromoEnd");
const tableBodyPromoPricesElement = document.querySelector("#tableBodyPromoPrices");

const buttonSubmit = document.getElementById("buttonSubmit");
const buttonUpdate = document.getElementById("buttonUpdate");
const tableBodyElement = document.querySelector("#tableBodyServicePackage");

//***********start of the main form area************

function refreshServicePackageForm() {
    formServicePackage.reset();

    servicePackage = new Object();
    servicePackage.servicePackageHasServiceList = new Array();
    servicePackage.servicePackagePriceList = new Array();
    servicePackage.duration = 0;

    buttonUpdate.style.display = "none";
    buttonSubmit.style.display = "block";

    fillSelectFromEnum(selectPackageStatusElement, "servicePackageStatus", "Please select status...!");
    fillSelectFromEnum(selectServiceCategoryElement,
        "serviceCategory",
        "Please select category...!");
    selectServiceCategoryElement.addEventListener("change", loadServicesByCategory);


    clearElement([textPackageNameElement, textDurationElement, selectPackageStatusElement, textNotesElement, textDefaultPriceElement]);

    document.querySelector('#panelServicePackageForm .offcanvas-title').textContent = 'New Service Package';

    textDurationElement.value = "";
    updateDiscountDisplay();

    refreshServicePackageInnerTable();
    refreshPromoPriceTable();
}

const refreshServicePackageTable = () => {
    servicePackages = getServiceRequest("/service_package/alldata");
    if (!Array.isArray(servicePackages)) {
        servicePackages = Object.values(servicePackages || {});
    }

    const getServicePackageStatus = (sp) => getEnumDisplayName("servicePackageStatus", sp.servicePackageStatus);

    const propertyList = [
        { propertyName: "package_name", dataType: "string" },
        { propertyName: "default_price", dataType: "currency" },
        { propertyName: "duration", dataType: "string" },
        { propertyName: getServicePackageStatus, dataType: "function" },
        { propertyName: getServiceName, dataType: "function" },
    ];

    fillDataIntoTable(tableBodyElement, servicePackages, propertyList, refillServicePackageForm, deleteServicePackage, printServicePackage, true, 'SERVICE_PACKAGE_UPDATE', 'SERVICE_PACKAGE_DELETE', null);
}

const getServiceName = (sp) => {
    if (sp.servicePackageHasServiceList && sp.servicePackageHasServiceList.length > 0) {
        return sp.servicePackageHasServiceList.map(item => item.service_id ? item.service_id.name : "").join(", ");
    }
    return "";
}

// Bind inputs
document.querySelector("#textPackageName").addEventListener("input", function () { servicePackage.package_name = this.value; });
document.querySelector("#textNotes").addEventListener("input", function () { servicePackage.notes = this.value; });
document.querySelector("#textDefaultPrice").addEventListener("input", function () {
    servicePackage.default_price = this.value;
    updateDiscountDisplay();
});
document.querySelector("#selectPackageStatus").addEventListener("change", function () { servicePackage.servicePackageStatus = this.value; setValid(this); });

function checkServicePackageFormErrors() {
    let errors = "";

    if (!servicePackage.package_name) {
        errors += "- Package name is required.\n";
    }
    if (!servicePackage.servicePackageStatus) {
        errors += "- Package status is required.\n";
    }
    if (!servicePackage.default_price || isNaN(servicePackage.default_price) || servicePackage.default_price <= 0) {
        errors += "- Default price is required and must be a positive number.\n";
    }
    if (!servicePackage.servicePackageHasServiceList || servicePackage.servicePackageHasServiceList.length === 0) {
        errors += "- At least one service must be added.\n";
    }
    return errors;
}

function submitServicePackageForm() {
    let errors = checkServicePackageFormErrors();

    if (errors == "") {
        showConfirm("Submit Form", "Are you sure to submit the form?", "Submit", "primary").then(confirmed => {
            if (!confirmed) return;
            let serviceResponse = getHTTPServicesRequest("/service_package/insert", "POST", servicePackage);
            if (serviceResponse == "OK") {
                showToast("Form submitted successfully!", "success");
                refreshServicePackageForm();
                refreshServicePackageTable();
                closePanel('panelServicePackageForm');
            } else {
                showToast("Form submission cancelled! Have some errors: " + serviceResponse, "error");
            }
        });
    } else {
        showToast("Please fill all required fields correctly! " + errors, "warning");
    }
}

function deleteServicePackage(obj) {
    showConfirm("Delete Service Package", "Are you sure to delete: " + obj.package_name + "?", "Delete", "danger").then(confirmed => {
        if (!confirmed) return;
        let serviceResponse = getHTTPServicesRequest("/service_package/delete", "DELETE", obj);
        if (serviceResponse == "OK") {
            showToast("Service package deleted successfully!", "success");
            refreshServicePackageForm();
            refreshServicePackageTable();
            closePanel('panelServicePackageForm');
        } else {
            showToast("Service package deletion cancelled! Have some errors: " + serviceResponse, "error");
        }
    });
}

function printServicePackage(obj) {
    const services = obj.servicePackageHasServiceList || [];
    let serviceRows = services.map((s, i) =>
        `<tr><td>${i + 1}</td><td>${escapeHtml(s.service_id ? s.service_id.name : "")}</td><td>${escapeHtml(s.service_id ? s.service_id.duration + " min" : "")}</td><td>Rs. ${formatCurrency(s.service_id ? s.service_id.price : 0)}</td></tr>`
    ).join("");

    const newTab = window.open();
    newTab.document.write(`<!DOCTYPE html><html><head><title>${escapeHtml(obj.package_name)}</title>
        <link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="/Resources/fontawesome-7.0.0/css/all.min.css">
        <link rel="stylesheet" href="/Resources/css/common.css">
        </head><body><div class="print-card">
        <div class="print-header">
            <h3><i class="fa-solid fa-box me-2"></i>Service Package Details</h3>
            <p>${escapeHtml(obj.package_name)}</p>
        </div>
        <div class="print-body"><table>
            <tr><th>Package Name</th><td>${escapeHtml(obj.package_name)}</td></tr>
            <tr><th>Default Price</th><td>Rs. ${formatCurrency(obj.default_price)}</td></tr>
            <tr><th>Duration</th><td>${escapeHtml(obj.duration)} min</td></tr>
            <tr><th>Status</th><td>${escapeHtml(getEnumDisplayName("servicePackageStatus", obj.servicePackageStatus))}</td></tr>
            <tr><th>Notes</th><td>${escapeHtml(obj.notes || "N/A")}</td></tr>
        </table>
        ${services.length > 0 ? `<h6 class="mt-3 mb-2">Services</h6>
        <table class="table table-bordered"><thead><tr><th>#</th><th>Service</th><th>Duration</th><th>Price</th></tr></thead>
        <tbody>${serviceRows}</tbody></table>` : ""}
        </div>
        <div class="print-footer">Printed on ${new Date().toLocaleDateString("en-LK")} | Salon DEEN</div>
        </div></body></html>`);
    setTimeout(() => { newTab.print(); newTab.close(); }, 500);
}

function refillServicePackageForm(obj) {
    servicePackage = getServiceRequest("/service_package/byid/" + obj.id);
    if (!servicePackage.servicePackageHasServiceList) servicePackage.servicePackageHasServiceList = [];
    if (!servicePackage.servicePackagePriceList) servicePackage.servicePackagePriceList = [];
    oldServicePackage = JSON.parse(JSON.stringify(servicePackage));

    fillSelectFromEnum(selectPackageStatusElement, "servicePackageStatus", "Please select status...!");
    fillSelectFromEnum(selectServiceCategoryElement, "serviceCategory", "Please select category...!");

    let services = getServiceRequest("/service/alldata");
    populateDataList(
        listServiceItemElement,
        searchServiceItemElement,
        selectServiceItemElement,
        services,
        (s) => s.name + " (" + s.servicecode + ")",
        "id"
    );

    textPackageNameElement.value = servicePackage.package_name;
    textNotesElement.value = servicePackage.notes || "";
    textDefaultPriceElement.value = servicePackage.default_price;
    selectPackageStatusElement.value = servicePackage.servicePackageStatus;

    buttonUpdate.style.display = "block";
    buttonSubmit.style.display = "none";

    document.querySelector('#panelServicePackageForm .offcanvas-title').textContent = 'Edit Service Package';
    openPanel('panelServicePackageForm');

    refreshServicePackageInnerTable();

    // Auto-fill today's date
    datePromoStartElement.value = new Date().toISOString().split("T")[0];

    refreshPromoPriceTable();
    recalculateDuration();
    updateDiscountDisplay();
}

const checkFormUpdates = () => {
    let updates = "";
    if (servicePackage.package_name != oldServicePackage.package_name) updates += "Package name changed\n";
    if (servicePackage.duration != oldServicePackage.duration) updates += "Duration changed\n";
    if (servicePackage.servicePackageStatus != oldServicePackage.servicePackageStatus) updates += "Status changed\n";
    if (servicePackage.default_price != oldServicePackage.default_price) updates += "Default price changed\n";
    if ((servicePackage.notes || "") != (oldServicePackage.notes || "")) updates += "Notes changed\n";
    return updates;
}

function updateServicePackageForm() {
    let errors = checkServicePackageFormErrors();
    if (errors == "") {
        let updates = checkFormUpdates();
        if (updates == "") {
            showToast("No changes detected to update.", "info");
        } else {
            showConfirm("Update Service Package", "Are you sure to update?\n" + updates, "Update", "primary").then(confirmed => {
                if (!confirmed) return;
                let serviceResponse = getHTTPServicesRequest("/service_package/update", "PUT", servicePackage);
                if (serviceResponse == "OK") {
                    showToast("Service package updated successfully!", "success");
                    refreshServicePackageForm();
                    refreshServicePackageTable();
                    closePanel('panelServicePackageForm');
                }
            });
        }
    } else {
        showToast("Form has errors: " + errors, "warning");
    }
}
// ***********end of the main form area*************

//**********start the inner form area (services)***********

function refreshServicePackageInnerTable() {
    const propertyList = [
        { propertyName: getServiceCategoryName, dataType: "function" },
        { propertyName: getServiceName_inner, dataType: "function" },
        { propertyName: getServiceDuration, dataType: "function" },
        { propertyName: getServicePrice, dataType: "function" },
    ];

    const list = Array.isArray(servicePackage.servicePackageHasServiceList) ? servicePackage.servicePackageHasServiceList : [];
    fillDataIntoInnerTable(tableBodySelectedServicesElement, list, propertyList, null, deleteServiceFromList);
}

const getServiceCategoryName = (obj) => {
    return obj?.service_id?.serviceCategory ? getEnumDisplayName("serviceCategory", obj.service_id.serviceCategory) : "";
}

const getServiceName_inner = (obj) => {
    return obj?.service_id ? obj.service_id.name : "";
}

const getServiceDuration = (obj) => {
    return obj?.service_id ? obj.service_id.duration + " min" : "";
}

const getServicePrice = (obj) => {
    return obj?.service_id ? "Rs. " + formatCurrency(obj.service_id.price) : "";
}

function addServiceToList() {
    if (!selectServiceItemElement.value) {
        showToast("Please select a service.", "warning");
        return;
    }

    showConfirm("Add Service", "Add this service to the package?", "Add", "primary").then(confirmed => {
        if (!confirmed) return;

        let allServices = getServiceRequest("/service/alldata");

        let selectedService = allServices.find(service =>
            service.id == selectServiceItemElement.value
        );

        let innerItem = new Object();
        innerItem.service_id = selectedService;

        servicePackage.servicePackageHasServiceList.push(innerItem);
        showToast("Service added!", "success");
        refreshServicePackageInnerForm();
        refreshServicePackageInnerTable();
        recalculateDuration();
        updateDiscountDisplay();
    });
}

function deleteServiceFromList(obj) {
    showConfirm("Remove Service", "Remove this service from package?", "Remove", "danger").then(confirmed => {
        if (!confirmed) return;
        const idx = servicePackage.servicePackageHasServiceList.indexOf(obj);
        if (idx > -1) {
            servicePackage.servicePackageHasServiceList.splice(idx, 1);
        }
        showToast("Service removed!", "success");
        refreshServicePackageInnerForm();
        refreshServicePackageInnerTable();
        recalculateDuration();
        updateDiscountDisplay();
    });
}

function refreshServicePackageInnerForm() {
    selectServiceCategoryElement.value = "";
    searchServiceItemElement.value = "";
    selectServiceItemElement.value = "";
}

function recalculateDuration() {
    const list = servicePackage.servicePackageHasServiceList || [];
    let total = 0;
    list.forEach(item => {
        if (item.service_id && item.service_id.duration) {
            total += parseFloat(item.service_id.duration) || 0;
        }
    });
    servicePackage.duration = total;
    textDurationElement.value = total > 0 ? total : "";
}

function updateDiscountDisplay() {
    const list = servicePackage.servicePackageHasServiceList || [];
    let totalServiceValue = 0;

    list.forEach(item => {
        if (item.service_id && item.service_id.price) {
            totalServiceValue += parseFloat(item.service_id.price) || 0;
        }
    });

    // Auto-fill Default Price
    servicePackage.default_price = totalServiceValue;
    textDefaultPriceElement.value = totalServiceValue > 0 ? totalServiceValue.toFixed(2) : "";

    const defaultPrice = parseFloat(servicePackage.default_price) || 0;

    if (totalServiceValue > 0 && defaultPrice > 0) {
        const discount = totalServiceValue - defaultPrice;
        const discountPercent = (discount / totalServiceValue) * 100;

        totalServiceValueElement.textContent = "Total Service Value: Rs. " + formatCurrency(totalServiceValue);

        if (discount > 0) {
            discountAmountElement.textContent = "You Save: Rs. " + formatCurrency(discount) + " (" + discountPercent.toFixed(0) + "%)";
            discountAmountElement.className = "text-success fw-bold";
        } else if (discount < 0) {
            discountAmountElement.textContent = "Premium: Rs. " + formatCurrency(Math.abs(discount));
            discountAmountElement.className = "text-danger fw-bold";
        } else {
            discountAmountElement.textContent = "No discount";
            discountAmountElement.className = "text-muted";
        }

        discountDisplayElement.style.display = "block";
    } else {
        discountDisplayElement.style.display = "none";
    }
}

//***********end of the inner form area (services)*************

//**********start the promotional pricing area***********

function refreshPromoPriceTable() {
    const propertyList = [
        { propertyName: "price", dataType: "currency" },
        { propertyName: "startDate", dataType: "string" },
        { propertyName: "endDate", dataType: "string" },
    ];

    const list = Array.isArray(servicePackage.servicePackagePriceList) ? servicePackage.servicePackagePriceList : [];
    fillDataIntoInnerTable(tableBodyPromoPricesElement, list, propertyList, null, deletePromoPrice);
}

function addPromoPrice() {
    if (!textPromoPriceElement.value || !datePromoStartElement.value || !datePromoEndElement.value) {
        showToast("Please fill price, start date, and end date.", "warning");
        return;
    }

    let promo = new Object();
    promo.price = textPromoPriceElement.value;
    promo.startDate = datePromoStartElement.value;
    promo.endDate = datePromoEndElement.value;

    servicePackage.servicePackagePriceList.push(promo);

    showToast("Promotional price added!", "success");
    textPromoPriceElement.value = "";
    datePromoStartElement.value = "";
    datePromoEndElement.value = "";
    refreshPromoPriceTable();
}

function deletePromoPrice(obj) {
    showConfirm("Remove Promo Price", "Remove this promotional price?", "Remove", "danger").then(confirmed => {
        if (!confirmed) return;
        const idx = servicePackage.servicePackagePriceList.indexOf(obj);
        if (idx > -1) {
            servicePackage.servicePackagePriceList.splice(idx, 1);
        }
        showToast("Promotional price removed!", "success");
        refreshPromoPriceTable();
    });
}


function loadServicesByCategory() {

    let category = selectServiceCategoryElement.value;

    let allServices = getServiceRequest("/service/alldata");

    let filteredServices = allServices.filter(service =>
        service.serviceCategory == category
    );

    populateDataList(
        listServiceItemElement,
        searchServiceItemElement,
        selectServiceItemElement,
        filteredServices,
        (service) => service.name + " (" + service.servicecode + ")",
        "id"
    );
}
//***********end of the promotional pricing area*************
