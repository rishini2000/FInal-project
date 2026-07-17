window.addEventListener("load", () => {
    refreshPrivilageForm();
    refreshPrivilageTable();
});

let selectRoleElement = document.querySelector("#selectRole");
let selectModuleElement = document.querySelector("#selectModule");

let checkboxSelectElement = document.querySelector("#checkboxSelect");
let checkboxInsertElement = document.querySelector("#checkboxInsert");
let checkboxUpdateElement = document.querySelector("#checkboxUpdate");
let checkboxDeleteElement = document.querySelector("#checkboxDelete");

let tableBodyPrivilage = document.querySelector("#tableBodyPrivilage");

const formPrivilage = document.querySelector("#formPrivilage");
const buttonSubmit = document.querySelector("#buttonSubmit");
const buttonUpdate = document.querySelector("#buttonUpdate");

checkboxSelectElement.addEventListener("change", () => {
    privilage.privSelect = checkboxSelectElement.checked;
});

checkboxInsertElement.addEventListener("change", () => {
    privilage.privInsert = checkboxInsertElement.checked;
});

checkboxUpdateElement.addEventListener("change", () => {
    privilage.privUpdate = checkboxUpdateElement.checked;
});

checkboxDeleteElement.addEventListener("change", () => {
    privilage.privDelete = checkboxDeleteElement.checked;
});

function refreshPrivilageForm() {
    if (formPrivilage) {
        formPrivilage.reset();
    }

    selectRoleElement.disabled = false;
    selectModuleElement.disabled = false;

    privilage = new Object();
    privilage.privSelect = false;
    privilage.privInsert = false;
    privilage.privUpdate = false;
    privilage.privDelete = false;

    document.querySelector('#panelPrivilageForm .offcanvas-title').textContent = 'New Privilege';

    let roles = getServiceRequest("/role/alldatawithoutadmin");
    fillDataIntoSelect(selectRoleElement, "-- Select Role --", roles, "name");

    let modules = getServiceRequest("/module/alldata");
    fillDataIntoSelect(selectModuleElement, "-- Select Module --", modules, "name");

    checkboxDeleteElement.checked = false;
    checkboxSelectElement.checked = false;
    checkboxInsertElement.checked = false;
    checkboxUpdateElement.checked = false;

    buttonUpdate.style.display = "none";
    buttonSubmit.style.display = "block";
    clearElement([selectRoleElement, selectModuleElement]);
}

function refreshPrivilageTable() {
    privilages = getServiceRequest("/privilage/alldata");
    if (!Array.isArray(privilages)) {
        privilages = Object.values(privilages || {});
    }
    let propertyList = [
        { propertyName: getRole, dataType: "function" },
        { propertyName: getModule, dataType: "function" },
        { propertyName: getSelect, dataType: "function" },
        { propertyName: getInsert, dataType: "function" },
        { propertyName: getUpdate, dataType: "function" },
        { propertyName: getDelete, dataType: "function" }
    ];
    fillDataIntoTable(tableBodyPrivilage, privilages, propertyList, refillPrivilageForm, deletePrivilage, printPrivilage);
}

const getRole = (obj) => {
    return obj.role_id ? obj.role_id.name : "N/A";
}
const getModule = (obj) => {
    return obj.module_id ? obj.module_id.name : "N/A";
}
const getSelect = (obj) => {
    return obj.privSelect ? "Yes" : "No";
}
const getInsert = (obj) => {
    return obj.privInsert ? "Yes" : "No";
}
const getUpdate = (obj) => {
    return obj.privUpdate ? "Yes" : "No";
}
const getDelete = (obj) => {
    return obj.privDelete ? "Yes" : "No";
}

function checkPrivilageFormErrors() {
    let errors = "";
    if (privilage.role_id == null) {
        errors += "please select a role.\n";
        setInvalid(selectRoleElement);
    } else {
        setValid(selectRoleElement);
    }
    if (privilage.module_id == null) {
        errors += "please select a module.\n";
        setInvalid(selectModuleElement);
    } else {
        setValid(selectModuleElement);
    }
    return errors;
}

function submitPrivilageForm() {
    const errors = checkPrivilageFormErrors();
    if (errors == "") {
        showConfirm("Add Privilage", "Are you sure to add this privilage?\nRole: " + privilage.role_id.name + "\nModule: " + privilage.module_id.name, "Add", "primary").then(confirmed => {
            if (!confirmed) return;
            let postResponse = getHTTPServicesRequest("/privilage/insert", "POST", privilage);
            if (postResponse == "OK") {
                showToast("Privilage added successfully!", "success");
                refreshPrivilageForm();
                refreshPrivilageTable();
                closePanel('panelPrivilageForm');
            } else {
                showToast("Privilage addition cancelled..! \n Have some errors.. \n" + postResponse, "error");
            }
        });
    } else {
        showToast("Privilage save not completed..!\n form has some errors.. \n" + errors, "warning");
    }
}

const deletePrivilage = (dataObject) => {
    showConfirm("Delete Privilage", "Are you sure to delete privilage with Role: " + getRole(dataObject) + " and Module: " + getModule(dataObject) + " ?", "Delete", "danger").then(confirmed => {
        if (!confirmed) return;
        let deleteResponse = getHTTPServicesRequest("/privilage/delete", "DELETE", dataObject);
        if (deleteResponse == "OK") {
            showToast("Privilage deleted successfully!", "success");
            refreshPrivilageForm();
            refreshPrivilageTable();
            closePanel('panelPrivilageForm');
        } else {
            showToast("Privilage deletion cancelled..! \n Have some errors.. \n" + deleteResponse, "error");
        }
    });
}

