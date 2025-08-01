'use strict';
const { useState, useEffect } = React;

const ForumViewer = () => {
    const [forum, setForum] = useState([]);
    const [replies, setReplies] = useState([]);
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    async function retrieveSpecificForum(id) {
        try {
            const forum_res = await fetch(`${API_URL}/forum/${id}`);
            const forum_data = await forum_res.json();
    
            const replies_res = await fetch(`${API_URL}/forum/reply/${id}`);
            const replies_data = await replies_res.json();
    
            setForum(forum_data);
            setReplies(replies_data);
        } catch (e) {
            console.error("Error fetching forum or reply logs:", e);
        }
    }

    useEffect(function() {
        if (id) {
            retrieveSpecificForum(id);
            const socket = io("https://cheerios.eastus.cloudapp.azure.com", {
                path: "/node/socket.io"
              });              
        
            socket.on("replyCreated", function(new_reply) {
                console.log("New forum received via websocket");
                retrieveSpecificForum(id);
            });
    
            return function() {
                socket.disconnect();
            };
        }
    }, [id]);
    
    return (
        <div className="container">
            <Header />
            <main className="main-content">
                <div id="reply-container">
                    <ForumDisplay
                        key={forum["_id"]}
                        header={forum["forum-header"]}
                        desc={forum["forum-desc"]}
                        id={forum["_id"]}
                        date={forum["date-created"]}
                        username={forum["username"]}
                        onReply={function() { retrieveSpecificForum(id) }}
                        aria-labelledby="forum-title"
                    />

                    {
                    replies.length > 0 ? (
                        replies.map((reply) => (
                            <ForumReply
                                key={reply["_id"]}
                                desc={reply["reply-desc"]}
                                username={reply["username"]}
                                date={reply["date-created"]}
                                aria-labelledby="reply-title"
                            />
                        ))
                    ) : (
                        <p id="no-replies-message">There are no replies to this forum.</p>
                    )}
                </div>

                <a className="return_to_forum" href="./Forum.html" aria-label="Return to the forum list">Back to Forum</a>
            </main>
            <Footer />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById("root")).render(
    <UserProvider>
        <ForumViewer />
    </UserProvider>
);
