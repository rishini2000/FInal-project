// On window load, refresh main form and table
window.addEventListener("load", () => {
    refreshMonthlyAvailablePlanForm();
    refreshMonthlyAvailablePlanTable();
});

// Helper function for async GET requests
function getServiceRequestAsync(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(xhr.status);
                }
            }
        };
        xhr.send();
    });
}

// Main form element references
const inputMonthElement = document.querySelector("#inputMonth");
const searchEmployeeElement = document.querySelector("#searchEmployee");
const listEmployeeElement = document.querySelector("#listEmployee");
const selectEmployeeHidden = document.querySelector("#selectEmployee");
const selectLeaveTypeElement = document.querySelector("#selectLeaveType");
const buttonSubmit = document.getElementById("buttonSubmit");
const buttonClear = document.getElementById("buttonClear");
const buttonUpdate = document.getElementById("buttonUpdate");
const tableBodyElement = document.querySelector("#tableBodyMonthlyAvailablePlan");

let calendar;
let selectedLeaveDates = [];
let pendingLeavePlan = null;


//add calender initialization on window load
window.addEventListener("load", () => {

    refreshMonthlyAvailablePlanForm();

    initializeCalendar();

});
//create calender function
function initializeCalendar() {

    let calendarElement =
        document.getElementById("calendar");

    calendar = new FullCalendar.Calendar(calendarElement, {

        initialView: "dayGridMonth",

        dateClick: function (info) {

            selectedLeaveDates.push(info.dateStr);

            calendar.addEvent({
                title: "Leave",
                start: info.dateStr,
                color: "red"
            });

        }

    });

    calendar.render();
}
//month change event to navigate calendar to selected month
inputMonthElement.addEventListener("change", function () {

    let selectedMonth =
        inputMonthElement.value;

    calendar.gotoDate(selectedMonth + "-01");

});
//employee change event to load employee's permanent leaves and show on calendar
searchEmployeeElement.addEventListener("change", function () {

    loadEmployeePermanentLeaves();

});
// Helper to show/hide panel
function showModal() {
    openPanel('panelLeavePlanForm');
}
function hideModal() {
    closePanel('panelLeavePlanForm');
}


function loadEmployeePermanentLeaves() {

    let employeeId = selectEmployeeHidden.value;

    let permLeaves =
        getServiceRequest(
            "/employeepermleave/byemployee?employeeid=" +
            employeeId
        );

    document.querySelector("#permanentLeaveDays").innerHTML = "";

    calendar.removeAllEvents();

    permLeaves.forEach(pl => {

        let dayName = pl.day_of_week.toLowerCase();

        document.querySelector("#permanentLeaveDays").innerHTML +=
            dayName + ", ";

        let currentDate = new Date(calendar.getDate());

        let year = currentDate.getFullYear();
        let month = currentDate.getMonth();

        for (let day = 1; day <= 31; day++) {

            let date = new Date(year, month, day);

            if (date.getMonth() !== month) {
                break;
            }

            let weekday =
                date.toLocaleDateString("en-US", {
                    weekday: "long"
                }).toLowerCase();

            if (weekday === dayName) {

                let year = date.getFullYear();
                let month = String(date.getMonth() + 1).padStart(2, "0");
                let day = String(date.getDate()).padStart(2, "0");

                let dateStr = `${year}-${month}-${day}`;

                calendar.addEvent({
                    title: "Permanent Leave",
                    start: dateStr,
                    color: "red"
                });

            }
        }
    });

}
const refreshMonthlyAvailablePlanForm = () => {
    let employees =
        getServiceRequest("/employee/alldata");

    console.log("Employees =", employees);

    document.getElementById("formMonthlyAvailablePlan").reset();
    leavePlan = new Object();
    oldLeavePlan = null;

    populateDataList(
        listEmployeeElement,
        searchEmployeeElement,
        selectEmployeeHidden,
        employees,
        (emp) => emp.empno + " - " + emp.fullname,
        "id"
    );

    selectLeaveTypeElement.innerHTML = "";
    let placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.selected = "selected";
    placeholder.disabled = "disabled";
    placeholder.innerText = "-- Select Leave Type --";
    selectLeaveTypeElement.appendChild(placeholder);
    [{ value: "FULLDAY", text: "Full Day" }, { value: "HALFDAY", text: "Half Day" }].forEach(lt => {
        let opt = document.createElement("option");
        opt.value = lt.value;
        opt.innerText = lt.text;
        selectLeaveTypeElement.appendChild(opt);
    });

    document.querySelector('#panelLeavePlanForm .offcanvas-title').textContent = 'New Leave Plan';
    buttonUpdate.style.display = "none";
    buttonSubmit.style.display = "inline-block";

    clearValidation(searchEmployeeElement);
    clearValidation(inputMonthElement);
}

