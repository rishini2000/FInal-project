// On window load, refresh main form and table
window.addEventListener("load", () => {
    refreshMonthlyAvailablePlanForm();
    refreshMonthlyAvailablePlanTable();
});

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
        printLeaveplan
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
        showConfirm("Confirm Submit", "Are you sure to submit the form ?", "Submit", "primary").then(confirmed => {
            if (!confirmed) return;
            let leavePlan = {

                monthYear: inputMonthElement.value,

                employee_id: {
                    id: parseInt(selectEmployeeHidden.value)
                },

                leaveType: selectLeaveTypeElement.value,

                leaveDates: selectedLeaveDates
            };

            console.log(selectedLeaveDates);
            // console.log(leavePlan);
            let serviceResponse = getHTTPServicesRequest("/leaveplan/insert", "POST", leavePlan);
            if (serviceResponse == "OK") {
                showToast("Form submitted successfully!", "success");

                refreshMonthlyAvailablePlanForm();
                refreshMonthlyAvailablePlanTable();

                closePanel('panelLeavePlanForm');
            } else {
                showToast("Form submission cancelled..! \n Have some errors.. \n" + serviceResponse, "error");
            }
        });
    } else {
        showToast("Please fill all required fields correctly..! \n" + errors, "warning");
    }
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