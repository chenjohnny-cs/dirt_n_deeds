'use strict';
const { useState, useEffect, useContext } = React;

const ForumDisplay = ({header, desc, id, date, username, onReply}) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const {user} = useContext(UserContext);
    const textAreaFocus = React.useRef(null);

    React.useEffect(() => {
        if (isReplying && textAreaFocus.current) {
            textAreaFocus.current.focus();
        }
    }, [isReplying]); 

    async function reply(event) {
        event.preventDefault();
        try {
            const replyInstance = {
                ["reply_desc"]: replyText,
                username: user.UserInfo.username
            }

            const res = await fetch(`${API_URL}/forum/reply/${id}`, {
                method: "POST",
                body: JSON.stringify(replyInstance),
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + user.accessToken
                }
            });
            cancelReply();
            if (typeof onReply === "function") {
                onReply();
            }
        } catch (e) {
            if (!user || !user["UserInfo"] || !user.accessToken) {
                alert("You are not logged in.");
            } else {
                console.error("Error replying to this forum post:", e);
            }
        }
    }

    function cancelReply() {
        setIsReplying(false);
        setReplyText('');
    }

    return (
        <div id={`${id}`} className="reply-forum-card" role="region" aria-labelledby={`forum-header-${id}`}>
            <h4 id={`forum-header-${id}`} className="forum-header">{header}</h4>
            <p className="forum-desc">{desc}</p>

            <label className="forum_date_created_label">{`Created by: ${username} (${date})`}</label>
            <div className="reply-interaction">
                {isReplying ? (
                    <div className="reply-container">
                        <textarea
                            className="reply-text-area"
                            ref={textAreaFocus}
                            value={replyText}
                            onChange={function(e) {setReplyText(e.target.value)}}
                            onBlur={function(e) {
                                if (e.target.value == "") {
                                    cancelReply()
                                }
                            }}
                            aria-label="Enter your reply"
                            aria-describedby={`reply-cancel-button-${id}`}
                        />
                        <div className="reply-buttons">
                            <button onClick={reply} aria-label="Submit your reply">Reply</button>
                            <button onClick={cancelReply} id={`reply-cancel-button-${id}`} aria-label="Cancel your reply">Cancel</button>
                        </div>
                    </div>
                ) 
                : (
                    <input
                        className="reply-interaction-area"
                        placeholder="Click to Reply"
                        readOnly
                        onClick={function() {
                            setIsReplying(true);
                        }}
                        aria-label="Click to start a reply"
                    />
                )
                }
            </div>
        </div>
    );
};
