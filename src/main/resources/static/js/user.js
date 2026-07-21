
window.addEventListener("load", () => {
    refreshUserForm();
    refreshUserTable();
});

let searchEmployeeElement = document.querySelector("#searchEmployee");
let listEmployeeElement = document.querySelector("#listEmployee");
let selectEmployeeElement = document.querySelector("#selectEmployee");
let textUserNameElement = document.querySelector("#textUsername");
let textUserPasswordElement = document.querySelector("#textPassword");
let textUserRetypePasswordElement = document.querySelector("#textRetypePassword");

let checkUserStatusElement = document.querySelector("#checkUserStatus");
let lblUserStatusElement = document.querySelector("#lblUserStatus");
let tableBodyUser = document.querySelector("#tableBodyUser");

function refreshUserForm() {
    formUser.reset();
    user = new Object();
    user.roles = [];
    document.querySelector('#panelUserForm .offcanvas-title').textContent = 'New User';

    buttonUpdate.style.display = "none";
    buttonSubmit.style.display = "block";

    let employees = getServiceRequest("/employee/available");
    populateDataList(listEmployeeElement, searchEmployeeElement, selectEmployeeElement, employees, "fullname", "id");

    searchEmployeeElement.addEventListener("keyup", () => {

        let selectedEmployee = employees.find(
            emp => emp.fullname === searchEmployeeElement.value
        );

        if (selectedEmployee) {

            user.employee_id = selectedEmployee;
            setValid(searchEmployeeElement);

        } else {

            user.employee_id = null;
            setInvalid(searchEmployeeElement);

        }

    });

    clearElement([textUserNameElement, textUserPasswordElement, textUserRetypePasswordElement]);

    lblUserStatusElement.innerText = "User Account Active";
    checkUserStatusElement.checked = true;
    user.status = true;

    let roles = getServiceRequest("/role/alldatawithoutadmin");
    divRole.innerHTML = "";

    roles.forEach(role => {
        let div = document.createElement("div");
        div.className = "form-check form-check-inline";
        let inputElement = document.createElement("input");
        inputElement.type = "checkbox";
        inputElement.className = "form-check-input input-element";
        inputElement.onchange = () => {
            if (inputElement.checked) {
                user.roles.push(role);
            } else {
                let existingRoleIndex = user.roles.map(r => r.id).indexOf(role.id);
                if (existingRoleIndex > -1) {
                    user.roles.splice(existingRoleIndex, 1);
                }
            }
        }
        let labelElement = document.createElement("label");
        labelElement.className = "form-check-label fw-bold";
        labelElement.innerText = role.name;

        div.appendChild(inputElement);
        div.appendChild(labelElement);
        divRole.appendChild(div);
    });
}

function refreshUserTable() {
    users = getServiceRequest("/user/alldata");
    if (!Array.isArray(users)) {
        users = Object.values(users || {});
    }
    let propertyList = [
        { propertyName: getEmployee, dataType: "function" },
        { propertyName: "username", dataType: "string" },
        { propertyName: getRoles, dataType: "function" },
        { propertyName: getStatus, dataType: "function" }
    ];
    fillDataIntoTable(tableBodyUser, users, propertyList, formRefill, userDelete, printUser, true, 'USER_UPDATE', 'USER_DELETE', null);
}

const getEmployee = (dataObject) => {
    return dataObject.employee_id.fullname;
}

const getRoles = (dataObject) => {
    let userRoles = getServiceRequest("/role/byuser/" + dataObject.id);
    let roles = "";
    userRoles.forEach(role => {
        roles += role.name + " ";
    });
    return roles;
}

const getStatus = (dataObject) => {
    if (dataObject.status) {
        return "Active <i class='bi bi-check-circle-fill text-success'></i>";
    } else {
        return "Inactive <i class='bi bi-x-circle-fill text-danger'></i>";
    }
}

textUserNameElement.addEventListener("keyup", () => {
    let username = textUserNameElement.value;
    if (username.length >= 3) {
        setValid(textUserNameElement);
        user.username = username;
    } else {
        setInvalid(textUserNameElement);
        user.username = null;
    }
});


