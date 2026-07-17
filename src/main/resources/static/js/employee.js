window.addEventListener("load", () => {
    refreshEmployeeForm();
    refreshEmployeeTable();
});

let textFullNameElement = document.querySelector("#textFullName");
let selectCallingNameElement = document.querySelector("#selectCallingName");
let textAddressElement = document.querySelector("#textAddress");
let textEmailElement = document.querySelector("#textEmail");
let textNicElement = document.querySelector("#textNIC");
let textMobileElement = document.querySelector("#textMobile");
let textDobElement = document.querySelector("#dateDOB");
let selectDesignationElement = document.querySelector("#selectDesignation");
let selectEmployeeStatus = document.querySelector("#selectEmployeeStatus");
let tableBodyEmployee = document.querySelector("#tableBodyEmployee");

// function refresh
const refreshEmployeeForm = () => {
    document.getElementById("formEmployee").reset();
    employee = new Object();
    oldEmployee = null;


    document.querySelector('#panelEmployeeForm .offcanvas-title').textContent = 'New Employee';
    document.getElementById("empCodeDisplay").style.display = "none";
    buttonUpdate.style.display = "none";
    buttonSubmit.style.display = "inline-block";

    fillSelectFromEnum(selectDesignationElement, "designation", "-- Select Designation --");
    fillSelectFromEnum(selectEmployeeStatus, "employeeStatus", "-- Select Status --");

    // Default status
    selectEmployeeStatus.value = "Active";
    employee.employeeStatus = "Active";
    setValid(selectEmployeeStatus);

    clearValidation(textFullNameElement);
    clearValidation(selectCallingNameElement);
    clearValidation(textNicElement);
    clearValidation(textMobileElement);
    clearValidation(textDobElement);
    clearValidation(selectDesignationElement);
    clearValidation(selectEmployeeStatus);
    clearElement([textAddressElement, textEmailElement]);
};

// function refresh table
const refreshEmployeeTable = () => {
    employees = getServiceRequest("/employee/alldata");
    if (!Array.isArray(employees)) {
        employees = Object.values(employees || {});
    }

    const getEmployeeCell = (emp) => {
        return `<div class="emp-cell">
            <span class="emp-code">${escapeHtml(emp.empno)}</span>
            <span class="emp-name">${escapeHtml(emp.callingname)}</span>
            <span class="emp-fullname">${escapeHtml(emp.fullname)}</span>
        </div>`;
    };

    const getNicCell = (emp) => {
        const masked = emp.nic ? emp.nic.substring(0, 3) + "****" + emp.nic.substring(emp.nic.length - 3) : "";
        return `<div class="masked-cell">
            <span class="masked-value" data-full="${escapeHtml(emp.nic)}" data-masked="${escapeHtml(masked)}">${escapeHtml(masked)}</span>
            <button type="button" class="btn-reveal" onclick="toggleMask(this)"><i class="fa-solid fa-eye"></i></button>
        </div>`;
    };

    const getContactCell = (emp) => {
        const mobile = emp.mobile || "";
        const masked = mobile ? mobile.substring(0, 3) + "****" + mobile.substring(mobile.length - 3) : "";
        return `<div class="masked-cell">
            <span class="masked-value" data-full="${escapeHtml(mobile)}" data-masked="${escapeHtml(masked)}">${escapeHtml(masked)}</span>
            <button type="button" class="btn-reveal" onclick="toggleMask(this)"><i class="fa-solid fa-eye"></i></button>
        </div>`;
    };

    const getDesignation = (emp) => getEnumDisplayName("designation", emp.designation);

    const getStatusCell = (emp) => {
        const status = emp.employeeStatus;
        const lower = status ? status.toLowerCase() : "";
        let dotClass = "active";
        let labelClass = "active";
        let displayName = getEnumDisplayName("employeeStatus", status);
        if (lower === "resigned") {
            dotClass = "resigned";
            labelClass = "resigned";
        } else if (lower === "inactive") {
            dotClass = "inactive";
            labelClass = "inactive";
        }
        return `<span class="status-dot ${dotClass}"></span><span class="status-label ${labelClass}">${escapeHtml(displayName)}</span>`;
    };

    const getDobCell = (emp) => {
        if (!emp.dob) return "";
        return formatDate(emp.dob);
    };

    const getAgeCell = (emp) => {
        return calculateAge(emp.dob);
    };

    let propertyList = [
        { propertyName: getEmployeeCell, dataType: "function" },
        { propertyName: getNicCell, dataType: "function" },
        { propertyName: getContactCell, dataType: "function" },
        { propertyName: getDobCell, dataType: "function" },
        { propertyName: getAgeCell, dataType: "function" },
        { propertyName: getDesignation, dataType: "function" },
        { propertyName: getStatusCell, dataType: "function" },
    ];

    fillDataIntoTable(tableBodyEmployee, employees, propertyList, formRefill, employeeDelete, printEmployee);
};

