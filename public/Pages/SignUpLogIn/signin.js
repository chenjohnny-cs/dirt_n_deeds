'use strict';
const { useState, useEffect, useContext } = React;

const SignIn = () => {
    const { setUser } = useContext(UserContext);
    async function LoginHandler(e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch(`${API_URL}/auth`, {
                method: "POST",
                body: JSON.stringify({ username, password }),
                headers: { "Content-Type": "application/json"},
                credentials: "include"
            });

            const data = await res.json();
            console.log(data);

            if (res.ok) {
                console.log("success!");
                setUser(data);
                window.location.href = `${API_URL}/`
            } else {
                if (res.status == 400) {
                    alert("Please enter both username and password.");
                } else if (res.status == 401) {
                    alert("Incorrect username or password.");
                } else {
                    alert(`Login Failed: ${res.statusText}`);
                }
            }
        } catch (err) {
            alert("Failed to Log in:", err);
        }
    }

  return (
    <div className="container">
      <Header />
      <main className="main-content">
        <section className="sign-in-section">
            <h3 className="sign-in-title" id="sign-in-heading">Sign In to Your Account</h3>
            <div className="sign-in-box">
                <form className="sign-in-form" onSubmit={LoginHandler} aria-labelledby="sign-in-heading">
                    <label htmlFor="username">Username</label>
                    <input 
                      type="text" 
                      id="username" 
                      name="username" 
                      required 
                      aria-required="true"
                      aria-label="Username" 
                    />
                    
                    <label htmlFor="password">Password</label>
                    <input 
                      type="password" 
                      id="password" 
                      name="password" 
                      required 
                      aria-required="true"
                      aria-label="Password"
                    />
                    
                    <button type="submit" aria-label="Sign In"> Sign In</button>
                </form>
                <p className="sign-up-link">
                    Don't have an account? 
                    <a href={`${API_URL}/Pages/SignUpLogIn/SignUp.html`} aria-label="Sign up here">Sign up here</a>
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
        <SignIn />
    </UserProvider>
);