textUserRetypePasswordElement.addEventListener("keyup", () => {
    textPasswordReTypeValidator(textUserRetypePasswordElement);
});

function checkFormError() {
    let errors = "";
    if (user.employee_id == null) {
        errors += "Please select employee..!\n";
    }
    if (user.username == null) {
        errors += "Username is required..!\n";
    }
    if (user.password == null) {
        errors += "Password is required..!\n";
    }
    if (user.retypePassword == null) {
        errors += "Retype Password is required..!\n";
    }
    if (user.password != user.retypePassword) {
        errors += "Passwords do not match..!\n";
    }
    if (user.roles.length == 0) {
        errors += "Role is required..!\n";
    }
    return errors;
}

const textPasswordReTypeValidator = (elementId) => {

    if (textUserPasswordElement.value === elementId.value) {

        setValid(textUserPasswordElement);
        setValid(elementId);

        user.password = textUserPasswordElement.value;
        user.retypePassword = elementId.value;

    } else {

        setInvalid(textUserPasswordElement);
        setInvalid(elementId);

        user.password = null;
        user.retypePassword = null;
    }
}

function submitUserForm() {
    let errors = checkFormError();
    if (errors == "") {
        showConfirm("Submit User", "Are you sure to submit the form?", "Submit", "primary").then(confirmed => {
            if (!confirmed) return;
            let serviceResponse = getHTTPServicesRequest("/user/insert", "POST", user);
            if (serviceResponse == "OK") {
                showToast("Form submitted successfully!", "success");
                closePanel('panelUserForm');
                refreshUserForm();
                refreshUserTable();
            } else {
                showToast("Form submission cancelled. Have some errors: " + serviceResponse, "error");
            }
        });
    } else {
        showToast("Please fill all required fields correctly.\n" + errors, "warning");
    }
}

const userDelete = (dataObject) => {
    showConfirm("Delete User", "Are you sure to delete user: " + dataObject.username + "?", "Delete", "danger").then(confirmed => {
        if (!confirmed) return;
        let serviceResponse = getHTTPServicesRequest("/user/delete", "DELETE", dataObject);
        if (serviceResponse == "OK") {
            showToast("User deleted successfully!", "success");
            refreshUserForm();
            refreshUserTable();
            closePanel('panelUserForm');
        } else {
            showToast("User deletion cancelled. Have some errors: " + serviceResponse, "error");
        }
    });
}

const printUser = (dataObject) => {
    const usr = dataObject;
    const newTab = window.open();
    newTab.document.write(`<!DOCTYPE html><html><head><title>User ${escapeHtml(usr.username)}</title>
        <link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="/Resources/fontawesome-7.0.0/css/all.min.css">
        <link rel="stylesheet" href="/Resources/css/common.css">
        </head><body><div class="print-card">
        <div class="print-header">
            <h3><i class="fa-solid fa-user-shield me-2"></i>User Details</h3>
            <p>${escapeHtml(usr.username)}</p>
        </div>
        <div class="print-body"><table>
            <tr><th>Username</th><td>${escapeHtml(usr.username)}</td></tr>
            <tr><th>Employee</th><td>${escapeHtml(usr.employee_id ? usr.employee_id.fullname : "N/A")}</td></tr>
            <tr><th>Roles</th><td>${escapeHtml(usr.roles ? usr.roles.map(r => r.name).join(", ") : "N/A")}</td></tr>
            <tr><th>Status</th><td>${usr.status ? "Active" : "Inactive"}</td></tr>
        </table></div>
        <div class="print-footer">Printed on ${new Date().toLocaleDateString("en-LK")} | Salon DEEN</div>
        </div></body></html>`);
    setTimeout(() => { newTab.print(); newTab.close(); }, 500);
};