const toggleMask = (btn) => {
    const span = btn.parentElement.querySelector(".masked-value");
    const isMasked = span.textContent === span.dataset.masked;
    if (isMasked) {
        span.textContent = span.dataset.full;
        btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
    } else {
        span.textContent = span.dataset.masked;
        btn.innerHTML = '<i class="fa-solid fa-eye"></i>';
    }
};


// --- Full Name → Calling Name ---

textFullNameElement.addEventListener("keyup", () => {
    let fullName = textFullNameElement.value;
    let regPattern = new RegExp("^[A-Z][a-zA-Z]*(\\s[A-Z][a-zA-Z]*){1,2}$");
    if (regPattern.test(fullName)) {
        setValid(textFullNameElement);
        employee.fullname = fullName;

        selectCallingNameElement.innerHTML = "";
        let optionMsg = document.createElement("option");
        optionMsg.selected = "selected";
        optionMsg.disabled = "disabled";
        optionMsg.value = "";
        optionMsg.innerText = "-- Select Calling Name --";
        selectCallingNameElement.appendChild(optionMsg);

        let nameParts = fullName.split(" ");
        nameParts.forEach(namePart => {
            let option = document.createElement("option");
            option.value = namePart;
            option.innerText = namePart;
            selectCallingNameElement.appendChild(option);
        });
    } else {
        setInvalid(textFullNameElement);
        employee.fullname = null;
        selectCallingNameElement.innerHTML = "";
        employee.callingname = null;
        setInvalid(selectCallingNameElement);
    }
});


// --- NIC → DOB ---

const getMonthAndDateFromDays = (noOfDays, birthYear) => {

    let days = parseInt(noOfDays);

    // Invalid day number
    if (days < 1 || days > 366) {
        return {
            month: "01",
            date: "01"
        };
    }

    let isLeap =
        (birthYear % 4 === 0 && birthYear % 100 !== 0) ||
        (birthYear % 400 === 0);

    let monthDays = [
        31,
        isLeap ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31
    ];

    let month = 1;
    let date = days;

    for (let i = 0; i < monthDays.length; i++) {

        if (date <= monthDays[i]) {
            month = i + 1;
            break;
        }

        date -= monthDays[i];
    }

    return {
        month: String(month).padStart(2, '0'),
        date: String(date).padStart(2, '0')
    };
};

textNicElement.addEventListener("keyup", () => {
    let nic = textNicElement.value;
    let regOb = new RegExp("^(([0-9]{9}[vVxX])|([0-9]{12}))$");
    if (regOb.test(nic)) {
        setValid(textNicElement);
        employee.nic = nic;

        let birthYear = "";
        let noOfDays = "";
        if (nic.length == 10) {
            birthYear = "19" + nic.substring(0, 2);
            noOfDays = nic.substring(2, 5);
        } else {
            birthYear = nic.substring(0, 4);
            noOfDays = nic.substring(4, 7);
        }
        let days = parseInt(noOfDays);

        if (days > 500) {

            // Female NIC
            days = days - 500;

            let monthAndDate = getMonthAndDateFromDays(days, parseInt(birthYear));

            textDobElement.value = birthYear + "-" + monthAndDate.month + "-" + monthAndDate.date;

            setValid(textNicElement);
            setValid(textDobElement);

            employee.nic = nic;
            employee.dob = textDobElement.value;

        } else {

            // Male NIC - Not allowed
            setInvalid(textNicElement);

            textDobElement.value = "";
            setInvalid(textDobElement);

            employee.nic = null;
            employee.dob = null;

            return;
        }

    } else {
        setInvalid(textNicElement);
        employee.nic = null;
        setInvalid(textDobElement);
        employee.dob = null;
    }
});