const refreshMonthlyAvailablePlanTable = () => {

    let leavePlans =
        getServiceRequest("/leaveplan/alldata");

    tableBodyElement.innerHTML = "";

    const propertyList = [
        { propertyName: getEmpNo, dataType: "function" },
        { propertyName: getEmployeeName, dataType: "function" },
        { propertyName: getMonth, dataType: "function" },
        { propertyName: getYear, dataType: "function" },
        { propertyName: getAvailableEmployees, dataType: "function" }
    ];

    fillDataIntoTable(
        tableBodyElement,
        leavePlans,
        propertyList,
        refillLeavePlanForm,
        deleteLeaveplan,
        printLeaveplan,
        true,
        'LEAVEPLAN_UPDATE',
        'LEAVEPLAN_DELETE',
        null
    );
}

const getEmpNo = (plan) => {
    return plan.employee_id.empno;
}

const getEmployeeName = (plan) => {
    return plan.employee_id.fullname;
}

const getMonth = (plan) => {
    return plan.monthYear.split("-")[1];
}

const getYear = (plan) => {
    return plan.monthYear.split("-")[0];
}

const getAvailableEmployees = (plan) => {
    return "-";
}


//define function check leaveplan form errors
function checkLeaveplanFormErrors() {

    let errors = "";

    if (!inputMonthElement.value) {
        errors += "Month is required.\n";
    }

    if (!selectEmployeeHidden.value) {
        errors += "Employee is required.\n";
    }

    return errors;
}

//define function for submit new leaveplan form
function submitLeaveplanForm() {

    let errors = checkLeaveplanFormErrors();
    if (errors == "") {
        let leavePlan = {

            monthYear: inputMonthElement.value,

            employee_id: {
                id: parseInt(selectEmployeeHidden.value)
            },

            leaveType: selectLeaveTypeElement.value,

            leaveDates: selectedLeaveDates
        };

        // Store the leave plan for later submission
        pendingLeavePlan = leavePlan;

        // Check for appointment conflicts before submitting
        checkForConflicts(leavePlan.employee_id.id, selectedLeaveDates);
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
    }
}

// Function to check for appointment conflicts
function checkForConflicts(employeeId, leaveDates) {
    if (!leaveDates || leaveDates.length === 0) {
        // No dates selected, proceed with submission
        submitLeavePlanToServer();
        return;
    }

    // Sort dates to get start and end
    let sortedDates = [...leaveDates].sort();
    let startDate = sortedDates[0];
    let endDate = sortedDates[sortedDates.length - 1];

    // Show loading toast
    showToast("Checking for appointment conflicts...", "info");

    // Call the backend to check for conflicts
    let url = `/leaveplan/check-conflicts?employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`;
    
    getServiceRequestAsync(url).then(conflicts => {
        if (conflicts && conflicts.length > 0) {
            // Show conflict modal
            showConflictModal(conflicts);
        } else {
            // No conflicts, proceed with submission
            submitLeavePlanToServer();
        }
    }).catch(error => {
        console.error("Error checking conflicts:", error);
        showToast("Error checking for conflicts. Proceeding with submission...", "warning");
        submitLeavePlanToServer();
    });
}

