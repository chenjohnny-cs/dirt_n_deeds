'use strict';
const { useState, useEffect, useContext } = React;

const SignUp = () => {
    const check = function() {
        const password = document.getElementById("password").value;
        const confirm_password = document.getElementById("confirm-password").value;
            if (password != confirm_password || (password == '' && confirm_password == '')) {
                console.log("not matching");
            } else {
                console.log("matching!")
            }
    }
    
    async function onSignup(e) {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirm_password = document.getElementById("confirm-password").value;

        let err = '';
        if (password != confirm_password) {
            err += "Passwords do not match!"
        }

        if (err != '') return alert(err);
        
        try {
            const res = await fetch(`${API_URL}/users`, {
                method: "POST",
                body: JSON.stringify({ username, email, password, roles: ['volunteer'] }),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            console.log(data);
            
            if (res.ok) {
                window.location.href = `${API_URL}/Pages/SignUpLogIn/SignIn.html`
            } else {
                console.log("nuh uh");
            }
            
        } catch (err) {
            console.log("Failed to Sign up:", err);
        }
    }

    return (
        <div className="container">
            <Header />
            <main className="main-content">
                <section className="sign-in-section">
                    <h3 className="sign-in-title" id="sign-up-heading">Create Your Account</h3>
                    <div className="sign-in-box">
                        <form className="sign-in-form" onSubmit={onSignup} aria-labelledby="sign-up-heading">
                            <label htmlFor="username">Username</label>
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                required 
                                aria-required="true" 
                                aria-label="Username"
                            />

                            <label htmlFor="email">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                required 
                                aria-required="true" 
                                aria-label="Email"
                            />
                            
                            <label htmlFor="password">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                autoComplete="on" 
                                onKeyUp={check} 
                                required 
                                aria-required="true" 
                                aria-label="Password"
                            />

                            <label htmlFor="confirm-password">Confirm Password</label>
                            <input 
                                type="password" 
                                id="confirm-password" 
                                name="confirm-password" 
                                autoComplete="on" 
                                onKeyUp={check} 
                                required 
                                aria-required="true" 
                                aria-label="Confirm Password"
                            />
                            
                            <button type="submit" aria-label="Sign Up">Sign Up</button>
                        </form>
                        <p className="sign-up-link">
                            Already have an account? 
                            <a href={`${API_URL}/Pages/SignUpLogIn/SignIn.html`} aria-label="Sign in here">Sign in here</a>
                        </p>
                        <p className="sign-up-link">
                            If you want to join as a garden owner, please email kauri@rpi.edu!
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <UserProvider>
        <SignUp />
    </UserProvider>
);