// --- Validation ---

const checkFormError = () => {
    let errors = "";
    if (employee.fullname == null) errors += "Full name is required\n";
    if (employee.callingname == null) errors += "Calling name is required\n";
    if (employee.nic == null) errors += "NIC is required\n";
    if (employee.email == null) errors += "Email is required\n";
    if (employee.mobile == null) errors += "Mobile number is required\n";
    if (employee.dob == null) errors += "Date of birth is required\n";
    if (employee.designation == null) errors += "Designation is required\n";
    if (employee.employeeStatus == null) errors += "Status is required\n";
    return errors;
};


// --- Submit ---

const submitEmployeeForm = () => {
    let errors = checkFormError();
    if (errors !== "") {
        showToast("Please fix the following:\n" + errors, "warning");
        return;
    }

    employee.address = textAddressElement.value || null;

    showConfirm("Submit Employee", "Are you sure you want to save this employee?", "Submit", "success").then(confirmed => {
        if (!confirmed) return;

        let serviceResponse = getHTTPServicesRequest("/employee/save", "POST", employee);
        if (serviceResponse == "OK") {
            showToast("Employee saved successfully!", "success");
            closePanel('panelEmployeeForm');
            refreshEmployeeForm();
            refreshEmployeeTable();
        } else {
            showToast("Save failed: " + serviceResponse, "error");
        }
    });
};


// --- Delete ---

const employeeDelete = (dataObject) => {
    showConfirm("Delete Employee", "Are you sure you want to delete " + dataObject.fullname + "?", "Delete", "danger").then(confirmed => {
        if (!confirmed) return;

        let serviceResponse = getHTTPServicesRequest("/employee/delete", "DELETE", dataObject);
        if (serviceResponse == "OK") {
            showToast("Employee deleted successfully!", "success");
            refreshEmployeeForm();
            refreshEmployeeTable();
        } else {
            showToast("Delete failed: " + serviceResponse, "error");
        }
    });
};


// --- Print ---

const printEmployee = (dataObject) => {
    const emp = dataObject;
    const age = calculateAge(emp.dob);
    const desig = getEnumDisplayName("designation", emp.designation);
    const status = getEnumDisplayName("employeeStatus", emp.employeeStatus);

    const newTab = window.open();
    newTab.document.write(`<!DOCTYPE html><html><head><title>Employee ${escapeHtml(emp.empno)}</title>
        <link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="/Resources/fontawesome-7.0.0/css/all.min.css">
        <link rel="stylesheet" href="/Resources/css/common.css">
        </head><body><div class="print-card">
        <div class="print-header">
            <h3><i class="fa-solid fa-user-tie me-2"></i>Employee Details</h3>
            <p>${escapeHtml(emp.empno)} - ${escapeHtml(emp.fullname)}</p>
        </div>
        <div class="print-body"><table>
            <tr><th>Employee No</th><td>${escapeHtml(emp.empno)}</td></tr>
            <tr><th>Full Name</th><td>${escapeHtml(emp.fullname)}</td></tr>
            <tr><th>Calling Name</th><td>${escapeHtml(emp.callingname)}</td></tr>
            <tr><th>NIC</th><td>${escapeHtml(emp.nic)}</td></tr>
            <tr><th>Mobile</th><td>${escapeHtml(emp.mobile)}</td></tr>
            <tr><th>Email</th><td>${escapeHtml(emp.email)}</td></tr>
            <tr><th>Date of Birth</th><td>${formatDate(emp.dob)}</td></tr>
            <tr><th>Age</th><td>${age} years</td></tr>
            <tr><th>Address</th><td>${escapeHtml(emp.address || "N/A")}</td></tr>
            <tr><th>Designation</th><td>${escapeHtml(desig)}</td></tr>
            <tr><th>Status</th><td>${escapeHtml(status)}</td></tr>
        </table></div>
        <div class="print-footer">Printed on ${new Date().toLocaleDateString("en-LK")} | Salon DEEN</div>
        </div></body></html>`);
    setTimeout(() => { newTab.print(); newTab.close(); }, 500);
};


