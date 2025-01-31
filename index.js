const Modal = {

    open(){

        document.querySelector('.modal-overlay').style.visibility = "visible";

    },

    close(){

        document.querySelector('.modal-overlay').style.visibility = "hidden";

    }
}

const Storage = {

    get() {

        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];

    },

    set(transactions) {

        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));

    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){

        Transaction.all.push(transaction);
        App.reload();

    },

    remove(index) {

        Transaction.all.splice(index, 1);
        App.reload();

    },

    incomes() {

        let income = 0;

        Transaction.all.forEach(transaction => {
            if( transaction.amount > 0 ) {

                income += transaction.amount;

            }
        })

        return income;
    },

    expenses() {
        let expense = 0;

        Transaction.all.forEach(transaction => {
            if( transaction.amount < 0 ) {

                expense += transaction.amount;

            }
        })
        
        return expense;
    },

    total() {

        return Transaction.incomes() + Transaction.expenses();

    }
}

const DOM = {

    transactionsContainer: document.querySelector('#datatable tbody'),

    addTransaction(transaction, index) {

        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        DOM.transactionsContainer.appendChild(tr);

    },

    innerHTMLTransaction(transaction, index) {

        const CSSclass = transaction.amount > 0 ? "income" : "expense";
        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td class="user">${transaction.user}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `;

        return html;
    },

    updateBalance() {

        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());

    },

    clearTransactions() {

        DOM.transactionsContainer.innerHTML = "";

    }
}

const Utils = {
    formatAmount(value){

        value = value * 100;
        return Math.round(value);

    },

    formatDate(date) {

        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;

    },

    formatCurrency(value) {

        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, "");

        value = Number(value) / 100;

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

       return signal + value;

    }
}

const Form = {

    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),
    user: document.querySelector("input#user"),

    getValues() {
        return {
            description: document.getElementById("description").value,
            amount: document.getElementById("amount").value,
            date: document.getElementById("date").value,
            user: document.getElementById("user").value,
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues();
        if( description === "" || amount === "" || date === "" || user === "" ) {
            new Error("Por favor, preencha todos os campos");
        }
    },

    formatValues() {

        let { description, amount, date, user } = Form.getValues();
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date,
            user
        }
    },

    clearFields() {

        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
        Form.date.user = "";

    },

    submit(event) {

        event.preventDefault();

        try {

            Form.validateFields();
            const transaction = Form.formatValues();
            Transaction.add(transaction);
            Form.clearFields();

        } 
        
        catch (error) 
        {
            alert(error.message);
        }
    }
}

const App = {
    init() {

        Modal.close();
        Transaction.all.forEach(DOM.addTransaction);
        DOM.updateBalance();
        Storage.set(Transaction.all);

    },
    
    reload() {

        DOM.clearTransactions();
        App.init();

    },
}

App.init();