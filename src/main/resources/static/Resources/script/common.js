// define function for request get server data 
const getServiceRequest = (url) => {

    let getResponces = [];

    $.ajax({

        url: url,
        type: "GET",
        async: false,
        dataType: "json",
        success: function (response) {
            console.log("Success:", response);
            getResponces = response;
            // fillDataIntoTable();
        },
        error: function (xhr, status, error) {
            console.log(error);
            console.log(xhr);
            console.log(status);
            // getResponces = status;
        },
        complete: function () {
            console.log("Request completed");
        }
    });


    return getResponces;
}


// define function for request get server data 
const getHTTPServicesRequest = (url, method, data) => {

    let ServicesResponces = "";

    $.ajax({
        url: url,
        type: method,
        async: false,
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: "text",
        success: function (response) {
            console.log("Data received:", response);
            ServicesResponces = response;
        },
        error: function (_xhr, status, error) {
            //    console.log("Error:", error);
            //    console.log("Status:", status);
            //    console.log("Response:", xhr);
            //    ServicesResponces = status;
            console.error("AJAX Error:", status, error);
            ServicesResponces = "AJAX Error: " + status + " - " + error;
        },
        complete: function () {
            console.log("Ajax Request completed");
        }
    });
    return ServicesResponces;
}


//define common text  element validator function 

const textValidator = (element, pattern, object, property) => {

    let elementValue = element.value;
    let regOb = new RegExp(pattern);

    if (elementValue != "") {
        if (regOb.test(elementValue)) {
            setValid(element);
            object[property] = elementValue;

        } else {
            setInvalid(element);
            object[property] = null;
        }
    } else {
        if (element.required) {
            setInvalid(element);
        } else {
            clearValidation(element);
        }
        object[property] = null;
    }
}

// define function for fill data into select (select, datalist, property)


function fillDataIntoSelect(element, message, dataList, property) {
    element.innerHTML = "";
    let optionMsg = document.createElement("option");
    optionMsg.selected = "selected";
    optionMsg.disabled = "disabled";
    optionMsg.value = "";
    optionMsg.innerText = message;
    element.appendChild(optionMsg);
dataList.forEach(dataOb => {
    let option = document.createElement("option");

    if (typeof dataOb === "string") {
        option.value = dataOb;
        option.innerText = dataOb;
    } else {
        option.value = JSON.stringify(dataOb);
        option.innerText = dataOb[property];
    }

    element.appendChild(option);
});
}

// New: fillDataIntoSelectById - sets option.value to id or package_id
function fillDataIntoSelectById(element, message, dataList, valueProperty, textProperty) {
    element.innerHTML = "";
    let optionMsg = document.createElement("option");
    optionMsg.selected = "selected";
    optionMsg.disabled = "disabled";
    optionMsg.value = "";
    optionMsg.innerText = message;
    element.appendChild(optionMsg);
    dataList.forEach(dataOb => {
        let option = document.createElement("option");
        option.value = dataOb[valueProperty] || dataOb["id"] || dataOb["package_id"];
        option.innerText = dataOb[textProperty];
        element.appendChild(option);
    });
}


//define function for clear ui element
const clearElement = (elements) => {
    elements.forEach(element => {
        if (element) {
            clearValidation(element);
        }
    });
}


// ---- Enum Helpers ----

// Cache enum data to avoid repeated AJAX calls
const enumCache = {};

const getEnumData = (enumName) => {
    if (!enumCache[enumName]) {
        enumCache[enumName] = getServiceRequest("/api/enums/" + enumName);
    }
    return enumCache[enumName];
};

const getEnumDisplayName = (enumName, enumValue) => {
    if (!enumValue) return "";
    let data = getEnumData(enumName);
    let found = data.find(e => e.name === enumValue || e.displayName === enumValue);
    return found ? found.displayName : enumValue;
};

const fillSelectFromEnum = (element, enumName, message) => {
    let data = getEnumData(enumName);
    fillDataIntoSelectById(element, message, data, "displayName", "displayName");
};

// ---- Formatting Utilities ----

const formatTableDate = (value) => {
    if (!value) return "";
    try {
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return d.getDate().toString().padStart(2, "0") + " " + months[d.getMonth()] + " " + d.getFullYear();
    } catch (e) {
        return value;
    }
};