// --- Refill (Edit) ---

const formRefill = (dataObject) => {
    employee = JSON.parse(JSON.stringify(dataObject));
    oldEmployee = JSON.parse(JSON.stringify(dataObject));

    textFullNameElement.value = employee.fullname;
    employee.fullname = employee.fullname;

    selectCallingNameElement.innerHTML = "";
    let optionMsg = document.createElement("option");
    optionMsg.selected = "selected";
    optionMsg.disabled = "disabled";
    optionMsg.value = "";
    optionMsg.innerText = "-- Select Calling Name --";
    selectCallingNameElement.appendChild(optionMsg);

    let nameParts = employee.fullname.split(" ");
    nameParts.forEach(namePart => {
        let option = document.createElement("option");
        option.value = namePart;
        option.innerText = namePart;
        selectCallingNameElement.appendChild(option);
    });
    selectCallingNameElement.value = employee.callingname;

    textAddressElement.value = employee.address || "";
    textEmailElement.value = employee.email || "";
    textNicElement.value = employee.nic || "";
    textMobileElement.value = employee.mobile || "";
    textDobElement.value = employee.dob || "";

    fillSelectFromEnum(selectDesignationElement, "designation", "-- Select Designation --");
    fillSelectFromEnum(selectEmployeeStatus, "employeeStatus", "-- Select Status --");
    selectDesignationElement.value = employee.designation;
    selectEmployeeStatus.value = employee.employeeStatus;

    document.getElementById("empCodeDisplay").style.display = "flex";
    document.getElementById("empCodeValue").textContent = employee.empno;

    buttonSubmit.style.display = "none";
    buttonUpdate.style.display = "inline-block";

    openPanel('panelEmployeeForm');
    document.querySelector('#panelEmployeeForm .offcanvas-title').textContent = 'Edit Employee';
};


// --- Update ---

const checkFormUpdates = () => {
    let updates = "";
    if (employee.fullname != oldEmployee.fullname) updates += "Full Name: " + oldEmployee.fullname + " → " + employee.fullname + "\n";
    if (employee.callingname != oldEmployee.callingname) updates += "Calling Name: " + oldEmployee.callingname + " → " + employee.callingname + "\n";
    if (employee.address != oldEmployee.address) updates += "Address changed\n";
    if (employee.email != oldEmployee.email) updates += "Email: " + oldEmployee.email + " → " + employee.email + "\n";
    if (employee.nic != oldEmployee.nic) updates += "NIC: " + oldEmployee.nic + " → " + employee.nic + "\n";
    if (employee.mobile != oldEmployee.mobile) updates += "Mobile: " + oldEmployee.mobile + " → " + employee.mobile + "\n";
    if (employee.dob != oldEmployee.dob) updates += "DOB: " + oldEmployee.dob + " → " + employee.dob + "\n";
    if (employee.designation != oldEmployee.designation) updates += "Designation: " + oldEmployee.designation + " → " + employee.designation + "\n";
    if (employee.employeeStatus != oldEmployee.employeeStatus) updates += "Status: " + oldEmployee.employeeStatus + " → " + employee.employeeStatus + "\n";
    return updates;
};

const updateEmployeeForm = () => {
    let errors = checkFormError();
    if (errors !== "") {
        showToast("Please fix the following:\n" + errors, "warning");
        return;
    }

    employee.address = textAddressElement.value || null;

    let updates = checkFormUpdates();
    if (updates === "") {
        showToast("No changes detected.", "info");
        return;
    }

    showConfirm("Update Employee", "Apply these changes?\n\n" + updates, "Update", "primary").then(confirmed => {
        if (!confirmed) return;

        let serviceResponse = getHTTPServicesRequest("/employee/update", "PUT", employee);
        if (serviceResponse == "OK") {
            showToast("Employee updated successfully!", "success");
            refreshEmployeeForm();
            closePanel('panelEmployeeForm');
            refreshEmployeeTable();
        } else {
            showToast("Update failed: " + serviceResponse, "error");
        }
    });
};
