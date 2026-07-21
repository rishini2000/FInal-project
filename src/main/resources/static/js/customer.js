window.addEventListener("load", () => {
    refreshCustomerForm();
    refreshCustomerTable();
});

let textFirstnameElement = document.querySelector("#textFirstname");
let textLastnameElement = document.querySelector("#textLastname");
let textMobileElement = document.querySelector("#textMobile");
let textEmailElement = document.querySelector("#textEmail");
let textAddressElement = document.querySelector("#textAddress");
let textNotesElement = document.querySelector("#textNotes");

let buttonUpdate = document.getElementById("buttonUpdate");
let buttonSubmit = document.getElementById("buttonSubmit");
let tableBodyCustomer = document.querySelector("#tableBodyCustomer");


const refreshCustomerForm = () => {
    document.getElementById("formCustomer").reset();
    customer = new Object();
    oldCustomer = null;

    document.querySelector('#panelCustomerForm .offcanvas-title').textContent = 'New Customer';
    document.getElementById("customerCodeDisplay").style.display = "none";
    buttonUpdate.style.display = "none";
    buttonSubmit.style.display = "inline-block";

    clearValidation(textFirstnameElement);
    clearValidation(textLastnameElement);
    clearValidation(textMobileElement);
    clearValidation(textEmailElement);
    clearElement([textAddressElement, textNotesElement]);
};

