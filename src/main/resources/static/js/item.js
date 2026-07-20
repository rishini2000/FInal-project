// Item management JS modeled after user.js style
window.addEventListener("load", () => {
    refreshItemForm();
    refreshItemTable();
});


let selectCategoryElement = document.querySelector("#selectCategory");
let textItemNameElement = document.querySelector("#textItemName");
let selectSizeElement = document.querySelector("#selectSize");
let selectStatusElement = document.querySelector("#selectStatus");
let textRentalPriceElement = document.querySelector("#textRentalPrice");
let textKeyMoneyElement = document.querySelector("#textKeyMoney");
let textNotesElement = document.querySelector("#textNotes");
let tableBodyItem = document.querySelector("#tableBodyItem");

let buttonUpdate = document.getElementById("buttonUpdate");
let buttonSubmit = document.getElementById("buttonSubmit");

// define function for Refreshing the item form
function refreshItemForm() {

    formItem.reset();

    item = new Object();

    document.querySelector('#panelItemForm .offcanvas-title').textContent = 'New Item';
    document.getElementById("itemCodeDisplay").style.display = "none";
    buttonUpdate.style.display = "none";
    buttonSubmit.style.display = "inline-block";

    fillSelectFromEnum(selectCategoryElement, "itemCategory", "Please select category...!");
    fillSelectFromEnum(selectSizeElement, "itemSize", "Please select size...!");
    fillSelectFromEnum(selectStatusElement, "itemStatus", "Please select status...!");

    // Clear form fields
    clearValidation(selectCategoryElement);
    clearValidation(textItemNameElement);
    clearValidation(selectSizeElement);
    clearValidation(selectStatusElement);
    clearValidation(textRentalPriceElement);
    clearElement([textNotesElement, textRentalPriceElement, textKeyMoneyElement]);
}

// define function for Refresh the item table
function refreshItemTable() {

    let items = getServiceRequest("/item/alldata");

    if (!Array.isArray(items)) {
        items = Object.values(items || {});
    }

    const getItem_Category = (dataObject) => getEnumDisplayName("itemCategory", dataObject.itemCategory);
    const getItem_Size = (dataObject) => getEnumDisplayName("itemSize", dataObject.itemSize);
    const getItem_Status = (dataObject) => getEnumDisplayName("itemStatus", dataObject.itemStatus);

    let propertyList = [
        { propertyName: "itemcode", dataType: "string" },
        { propertyName: getItem_Category, dataType: "function" },
        { propertyName: "item_name", dataType: "string" },
        { propertyName: getItem_Size, dataType: "function" },
        { propertyName: getItem_Status, dataType: "function" },
        { propertyName: "note", dataType: "string" }
    ];
    fillDataIntoTable(tableBodyItem, items, propertyList, refillItemForm, itemDelete, printItem);
}

textItemNameElement.addEventListener("keyup", () => {
    let itemName = textItemNameElement.value;
    if (itemName.length >= 2) {
        setValid(textItemNameElement);
        item.item_name = itemName;
    } else {
        setInvalid(textItemNameElement);
        item.item_name = null;
    }
});

selectCategoryElement.addEventListener("change", () => {
    let category = selectCategoryElement.value;
    if (category) {
        setValid(selectCategoryElement);
        item.itemCategory = category;
    } else {
        setInvalid(selectCategoryElement);
        item.itemCategory = null;
    }
});

selectSizeElement.addEventListener("change", () => {
    let size = selectSizeElement.value;
    if (size) {
        setValid(selectSizeElement);
        item.itemSize = size;
    } else {
        setInvalid(selectSizeElement);
        item.itemSize = null;
    }
});

selectStatusElement.addEventListener("change", () => {
    let status = selectStatusElement.value;
    if (status) {
        setValid(selectStatusElement);
        item.itemStatus = status;
    } else {
        setInvalid(selectStatusElement);
        item.itemStatus = null;
    }
});