const formatTableDateTime = (value) => {
    if (!value) return "";
    try {
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return d.getDate().toString().padStart(2, "0") + " " + months[d.getMonth()] + " " + d.getFullYear() +
            " " + d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
    } catch (e) {
        return value;
    }
};

const formatTableCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "";
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return "Rs. " + num.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatTableNumber = (value) => {
    if (value === null || value === undefined || value === "") return "";
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num.toLocaleString("en-LK");
};

// ---- Utility Helpers ----

const escapeHtml = (str) => {
    if (str === null || str === undefined) return "";
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
};

const capitalize = (str) => {
    if (!str) return "";
    str = String(str);
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return "";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 0 ? age : "";
};

const formatDate = (value) => {
    if (!value) return "";
    try {
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return d.getDate().toString().padStart(2, "0") + " " + months[d.getMonth()] + " " + d.getFullYear();
    } catch (e) {
        return value;
    }
};

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "0.00";
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ---- Cell Renderer ----

const renderTableCell = (td, data, property) => {
    if (property.dataType === "string") {
        td.innerText = data[property.propertyName] || "";
    } else if (property.dataType === "function") {
        td.innerHTML = typeof property.propertyName === "function" ? property.propertyName(data) : "";
    } else if (property.dataType === "date") {
        td.innerText = formatTableDate(data[property.propertyName]);
    } else if (property.dataType === "datetime") {
        td.innerText = formatTableDateTime(data[property.propertyName]);
    } else if (property.dataType === "currency") {
        td.innerText = formatTableCurrency(data[property.propertyName]);
    } else if (property.dataType === "number") {
        td.innerText = formatTableNumber(data[property.propertyName]);
    } else if (property.dataType === "boolean") {
        td.innerHTML = data[property.propertyName]
            ? '<i class="fa-solid fa-check text-success"></i>'
            : '<i class="fa-solid fa-xmark text-danger"></i>';
    } else {
        td.innerText = data[property.propertyName] || "";
    }
};


//define function for all data into table (tablebodyid,datalist,displayproperty)
const fillDataIntoTable = (tableBodyId, dataList, PropertyList, editfunction, deletefunction, printfunction, buttonVisibility = true, editAuthority = null, deleteAuthority = null, printAuthority = null) => {
    tableBodyId.innerHTML = "";

    dataList.forEach((data, index) => {
        let tr = document.createElement("tr");

        let tdIndex = document.createElement("td");
        tdIndex.innerText = index + 1;
        tr.appendChild(tdIndex);

        PropertyList.forEach((property) => {
            let td = document.createElement("td");
            renderTableCell(td, data, property);
            tr.appendChild(td);
        });

        if (buttonVisibility) {
            let tdActions = document.createElement("td");
            let hasButtons = false;

            // Edit button with FontAwesome 7+ icon
            if (typeof editfunction === "function") {
                // Check authority if specified
                if (!editAuthority || (window.hasAuthority && window.hasAuthority(editAuthority))) {
                    let buttonEdit = document.createElement("button");
                    buttonEdit.type = "button";
                    buttonEdit.onclick = () => {
                        console.log("Edit button clicked for:", data);
                        editfunction(data);
                    };
                    buttonEdit.className = "btn btn-outline-warning me-1 fw-bold";
                    buttonEdit.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
                    tdActions.appendChild(buttonEdit);
                    hasButtons = true;
                }
            }

            // Print button with FontAwesome 7+ icon
            if (typeof printfunction === "function") {
                // Check authority if specified
                if (!printAuthority || (window.hasAuthority && window.hasAuthority(printAuthority))) {
                    let buttonPrint = document.createElement("button");
                    buttonPrint.type = "button";
                    buttonPrint.onclick = () => {
                        console.log("Print button clicked for:", data);
                        printfunction(data);
                    };
                    buttonPrint.className = "btn btn-outline-success me-1 fw-bold";
                    buttonPrint.innerHTML = '<i class="fa-solid fa-print"></i>';
                    tdActions.appendChild(buttonPrint);
                    hasButtons = true;
                }
            }

            // Delete button with FontAwesome 7+ icon
            if (typeof deletefunction === "function") {
                // Check authority if specified
                if (!deleteAuthority || (window.hasAuthority && window.hasAuthority(deleteAuthority))) {
                    let buttonDelete = document.createElement("button");
                    buttonDelete.type = "button";
                    buttonDelete.className = "btn btn-outline-danger fw-bold";
                    buttonDelete.innerHTML = '<i class="fa-solid fa-trash"></i>';
                    buttonDelete.onclick = () => {
                        console.log("Delete button clicked for:", data);
                        deletefunction(data);
                    };
                    tdActions.appendChild(buttonDelete);
                    hasButtons = true;
                }
            }

            if (hasButtons) {
                tr.appendChild(tdActions);
            }
        }

        // append this row into the table body
        tableBodyId.appendChild(tr);
    });
}


