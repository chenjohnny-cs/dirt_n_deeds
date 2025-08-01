'use strict';
const { useState, useEffect, useContext } = React;

const Forum = () => {
    const {user} = useContext(UserContext);
    const [forums, setForums] = useState([]);

    async function getForum() {
        try {
            const res = await fetch(`${API_URL}/forum`, {
                method: "GET"
            });
            const data = await res.json();
            setForums(data);
        } catch (e) {
            console.error("Error fetching forum logs:", e);
        }
    }

    async function purge() {
        try {
            await fetch(`${API_URL}/forum`, { 
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + user.accessToken
                }
            })
        } catch (e) {
            if (!user || !user["UserInfo"] || !user.accessToken) {
                alert("You are not logged in.");
            } else {
                console.error("Error purging all documents:", e);
            }
        }
    }

    async function find_by_id(query) {
        if (!query.trim()) {
            return getForum();
        }
        try {
            const res = await fetch(`${API_URL}/forum/search/${query}`, { 
                method: "GET",
            });
            const data = await res.json();
            setForums(data);

        } catch (e) {
            console.error("Error finding documents, either query doesnt exist or error:", e);
        }
    }

    useEffect(function() {
        getForum();
        const socket = io("https://cheerios.eastus.cloudapp.azure.com", {
            path: "/node/socket.io"
          });          
        socket.on("forumCreated", function(new_forum) {
            console.log("A new forum was created, recieved via websocket.");
            getForum();
        });

        socket.on("replyCreated", function(new_forum) {
            console.log("A new reply was created, recieved via websocket.");
            getForum();
        });

        socket.on("forumPurged", function() {
            console.log("Forum was purged, recieved via websocket.");
            getForum();
        })

        socket.on("forumDeleted", function() {
            console.log("A forum was deleted, recieved via websocket.");
            getForum();
        })

        socket.on("replyDeleted", function() {
            console.log("A reply was deleted, recieved via websocked.");
            getForum();
        })

        return function() {
            socket.disconnect();
        };
    }, [user]);

    return (
        <div className="container">
            <Header />
            <main className="main-content">
                <div className="forum-header-section">
                    <h3 className="resources-title" id="forum-header">Plant, Grow and Connect!</h3>
                    <p className="resources-subtitle" id="forum-subtitle">Find people who are connected to their local gardens!</p>

                    <div className="forum-controls">
                        <label htmlFor="forum_filter_input" className="sr-only">Search by Forum Header</label>
                        <input
                            id="forum_filter_input"
                            name="forum_filter_input"
                            placeholder="Search by Forum Header"
                            className="forum-filter"
                            onChange={function(e) { find_by_id(e.target.value) }}
                            aria-describedby="forum-header"
                            aria-label="Search for forum by header"
                        />
                        <div className="forum-button-row">
                            <a
                                id="create-forum"
                                className="forum-button"
                                href="./forum_create.html"
                                role="button"
                                aria-label="Create a new forum"
                            >
                                Create Forum
                            </a>
                            <button
                                className="forum-button purge-button"
                                onClick={purge}
                                aria-label="Purge all forums"
                            >
                                Purge
                            </button>
                        </div>
                    </div>
                </div>

                <div id="forum-display" role="region" aria-labelledby="forum-header">
                    <div id="forum-container">
                        {forums.length > 0 ? (
                            forums.map((forum) => (
                                <ForumCard
                                    key={forum["_id"]}
                                    header={forum["forum-header"]}
                                    desc={forum["forum-desc"]}
                                    id={forum["_id"]}
                                    date={forum["date-created"]}
                                    username={forum["username"]}
                                    replycount={forum["replies"].length}
                                    aria-labelledby={`forum-${forum["_id"]}`}
                                />
                            ))
                        ) : (
                            <p className="no-forums" role="alert" aria-live="assertive">No forum pages were found.</p>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <UserProvider>
        <Forum />
    </UserProvider>
);
