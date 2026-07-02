async function authenticate() {
    const endpoint = 'http://localhost:8080/authenticate/login/user';
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginRequest = {
        username: username,
        password: password
    };

    

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
            headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(loginRequest)
            });
        if(!response.ok) {
            console.log("ERROR")
        }

        const data = await response.json();
        console.log(data)
        localStorage.setItem("accessToken", data.token);

        window.location.href = "http://localhost:5500/inner_website/home.html";
    } catch(ex) {
        console.log("FETCH FAILED" + ex)
    }
}