//define function for all data into table (tablebodyid,datalist,displayproperty)
const fillDataIntoInnerTable = (tableBodyId, dataList, PropertyList, editfunction, deletefunction, buttonVisibility = true) => {
    tableBodyId.innerHTML = "";

    dataList.forEach((data, index) => {
        let tr = document.createElement("tr");

        let tdIndex = document.createElement("td");
        tdIndex.innerText = index + 1;
        tr.appendChild(tdIndex);

        PropertyList.forEach((property) => {
            let td = document.createElement("td");
            renderTableCell(td, data, property);
            tr.appendChild(td);
        });

        if (buttonVisibility) {
            let tdActions = document.createElement("td");
            let hasButtons = false;

            // Edit button with FontAwesome 7+ icon
            if (typeof editfunction === "function") {
                let buttonEdit = document.createElement("button");
                buttonEdit.type = "button";
                buttonEdit.onclick = () => {
                    console.log("Edit button clicked for:", data);
                    editfunction(data);
                };
                buttonEdit.className = "btn btn-outline-warning me-1 fw-bold";
                buttonEdit.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
                tdActions.appendChild(buttonEdit);
                hasButtons = true;
            }

            // Delete button with FontAwesome 7+ icon
            if (typeof deletefunction === "function") {
                let buttonDelete = document.createElement("button");
                buttonDelete.type = "button";
                buttonDelete.className = "btn btn-outline-danger fw-bold";
                buttonDelete.innerHTML = '<i class="fa-solid fa-trash"></i>';
                buttonDelete.onclick = () => {
                    console.log("Delete button clicked for:", data);
                    deletefunction(data);
                };
                tdActions.appendChild(buttonDelete);
                hasButtons = true;
            }

            if (hasButtons) {
                tr.appendChild(tdActions);
            }
        }

        // append this row into the table body
        tableBodyId.appendChild(tr);
    });
}


// ---- Bootstrap Confirm Modal ----

// ---- Offcanvas Panel Helpers ----

const openPanel = (panelId) => {
    const el = document.getElementById(panelId);
    if (!el) { console.warn('Panel not found:', panelId); return; }
    bootstrap.Offcanvas.getOrCreateInstance(el).show();
};

const closePanel = (panelId) => {
    const el = document.getElementById(panelId);
    if (!el) { console.warn('Panel not found:', panelId); return; }
    bootstrap.Offcanvas.getOrCreateInstance(el).hide();
};


// ---- Datalist Search Component ----

const populateDataList = (listEl, searchInputEl, hiddenInputEl, dataList, displayFn, valueField) => {
    if (!listEl || !searchInputEl) return;
    listEl.innerHTML = "";
    dataList.forEach(item => {
        const opt = document.createElement("option");
        opt.value = typeof displayFn === "function" ? displayFn(item) : item[displayFn];
        opt.dataset.id = item[valueField];
        listEl.appendChild(opt);
    });
    searchInputEl.addEventListener("input", () => {
        const val = searchInputEl.value;
        const match = dataList.find(item => {
            const display = typeof displayFn === "function" ? displayFn(item) : item[displayFn];
            return display === val;
        });
        if (match) {
            hiddenInputEl.value = match[valueField];
            setValid(searchInputEl);
        } else {
            hiddenInputEl.value = "";
            if (val.length > 0) setInvalid(searchInputEl);
            else searchInputEl.classList.remove("is-valid", "is-invalid");
        }
    });
    searchInputEl.addEventListener("change", () => {
        const val = searchInputEl.value;
        const match = dataList.find(item => {
            const display = typeof displayFn === "function" ? displayFn(item) : item[displayFn];
            return display === val;
        });
        if (match) {
            hiddenInputEl.value = match[valueField];
            setValid(searchInputEl);
        }
    });
};