textRentalPriceElement.addEventListener("keyup", () => {

    let price = textRentalPriceElement.value.trim();

    if (price != "" && Number(price) > 0) {

        item.rental_price = Number(price);

        setValid(textRentalPriceElement);

    } else {

        item.rental_price = null;

        setInvalid(textRentalPriceElement);

    }

});

textKeyMoneyElement.addEventListener("keyup", () => {

    let keyMoney = textKeyMoneyElement.value.trim();

    if (keyMoney != "" && Number(keyMoney) > 0) {

        item.key_money = Number(keyMoney);

        setValid(textKeyMoneyElement);

    } else {

        item.key_money = null;

        setInvalid(textKeyMoneyElement);

    }

});

textNotesElement.addEventListener("keyup", () => {
    item.note = textNotesElement.value;
});


// Check form errors
function checkFormError() {
    let errors = "";
    if (item.itemCategory == null) {
        errors += "Category is required..!\n";
    }
    if (item.item_name == null) {
        errors += "Item name is required..!\n";
    }
    if (item.itemSize == null) {
        errors += "Size is required..!\n";
    }
    if (item.itemStatus == null) {
        errors += "Status is required..!\n";
    }
    if (item.rental_price == null) {
        errors += "Rental price is required..!\n";
    }
    if (item.key_money == null) {
        errors += "Key money is required..!\n";
    }
    return errors;
}

