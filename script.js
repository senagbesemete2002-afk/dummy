 /* =====================================================
Complaints app (dummy data only, no backend)
Sections:
1. Data
2. Variables that change while the app runs
3. Small helper functions
4. Complaints list
5. Details panel (drawer)
6. Employee picker pop-up
7. Form
8. Events (clicks, typing...)
===================================================== */


/* ---------- 1. DATA ---------- */

const employees = [
{ name: "Chinedu Okafor", role: "Software Engineer" },
{ name: "Adaeze Nwosu", role: "Product Manager" },
{ name: "Oluwaseun Adeyemi", role: "Lead Designer" },
{ name: "Ibrahim Musa", role: "Head of Operations" },
{ name: "Funmilayo Balogun", role: "Accountant" },
{ name: "Emeka Obi", role: "Head, Welfare" },
{ name: "Zainab Bello", role: "HR Officer" },
{ name: "Tunde Bakare", role: "Line Manager" }
];

const complaintTypes = [
"Absenteeism",
"Bullying",
"Discrimination",
"Harassment",
"Hostile work environment",
"Inability to prioritise",
"Insubordination",
"Persistent lateness",
"Sexual assault",
"Slow response to work requests",
"Theft",
"Unsustainable workload",
"Violation of health and safety",
"Other (specify in description)"
];

// Complaints the user filed
const reportedByYou = [
{ id: 1, date: "31 Jan, 2023", type: "Sexual assault", against: "Funmilayo Balogun", status: "Pending", stage: "N/A", decision: "N/A", incidentDate: "28 Jan, 2023", frequency: "One time", times: "", sentTo: "HR", description: "Lorem ipsum details.", documents: [] },
{ id: 2, date: "08 Sept, 2022", type: "Violation of health and safety", against: "N/A", status: "Open", stage: "Investigation", decision: "N/A", incidentDate: "23 Sept, 2021", frequency: "One time", times: "", sentTo: "Line manager", description: "Lorem ipsum details.", documents: ["evidence-1.pdf", "evidence-2.pdf"] },
{ id: 3, date: "12 Aug, 2022", type: "Hostile work environment", against: "N/A", status: "Open", stage: "Resolution", decision: "Dismissed", incidentDate: "02 Aug, 2022", frequency: "One time", times: "", sentTo: "HR", description: "Lorem ipsum details.", documents: [] },
{ id: 4, date: "10 Dec, 2021", type: "Theft", against: "Adaeze Nwosu", status: "Open", stage: "Investigation", decision: "N/A", incidentDate: "01 Dec, 2021", frequency: "One time", times: "", sentTo: "HR and line manager", description: "Lorem ipsum details.", documents: [] },
{ id: 5, date: "11 Jun, 2020", type: "Bullying", against: "Emeka Obi", status: "Closed", stage: "Resolution", decision: "Suspension", incidentDate: "21 Aug, 2020", frequency: "Repeat behavior", times: "3", sentTo: "HR", description: "Lorem ipsum details.", documents: [] }
];

// Complaints other people filed about the user
const againstYou = [
{ id: 11, date: "10 Jun, 2023", type: "Slow response to work requests", status: "Open", stage: "Investigation", description: "Lorem ipsum details." },
{ id: 12, date: "02 Sept, 2022", type: "Harassment", status: "Closed", stage: "Resolution", description: "Lorem ipsum details." },
{ id: 13, date: "28 Mar, 2021", type: "Inability to prioritise", status: "Closed", stage: "Resolution", description: "Lorem ipsum details." }
];


/* ---------- 2. VARIABLES THAT CHANGE ---------- */

let currentTab = "reported"; // "reported" or "against"
let selectedAbout = ""; // employee the complaint is about
let selectedWitnesses = []; // list of witness names
let pickerMode = ""; // "about" or "witness"
let pickerSelection = []; // names ticked inside the pop-up
let nextId = 100; // id for new complaints


/* ---------- 3. SMALL HELPER FUNCTIONS ---------- */

function $(id) {
return document.getElementById(id);
}

// Stops user text from being treated as HTML
function escapeHtml(text) {
return String(text)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;");
}

// "2026-10-20" becomes "20 Oct, 2026"
function formatDate(isoDate) {
if (isoDate === "") {
return "N/A";
}
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const parts = isoDate.split("-");
return Number(parts[2]) + " " + months[Number(parts[1]) - 1] + ", " + parts[0];
}

function getToday() {
return new Date().toISOString().slice(0, 10);
}

function getRadioValue(name) {
return document.querySelector('input[name="' + name + '"]:checked').value;
}

function showToast(message) {
const toast = $("toast");
toast.textContent = message;
toast.hidden = false;
setTimeout(function () {
toast.hidden = true;
}, 2500);
}

function getRoleOf(name) {
for (const person of employees) {
if (person.name === name) {
return person.role;
}
}
return "Employee";
}

function statusLabel(status) {
return '<span class="status status-' + status.toLowerCase().replace(/ /g, "-") + '">' + status + "</span>";
}

// All the pages of the app. Only one is visible at a time.
const pageIds = ["homePage", "listPage", "formPage", "otherPage"];

function showPage(pageId) {
// If the form was open as a side panel, close it first
$("formPage").classList.remove("panel");
$("overlay").hidden = true;

for (const id of pageIds) {
$(id).hidden = (id !== pageId);
}
window.scrollTo(0, 0);
}

// Highlights one button in the top menu
function setActiveMenu(button) {
for (const item of document.querySelectorAll(".menu-item")) {
item.classList.remove("active");
}
button.classList.add("active");
}

function getMenuButton(page) {
return document.querySelector('.menu-item[data-page="' + page + '"]');
}

// true when the form was opened from the Home page (so Back returns there)
let cameFromHome = false;

