'use strict';

const ForumCard = ({header, desc, id, date, replycount, username}) => {
    return (
        <div className={`forum-card ${id}`} aria-labelledby={`forum-header-${id}`} role="region">
            <h4 id={`forum-header-${id}`} className="forum-header">{header}</h4>
            <p className="forum-desc">{desc}</p>

            <div id="forum-options">
                <a 
                    id="reply-button" 
                    href={`./forum_view.html?id=${id}`}
                    aria-label={`View forum titled "${header}" with ${replycount > 1 ? `${replycount} replies` : `${replycount} reply`}`}
                >
                    {replycount > 1 ? (`${replycount} replies`) : (`${replycount} reply`)}
                </a>
                <label className="forum_date_created_label">{`Created by: ${username} (${date})`}</label>
            </div>
        </div>
    );
};