// Define function for Submit item form
function submitItemForm() {

    let errors = checkFormError();

    if (errors == "") {
        let message = "Are you sure to submit the form ?";
        showConfirm("Submit Item", message, "Submit", "primary").then(confirmed => {
            if (!confirmed) return;
            let serviceResponse = getHTTPServicesRequest("/item/insert", "POST", item);
            if (serviceResponse == "OK") {

                showToast("Form submitted successfully!", "success");

                refreshItemForm();
                refreshItemTable();
                closePanel('panelItemForm');
            } else {
                showToast("Form submission cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
            }
        });
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
    }
}

// Define function for Delete item
const itemDelete = (dataObject) => {
    let message = "Are you sure to delete item : " + dataObject.item_name + " ?";
    showConfirm("Delete Item", message, "Delete", "danger").then(confirmed => {
        if (!confirmed) return;
        let deleteResponse = getHTTPServicesRequest("/item/delete", "DELETE", dataObject);
        if (deleteResponse == "OK") {

            showToast("Item deleted successfully!", "success");

            refreshItemForm();
            refreshItemTable();
            closePanel('panelItemForm');
        } else {
            showToast("Item deletion cancelled..! \n Have some errors.. \n" + deleteResponse, "error");
        }
    });
};

//  Define function for Print item details
const printItem = (dataObject) => {
    const item = dataObject;
    const newTab = window.open();
    newTab.document.write(`<!DOCTYPE html><html><head><title>Item ${escapeHtml(item.itemcode)}</title>
        <link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="/Resources/fontawesome-7.0.0/css/all.min.css">
        <link rel="stylesheet" href="/Resources/css/common.css">
        </head><body><div class="print-card">
        <div class="print-header">
            <h3><i class="fa-solid fa-boxes-stacked me-2"></i>Item Details</h3>
            <p>${escapeHtml(item.itemcode)} - ${escapeHtml(item.item_name)}</p>
        </div>
        <div class="print-body"><table>
            <tr><th>Item Code</th><td>${escapeHtml(item.itemcode)}</td></tr>
            <tr><th>Category</th><td>${escapeHtml(getEnumDisplayName("itemCategory", item.itemCategory))}</td></tr>
            <tr><th>Name</th><td>${escapeHtml(item.item_name)}</td></tr>
            <tr><th>Size</th><td>${escapeHtml(getEnumDisplayName("itemSize", item.itemSize))}</td></tr>
            <tr><th>Status</th><td>${escapeHtml(getEnumDisplayName("itemStatus", item.itemStatus))}</td></tr>
            <tr><th>Notes</th><td>${escapeHtml(item.note || "N/A")}</td></tr>
        </table></div>
        <div class="print-footer">Printed on ${new Date().toLocaleDateString("en-LK")} | Salon DEEN</div>
        </div></body></html>`);
    setTimeout(() => { newTab.print(); newTab.close(); }, 500);
};

// Refill item form for update
const refillItemForm = (dataObject) => {

    item = JSON.parse(JSON.stringify(dataObject));
    oldItem = JSON.parse(JSON.stringify(dataObject));

    textItemNameElement.value = item.item_name;
    textNotesElement.value = item.note;
    textRentalPriceElement.value = item.rental_price;
    textKeyMoneyElement.value = item.key_money;

    fillSelectFromEnum(selectCategoryElement, "itemCategory", "Please select category...!");
    fillSelectFromEnum(selectStatusElement, "itemStatus", "Please select status...!");
    fillSelectFromEnum(selectSizeElement, "itemSize", "Please select size...!");
    selectCategoryElement.value = item.itemCategory;
    selectSizeElement.value = item.itemSize;
    selectStatusElement.value = item.itemStatus;

    if (item.itemCategory) {
        setValid(selectCategoryElement);
    } else {
        setInvalid(selectCategoryElement);
    }

    if (item.itemSize) {
        setValid(selectSizeElement);
    } else {
        setInvalid(selectSizeElement);
    }

    if (item.itemStatus) {
        setValid(selectStatusElement);
    } else {
        setInvalid(selectStatusElement);
    }

    document.getElementById("itemCodeDisplay").style.display = "flex";
    document.getElementById("itemCodeValue").textContent = item.itemcode;

    buttonUpdate.style.display = "inline-block";
    buttonSubmit.style.display = "none";
    openPanel('panelItemForm');
    document.querySelector('#panelItemForm .offcanvas-title').textContent = 'Edit Item';
};

// Check form updates for update confirmation message
const checkFormUpdates = () => {

    let updates = "";

    if (item.itemCategory != oldItem.itemCategory) {
        updates += "Category changed from " + oldItem.itemCategory + " to " + item.itemCategory + "\n";
    }
    if (item.item_name != oldItem.item_name) {
        updates += "Item name changed from " + oldItem.item_name + " to " + item.item_name + "\n";
    }
    if (item.itemSize != oldItem.itemSize) {
        updates += "Size changed from " + oldItem.itemSize + " to " + item.itemSize + "\n";
    }
    if (item.itemStatus != oldItem.itemStatus) {
        updates += "Status changed from " + oldItem.itemStatus + " to " + item.itemStatus + "\n";
    }
    if (item.rental_price != oldItem.rental_price) {
        updates += "Rental price changed from " + oldItem.rental_price + " to " + item.rental_price + "\n";
    }
    if (item.key_money != oldItem.key_money) {
        updates += "Key money changed from " + oldItem.key_money + " to " + item.key_money + "\n";
    }
    if (item.note != oldItem.note) {
        updates += "Notes changed from " + oldItem.note + " to " + item.note + "\n";
    }
    return updates;
};

// Update item details
const updateItemForm = () => {

    let errors = checkFormError();
    if (errors == "") {
        let updates = checkFormUpdates();
        if (updates == "") {
            showToast("No changes detected to update.", "info");
        } else {
            showConfirm("Update Item", "Are you sure to update the item details with following changes ?\n" + updates, "Update", "primary").then(confirmed => {
                if (!confirmed) return;
                let updateResponse = getHTTPServicesRequest("/item/update", "PUT", item);
                if (updateResponse == "OK") {
                    showToast("Item details updated successfully!", "success");

                    refreshItemForm();
                    refreshItemTable();

                    closePanel('panelItemForm');
                } else {
                    showToast("Item update cancelled..! \n Have some errors.. \n" + updateResponse, "error");
                }
            });
        }
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
        return;
    }
};