const { useState, useEffect, createContext } = React;
const UserContext = createContext(null);

function UserProvider({ children }) {
    function decodeJWT(token) {
        try {
            const base64Payload = token.split('.')[1];
            const payload = atob(base64Payload);
            return JSON.parse(payload);
        } catch (e) {
            return null;
        }
    }

    const [user, setUser] = useState(null);

    // Essentially, when this component loads, gets the user from local storage.
    useEffect(() => {
        async function refreshAccessToken() {
            try {
                const res = await fetch(`${API_URL}/auth/refresh`, {
                    method: "GET",
                    credentials: "include",
                });

                if (res.ok) {
                    const data = await res.json();
                    const decoded = decodeJWT(data.accessToken);

                    const updatedUser = {
                        accessToken: data.accessToken,
                        UserInfo: decoded.UserInfo
                    };
                    console.log(updatedUser); // see access token and other stuff
                    setUser(updatedUser);
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                } else {
                    if (res.status == 401) {
                        console.warn("User is not signed in.");
                    } else {
                        console.warn("Could not refresh token:", res.status);
                    }
                    setUser(null);
                }
            } catch (e) {
                console.error("Token refresh failed:", e);
                setUser(null);
            }
        }

        refreshAccessToken();
    }, []);

    // When user changes, if we do have a user, we set user in local storage to that,
    // if we dont, we remove it.
    useEffect(function() {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    return (
        <UserContext.Provider value={{user, setUser}} aria-live="polite" aria-label="User Authentication Context">
            { children }
        </UserContext.Provider>
    );
}
