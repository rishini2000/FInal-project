//access browser onload event
window.addEventListener("load", () => {
    refreshFittonForm();
    refreshFittonTable();
    refreshFittonInnerForm();
    refreshFittonInnerTable();
});

// Element references
const searchRentalElement = document.querySelector('#searchRental');
const hiddenRentalElement = document.querySelector('#selectRental');
const textCustomerElement = document.querySelector('#textCustomer');
const selectFittonStatusElement = document.querySelector('#selectFittonStatus');
const dateFittonElement = document.querySelector('#dateFitton');
const timeFittonElement = document.querySelector('#timeFitton');

const buttonSubmit = document.getElementById('buttonSubmit');
const buttonUpdate = document.getElementById('buttonUpdate');
const tableBodyFitton = document.querySelector('#tableBodyFitton');

// Inner form elements
const selectRentalItemElement = document.querySelector('#selectRentalItem');
const checkAlterationRequiredElement = document.querySelector('#checkAlterationRequired');
const textAlterationNoteElement = document.querySelector('#textAlterationNote');
const tableBodySelectedRentalItemsElement = document.querySelector('#tableBodySelectedRentalItemsInnerForm');
const buttonAddFittonItem = document.querySelector('#buttonAddFittonItem');

// Inner form - guard innerFitton initialization
let innerFitton = new Object();

selectRentalItemElement.addEventListener("change", () => {
    if (selectRentalItemElement.value) {
        innerFitton.item_id = JSON.parse(selectRentalItemElement.value);
    }
});

checkAlterationRequiredElement.addEventListener("change", () => {
    innerFitton.alteration_required = checkAlterationRequiredElement.checked;
    if (checkAlterationRequiredElement.checked) {
        textAlterationNoteElement.disabled = false;
    } else {
        textAlterationNoteElement.disabled = true;
        textAlterationNoteElement.value = "";
        innerFitton.alteration_note = "";
    }
});

buttonAddFittonItem.addEventListener("click", () => {
    buttonInnerFittonSubmit();
});

textAlterationNoteElement.addEventListener("keyup", () => {
    innerFitton.alteration_note = textAlterationNoteElement.value;
});

//***********start of the main form area************

function refreshFittonForm() {

    formFitton.reset();

    fitton = new Object();
    fitton.fittonHasItemsList = new Array();

    buttonUpdate.style.display = "none";
    buttonSubmit.style.display = "block";

    //rental as datalist
    let rentals = getServiceRequest("/rental/alldata");
    populateDataList(
        document.getElementById("listRental"),
        searchRentalElement,
        hiddenRentalElement,
        rentals,
        (r) => r.rent_no,
        "id"
    );

    //rental code, customer, fitton date fitton time autofill
    searchRentalElement.addEventListener("input", () => {
        const val = searchRentalElement.value;
        const match = rentals.find(r => r.rent_no === val);
        if (match) {
            hiddenRentalElement.value = match.id;

            textCustomerElement.value =
                (match.customer_id?.firstname || "") + " " +
                (match.customer_id?.lastname || "");

            let rentalItems = [];
            if (match.rentalHasItemList) {
                match.rentalHasItemList.forEach(rentalItem => {
                    if (rentalItem.item_id) rentalItems.push(rentalItem.item_id);
                });
            }

            fillDataIntoSelect(
                selectRentalItemElement,
                "Select Rental Item",
                rentalItems,
                "item_name"
            );

            dateFittonElement.value = match.fitton_date ? match.fitton_date.substring(0, 10) : "";
            fitton.fitton_date = match.fitton_date ? match.fitton_date.substring(0, 10) : "";
        }
    });

    fillSelectFromEnum(selectFittonStatusElement, "fittonStatus", "Please select status...!");

    clearElement([dateFittonElement, timeFittonElement, selectFittonStatusElement, textCustomerElement]);
    clearValidation(searchRentalElement);

    document.querySelector('#panelFittonForm .offcanvas-title').textContent = 'New Fitton';
}