function printPrivilage(dataObject) {
    const priv = dataObject;
    const newTab = window.open();
    newTab.document.write(`<!DOCTYPE html><html><head><title>Privilage</title>
        <link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="/Resources/fontawesome-7.0.0/css/all.min.css">
        <link rel="stylesheet" href="/Resources/css/common.css">
        </head><body><div class="print-card">
        <div class="print-header">
            <h3><i class="fa-solid fa-key me-2"></i>Privilage Details</h3>
            <p>${escapeHtml(priv.role_id ? priv.role_id.name : "")} - ${escapeHtml(priv.module_id ? priv.module_id.name : "")}</p>
        </div>
        <div class="print-body"><table>
            <tr><th>Role</th><td>${escapeHtml(priv.role_id ? priv.role_id.name : "N/A")}</td></tr>
            <tr><th>Module</th><td>${escapeHtml(priv.module_id ? priv.module_id.name : "N/A")}</td></tr>
            <tr><th>Select</th><td>${priv.privSelect ? "Yes" : "No"}</td></tr>
            <tr><th>Insert</th><td>${priv.privInsert ? "Yes" : "No"}</td></tr>
            <tr><th>Update</th><td>${priv.privUpdate ? "Yes" : "No"}</td></tr>
            <tr><th>Delete</th><td>${priv.privDelete ? "Yes" : "No"}</td></tr>
        </table></div>
        <div class="print-footer">Printed on ${new Date().toLocaleDateString("en-LK")} | Salon DEEN</div>
        </div></body></html>`);
    setTimeout(() => { newTab.print(); newTab.close(); }, 500);
}

const refillPrivilageForm = (dataObject) => {
    privilage = JSON.parse(JSON.stringify(dataObject));
    oldPrivilage = JSON.parse(JSON.stringify(dataObject));

    // Re-populate selects with options
    let roles = getServiceRequest("/role/alldatawithoutadmin");
    fillDataIntoSelect(selectRoleElement, "-- Select Role --", roles, "name");

    let modules = getServiceRequest("/module/alldata");
    fillDataIntoSelect(selectModuleElement, "-- Select Module --", modules, "name");

    // Disable selects on edit (role+module is the unique key)
    selectRoleElement.disabled = true;
    selectModuleElement.disabled = true;

    // Find and set the matching option by comparing IDs
    for (let opt of selectRoleElement.options) {
        try {
            let parsed = JSON.parse(opt.value);
            if (parsed && parsed.id === privilage.role_id.id) {
                selectRoleElement.value = opt.value;
                break;
            }
        } catch (e) {}
    }
    for (let opt of selectModuleElement.options) {
        try {
            let parsed = JSON.parse(opt.value);
            if (parsed && parsed.id === privilage.module_id.id) {
                selectModuleElement.value = opt.value;
                break;
            }
        } catch (e) {}
    }

    checkboxSelectElement.checked = privilage.privSelect;
    checkboxInsertElement.checked = privilage.privInsert;
    checkboxUpdateElement.checked = privilage.privUpdate;
    checkboxDeleteElement.checked = privilage.privDelete;

    buttonUpdate.style.display = "block";
    buttonSubmit.style.display = "none";
    openPanel('panelPrivilageForm');
    document.querySelector('#panelPrivilageForm .offcanvas-title').textContent = 'Edit Privilege';
}

function checkFormUpdate() {
    let updates = "";
    if (privilage.privSelect != oldPrivilage.privSelect) {
        updates += "Select privilage: " + (oldPrivilage.privSelect ? "granted" : "not granted") + " to " + (privilage.privSelect ? "granted" : "not granted") + "\n";
    }
    if (privilage.privInsert != oldPrivilage.privInsert) {
        updates += "Insert privilage: " + (oldPrivilage.privInsert ? "granted" : "not granted") + " to " + (privilage.privInsert ? "granted" : "not granted") + "\n";
    }
    if (privilage.privUpdate != oldPrivilage.privUpdate) {
        updates += "Update privilage: " + (oldPrivilage.privUpdate ? "granted" : "not granted") + " to " + (privilage.privUpdate ? "granted" : "not granted") + "\n";
    }
    if (privilage.privDelete != oldPrivilage.privDelete) {
        updates += "Delete privilage: " + (oldPrivilage.privDelete ? "granted" : "not granted") + " to " + (privilage.privDelete ? "granted" : "not granted") + "\n";
    }
    return updates;
}

function updatePrivilageForm() {
    let errors = checkPrivilageFormErrors();
    if (errors == "") {
        let updates = checkFormUpdate();
        if (updates == "") {
            showToast("Save not completed..! \n No changes to update..", "info");
        } else {
            showConfirm("Update Privilage", "Are you sure to update this privilage? \n" + updates, "Update", "primary").then(confirmed => {
                if (!confirmed) return;
                let updateResponse = getHTTPServicesRequest("/privilage/update", "PUT", privilage);
                if (updateResponse == "OK") {
                    showToast("Privilage updated successfully!", "success");
                    refreshPrivilageForm();
                    refreshPrivilageTable();
                    closePanel('panelPrivilageForm');
                } else {
                    showToast("Privilage update cancelled..! \n Have some errors.. \n" + updateResponse, "error");
                }
            });
        }
    } else {
        showToast("Privilage update not completed..!\n form has some errors.. \n" + errors, "warning");
    }
}
