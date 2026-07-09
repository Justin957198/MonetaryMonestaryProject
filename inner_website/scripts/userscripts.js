window.addEventListener("DOMContentLoaded", loadUser);




async function loadUser() {
    try {
        const token = localStorage.getItem('accessToken')
        const user = await fetch("http://localhost:8080/authenticate/you", {
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
        .textContent = `User: ${frontUser.username}`;
        document.getElementById("name-email")
        .textContent = `Name: ${frontUser.userDetails[0]} -- Email: ${frontUser.email}`
        document.getElementById("phone")
        .textContent = `Phone: ${frontUser.userDetails[1]}`
        document.getElementById("address")
        .textContent = `Current Adress: ${frontUser.userDetails[3]}`
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
