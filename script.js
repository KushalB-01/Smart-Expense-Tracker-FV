const form = document.getElementById('expense-form');
const tableBody = document.getElementById('expense-table-body');
const totalAmountEl = document.getElementById('total-amount');
const filterCategory = document.getElementById('filter-category');

const budgetDisplay = document.getElementById('budget-display');
const spentDisplay = document.getElementById('spent-display');
const remainingDisplay = document.getElementById('remaining-display');

const modal = document.getElementById('welcome-modal');
const budgetInput = document.getElementById('budget-input');
const progressFill = document.getElementById('progress-fill');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let budget = parseFloat(localStorage.getItem('budget')) || 0;

/* ================= THEME ================= */
document.getElementById('toggle-theme').onclick = () => {
    document.body.classList.toggle('dark');
};

/* ================= GOJO ================= */
document.getElementById('toggle-gojo').onclick = () => {
    document.getElementById('bg').classList.toggle('gojo');
};

/* ================= MODAL ================= */
window.onload = () => {
    if (!localStorage.getItem('budget')) {
        modal.style.display = 'flex';
    } else {
        renderExpenses();
    }
};

/* ================= SET BUDGET ================= */
document.getElementById('budget-submit').onclick = () => {
    if (budgetInput.value > 0) {
        budget = parseFloat(budgetInput.value);
        localStorage.setItem('budget', budget);
        modal.style.display = 'none';
        renderExpenses();
    }
};

/* ================= CHANGE BUDGET ================= */
document.getElementById('reset-budget').onclick = () => {
    modal.style.display = 'flex';
};

/* ================= ADD ================= */
form.onsubmit = (e) => {
    e.preventDefault();

    const exp = {
        description: description.value,
        amount: parseFloat(amount.value),
        category: category.value,
        date: date.value
    };

    expenses.push(exp);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    form.reset();
    renderExpenses(filterCategory.value);
};

/* ================= DELETE ================= */
function deleteExpense(i) {
    expenses.splice(i,1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses(filterCategory.value);
}

/* ================= FILTER ================= */
filterCategory.onchange = () => {
    renderExpenses(filterCategory.value);
};

/* ================= CHART ================= */
const ctx = document.getElementById('budgetChart').getContext('2d');

let budgetChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Spent', 'Remaining'],
        datasets: [{
            data: [0, 0],
            backgroundColor: ['#6366f1', '#72757c']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    }
});

/* ================= RENDER ================= */
function renderExpenses(filter = "All") {
    tableBody.innerHTML = '';
    let total = 0;

    let filtered = expenses.filter(e => filter === "All" || e.category === filter);

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5">No expenses yet 👀</td></tr>`;
        totalAmountEl.textContent = "0";
        updateBudget(0);
        return;
    }

    filtered.forEach((e, i) => {
        total += e.amount;

        tableBody.innerHTML += `
        <tr>
            <td>${e.description}</td>
            <td>${e.amount}</td>
            <td>${e.category}</td>
            <td>${e.date}</td>
            <td><button class="delete-btn" onclick="deleteExpense(${i})">✖</button></td>
        </tr>`;
    });

    totalAmountEl.textContent = total;
    updateBudget(total);
}

/* ================= BUDGET ================= */
function updateBudget(spent) {
    let remaining = Math.max(budget - spent, 0);

    budgetDisplay.textContent = budget;
    spentDisplay.textContent = spent;
    remainingDisplay.textContent = remaining;

    let percent = (spent / budget) * 100;
    progressFill.style.width = percent + "%";

    updateChart(spent, remaining);
}

/* ================= UPDATE CHART ================= */
function updateChart(spent, remaining) {
    budgetChart.data.datasets[0].data = [spent, remaining];
    budgetChart.update();
}