function showListPage() {
cameFromHome = false;
setActiveMenu(getMenuButton("complaints"));
showPage("listPage");
}

function showFormPage() {
if (cameFromHome) {
// Opened from Home: keep Home visible and slide the form in as a side panel
setActiveMenu(getMenuButton("home"));
showPage("homePage");
$("formPage").classList.add("panel");
$("formPage").hidden = false;
$("overlay").hidden = false;
} else {
setActiveMenu(getMenuButton("complaints"));
showPage("formPage");
}
}

function goBack() {
if (cameFromHome) {
cameFromHome = false;
setActiveMenu(getMenuButton("home"));
showPage("homePage");
} else {
showListPage();
}
}

// Greeting, date and clock on the Home page
function renderHome() {
const now = new Date();
const hour = now.getHours();
let greeting = "Good evening";
if (hour < 12) {
greeting = "Good morning";
} else if (hour < 17) {
greeting = "Good afternoon";
}
$("greeting").textContent = greeting;
$("todayDate").textContent = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
$("clockTime").textContent = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// Opens or closes a small drop-down menu
function toggleMenu(menuId) {
$(menuId).hidden = !$(menuId).hidden;
}

function closeMenus() {
$("quickMenu").hidden = true;
$("timeoffMenu").hidden = true;
}


/* ---------- 4. COMPLAINTS LIST ---------- */

function fillTypeOptions() {
let filterHtml = '<option value="">Complaint type</option>';
let formHtml = '<option value="">Select complaint type</option>';

for (const type of complaintTypes) {
filterHtml += "<option>" + type + "</option>";
formHtml += "<option>" + type + "</option>";
}

$("typeFilter").innerHTML = filterHtml;
$("typeSelect").innerHTML = formHtml;
}

function renderTable() {
// 1. Choose which list to show
let list = againstYou;
if (currentTab === "reported") {
list = reportedByYou;
}

// 2. Read the filters
const searchText = $("searchInput").value.toLowerCase();
const typeFilter = $("typeFilter").value;
const statusFilter = $("statusFilter").value;
const stageFilter = $("stageFilter").value;

// 3. Keep only the complaints that match
const filtered = [];
for (const complaint of list) {
const searchableText = (complaint.date + " " + complaint.type + " " + (complaint.against || "")).toLowerCase();

if (searchText !== "" && !searchableText.includes(searchText)) continue;
if (typeFilter !== "" && complaint.type !== typeFilter) continue;
if (statusFilter !== "" && complaint.status !== statusFilter) continue;
if (stageFilter !== "" && complaint.stage !== stageFilter) continue;

filtered.push(complaint);
}

// 4. Table heading (the two lists have different columns)
if (currentTab === "reported") {
$("tableHead").innerHTML =
"<tr><th>Date reported</th><th>Complaint type</th><th>Filed against</th><th>Status</th><th>Stage</th><th>Decision</th></tr>";
} else {
$("tableHead").innerHTML =
"<tr><th>Date of complaint</th><th>Complaint type</th><th>Status</th><th>Stage</th></tr>";
}

// 5. Table rows
let rowsHtml = "";
for (const c of filtered) {
rowsHtml += '<tr data-id="' + c.id + '">';
rowsHtml += "<td>" + c.date + "</td>";
rowsHtml += '<td><span class="cut" title="' + escapeHtml(c.type) + '">' + escapeHtml(c.type) + "</span></td>";
if (currentTab === "reported") {
rowsHtml += "<td>" + escapeHtml(c.against) + "</td>";
}
rowsHtml += "<td>" + statusLabel(c.status) + "</td>";
rowsHtml += "<td>" + c.stage + "</td>";
if (currentTab === "reported") {
rowsHtml += "<td>" + escapeHtml(c.decision) + "</td>";
}
rowsHtml += "</tr>";
}
$("tableBody").innerHTML = rowsHtml;

// 6. Message when nothing matches
$("emptyMessage").hidden = filtered.length > 0;
}

function switchTab(tabName) {
currentTab = tabName;
$("reportedTab").classList.toggle("active", tabName === "reported");
$("againstTab").classList.toggle("active", tabName === "against");
renderTable();
}


/* ---------- 5. DETAILS PANEL (DRAWER) ---------- */

function personBox(name, role) {
return '<div class="drawer-box"><strong style="color:#1d2428">' + escapeHtml(name) + "</strong><br>" + escapeHtml(role) + "</div>";
}

function openDrawer(id) {
let html = "";

if (currentTab === "reported") {
// Find the complaint with this id
let c = null;
for (const item of reportedByYou) {
if (item.id === id) c = item;
}

html += '<div class="drawer-header"><div class="drawer-title">Complaint : ' + escapeHtml(c.type) + "</div>";
html += '<button class="link-button" id="drawerClose" aria-label="Close">✕</button></div>';

if (c.against !== "N/A") {
html += '<p class="drawer-label">Filed against</p>' + personBox(c.against, getRoleOf(c.against));
}

html += '<p class="drawer-label">Incident date</p><div class="drawer-box">' + c.incidentDate + "</div>";

if (c.times !== "") {
html += '<p class="drawer-label">Frequency</p><div class="drawer-box">' + c.frequency + ", " + c.times + " times</div>";
}

html += '<p class="drawer-label">Reported to</p><div class="drawer-box">' + escapeHtml(c.sentTo) + "</div>";
html += '<p class="drawer-label">Description</p><div class="drawer-box">' + escapeHtml(c.description) + "</div>";

if (c.documents.length > 0) {
html += '<p class="drawer-label">Documents</p>';
for (const fileName of c.documents) {
html += '<div class="file-box">📄 ' + escapeHtml(fileName) + "</div>";
}
}
} else {
let c = null;
for (const item of againstYou) {
if (item.id === id) c = item;
}

html += '<div class="drawer-header"><div><div class="drawer-title">General complaint</div>';
html += '<small class="muted">Submission: ' + c.date + "</small></div>";
html += '<button class="link-button" id="drawerClose" aria-label="Close">✕</button></div>';
html += '<p class="drawer-label">Incident type</p><div class="drawer-box">' + escapeHtml(c.type) + "</div>";
html += '<p class="drawer-label">Description</p><div class="drawer-box">' + escapeHtml(c.description) + "</div>";
}

html += '<button class="btn primary full" id="drawerCloseBottom">Close</button>';

$("drawer").innerHTML = html;
$("drawer").hidden = false;
$("overlay").hidden = false;
}

function closeDrawer() {
$("drawer").hidden = true;
$("overlay").hidden = true;
}


/* ---------- 6. EMPLOYEE PICKER POP-UP ---------- */

function openPicker(mode) {
pickerMode = mode;
$("pickerSearch").value = "";

if (mode === "about") {
$("pickerTitle").textContent = "Select employee";
$("pickerConfirm").textContent = "Select employee";
pickerSelection = selectedAbout === "" ? [] : [selectedAbout];
} else {
$("pickerTitle").textContent = "Select witness(es)";
$("pickerConfirm").textContent = "Select employees";
pickerSelection = selectedWitnesses.slice(); // copy of the list
}

renderPickerList();
$("pickerDialog").showModal();
}

function renderPickerList() {
const searchText = $("pickerSearch").value.toLowerCase();
// One person can be chosen for "about", many for "witness"
const inputType = pickerMode === "about" ? "radio" : "checkbox";

let html = "";
for (const person of employees) {
if (searchText !== "" && !person.name.toLowerCase().includes(searchText)) continue;

const isChecked = pickerSelection.includes(person.name) ? "checked" : "";
html += '<label class="person">';
html += '<input type="' + inputType + '" name="person" value="' + person.name + '" ' + isChecked + ">";
html += "<span>" + person.name + "<small>" + person.role + "</small></span>";
html += "</label>";
}

if (html === "") {
html = '<p class="muted">No employees found.</p>';
}
$("pickerList").innerHTML = html;
}

function onPickerChange(event) {
const name = event.target.value;

if (pickerMode === "about") {
pickerSelection = [name];
} else if (event.target.checked) {
pickerSelection.push(name);
} else {
pickerSelection = pickerSelection.filter(function (item) {
return item !== name;
});
}
}

function confirmPicker() {
if (pickerMode === "about") {
if (pickerSelection.length === 0) return; // nothing chosen yet
selectedAbout = pickerSelection[0];
$("aboutButton").textContent = selectedAbout;
$("aboutButton").classList.add("chosen");
$("field-about").classList.remove("has-error");
} else {
selectedWitnesses = pickerSelection.slice();
renderWitnessChips();
}
$("pickerDialog").close();
}

function renderWitnessChips() {
let html = "";
for (const name of selectedWitnesses) {
html += '<span class="chip">' + name + ' <button data-remove="' + name + '" aria-label="Remove ' + name + '">×</button></span>';
}
$("witnessChips").innerHTML = html;
}


/* ---------- 7. FORM ---------- */

// Show or hide parts of the form depending on the radio buttons
function updateFormSections() {
const kind = getRadioValue("kind");
const frequency = getRadioValue("frequency");
const isEmployee = kind === "employee";
const isRepeat = isEmployee && frequency === "repeat";

$("field-about").hidden = !isEmployee;
$("employeeOnly").hidden = !isEmployee;
$("witnessField").hidden = !isEmployee;
$("field-times").hidden = !isRepeat;

// Labels change slightly between the two types
if (isEmployee) {
$("typeLabel").textContent = "Select incident you are complaining about *";
$("descLabel").textContent = "Description of incident *";
$("dateLabel").textContent = isRepeat ? "Most recent date of incident *" : "Date of incident *";
$("sendToLabel").textContent = "Who would you like to send this complaint to? *";
$("typeSelect").options[0].textContent = "Select incident";
} else {
$("typeLabel").textContent = "Select complaint type *";
$("descLabel").textContent = "Provide description of complaint in details *";
$("dateLabel").textContent = "Incident date (if date related)";
$("sendToLabel").textContent = "Submit complaint to *";
$("typeSelect").options[0].textContent = "Select complaint type";
}
}

function resetForm() {
$("typeSelect").value = "";
$("descInput").value = "";
$("dateInput").value = "";
$("timesInput").value = "";
$("fileInput").value = "";
$("fileNames").textContent = "";
document.querySelector('input[name="kind"][value="general"]').checked = true;
document.querySelector('input[name="frequency"][value="one"]').checked = true;
document.querySelector('input[name="sendTo"][value="HR"]').checked = true;

selectedAbout = "";
selectedWitnesses = [];
$("aboutButton").textContent = "Select employee";
$("aboutButton").classList.remove("chosen");
renderWitnessChips();
clearErrors();
updateFormSections();
renderHome();
setInterval(renderHome, 30000); // keeps the clock and greeting fresh
}

function clearErrors() {
const fields = document.querySelectorAll(".field");
for (const field of fields) {
field.classList.remove("has-error");
}
}

function showError(fieldId) {
$(fieldId).classList.add("has-error");
}

// Returns true when everything is filled in correctly
function validateForm() {
clearErrors();
let isValid = true;

const isEmployee = getRadioValue("kind") === "employee";
const isRepeat = isEmployee && getRadioValue("frequency") === "repeat";

if ($("typeSelect").value === "") {
showError("field-type");
isValid = false;
}

if ($("descInput").value.trim() === "") {
showError("field-description");
isValid = false;
}

if (isEmployee && selectedAbout === "") {
showError("field-about");
isValid = false;
}

if (isEmployee && $("dateInput").value === "") {
showError("field-date");
isValid = false;
}

if (isRepeat && Number($("timesInput").value) < 2) {
showError("field-times");
isValid = false;
}

// The date can never be in the future
if ($("dateInput").value > getToday()) {
showError("field-date");
isValid = false;
}

return isValid;
}

function submitForm() {
if (!validateForm()) {
return; // stop here, errors are now visible
}

const isEmployee = getRadioValue("kind") === "employee";
const isRepeat = isEmployee && getRadioValue("frequency") === "repeat";

// Collect the names of the chosen files
const fileNames = [];
for (const file of $("fileInput").files) {
fileNames.push(file.name);
}

const newComplaint = {
id: nextId,
date: formatDate(getToday()),
type: $("typeSelect").value,
against: isEmployee ? selectedAbout : "N/A",
status: "Pending",
stage: "N/A",
decision: "N/A",
incidentDate: formatDate($("dateInput").value),
frequency: isRepeat ? "Repeat behavior" : "One time",
times: isRepeat ? $("timesInput").value : "",
sentTo: getRadioValue("sendTo"),
description: $("descInput").value.trim(),
documents: fileNames
};
nextId = nextId + 1;

reportedByYou.unshift(newComplaint); // add to the top of the list

resetForm();
showListPage();
switchTab("reported");
showToast("Complaint filed successfully");
}


/* ---------- 7B. OTHER PAGES (People, Timeoff, Benefits...) ----------
These pages have no Figma frame, so they are simple designs made in
the same style. Each page has its own data array and its own function
that returns the HTML for that page. */

function money(amount) {
return "₦" + amount.toLocaleString("en-NG");
}

function pageHeader(title) {
return '<div class="page-header"><h1>' + title + "</h1></div>";
}

// Builds a table from a list of column names and ready-made rows
function tableHtml(headers, bodyId, rowsHtml) {
let head = "";
for (const name of headers) {
head += "<th>" + name + "</th>";
}
return '<div class="table-wrap"><table><thead><tr>' + head + '</tr></thead><tbody id="' + bodyId + '">' + rowsHtml + "</tbody></table></div>";
}

function daysBetween(fromIso, toIso) {
return Math.round((new Date(toIso) - new Date(fromIso)) / 86400000) + 1;
}

/* ----- Data for the other pages ----- */

const directory = [
{ name: "Chinedu Okafor", role: "Software Engineer", department: "Technology", email: "chinedu.okafor@bizedge.ng" },
{ name: "Adaeze Nwosu", role: "Product Manager", department: "Product", email: "adaeze.nwosu@bizedge.ng" },
{ name: "Oluwaseun Adeyemi", role: "Lead Designer", department: "Design", email: "oluwaseun.adeyemi@bizedge.ng" },
{ name: "Ibrahim Musa", role: "Head of Operations", department: "Operations", email: "ibrahim.musa@bizedge.ng" },
{ name: "Funmilayo Balogun", role: "Accountant", department: "Finance", email: "funmilayo.balogun@bizedge.ng" },
{ name: "Emeka Obi", role: "Head, Welfare", department: "HR", email: "emeka.obi@bizedge.ng" },
{ name: "Zainab Bello", role: "HR Officer", department: "HR", email: "zainab.bello@bizedge.ng" },
{ name: "Tunde Bakare", role: "Line Manager", department: "Operations", email: "tunde.bakare@bizedge.ng" },
{ name: "Ngozi Eze", role: "Customer Support Lead", department: "Support", email: "ngozi.eze@bizedge.ng" },
{ name: "Segun Adebayo", role: "Finance Analyst", department: "Finance", email: "segun.adebayo@bizedge.ng" }
];

const timeoffTypes = ["Annual timeoff", "Sick timeoff", "Casual timeoff", "Study timeoff", "Maternity timeoff", "Paternity timeoff"];

const timeoffBalances = [
{ type: "Annual timeoff", days: 20 },
{ type: "Sick timeoff", days: 9 },
{ type: "Casual timeoff", days: 10 },
{ type: "Study timeoff", days: 5 }
];

const timeoffRequests = [
{ type: "Annual timeoff", from: "03 Aug, 2026", to: "07 Aug, 2026", days: 5, status: "Approved" },
{ type: "Sick timeoff", from: "14 Sept, 2026", to: "15 Sept, 2026", days: 2, status: "Approved" }
];

const benefits = [
{ name: "Family Healthcare Plan", provider: "Leadway Assurance", details: ["Plan: Gold", "Dependants covered: 2", "Annual cover: " + money(5000000)] },
{ name: "Leadway Pension", provider: "Leadway Pensure PFA", details: ["Employee contribution: 8%", "Employer contribution: 10%", "Status: Active"] },
{ name: "Group Life Insurance", provider: "AXA Mansard", details: ["Cover: " + money(12000000), "Beneficiaries: 1", "Status: Active"] }
];

const documents = [
{ name: "Employment contract.pdf", type: "Contract", date: "03 Jan, 2024" },
{ name: "Offer letter.pdf", type: "Letter", date: "15 Dec, 2023" },
{ name: "Non-disclosure agreement.pdf", type: "Contract", date: "03 Jan, 2024" },
{ name: "Pension form.pdf", type: "Form", date: "10 Jan, 2024" }
];

const payslips = [
{ month: "October 2026", basic: 250000, housing: 100000, transport: 50000, bonus: 30000 },
{ month: "September 2026", basic: 250000, housing: 100000, transport: 50000, bonus: 0 },
{ month: "August 2026", basic: 250000, housing: 100000, transport: 50000, bonus: 0 },
{ month: "July 2026", basic: 250000, housing: 100000, transport: 50000, bonus: 0 },
{ month: "June 2026", basic: 250000, housing: 100000, transport: 50000, bonus: 15000 },
{ month: "May 2026", basic: 250000, housing: 100000, transport: 50000, bonus: 0 }
];

const goals = [
{ title: "Reduce complaint resolution time to 14 days", progress: 70, due: "30 Nov, 2026" },
{ title: "Complete leadership training course", progress: 40, due: "15 Dec, 2026" },
{ title: "Mentor two new team members", progress: 100, due: "30 Sept, 2026" }
];
let reviewStatus = "Not started";

const assets = [
{ tag: "LAP-0142", name: "Dell Latitude 5420 laptop", assigned: "12 Feb, 2025", status: "In use" },
{ tag: "PHN-0087", name: "Samsung Galaxy A54", assigned: "12 Feb, 2025", status: "In use" },
{ tag: "ACC-0210", name: "Office access card", assigned: "03 Jan, 2024", status: "In use" }
];

const tasks = [
{ id: 1, text: "Submit October expense report", done: false },
{ id: 2, text: "Complete health and safety training", done: false },
{ id: 3, text: "Review team timeoff requests", done: true },
{ id: 4, text: "Update emergency contact details", done: false }
];
let taskFilter = "all";
let nextTaskId = 5;


/* ----- Opening an "other" page ----- */

function showOtherPage(name) {
renderOtherPage(name);
showPage("otherPage");
}

function renderOtherPage(name) {
let html = "";

if (name === "People") html = peopleHtml();
else if (name === "Timeoff") html = timeoffHtml();
else if (name === "Benefits") html = benefitsHtml();
else if (name === "Documents") html = documentsHtml();
else if (name === "Payslips") html = payslipsHtml();
else if (name === "Performance review") html = performanceHtml();
else if (name === "Assets") html = assetsHtml();
else if (name === "Tasks") html = tasksHtml();

$("otherPage").innerHTML = html;

if (name === "People") updatePeople();
}

/* ----- People ----- */

function peopleHtml() {
const departments = [];
for (const person of directory) {
if (!departments.includes(person.department)) departments.push(person.department);
}
let options = '<option value="">Department</option>';
for (const department of departments) {
options += "<option>" + department + "</option>";
}

return pageHeader("People") +
'<div class="filters"><input id="peopleSearch" type="search" placeholder="Search people">' +
'<select id="peopleDept">' + options + "</select></div>" +
tableHtml(["Name", "Role", "Department", "Email"], "peopleBody", "") +
'<p id="peopleEmpty" class="muted" hidden>No one found.</p>';
}

function updatePeople() {
const searchText = $("peopleSearch").value.toLowerCase();
const department = $("peopleDept").value;
let rows = "";
let count = 0;

for (const person of directory) {
if (searchText !== "" && !(person.name + " " + person.role).toLowerCase().includes(searchText)) continue;
if (department !== "" && person.department !== department) continue;

rows += '<tr><td><span class="person-row" style="background:none;padding:0;margin:0"><span class="dot"></span><strong>' + person.name + "</strong></span></td>";
rows += "<td>" + person.role + "</td><td>" + person.department + "</td><td>" + person.email + "</td></tr>";
count = count + 1;
}
$("peopleBody").innerHTML = rows;
$("peopleEmpty").hidden = count > 0;
}

/* ----- Timeoff ----- */

function timeoffHtml() {
let cards = "";
for (const balance of timeoffBalances) {
cards += '<div class="card center"><strong>' + balance.type + '</strong><span class="big">' + balance.days + '</span><small class="muted">days left</small></div>';
}

let options = '<option value="">Select timeoff type</option>';
for (const type of timeoffTypes) {
options += "<option>" + type + "</option>";
}

let rows = "";
for (const request of timeoffRequests) {
rows += "<tr><td>" + request.type + "</td><td>" + request.from + "</td><td>" + request.to + "</td><td>" + request.days + "</td><td>" + statusLabel(request.status) + "</td></tr>";
}

return pageHeader("Timeoff") +
'<div class="cards">' + cards + "</div>" +
'<div class="box form-card"><h3>Request timeoff</h3>' +
'<div class="field" id="field-toType"><label class="label" for="toType">Timeoff type *</label><select id="toType">' + options + '</select><p class="error">Please choose a timeoff type</p></div>' +
'<div class="field" id="field-toFrom"><label class="label" for="toFrom">Start date *</label><input id="toFrom" type="date" min="' + getToday() + '"><p class="error">Choose a start date</p></div>' +
'<div class="field" id="field-toTo"><label class="label" for="toTo">End date *</label><input id="toTo" type="date" min="' + getToday() + '"><p class="error" id="errTo">Choose an end date</p></div>' +
'<div class="field"><label class="label" for="toReason">Reason (optional)</label><textarea id="toReason"></textarea></div>' +
'<button class="btn primary" data-action="submitTimeoff">Submit request</button></div>' +
'<h3 class="section-title">Your requests</h3>' +
tableHtml(["Type", "From", "To", "Days", "Status"], "timeoffBody", rows);
}

// Used by the Home page buttons too (the type can be chosen in advance)
function openTimeoffPage(type) {
setActiveMenu(getMenuButton("timeoff"));
showOtherPage("Timeoff");
if (type) {
$("toType").value = type;
}
}

function submitTimeoff() {
clearErrors();
let isValid = true;

const type = $("toType").value;
const from = $("toFrom").value;
const to = $("toTo").value;

if (type === "") {
showError("field-toType");
isValid = false;
}
if (from === "") {
showError("field-toFrom");
isValid = false;
}
if (to === "") {
$("errTo").textContent = "Choose an end date";
showError("field-toTo");
isValid = false;
} else if (from !== "" && to < from) {
$("errTo").textContent = "End date must not be before the start date";
showError("field-toTo");
isValid = false;
}
if (!isValid) return;

const days = daysBetween(from, to);

// Check the balance (only the types that have one)
let balance = null;
for (const item of timeoffBalances) {
if (item.type === type) balance = item;
}
if (balance !== null && days > balance.days) {
$("errTo").textContent = "You only have " + balance.days + " days left";
showError("field-toTo");
return;
}
if (balance !== null) {
balance.days = balance.days - days;
}

timeoffRequests.unshift({ type: type, from: formatDate(from), to: formatDate(to), days: days, status: "Pending" });
renderOtherPage("Timeoff");
showToast("Timeoff request submitted");
}

/* ----- Benefits ----- */

function benefitsHtml() {
let cards = "";
for (const benefit of benefits) {
cards += '<div class="card"><strong>' + benefit.name + '</strong><small class="muted">' + benefit.provider + "</small>";
for (const line of benefit.details) {
cards += "<span>" + line + "</span>";
}
cards += "</div>";
}
return pageHeader("Benefits") + '<div class="cards">' + cards + "</div>";
}

/* ----- Documents ----- */

function documentsHtml() {
return pageHeader("Documents") +
'<div class="upload-row"><label class="btn secondary" style="display:inline-block">Upload document<input id="docUpload" type="file" multiple hidden></label></div>' +
tableHtml(["Name", "Type", "Date added", ""], "docBody", docRows());
}

function docRows() {
let rows = "";
for (const doc of documents) {
rows += "<tr><td>📄 " + escapeHtml(doc.name) + "</td><td>" + doc.type + "</td><td>" + doc.date + '</td><td><button class="mini-link" data-action="downloadDoc" data-name="' + escapeHtml(doc.name) + '">Download</button></td></tr>';
}
return rows;
}

function addDocuments() {
for (const file of $("docUpload").files) {
documents.unshift({ name: file.name, type: "Uploaded", date: formatDate(getToday()) });
}
$("docBody").innerHTML = docRows();
showToast("Document uploaded");
}

/* ----- Payslips ----- */

function payslipTotals(slip) {
const gross = slip.basic + slip.housing + slip.transport + slip.bonus;
const tax = Math.round(gross * 0.08);
const pension = Math.round(slip.basic * 0.08);
return { gross: gross, tax: tax, pension: pension, net: gross - tax - pension };
}

function payslipsHtml() {
let rows = "";
for (let i = 0; i < payslips.length; i++) {
const totals = payslipTotals(payslips[i]);
rows += "<tr><td>" + payslips[i].month + "</td><td>" + money(totals.gross) + "</td><td>" + money(totals.tax + totals.pension) + "</td><td><strong>" + money(totals.net) + '</strong></td><td><button class="mini-link" data-action="viewPayslip" data-index="' + i + '">View</button></td></tr>';
}
return pageHeader("Payslips") + tableHtml(["Month", "Gross pay", "Deductions", "Net pay", ""], "payBody", rows);
}

function openPayslip(index) {
const slip = payslips[index];
const totals = payslipTotals(slip);
const line = function (label, value) {
return '<div class="drawer-box" style="display:flex;justify-content:space-between;margin-bottom:6px"><span>' + label + "</span><strong>" + money(value) + "</strong></div>";
};

let html = '<div class="drawer-header"><div class="drawer-title">Payslip : ' + slip.month + '</div><button class="link-button" id="drawerClose" aria-label="Close">✕</button></div>';
html += '<p class="drawer-label">Earnings</p>';
html += line("Basic salary", slip.basic) + line("Housing allowance", slip.housing) + line("Transport allowance", slip.transport);
if (slip.bonus > 0) html += line("Bonus", slip.bonus);
html += '<p class="drawer-label">Deductions</p>';
html += line("Tax (PAYE)", totals.tax) + line("Pension (8% of basic)", totals.pension);
html += '<p class="drawer-label">Net pay</p>' + line("Paid into your account", totals.net);
html += '<button class="btn primary full" id="drawerCloseBottom">Close</button>';

$("drawer").innerHTML = html;
$("drawer").hidden = false;
$("overlay").hidden = false;
}

/* ----- Performance review ----- */

function performanceHtml() {
let goalRows = "";
for (const goal of goals) {
goalRows += '<div class="box" style="margin-bottom:10px"><strong>' + goal.title + '</strong><div class="bar-wrap"><div class="bar" style="width:' + goal.progress + '%"></div></div><small class="muted">' + goal.progress + "% complete · due " + goal.due + "</small></div>";
}
const canStart = reviewStatus === "Not started";

return pageHeader("Performance review") +
'<div class="box" style="margin-bottom:16px"><div class="box-head"><div><h3>Q4 2026 review</h3><small class="muted">Self assessment due 30 Nov, 2026</small></div>' + statusLabel(reviewStatus) + "</div>" +
(canStart ? '<button class="btn primary" data-action="startReview">Start self assessment</button>' : '<small class="muted">Your manager will review it soon.</small>') +
"</div>" +
'<h3 class="section-title" style="margin-top:0">Your goals</h3>' + goalRows;
}

/* ----- Assets ----- */

function assetsHtml() {
let rows = "";
for (let i = 0; i < assets.length; i++) {
const asset = assets[i];
rows += "<tr><td>" + asset.tag + "</td><td>" + asset.name + "</td><td>" + asset.assigned + "</td><td>" + statusLabel(asset.status) + '</td><td><button class="mini-link" data-action="reportIssue" data-index="' + i + '">Report issue</button></td></tr>';
}
return pageHeader("Assets") + tableHtml(["Tag", "Asset", "Assigned on", "Status", ""], "assetBody", rows);
}

function reportAssetIssue(index) {
assets[index].status = "Issue reported";
renderOtherPage("Assets");
showToast("Issue reported to the IT team");
}

/* ----- Tasks ----- */

function taskRows() {
let rows = "";
let count = 0;
for (const task of tasks) {
if (taskFilter === "open" && task.done) continue;
if (taskFilter === "done" && !task.done) continue;

rows += '<div class="task-row' + (task.done ? " done" : "") + '"><input type="checkbox" data-action="toggleTask" data-id="' + task.id + '"' + (task.done ? " checked" : "") + '><span>' + escapeHtml(task.text) + '</span><button class="mini-link" data-action="deleteTask" data-id="' + task.id + '">Delete</button></div>';
count = count + 1;
}
if (count === 0) rows = '<p class="muted">No tasks here.</p>';
return rows;
}

function tasksHtml() {
const tab = function (value, label) {
return '<button data-action="taskFilter" data-value="' + value + '"' + (taskFilter === value ? ' class="active"' : "") + ">" + label + "</button>";
};
return pageHeader("Tasks") +
'<div class="inline-form"><input id="newTask" placeholder="Add a new task"><button class="btn primary" data-action="addTask">Add task</button></div>' +
'<div class="toggle">' + tab("all", "All") + tab("open", "Open") + tab("done", "Done") + "</div>" +
'<div id="taskList">' + taskRows() + "</div>";
}

function addTask() {
const text = $("newTask").value.trim();
if (text === "") {
showToast("Type a task first");
return;
}
tasks.unshift({ id: nextTaskId, text: text, done: false });
nextTaskId = nextTaskId + 1;
renderOtherPage("Tasks");
}

function toggleTask(id) {
for (const task of tasks) {
if (task.id === id) task.done = !task.done;
}
renderOtherPage("Tasks");
}

function deleteTask(id) {
const index = tasks.findIndex(function (task) { return task.id === id; });
tasks.splice(index, 1);
renderOtherPage("Tasks");
}

/* ----- Quick action forms (Report missed days, Expense request) ----- */

let quickKind = "";

function openQuickForm(kind) {
quickKind = kind;
let html = "";

if (kind === "missed") {
html += '<div class="drawer-header"><div class="drawer-title">Report missed days</div><button class="link-button" id="drawerClose" aria-label="Close">✕</button></div>';
html += '<div class="field" id="field-qDate"><label class="label" for="qDate">Date you missed *</label><input id="qDate" type="date" max="' + getToday() + '"><p class="error">Choose a date that is not in the future</p></div>';
html += '<div class="field" id="field-qReason"><label class="label" for="qReason">Reason *</label><select id="qReason"><option value="">Select reason</option><option>Forgot to check in</option><option>Network problem</option><option>Power outage</option><option>Other</option></select><p class="error">Please choose a reason</p></div>';
html += '<div class="field"><label class="label" for="qNote">Note (optional)</label><textarea id="qNote"></textarea></div>';
} else {
html += '<div class="drawer-header"><div class="drawer-title">Expense request</div><button class="link-button" id="drawerClose" aria-label="Close">✕</button></div>';
html += '<div class="field" id="field-qCategory"><label class="label" for="qCategory">Category *</label><select id="qCategory"><option value="">Select category</option><option>Transport</option><option>Meals</option><option>Data and airtime</option><option>Office supplies</option><option>Other</option></select><p class="error">Please choose a category</p></div>';
html += '<div class="field" id="field-qAmount"><label class="label" for="qAmount">Amount (₦) *</label><input id="qAmount" type="number" min="1" placeholder="e.g. 15000"><p class="error">Enter an amount greater than 0</p></div>';
html += '<div class="field" id="field-qDesc"><label class="label" for="qDesc">What was it for? *</label><textarea id="qDesc"></textarea><p class="error">Please add a short description</p></div>';
html += '<div class="field"><label class="label" for="qReceipt">Receipt (optional)</label><input id="qReceipt" type="file"></div>';
}

html += '<div class="button-row"><button class="btn secondary" id="drawerCloseBottom">Cancel</button><button class="btn primary" id="quickSubmit">Submit</button></div>';

$("drawer").innerHTML = html;
$("drawer").hidden = false;
$("overlay").hidden = false;
}

function submitQuickForm() {
clearErrors();
let isValid = true;

if (quickKind === "missed") {
if ($("qDate").value === "" || $("qDate").value > getToday()) {
showError("field-qDate");
isValid = false;
}
if ($("qReason").value === "") {
showError("field-qReason");
isValid = false;
}
} else {
if ($("qCategory").value === "") {
showError("field-qCategory");
isValid = false;
}
if (Number($("qAmount").value) <= 0) {
showError("field-qAmount");
isValid = false;
}
if ($("qDesc").value.trim() === "") {
showError("field-qDesc");
isValid = false;
}
}
if (!isValid) return;

closeDrawer();
showToast(quickKind === "missed" ? "Missed day report submitted" : "Expense request submitted");
}


/* ---------- 8. EVENTS ---------- */

// Top menu
for (const item of document.querySelectorAll(".menu-item")) {
item.addEventListener("click", function () {
const page = item.dataset.page;
setActiveMenu(item);

if (page === "home") {
cameFromHome = false;
renderHome();
showPage("homePage");
} else if (page === "complaints") {
showPage("listPage");
} else {
showOtherPage(item.textContent);
}
});
}

// Home page: Quick actions menu
$("quickButton").addEventListener("click", function (event) {
event.stopPropagation(); // so the click does not also close the menu
$("timeoffMenu").hidden = true;
toggleMenu("quickMenu");
});

$("quickMenu").addEventListener("click", function (event) {
const choice = event.target.dataset.quick;
closeMenus();
if (choice === "complaint") {
cameFromHome = true;
resetForm();
showFormPage();
} else if (choice === "missed") {
openQuickForm("missed");
} else if (choice === "expense") {
openQuickForm("expense");
}
});

// Home page: Timeoff menu and cards
$("timeoffButton").addEventListener("click", function (event) {
event.stopPropagation();
$("quickMenu").hidden = true;
toggleMenu("timeoffMenu");
});

$("homePage").addEventListener("click", function (event) {
const timeoffName = event.target.dataset.timeoff;
if (timeoffName) {
closeMenus();
openTimeoffPage(timeoffName);
}
});

document.addEventListener("click", closeMenus); // click anywhere else closes menus

// Home page: Remote / On-site toggle
$("homePage").addEventListener("click", function (event) {
if (event.target.dataset.where) {
for (const button of document.querySelectorAll(".pill-toggle button")) {
button.classList.remove("active");
}
event.target.classList.add("active");
}
});

// Home page: Check in / Check out
let checkedIn = false;
$("checkButton").addEventListener("click", function () {
checkedIn = !checkedIn;
$("checkButton").textContent = checkedIn ? "Check out" : "Check in";
$("checkStatus").textContent = checkedIn ? "Present" : "Absent";
});

// Home page: Upcoming / Pending tabs
$("recordTabs").addEventListener("click", function (event) {
const panelToShow = event.target.dataset.show;
if (!panelToShow) return;

for (const button of $("recordTabs").querySelectorAll("button")) {
button.classList.remove("active");
}
event.target.classList.add("active");
$("recordUpcoming").hidden = (panelToShow !== "recordUpcoming");
$("recordPending").hidden = (panelToShow !== "recordPending");
});

// Other pages (People, Timeoff, Tasks...)
$("otherPage").addEventListener("click", function (event) {
const button = event.target.closest("[data-action]");
if (!button) return;
const action = button.dataset.action;

if (action === "submitTimeoff") submitTimeoff();
else if (action === "viewPayslip") openPayslip(Number(button.dataset.index));
else if (action === "downloadDoc") showToast("Downloading " + button.dataset.name);
else if (action === "startReview") {
reviewStatus = "Submitted";
renderOtherPage("Performance review");
showToast("Self assessment started and submitted");
}
else if (action === "reportIssue") reportAssetIssue(Number(button.dataset.index));
else if (action === "addTask") addTask();
else if (action === "taskFilter") {
taskFilter = button.dataset.value;
renderOtherPage("Tasks");
}
else if (action === "deleteTask") deleteTask(Number(button.dataset.id));
});

$("otherPage").addEventListener("change", function (event) {
if (event.target.dataset.action === "toggleTask") toggleTask(Number(event.target.dataset.id));
if (event.target.id === "docUpload") addDocuments();
});

$("otherPage").addEventListener("input", function (event) {
if (event.target.id === "peopleSearch" || event.target.id === "peopleDept") updatePeople();
});

$("otherPage").addEventListener("keydown", function (event) {
if (event.key === "Enter" && event.target.id === "newTask") addTask();
});

// Complaints list
$("reportedTab").addEventListener("click", function () { switchTab("reported"); });
$("againstTab").addEventListener("click", function () { switchTab("against"); });
$("searchInput").addEventListener("input", renderTable);
$("typeFilter").addEventListener("change", renderTable);
$("statusFilter").addEventListener("change", renderTable);
$("stageFilter").addEventListener("change", renderTable);

$("tableBody").addEventListener("click", function (event) {
const row = event.target.closest("tr");
if (row) {
openDrawer(Number(row.dataset.id));
}
});

// Details panel
$("overlay").addEventListener("click", function () {
if ($("formPage").classList.contains("panel")) {
goBack();
} else {
closeDrawer();
}
});
$("drawer").addEventListener("click", function (event) {
if (event.target.id === "drawerClose" || event.target.id === "drawerCloseBottom") {
closeDrawer();
} else if (event.target.id === "quickSubmit") {
submitQuickForm();
}
});
document.addEventListener("keydown", function (event) {
if (event.key === "Escape" && !$("pickerDialog").open) {
if ($("formPage").classList.contains("panel")) {
goBack();
} else {
closeDrawer();
}
}
});

// Moving between the two pages
$("fileButton").addEventListener("click", function () {
cameFromHome = false;
resetForm();
showFormPage();
});
$("backButton").addEventListener("click", goBack);
$("cancelButton").addEventListener("click", goBack);
$("panelClose").addEventListener("click", goBack);

// Form
$("submitButton").addEventListener("click", submitForm);

for (const radio of document.querySelectorAll('input[name="kind"], input[name="frequency"]')) {
radio.addEventListener("change", updateFormSections);
}

$("fileInput").addEventListener("change", function () {
const names = [];
for (const file of $("fileInput").files) {
names.push(file.name);
}
$("fileNames").textContent = names.join(", ");
});

// Employee picker
$("aboutButton").addEventListener("click", function () { openPicker("about"); });
$("witnessButton").addEventListener("click", function () { openPicker("witness"); });
$("pickerSearch").addEventListener("input", renderPickerList);
$("pickerList").addEventListener("change", onPickerChange);
$("pickerConfirm").addEventListener("click", confirmPicker);
$("pickerClose").addEventListener("click", function () { $("pickerDialog").close(); });

// Remove a witness chip
$("witnessChips").addEventListener("click", function (event) {
const nameToRemove = event.target.dataset.remove;
if (nameToRemove) {
selectedWitnesses = selectedWitnesses.filter(function (name) {
return name !== nameToRemove;
});
renderWitnessChips();
}
});


/* ---------- START ---------- */

$("dateInput").max = getToday(); // block future dates in the calendar
fillTypeOptions();
renderTable();
updateFormSections();
renderHome();
setInterval(renderHome, 30000); // keeps the clock and greeting fresh