// Function to show conflict modal
function showConflictModal(conflicts) {
    let tbody = document.getElementById("conflictTableBody");
    tbody.innerHTML = "";

    conflicts.forEach(appointment => {
        let row = document.createElement("tr");
        
        // Format date
        let dateStr = appointment.date || "";
        
        // Format time
        let timeStr = "";
        if (appointment.start_time) {
            timeStr = appointment.start_time;
            if (appointment.end_time) {
                timeStr += " - " + appointment.end_time;
            }
        }

        // Get customer name
        let customerName = appointment.customer_id ? 
            (appointment.customer_id.callingname || appointment.customer_id.fullname || "N/A") : "N/A";

        // Get status
        let status = appointment.appointmentStatus || "N/A";

        row.innerHTML = `
            <td>${dateStr}</td>
            <td>${timeStr}</td>
            <td>${customerName}</td>
            <td><span class="badge bg-primary">${status}</span></td>
            <td>
                <a href="/appointment" class="btn btn-sm btn-outline-primary">
                    <i class="fa-solid fa-calendar-pen"></i> Reschedule
                </a>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Show the modal
    let modal = new bootstrap.Modal(document.getElementById("conflictModal"));
    modal.show();
}

// Function to proceed with leave after viewing conflicts
function proceedWithLeave() {
    // Close the modal
    let modal = bootstrap.Modal.getInstance(document.getElementById("conflictModal"));
    if (modal) {
        modal.hide();
    }

    // Proceed with submission
    submitLeavePlanToServer();
}

// Function to submit leave plan to server
function submitLeavePlanToServer() {
    if (!pendingLeavePlan) {
        showToast("No leave plan data found.", "error");
        return;
    }

    showConfirm("Confirm Submit", "Are you sure to submit the form ?", "Submit", "primary").then(confirmed => {
        if (!confirmed) return;
        
        let serviceResponse = getHTTPServicesRequest("/leaveplan/insert", "POST", pendingLeavePlan);
        if (serviceResponse == "OK") {
            showToast("Form submitted successfully!", "success");

            refreshMonthlyAvailablePlanForm();
            refreshMonthlyAvailablePlanTable();

            closePanel('panelLeavePlanForm');
            pendingLeavePlan = null;
        } else {
            showToast("Form submission cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
        }
    });
}

//define function delete leaveplan 
function deleteLeaveplan(obj) {

    showConfirm("Confirm Delete", "Are you sure to delete leaveplan : " + obj.leaveplan_id + " ?", "Delete", "danger").then(confirmed => {
        if (!confirmed) return;
        let serviceResponse = getHTTPServicesRequest("/leaveplan/delete", "DELETE", obj);
        if (serviceResponse == "OK") {
            showToast("Leaveplan deleted successfully!", "success");

            refreshMonthlyAvailablePlanForm();
            refreshMonthlyAvailablePlanTable();
            closePanel('panelLeavePlanForm');
        } else {
            showToast("Leaveplan deletion cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
        }
    });
}

//define function for print leaveplan details
function printLeaveplan(obj) {
    const newTab = window.open();
    newTab.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaveplan - ${escapeHtml(obj.leaveplan_id)}</title>
    <link rel="stylesheet" href="/Resources/bootstrap-5.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="/Resources/fontawesome-7/fonts/all.min.css">
    <style>
        body { background: #f8f9fa; }
        .card { box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: none; border-radius: 12px; overflow: hidden; }
        .card-header { padding: 20px 24px; }
        .card-header h3 { margin: 0; font-weight: 700; }
        .info-row { border-bottom: 1px solid #eee; padding: 12px 0; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: 600; color: #555; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-value { font-size: 1.05rem; color: #222; }
        @media print { body { background: #fff; } .card { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-7">
                <div class="card">
                    <div class="card-header bg-primary text-light text-center">
                        <h3><i class="fa-solid fa-calendar-days me-2"></i>Leaveplan Details</h3>
                    </div>
                    <div class="card-body p-4">
                        <div class="row info-row">
                            <div class="col-5 info-label">Leaveplan ID</div>
                            <div class="col-7 info-value">${escapeHtml(obj.leaveplan_id)}</div>
                        </div>
                        <div class="row info-row">
                            <div class="col-5 info-label">Employee Name</div>
                            <div class="col-7 info-value">${escapeHtml(obj.employee_id.fullname)}</div>
                        </div>
                        <div class="row info-row">
                            <div class="col-5 info-label">Employee No</div>
                            <div class="col-7 info-value">${escapeHtml(obj.employee_id.empno)}</div>
                        </div>
                        <div class="row info-row">
                            <div class="col-5 info-label">Month / Year</div>
                            <div class="col-7 info-value">${escapeHtml(obj.monthYear)}</div>
                        </div>
                        <div class="row info-row">
                            <div class="col-5 info-label">Status</div>
                            <div class="col-7 info-value">${escapeHtml(obj.status)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`);
    setTimeout(() => {
        newTab.print();
        newTab.close();
    }, 400);
}


const refillLeavePlanForm = (ob) => {
    leavePlan = getServiceRequest("/leaveplan/alldata").find(lp => lp.id === ob.id);
    oldLeavePlan = JSON.parse(JSON.stringify(leavePlan));

    // Re-populate employee datalist
    let employees = getServiceRequest("/employee/alldata");
    populateDataList(
        listEmployeeElement,
        searchEmployeeElement,
        selectEmployeeHidden,
        employees,
        (emp) => emp.empno + " - " + emp.fullname,
        "id"
    );

    // Set form fields
    if (leavePlan.monthYear) inputMonthElement.value = leavePlan.monthYear;
    if (leavePlan.employee_id) 
        setSelectedByHiddenId(searchEmployeeElement, selectEmployeeHidden, employees, (emp) => emp.empno + " - " + emp.fullname, "id", leavePlan.employee_id.id);
    if (leavePlan.leaveType) selectLeaveTypeElement.value = leavePlan.leaveType;

    buttonUpdate.style.display = "inline-block";
    buttonSubmit.style.display = "none";
    document.querySelector('#panelLeavePlanForm .offcanvas-title').textContent = 'Edit Leave Plan';
    openPanel('panelLeavePlanForm');
};

//define function for update leave plan
function updateMonthlyAvailablePlanForm() {
    if (!inputMonthElement.value) { showToast("Month is required", "error"); return; }
    if (!selectEmployeeHidden.value) { showToast("Employee is required", "error"); return; }

    leavePlan.monthYear = inputMonthElement.value;
    leavePlan.employee_id = { id: parseInt(selectEmployeeHidden.value) };
    leavePlan.leaveType = selectLeaveTypeElement.value;

    showConfirm("Confirm Update", "Are you sure you want to update this leave plan?", "Update", "primary").then(confirmed => {
        if (!confirmed) return;
        let serverResponse = getHTTPServicesRequest("/leaveplan/update", "PUT", leavePlan);
        if (serverResponse === "OK") {
            showToast("Leave plan updated successfully!", "success");
            refreshMonthlyAvailablePlanForm();
            refreshMonthlyAvailablePlanTable();
            closePanel('panelLeavePlanForm');
        } else {
            showToast("Failed to update leave plan. " + serverResponse, "error");
        }
    });
}