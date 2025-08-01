'use react'
const { useState, useEffect } = React;

const ForumReply = ({desc, id, username, date}) => {
    return (
        <div id={`${id}`} className="reply-forum-card" role="region" aria-labelledby={`reply-header-${id}`}>
            <p id={`reply-desc-${id}`} className="forum-desc">{desc}</p>

            <label className="forum_date_created_label" id={`reply-creator-${id}`}>{`Replied by: ${username} (${date})`}</label>
        </div>
    )
};
