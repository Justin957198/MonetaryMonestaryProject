const submitbtn = document.getElementById('submit-btn')
const infoCheck = document.getElementById('check-btn')



async function createUser() {
    const Cust_Name = document.getElementById('name-input').value + " " + document.getElementById('middle-initial').value + " " + document.getElementById('last-name').value;
    const Cust_Phone = document.getElementById('phone-number').value;
    const Cust_Gender = document.querySelector('input[name="gender-choice"]:checked')?.value;
    const Cust_Address = document.getElementById('address').value;
    const Cust_Birthday = document.getElementById('birthday').value;
    const userEmail = document.getElementById('email').value;
    const Cust_Identification_Token = document.getElementById('user-identification-token').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const Cust_Password_Check = document.getElementById('password_re_enter').value;
    console.log(Cust_Gender);

    const userInfo = {
        Cust_Name,
        Cust_Phone,
        Cust_Gender, 
        Cust_Address, 
        Cust_Birthday, 
        Cust_Identification_Token
    }

    const newUserPackage = {
        username,
        userInfo,
        password,
        userEmail

    }

    if(password !== Cust_Password_Check) {
        console.log("Passwords dont match")
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/web/bank/user/addUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newUserPackage)
        })

        if(!response.status.ok) {
            console.log("ERROR IN CREATION")
        }

        const textResponse = await response.json();
        console.log(textResponse);
    } catch(ex) {
        console.log(ex);
    }
}

submitbtn.addEventListener("click", createUser);