const setSelectedByHiddenId = (searchInputEl, hiddenInputEl, dataList, displayFn, valueField, idValue) => {
    if (!idValue || !dataList) return;
    const match = dataList.find(item => item[valueField] == idValue);
    if (match) {
        const display = typeof displayFn === "function" ? displayFn(match) : match[displayFn];
        searchInputEl.value = display;
        hiddenInputEl.value = match[valueField];
        setValid(searchInputEl);
    }
};


// ---- Bootstrap Validation Helpers ----

const setValid = (el) => {
    if (!el) return;
    el.classList.remove("is-invalid");
    el.classList.add("is-valid");
};

const setInvalid = (el, msg) => {
    if (!el) return;
    el.classList.remove("is-valid");
    el.classList.add("is-invalid");
    if (msg) {
        let fb = el.parentElement.querySelector(".invalid-feedback");
        if (!fb) {
            fb = document.createElement("div");
            fb.className = "invalid-feedback";
            el.parentElement.appendChild(fb);
        }
        fb.textContent = msg;
    }
};

const clearValidation = (el) => {
    if (!el) return;
    el.classList.remove("is-valid", "is-invalid");
};

const togglePassword = (btn) => {
    const input = btn.parentElement.querySelector("input");
    if (!input) return;
    const icon = btn.querySelector("i");
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
};


// ---- Form Section Helper ----

const createSectionTitle = (icon, text) => {
    return `<h6 class="form-section-title"><i class="fa-solid ${icon} me-2"></i>${text}</h6>`;
};


// ---- Bootstrap Confirm Modal ----

const showConfirm = (title, message, confirmText = "Confirm", confirmStyle = "danger") => {
    return new Promise((resolve) => {
        const modalId = "confirmModal_" + Date.now();
        const styleMap = {
            danger: "btn-danger",
            warning: "btn-warning",
            success: "btn-success",
            info: "btn-info",
            primary: "btn-primary"
        };
        const btnClass = styleMap[confirmStyle] || "btn-danger";

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content">
                        <div class="modal-header bg-${confirmStyle} text-white py-2">
                            <h6 class="modal-title"><i class="fa-solid fa-triangle-exclamation me-2"></i>${escapeHtml(title)}</h6>
                        </div>
                        <div class="modal-body py-3">
                            <p class="mb-0">${escapeHtml(message)}</p>
                        </div>
                        <div class="modal-footer py-2">
                            <button type="button" class="btn btn-sm btn-light" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-sm ${btnClass}" id="${modalId}_confirm">${escapeHtml(confirmText)}</button>
                        </div>
                    </div>
                </div>
            </div>`;

        const container = document.createElement("div");
        container.innerHTML = modalHtml;
        document.body.appendChild(container);

        const modalEl = document.getElementById(modalId);
        const bsModal = new bootstrap.Modal(modalEl, { backdrop: "static" });

        document.getElementById(modalId + "_confirm").addEventListener("click", () => {
            bsModal.hide();
            resolve(true);
        });

        modalEl.addEventListener("hidden.bs.modal", () => {
            container.remove();
            resolve(false);
        });

        bsModal.show();
    });
};


// ---- Bootstrap Toast Notifications ----

const _ensureToastContainer = () => {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container position-fixed top-0 end-0 p-3";
        container.style.zIndex = "9999";
        document.body.appendChild(container);
    }
    return container;
};

const showToast = (message, type = "info") => {
    const container = _ensureToastContainer();
    const toastId = "toast_" + Date.now();

    const iconMap = {
        success: "fa-circle-check text-success",
        error: "fa-circle-xmark text-danger",
        warning: "fa-triangle-exclamation text-warning",
        info: "fa-circle-info text-info"
    };
    const bgMap = {
        success: "border-start border-success border-3",
        error: "border-start border-danger border-3",
        warning: "border-start border-warning border-3",
        info: "border-start border-info border-3"
    };

    const icon = iconMap[type] || iconMap.info;
    const bg = bgMap[type] || bgMap.info;

    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center ${bg}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body d-flex align-items-center gap-2">
                    <i class="fa-solid ${icon} fs-5"></i>
                    <span>${escapeHtml(message)}</span>
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>`;

    container.insertAdjacentHTML("beforeend", toastHtml);

    const toastEl = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toastEl, { delay: 3500 });
    bsToast.show();

    toastEl.addEventListener("hidden.bs.toast", () => {
        toastEl.remove();
    });
};