function formRefill(dataObject) {
    user = JSON.parse(JSON.stringify(dataObject));
     console.log(user);

    user.roles = getServiceRequest("/role/byuser/" + user.id);

    oldUser = JSON.parse(JSON.stringify(user));

if (!user.roles) {
    user.roles = [];
}

    let employees = getServiceRequest("/employee/alldata");
    populateDataList(listEmployeeElement, searchEmployeeElement, selectEmployeeElement, employees, "fullname", "id");
    setSelectedByHiddenId(searchEmployeeElement, selectEmployeeElement, employees, "fullname", "id", user.employee_id ? user.employee_id.id : null);

    textUserNameElement.value = user.username;
    textUserPasswordElement.value = "";
    textUserRetypePasswordElement.value = "";

    if (user.status) {
        checkUserStatusElement.checked = true;
        lblUserStatusElement.innerText = "User account is Active";
    } else {
        checkUserStatusElement.checked = false;
        lblUserStatusElement.innerText = "User account is Inactive";
    }

    let roles = getServiceRequest("/role/alldatawithoutadmin");
    divRole.innerHTML = "";
    roles.forEach(role => {
        let div = document.createElement("div");
        div.className = "form-check form-check-inline";
        let inputElement = document.createElement("input");
        inputElement.type = "checkbox";
        inputElement.className = "form-check-input input-element";
        inputElement.onchange = () => {
            if (inputElement.checked) {
                user.roles.push(role);
            } else {
                let existingRoleIndex = user.roles.map(r => r.id).indexOf(role.id);
                if (existingRoleIndex > -1) {
                    user.roles.splice(existingRoleIndex, 1);
                }
            }
        }
        let existingRoleIndex = (user.roles || []).map(rl => rl.name).indexOf(role.name);
        if (existingRoleIndex > -1) {
            inputElement.checked = true;
        }
        let labelElement = document.createElement("label");
        labelElement.className = "form-check-label fw-bold";
        labelElement.innerText = role.name;

        div.appendChild(inputElement);
        div.appendChild(labelElement);
        divRole.appendChild(div);
    });

    buttonUpdate.style.display = "block";
    buttonSubmit.style.display = "none";
    openPanel('panelUserForm');
    document.querySelector('#panelUserForm .offcanvas-title').textContent = 'Edit User';
}

const checkFormUpdates = () => {
    let updates = "";
    if (user.employee_id.id != oldUser.employee_id.id) {
        updates += "Employee changed from " + oldUser.employee_id.fullname + " to " + user.employee_id.fullname + "\n";
    }
    if (user.username != oldUser.username) {
        updates += "Username changed from " + oldUser.username + " to " + user.username + "\n";
    }
    if (user.status != oldUser.status) {
        updates += "Status changed from " + (oldUser.status ? "Active" : "Inactive") + " to " + (user.status ? "Active" : "Inactive") + "\n";
    }
    if (user.roles.length != oldUser.roles.length) {
        updates += "Role changed from " + oldUser.roles.map(r => r.name).join(", ") + " to " + user.roles.map(r => r.name).join(", ") + "\n";
    } else {
        let roleChanges = [];
        user.roles.forEach(role => {
            let existingRoleIndex = oldUser.roles.map(r => r.name).indexOf(role.name);
            if (existingRoleIndex == -1) {
                roleChanges.push("Added role: " + role.name);
            }
        });
        oldUser.roles.forEach(role => {
            let existingRoleIndex = user.roles.map(r => r.name).indexOf(role.name);
            if (existingRoleIndex == -1) {
                roleChanges.push("Removed role: " + role.name);
            }
        });
        if (roleChanges.length > 0) {
            updates += roleChanges.join("\n") + "\n";
        }
    }
    return updates;
}

const updateUserForm = () => {
    let errors = checkFormError();
    if (errors == "") {
        let updates = checkFormUpdates();
        if (updates == "") {
            showToast("No changes detected to update.", "info");
        } else {
            showConfirm("Update User", "Are you sure to update the user details with following changes?\n" + updates, "Update", "primary").then(confirmed => {
                if (!confirmed) return;
                user.addeddatetime = oldUser.addeddatetime;
                let serviceResponse = getHTTPServicesRequest("/user/update", "PUT", user);
                if (serviceResponse == "OK") {
                    showToast("User details updated successfully!", "success");
                    refreshUserForm();
                    refreshUserTable();
                    closePanel('panelUserForm');
                } else {
                    showToast("User update cancelled. Have some errors: " + serviceResponse, "error");
                }
            });
        }
    } else {
        showToast("Please fill all required fields correctly.\n" + errors, "warning");
        return;
    }
}
