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
        if(!user.ok) {
            throw new Error("Not Authenticated");
        }

        const frontUser = await user.json();
        console.log(frontUser)
        document.getElementById("user-welcome")
        .textContent = `Welcome ${frontUser.username} AKA ${frontUser.userDetails[0]}`;
    } catch(ex) {
        console.log("FETCH ERROR");
    }
}