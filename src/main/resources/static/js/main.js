// Smart Village Management System - Frontend JavaScript

document.addEventListener("DOMContentLoaded", function () {
    // 1. Table Live Search & Filter Functionality
    const tableSearchInputs = document.querySelectorAll(".table-search-input");
    tableSearchInputs.forEach(input => {
        input.addEventListener("keyup", function () {
            const query = this.value.toLowerCase();
            const targetTableId = this.getAttribute("data-target-table");
            const table = document.getElementById(targetTableId);
            if (!table) return;

            const rows = table.querySelectorAll("tbody tr");
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? "" : "none";
            });
        });
    });

    // 2. Select Category Filter
    const categoryFilters = document.querySelectorAll(".table-category-filter");
    categoryFilters.forEach(select => {
        select.addEventListener("change", function () {
            const filterValue = this.value.toLowerCase();
            const targetTableId = this.getAttribute("data-target-table");
            const table = document.getElementById(targetTableId);
            if (!table) return;

            const rows = table.querySelectorAll("tbody tr");
            rows.forEach(row => {
                if (!filterValue || filterValue === "all") {
                    row.style.display = "";
                } else {
                    const rowCategory = row.getAttribute("data-category") || "";
                    const text = row.textContent.toLowerCase();
                    row.style.display = (rowCategory.toLowerCase() === filterValue || text.includes(filterValue)) ? "" : "none";
                }
            });
        });
    });

    // 3. Print Report Trigger
    const printBtns = document.querySelectorAll(".btn-print-report");
    printBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            window.print();
        });
    });
});
