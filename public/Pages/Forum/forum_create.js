'use strict';
const { useState, useEffect, useContext } = React;

const ForumCreator = () => {
    const { user } = useContext(UserContext);

    async function create_forum(event) {
        event.preventDefault();

        const forum_header = document.getElementById("forum_header_input").value;
        const forum_desc = document.getElementById("forum_desc_input").value;

        try {
            const forum_instance = {
                "forum_header": forum_header,
                "forum_desc": forum_desc,
                "username": user["UserInfo"].username
            };
           
            const res = await fetch(`${API_URL}/forum`, {
                method: "POST",
                body: JSON.stringify(forum_instance),
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + user.accessToken
                }
            });
            window.location.href = "./Forum.html";
        } catch (e) {
            if (!user || !user["UserInfo"] || !user.accessToken) {
                alert("You are not logged in.");
            } else {
                console.log("There was an error processing your request:", e);
            }
        }
    }

    return (
        <div className="forum-page-wrapper">
            <Header />
            <main className="forum-create-section">
                <div className="forum-create-box">
                    <h2 className="forum-create-title" id="forum-create-title">Create a New Forum</h2>
                    <form id="post_forum" onSubmit={create_forum} aria-labelledby="forum-create-title">
                        <div className="form-row">
                            <label htmlFor="forum_header_input" id="forum-header-label">Forum Header</label>
                            <input
                                id="forum_header_input"
                                name="forum_header_input"
                                placeholder="Title of your forum post"
                                required
                                aria-labelledby="forum-header-label"
                                aria-required="true"
                            />
                        </div>
                        <div className="form-row">
                            <label htmlFor="forum_desc_input" id="forum-desc-label">Forum Description</label>
                            <textarea
                                id="forum_desc_input"
                                name="forum_desc_input"
                                placeholder="Description of your forum post"
                                required
                                aria-labelledby="forum-desc-label"
                                aria-required="true"
                            />
                        </div>
                        <div className="form-button-wrapper">
                            <button id="submit" type="submit" aria-label="Create the forum post">Create Forum</button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById("root")).render(
    <UserProvider>
        <ForumCreator />
    </UserProvider>
);