const refreshCustomerTable = () => {
    let customers = getServiceRequest("/customer/alldata");
    if (!Array.isArray(customers)) {
        customers = Object.values(customers || {});
    }

    //sort customers by id in descending order //I sorted the retrieved list before displaying it."
    customers.sort((a, b) => b.id - a.id);

    const getCustomerCell = (cust) => {
        return `<div class="emp-cell">
            <span class="emp-code">${escapeHtml(cust.customercode)}</span>
            <span class="emp-name">${escapeHtml(cust.firstname)} ${escapeHtml(cust.lastname)}</span>
        </div>`;
    };

    const getContactCell = (cust) => {
        const mobile = cust.mobile || "";
        const masked = mobile ? mobile.substring(0, 3) + "****" + mobile.substring(mobile.length - 3) : "";
        return `<div class="masked-cell">
            <span class="masked-value" data-full="${escapeHtml(mobile)}" data-masked="${escapeHtml(masked)}">${escapeHtml(masked)}</span>
            <button type="button" class="btn-reveal" onclick="toggleMask(this)"><i class="fa-solid fa-eye"></i></button>
        </div>`;
    };

    let propertyList = [
        { propertyName: getCustomerCell, dataType: "function" },
        { propertyName: "email", dataType: "string" },
        { propertyName: getContactCell, dataType: "function" },
        { propertyName: "address", dataType: "string" },
        { propertyName: "note", dataType: "string" }
    ];

    fillDataIntoTable(tableBodyCustomer, customers, propertyList, formRefill, customerDelete, printCustomer, true, 'CUSTOMER_UPDATE', 'CUSTOMER_DELETE', null);
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


// --- Validation ---
textFirstnameElement.addEventListener("keypress", (e) => {
    if (e.key == " ") {
        e.preventDefault();
    }
});
textFirstnameElement.addEventListener("keyup", () => {

    let firstname = textFirstnameElement.value.trim();

    let regPattern = /^[A-Z][a-zA-Z]{1,}$/;

    if (regPattern.test(firstname)) {
        setValid(textFirstnameElement);
        customer.firstname = firstname;
    } else {
        setInvalid(textFirstnameElement);
        customer.firstname = null;
    }

});

textLastnameElement.addEventListener("keypress", (e) => {
    if (e.key == " ") {
        e.preventDefault();
    }
});

textLastnameElement.addEventListener("keyup", () => {

    let lastname = textLastnameElement.value.trim();

    let regPattern = /^[A-Z][a-zA-Z]{1,}$/;

    if (regPattern.test(lastname)) {
        setValid(textLastnameElement);
        customer.lastname = lastname;
    } else {
        setInvalid(textLastnameElement);
        customer.lastname = null;
    }

});

textMobileElement.addEventListener("keyup", () => {

    let mobile = textMobileElement.value.trim();

    let regPattern = /^07[01245678][0-9]{7}$/;

    if (regPattern.test(mobile)) {
        setValid(textMobileElement);
        customer.mobile = mobile;
    } else {
        setInvalid(textMobileElement);
        customer.mobile = null;
    }

});

textEmailElement.addEventListener("keyup", () => {

    let email = textEmailElement.value.trim();

    // Email is optional
    if (email == "") {

        customer.email = null;
        clearValidation(textEmailElement);

        return;
    }

    let regPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (regPattern.test(email)) {

        customer.email = email;
        setValid(textEmailElement);

    } else {

        customer.email = null;
        setInvalid(textEmailElement);

    }

});

textAddressElement.addEventListener("keyup", () => {

    let address = textAddressElement.value.trim();

    let regPattern = /^[A-Za-z0-9\s,./-]{5,100}$/;

    if (regPattern.test(address)) {
        setValid(textAddressElement);
        customer.address = address;
    } else {
        setInvalid(textAddressElement);
        customer.address = null;
    }

});

textNotesElement.addEventListener("keyup", () => {
    customer.note = textNotesElement.value;
});


const checkFormError = () => {

    let errors = "";

    if (customer.firstname == null)
        errors += "First name is required\n";

    if (customer.lastname == null)
        errors += "Last name is required\n";

    if (customer.mobile == null)
        errors += "Mobile is required\n";

    if (customer.address == null)
        errors += "Address is required\n";

    return errors;

};


// --- Submit ---

const submitCustomerForm = () => {
    let errors = checkFormError();
    if (errors !== "") {
        showToast("Please fix the following:\n" + errors, "warning");
        return;
    }

    customer.address = textAddressElement.value || null;
    customer.note = textNotesElement.value || null;

    showConfirm("Submit Customer", "Are you sure you want to save this customer?", "Submit", "success").then(confirmed => {
        if (!confirmed) return;

        let serviceResponse = getHTTPServicesRequest("/customer/insert", "POST", customer);
        if (serviceResponse == "OK") {
            showToast("Customer saved successfully!", "success");
            refreshCustomerForm();
            refreshCustomerTable();
            closePanel('panelCustomerForm');
        } else {
            showToast("Save failed: " + serviceResponse, "error");
        }
    });
};


// --- Delete ---

const customerDelete = (dataObject) => {
    showConfirm("Delete Customer", "Are you sure you want to delete " + dataObject.firstname + " " + dataObject.lastname + "?", "Delete", "danger").then(confirmed => {
        if (!confirmed) return;

        let serviceResponse = getHTTPServicesRequest("/customer/delete", "DELETE", dataObject);
        if (serviceResponse == "OK") {
            showToast("Customer deleted successfully!", "success");
            refreshCustomerForm();
            refreshCustomerTable();
        } else {
            showToast("Delete failed: " + serviceResponse, "error");
        }
    });
};


// --- Print ---

const printCustomer = (dataObject) => {
    const cust = dataObject;
    const newTab = window.open();
    newTab.document.write(`<!DOCTYPE html><html><head><title>Customer ${escapeHtml(cust.customercode)}</title>
        <link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="/Resources/fontawesome-7.0.0/css/all.min.css">
        <link rel="stylesheet" href="/Resources/css/common.css">
        </head><body><div class="print-card">
        <div class="print-header">
            <h3><i class="fa-solid fa-user-group me-2"></i>Customer Details</h3>
            <p>${escapeHtml(cust.customercode)} - ${escapeHtml(cust.firstname)} ${escapeHtml(cust.lastname)}</p>
        </div>
        <div class="print-body"><table>
            <tr><th>Customer Code</th><td>${escapeHtml(cust.customercode)}</td></tr>
            <tr><th>First Name</th><td>${escapeHtml(cust.firstname)}</td></tr>
            <tr><th>Last Name</th><td>${escapeHtml(cust.lastname)}</td></tr>
            <tr><th>Mobile</th><td>${escapeHtml(cust.mobile)}</td></tr>
            <tr><th>Email</th><td>${escapeHtml(cust.email)}</td></tr>
            <tr><th>Address</th><td>${escapeHtml(cust.address || "N/A")}</td></tr>
            <tr><th>Notes</th><td>${escapeHtml(cust.note || "N/A")}</td></tr>
        </table></div>
        <div class="print-footer">Printed on ${new Date().toLocaleDateString("en-LK")} | Salon DEEN</div>
        </div></body></html>`);
    setTimeout(() => { newTab.print(); newTab.close(); }, 500);
};


// --- Refill (Edit) ---

const formRefill = (dataObject) => {
    customer = JSON.parse(JSON.stringify(dataObject));
    oldCustomer = JSON.parse(JSON.stringify(dataObject));

    textFirstnameElement.value = customer.firstname;
    textLastnameElement.value = customer.lastname;
    textMobileElement.value = customer.mobile || "";
    textEmailElement.value = customer.email || "";
    textAddressElement.value = customer.address || "";
    textNotesElement.value = customer.note || "";

    document.getElementById("customerCodeDisplay").style.display = "flex";
    document.getElementById("customerCodeValue").textContent = customer.customercode;

    buttonUpdate.style.display = "inline-block";
    buttonSubmit.style.display = "none";
    openPanel('panelCustomerForm');
    document.querySelector('#panelCustomerForm .offcanvas-title').textContent = 'Edit Customer';
};


// --- Update ---

const checkFormUpdates = () => {
    let updates = "";
    if (customer.firstname != oldCustomer.firstname) updates += "First Name: " + oldCustomer.firstname + " → " + customer.firstname + "\n";
    if (customer.lastname != oldCustomer.lastname) updates += "Last Name: " + oldCustomer.lastname + " → " + customer.lastname + "\n";
    if (customer.mobile != oldCustomer.mobile) updates += "Mobile: " + oldCustomer.mobile + " → " + customer.mobile + "\n";
    if (customer.email != oldCustomer.email) updates += "Email: " + oldCustomer.email + " → " + customer.email + "\n";
    if (customer.address != oldCustomer.address) updates += "Address changed\n";
    if (customer.note != oldCustomer.note) updates += "Notes changed\n";
    return updates;
};

const updateCustomerForm = () => {
    let errors = checkFormError();
    if (errors !== "") {
        showToast("Please fix the following:\n" + errors, "warning");
        return;
    }

    customer.address = textAddressElement.value || null;
    customer.note = textNotesElement.value || null;

    let updates = checkFormUpdates();
    if (updates === "") {
        showToast("No changes detected.", "info");
        return;
    }

    showConfirm("Update Customer", "Apply these changes?\n\n" + updates, "Update", "primary").then(confirmed => {
        if (!confirmed) return;

        let serviceResponse = getHTTPServicesRequest("/customer/update", "PUT", customer);
        if (serviceResponse == "OK") {
            showToast("Customer updated successfully!", "success");
            refreshCustomerForm();
            refreshCustomerTable();
            closePanel('panelCustomerForm');
        } else {
            showToast("Update failed: " + serviceResponse, "error");
        }
    });
};
