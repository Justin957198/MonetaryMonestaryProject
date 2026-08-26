window.addEventListener("DOMContentLoaded", loadUser);
const infoButton = document.getElementById('info-button');
const infoListElement = document.getElementById('info-list');
const logoutButton = document.getElementById('logout');
const openAccountBtn = document.getElementById('open-account');
const hideAccountCreator = document.getElementById('hide-account-menu');
const depoBtn = document.getElementById('deposit');
const withBtn = document.getElementById('withdraw');
const transBtn = document.getElementById('transfer');
const accNumList = [];
let trabsactionsLoaded = false;
let infoLoaded = false;
let frontUser = null;

async function loadUser() {
    try {
        const token = localStorage.getItem('accessToken')
        const user = await fetch("http://localhost:8080/authenticate/you", {
            method: "GET",
            headers: {
                //"Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if(!user.ok || user.status === 401) {
            //throw new Error("Not Authenticated");
            refresh();
            return;
        }

        frontUser = await user.json();
        console.log(frontUser)
        document.getElementById("user-welcome")
        .textContent = `Welcome ${frontUser.username}`;
        if(frontUser.usersAccounts !== undefined) {
            Object.entries(frontUser.usersAccounts).forEach(([accountNumber, account]) => {
                let statusClass = "";
                let minimumClass = "";
            if(account.status === "Unlocked") {
                statusClass = "status-unlocked"
            } else {
                statusClass = "status-locked"
            }

            if(account.minimum > account.currency) {
                minimumClass = "under-minimum"
            } else {
                minimumClass = "over-minimum"
            }
                document.getElementById('accounts-list')
            .innerHTML += `
            <div id="${accountNumber}" class="account-block">
            <hr>
            <h3>${account.accountType}</h3>
            <p>Account Number: ${accountNumber} | Routing: ${account.routingNumber}</p>
            <p id="current-funds">Avaliable Balance: ${account.currency}</p>
            <div class="status-squares"><span class="module ${statusClass}"></span><span class="module ${minimumClass}"></span><span class="module"></span></div>
            <hr>
            </div>`
            accNumList.push(accountNumber);
            });
        } else {
            document.getElementById('accounts-list')
            .textContent = `No accounts exist, please open an account above.`
        }
        document.getElementById('standing-information').innerHTML = `
        <p>Customer trust rating ${frontUser.userStatus.customerRating}</p>
        <p>Total Debt: ${frontUser.userStatus.debt}</p>`
        if(frontUser.userStatus.failedBills === null) {
            document.getElementById('standing-information').innerHTML += `
            <p>No bills failed yay</p>`
        } else {
            Objects.entries(frontUser.userStatus.failedBills).forEach(([billName, bill]) => {
                document.getElementById('standing-information').innerHTML += `
                <h4>Failed Bills</h4>
                <p>Bill Name: ${billName}</p>
                <p>Bill Info: ${bill}</p>`
            })
        }
        
    } catch(ex) {
        console.log(ex);
    }
}

async function refresh() {
    const newToken = await fetch("http://localhost:8080/authenticate/refresh", {
        method: "POST",
        credentials: "include"
    });

    if(!newToken.ok) {
        localStorage.removeItem("accessToken");
        window.location.href = "http://localhost:5500/index.html";
    }

    const tokenData = await newToken.json();
    //console.log(tokenData);

    localStorage.setItem(
        "accessToken",
        tokenData.token
    );

    await loadUser();
}

async function openAccountForm() {
    document.getElementById('account-form')
    .innerHTML = `<label>Select account type</label><br>
    <label>Cheackings</label>
    <input type="radio" id="type_checkings" name="account_type" value="Checking">
    <label>Savings</label>
    <input type="radio" id="type_savings" name="account_type" value="Savings"><br>
    <label>Set Account Minimum (leave blank for none)</label><br>
    <input type="number" id="minimum" value=0><br>
    <label>Transfer Limit</label>
    <input type="number" id="trans_limit" name="trans_limit" value=0><br>
    <label>Enable Overdraft?</label><input type="checkbox" id="over_draft" name="over_draft"><br>
    <button onclick="submitAccount()">Open</button>`
}

async function hideAccountForm() {
    document.getElementById('account-form')
    .innerHTML = ``;
}

async function submitAccount() {
    const accountType = document.querySelector('input[name="account_type"]:checked')?.value;
    const Minimum = Number(document.getElementById('minimum').value);
    const Transfer_Limit = Number(document.getElementById('trans_limit').value);
    const OverDreaftBox = document.getElementById('over_draft').checked;
    let Overdraft = null;

    if(OverDreaftBox) {
        Overdraft = "YES";
    } else {
        Overdraft = "NO";
    }
    const accInfo = {
        Minimum,
        Overdraft, 
        Transfer_Limit
    };

    const accountPayload = {
        accountType,
        username: frontUser.username,
        accInfo
    }

    try {
        const response = await fetch("http://localhost:8080/web/bank/account/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            },
            body: JSON.stringify(accountPayload)
        });

        if(response.status === 401) {
            await refresh()
            return submitAccount()
            
        }

        if(!response.ok) {
            console.log(response.status);
        }

        const result = await response.json();
        document.getElementById('ErrorOrComfirmation')
        .textContent = result.message;
    } catch(ex) {
        console.log(ex.message);
    }
}

async function openDepositForm() {
    document.getElementById('transaction-form').innerHTML = `
    <label id="action-type">Deposit</label><br>
    <label>Enter account number:</label>
    <select id="account-select"></select><br>
    <label>Enter cash injection:</label>
    <input id="injection" type="number" value=0><br>
    <button onClick="manipCurrency()">Submit</button>` 
    for(let i = 0; i < accNumList.length; i++) {
        document.getElementById('account-select').innerHTML += `
        <option>${accNumList[i]}</option>`
    }
}

async function openWithdrawForm() {
    document.getElementById('transaction-form').innerHTML = `
    <label id="action-type">Withdraw</label><br>
    <label>Enter account number:</label>
    <select id="account-select"></select><br>
    <label>Enter cash request:</label>
    <input id="injection" type="number" value=0><br>
    <button onClick="manipCurrency()">Submit</button>` 
    for(let i = 0; i < accNumList.length; i++) {
        document.getElementById('account-select').innerHTML += `
        <option>${accNumList[i]}</option>`
    }
}

async function openTransferForm() {
    document.getElementById('transaction-form').innerHTML = `
    <label id="action-type">Transfer</label><br>
    <label>Enter origin account number:</label>
    <select id="account-select"></select><br>
    <label>Enter origin account number:</label>
    <select id="account-select2"></select><br>
    <label>Enter cash Transfer:</label>
    <input id="injection" type="number" value=0><br>
    <button onClick="manipCurrency()">Submit</button>` 
    for(let i = 0; i < accNumList.length; i++) {
        document.getElementById('account-select').innerHTML += `
        <option>${accNumList[i]}</option>`
        document.getElementById('account-select2').innerHTML += `
        <option>${accNumList[i]}</option>`
    }
}

async function manipCurrency() {
    const action = document.getElementById('action-type').textContent;
    const accNumber = [document.getElementById('account-select').value];
    const money = document.getElementById('injection').valueAsNumber;

    if(action === "Transfer") {
        accNumber.push(document.getElementById('account-select2').value)
        if(accNumber[0] === accNumber[1]) {
            document.getElementById('transaction-form').innerText = `ERROR cannot transfer to self`;
            return;
        }
    }

    if(money === 0 || money === null) {
        document.getElementById('transaction-form').innerText = `ERROR a transfer requires at least 0.01`;
        return;
    }

    manipPayload = {
        action,
        accNumber,
        money
    }

    try {
        const data = await fetch("http://localhost:8080/web/bank/account/manipFunds", {
            method: "PUT",
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            },
            body: JSON.stringify(manipPayload)
        });

        if(data.ok) {
            const response = await data.json()
            if(response.actionPreformed === "Transfer") {
                document.getElementById('transaction-form').innerHTML = `
            <p>Succsessfully completed a ${response.actionPreformed} on account ${response.accounts[0]} to ${response.accounts[1]} with ${response.amount} at time ${response.timePreformed}</p>`
            } else {
                document.getElementById('transaction-form').innerHTML = `
                <p>Succsessfully completed a ${response.actionPreformed} on account ${response.accounts[0]} with ${response.amount} at time ${response.timePreformed}</p>`
            }
            response.accounts.forEach( async (updatedAccount) => {
                const account = await fetch(`http://localhost:8080/web/bank/account/getAccount=${updatedAccount}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
                }
                });

                if(!account.ok) {
                    console.log("ERROR");
                }

                const acc = await account.json();
                let statusClass = "";
                let minimumClass = "";
                if(acc.status === "Unlocked") {
                    statusClass = "status-unlocked";
                } else {
                    statusClass = "status-locked";
                }

                if(acc.minimum > acc.currency) {
                    minimumClass = "under-minimum"
                } else {
                    minimumClass = "over-minimum"
                }
                document.getElementById(`${acc.accountNumber}`).innerHTML = `
                <hr>
                <h3>${acc.accountType}</h3>
                <p>Account Number: ${acc.accountNumber} | Routing: ${acc.routingNumber}</p>
                <p "current-funds">Avaliable Balance: ${acc.currency}</p>
                <div class="status-squares"><span class="module ${statusClass}"></span><span class="module ${minimumClass}"></span><span class="module"></span></div>
                <hr>`
            })
            
            
        } else if(data.status === 401) {
            await refresh()
            await manipCurrency()
        } else {
            //console.log(data);
        }
    } catch(ex) {
        console.log(ex);
    }
    
}

async function fetchTransactions() {
    if(accNumList === null || accNumList.length === 0) {

    } else {
        let index = 0;
        console.log(accNumList);
        if(trabsactionsLoaded === true) {

        } else {
            document.getElementById('transaction-block').innerHTML = ``;
            accNumList.forEach( async (getTransactions) => {
                const response = await fetch(`http://localhost:8080/web/bank/transactions/account=${getTransactions}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
                    }
                });

                if(!response.ok) {
                    console.log("ERROR");
                }

                if(response.status === 401) {
                    await refresh()
                    return fetchTransactions()
                }

                const transactionList = await response.json()
                console.log(transactionList);
                transactionList.forEach((transactions) => {
                    document.getElementById('transaction-block').innerHTML += `
                <div id="accTransBlock">
                    <h3>Account used: ${transactions.originAccount} | Type: ${transactions.type} | Ammount: ${transactions.transactionAmount} | Date: ${transactionList.date}</h3>
                </div>
                `
                })
                index++;
                
            })
            trabsactionsLoaded = true;
        }
    }
}

function loadInfo() {
    window.location.href = "http://localhost:5500/inner_website/user.html"
}

async function logout() {
    try {
        const response = await fetch(`http://localhost:8080/authenticate/logout/user`, {
            method: "POST",
            credentials: "include",
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            },
        })

        if(!response.ok) {
            console.log("ERROR")
        }

        //let badToken = await response.json()
        //console.log(badToken);
        localStorage.removeItem("accessToken");
        //localStorage.setItem("accessToken", badToken.token);
        window.location.href = "http://localhost:5500/index.html"
    } catch(ex) {

    }
}

openAccountBtn.addEventListener("click", openAccountForm);
hideAccountCreator.addEventListener("click", hideAccountForm);
infoButton.addEventListener("click", loadInfo);
depoBtn.addEventListener("click", openDepositForm);
withBtn.addEventListener("click", openWithdrawForm);
transBtn.addEventListener("click", openTransferForm);
logoutButton.addEventListener("click", logout);