const refreshFittonTable = () => {

    fittons = getServiceRequest("/fitton/alldata");

    if (!Array.isArray(fittons)) {
        fittons = Object.values(fittons || {});
    }

    const propertyList = [
        { propertyName: getRentalNo, dataType: "function" },
        { propertyName: "fitton_date", dataType: "date" },
        { propertyName: getFittonStatus, dataType: "function" },
    ];

    fillDataIntoTable(tableBodyFitton, fittons, propertyList, refillFittonForm, deleteFitton, printFitton);
}

const getRentalNo = (obj) => {
    return obj.rental_id ? obj.rental_id.rent_no : "N/A";
}

const getFittonStatus = (obj) => {
    return getEnumDisplayName("fittonStatus", obj.fittonStatus);
}

function checkFittonFormErrors() {
    let errors = "";

    if (!hiddenRentalElement.value) {
        errors += "- Rental is required.\n";
        setInvalid(searchRentalElement);
    } else {
        setValid(searchRentalElement);
    }
    if (!fitton.fitton_date) {
        errors += "- Fitton date is required.\n";
        setInvalid(dateFittonElement);
    } else {
        setValid(dateFittonElement);
    }
    if (!fitton.fittonStatus) {
        errors += "- Fitton status is required.\n";
        setInvalid(selectFittonStatusElement);
    } else {
        setValid(selectFittonStatusElement);
    }
    return errors;
}

