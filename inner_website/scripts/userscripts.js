window.addEventListener("DOMContentLoaded", loadUser);
const editInfoBtn = document.getElementById('edit-info')




async function loadUser() {
    try {
        const token = localStorage.getItem('accessToken')
        const user = await fetch("http://localhost:8080/web/bank/user/userInfo", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
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
        document.getElementById("user-title")
        .textContent = `User: ${frontUser[4]}`;
        document.getElementById("name-email")
        .textContent = `Name: ${frontUser[0]} -- Email: ${frontUser[5]}`;
        document.getElementById("phone-birthday")
        .textContent = `Phone: ${frontUser[3]} -- Birthday: ${frontUser[2]}`;
        document.getElementById("address")
        .textContent = `Current Adress: ${frontUser[1]}`;
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

function editForm() {
    document.getElementById('form-output').innerHTML = `
    <Label>Select The information you wish to edit</label>
    <select id="option">
        <option>Name</option>
        <option>Address</option>
        <option>Email</option>
        <option>Phone number</option>
    </select>
    <label>New information:</label>
    <input id="replace-text" type="text">
    <button id="submit-change" onClick="updateUserInfo()">Submit</button>`
}

async function updateUserInfo() {

    const option = document.getElementById('option').value;
    const replacement = document.getElementById('replace-text').value;
    const editPayload = {
        option,
        replacement
    }
    try {
        const token = localStorage.getItem('accessToken')
        const result = fetch("http://localhost:8080/web/bank/user/manip", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "content-type": "application/json"
            },
            body: JSON.stringify(editPayload)
        })

        if(result == null) {
            document.getElementById('error-field').innerHTML = `<p>Error in editing profile</p>`
        }

        const confirmation = (await result).text();
        document.getElementById('form-output').innerHTML = `<p>Successfully changed account detail ${option} to ${replacement}`
        await loadUser()

    } catch(ex) {
        console.log(ex);
    }
}

editInfoBtn.addEventListener("click", editForm)