function submitFittonForm() {

    fitton.rental_id = hiddenRentalElement.value ? { id: parseInt(hiddenRentalElement.value) } : null;
    fitton.fitton_date = dateFittonElement.value;
    fitton.fittonStatus = selectFittonStatusElement.value;

    let errors = checkFittonFormErrors();

    if (errors == "") {
        showConfirm("Submit Fitton", "Are you sure to submit the form?", "Submit", "success").then(confirmed => {
            if (!confirmed) return;
            let serviceResponse = getHTTPServicesRequest("/fitton/insert", "POST", fitton);
            if (serviceResponse == "OK") {
                showToast("Form submitted successfully!", "success");
                refreshFittonForm();
                refreshFittonTable();
                closePanel('panelFittonForm');
            } else {
                showToast("Form submission cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
            }
        });
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
    }
}

function deleteFitton(obj) {
    showConfirm("Delete Fitton", "Are you sure to delete fitton #" + obj.id + "?", "Delete", "danger").then(confirmed => {
        if (!confirmed) return;
        let serviceResponse = getHTTPServicesRequest("/fitton/delete", "DELETE", obj);
        if (serviceResponse == "OK") {
            showToast("Fitton deleted successfully!", "success");
            refreshFittonForm();
            refreshFittonTable();
            closePanel('panelFittonForm');
        } else {
            showToast("Fitton deletion cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
        }
    });
}

function printFitton(obj) {
    const newTab = window.open();
    let rentalDisplay = obj.rental_id ? escapeHtml(obj.rental_id.rent_no) : "N/A";
    newTab.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fitton - ${escapeHtml(obj.id)}</title>
    <link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css">
    <style>
        body { background: #f8f9fa; }
        .print-header { background: linear-gradient(135deg, #0d6efd, #0a58ca); }
    </style>
</head>
<body class="p-4">
    <div class="card shadow-lg border-0" style="max-width: 700px; margin: 0 auto;">
        <div class="card-header print-header text-white text-center py-4">
            <h2 class="mb-0">Fitton Details</h2>
            <small class="opacity-75">#${escapeHtml(obj.id)}</small>
        </div>
        <div class="card-body p-4">
            <table class="table table-bordered table-striped mb-0">
                <tbody>
                    <tr>
                        <th class="bg-light" style="width: 35%;">Fitton ID</th>
                        <td>${escapeHtml(obj.id)}</td>
                    </tr>
                    <tr>
                        <th class="bg-light">Rental No</th>
                        <td>${rentalDisplay}</td>
                    </tr>
                    <tr>
                        <th class="bg-light">Fitton Date</th>
                        <td>${formatDate(obj.fitton_date)}</td>
                    </tr>
                    <tr>
                        <th class="bg-light">Fitton Status</th>
                        <td>${escapeHtml(getEnumDisplayName("fittonStatus", obj.fittonStatus))}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="card-footer text-muted text-center py-3">
            <small>Printed on: ${new Date().toLocaleDateString()}</small>
        </div>
    </div>
</body>
</html>`);
    setTimeout(() => {
        newTab.print();
        newTab.close();
    }, 400);
}

function refillFittonForm(obj) {

    fitton = getServiceRequest("/fitton/byid/" + obj.id);
    if (!fitton.fittonHasItemsList) fitton.fittonHasItemsList = [];
    oldFitton = JSON.parse(JSON.stringify(fitton));

    //rental as datalist
    let rentals = getServiceRequest("/rental/alldata");
    populateDataList(
        document.getElementById("listRental"),
        searchRentalElement,
        hiddenRentalElement,
        rentals,
        (r) => r.rent_no,
        "id"
    );
    setSelectedByHiddenId(searchRentalElement, hiddenRentalElement, rentals, (r) => r.rent_no, "id", fitton.rental_id?.id);

    if (fitton.rental_id) {
        textCustomerElement.value = (fitton.rental_id.customer_id?.firstname || "") + " " + (fitton.rental_id.customer_id?.lastname || "");
        dateFittonElement.value = fitton.fitton_date ? fitton.fitton_date.substring(0, 10) : "";
    }

    fillSelectFromEnum(selectFittonStatusElement, "fittonStatus", "Please select status...!");
    selectFittonStatusElement.value = fitton.fittonStatus;

    buttonUpdate.style.display = "block";
    buttonSubmit.style.display = "none";

    document.querySelector('#panelFittonForm .offcanvas-title').textContent = 'Edit Fitton';
    openPanel('panelFittonForm');

    refreshFittonInnerTable();
}

const checkFormUpdates = () => {

    let updates = "";

    if (fitton.fitton_date !== oldFitton.fitton_date) {
        updates += `- Fitton date changed from "${oldFitton.fitton_date}" to "${fitton.fitton_date}".\n`;
    }
    if (fitton.fittonStatus !== oldFitton.fittonStatus) {
        updates += `- Fitton status changed from "${oldFitton.fittonStatus}" to "${fitton.fittonStatus}".\n`;
    }

    return updates;
}

function updateFittonForm() {

    fitton.rental_id = hiddenRentalElement.value ? { id: parseInt(hiddenRentalElement.value) } : null;
    fitton.fitton_date = dateFittonElement.value;
    fitton.fittonStatus = selectFittonStatusElement.value;

    let errors = checkFittonFormErrors();
    if (errors == "") {
        let updates = checkFormUpdates();
        if (updates == "") {
            showToast("No changes detected to update.", "info");
        } else {
            showConfirm("Update Fitton", "Are you sure to update the fitton details with following changes?\n" + updates, "Update", "primary").then(confirmed => {
                if (!confirmed) return;

                let serviceResponse = getHTTPServicesRequest("/fitton/update", "PUT", fitton);
                if (serviceResponse == "OK") {
                    showToast("Fitton details updated successfully!", "success");
                    refreshFittonForm();
                    refreshFittonTable();
                    closePanel('panelFittonForm');
                }
            });
        }
    } else {
        showToast("Form has errors:\n" + errors, "warning");
    }
}
// ***********end of the main form area*************

//**********start the inner form area***********

const refreshFittonInnerForm = () => {

    innerFitton = new Object();

    let rentals = getServiceRequest("/rental/alldata");
    let rentalItems = [];
    rentals.forEach(r => {
        if (r.rentalHasItemList) {
            r.rentalHasItemList.forEach(ri => {
                if (ri.item_id) rentalItems.push(ri.item_id);
            });
        }
    });
    fillDataIntoSelect(selectRentalItemElement, "Select Item", rentalItems, "item_name");

    clearElement([selectRentalItemElement, textAlterationNoteElement]);
    checkAlterationRequiredElement.checked = false;
    textAlterationNoteElement.disabled = true;
}

const refreshFittonInnerTable = () => {

    const propertyList = [
        { propertyName: getItemDisplayName, dataType: "function" },
        { propertyName: getAlterationDisplay, dataType: "function" },
        { propertyName: "alteration_note", dataType: "string" },
    ];

    const itemsList = Array.isArray(fitton.fittonHasItemsList) ? fitton.fittonHasItemsList : [];
    fillDataIntoInnerTable(tableBodySelectedRentalItemsElement, itemsList, propertyList, refillFittonInnerForm, deleteFittonItem);
}

const getItemDisplayName = (obj) => {
    return obj.item_id ? obj.item_id.item_name : "N/A";
}

const getAlterationDisplay = (obj) => {
    return obj.alteration_required ? "Yes" : "No";
}

function checkFormError() {
    let errors = "";
    if (!innerFitton.item_id) {
        errors += "- Item is required.\n";
    }
    return errors;
}

function buttonInnerFittonSubmit() {
    let errors = checkFormError();
    if (errors == "") {
        showConfirm("Submit Fitton Detail", "Are you sure to submit the form?", "Submit", "success").then(confirmed => {
            if (!confirmed) return;

            innerFitton.alteration_required = checkAlterationRequiredElement.checked;
            innerFitton.alteration_note = textAlterationNoteElement.value;

            fitton.fittonHasItemsList.push(innerFitton);

            showToast("Form submitted successfully!", "success");

            refreshFittonInnerForm();
            refreshFittonInnerTable();
        });
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
    }
}

function deleteFittonItem(obj) {
    showConfirm("Delete Fitton Detail", "Are you sure to delete this item?", "Delete", "danger").then(confirmed => {
        if (!confirmed) return;

        const idx = fitton.fittonHasItemsList.indexOf(obj);
        if (idx > -1) {
            fitton.fittonHasItemsList.splice(idx, 1);
        }
        showToast("Item removed successfully!", "success");

        refreshFittonInnerForm();
        refreshFittonInnerTable();
    });
}

function refillFittonInnerForm(obj) {

    innerFitton = JSON.parse(JSON.stringify(obj));
    oldInnerFitton = JSON.parse(JSON.stringify(obj));

    let rentals = getServiceRequest("/rental/alldata");
    let rentalItems = [];
    rentals.forEach(r => {
        if (r.rentalHasItemList) {
            r.rentalHasItemList.forEach(ri => {
                if (ri.item_id) rentalItems.push(ri.item_id);
            });
        }
    });
    fillDataIntoSelect(selectRentalItemElement, "Select Item", rentalItems, "item_name");

    if (innerFitton.item_id) {
        selectRentalItemElement.value = JSON.stringify(innerFitton.item_id);
    }

    checkAlterationRequiredElement.checked = !!innerFitton.alteration_required;
    textAlterationNoteElement.value = innerFitton.alteration_note || "";
    textAlterationNoteElement.disabled = !innerFitton.alteration_required;
}

const checkFormUpdate = () => {
    let updates = "";
    if (checkAlterationRequiredElement.checked != oldInnerFitton.alteration_required) {
        updates += "Alteration required changed from " + oldInnerFitton.alteration_required + " to " + checkAlterationRequiredElement.checked + "\n";
    }
    if (textAlterationNoteElement.value != (oldInnerFitton.alteration_note || "")) {
        updates += "Alteration note changed\n";
    }
    return updates;
}

function buttonInnerFittonUpdate() {

    let errors = checkFormError();

    if (errors == "") {
        let updates = checkFormUpdate();
        if (updates == "") {
            showToast("No changes detected to update.", "info");
        } else {
            showConfirm("Update Fitton Detail", "Are you sure to update the fitton detail with following changes?\n" + updates, "Update", "primary").then(confirmed => {
                if (!confirmed) return;

                const idx = fitton.fittonHasItemsList.indexOf(innerFitton);
                if (idx > -1) {
                    innerFitton.item_id = JSON.parse(selectRentalItemElement.value);
                    innerFitton.alteration_required = checkAlterationRequiredElement.checked;
                    innerFitton.alteration_note = textAlterationNoteElement.value;
                    fitton.fittonHasItemsList[idx] = innerFitton;
                }

                showToast("Fitton detail updated successfully!", "success");

                refreshFittonInnerForm();
                refreshFittonInnerTable();
            });
        }
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
    }
}
