'use strict';
const { useState, useEffect, useContext } = React;

const Profile = () => {
  const { user, setUser } = useContext(UserContext);

  const [allOwnedGardens, setAllOwnedGardens] = useState([]);
  const [allVolunteeringEvents, setAllVolunteeringEvents] = useState([]);
  const [gardens, setGardens] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    if (user && user.UserInfo && user.UserInfo.userid) {
      fetch(`${API_URL}/map/${user.UserInfo.userid}`)
        .then((res) => res.json())
        .then((data) => setAllOwnedGardens(data))
        .catch((err) => console.error('Error - Fetching user\'s garden stuff:', err));

      fetch(`${API_URL}/volunteer/${user.UserInfo.userid}`)
        .then((res) => res.json())
        .then((data) => setAllVolunteeringEvents(data))
        .catch((err) => console.error('Error - Fetching user\'s volunteer stuff:', err));
    }
  }, [user]);

  const now = new Date();
  const calculateEventHours = (start, end) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const startDate = new Date(0, 0, 0, startH, startM);
    const endDate = new Date(0, 0, 0, endH, endM);

    let diff = (endDate - startDate) / 1000 / 60 / 60;

    if (diff < 0) {
      diff += 24;
    }

    return diff;
  };

  const previousEvents = allVolunteeringEvents.filter((event) => {
    const eventDateTime = new Date(`${event.date}T${event.end_time}`);
    return eventDateTime < now;
  });

  const upcomingEvents = allVolunteeringEvents.filter((event) => {
    const eventDateTime = new Date(`${event.date}T${event.end_time}`);
    return eventDateTime >= now;
  });

  const totalHours = previousEvents.reduce(
    (sum, event) =>
      sum + calculateEventHours(event.start_time, event.end_time),
    0
  );

  const handleEditToggle = (index) => {
    const updatedGardens = [...allOwnedGardens];
    updatedGardens[index].editing = !updatedGardens[index].editing;
    setAllOwnedGardens(updatedGardens);
  };

  const handleInputChange = (index, field, value) => {
    const updatedGardens = [...allOwnedGardens];
    updatedGardens[index][field] = value;
    setAllOwnedGardens(updatedGardens);
  };

  async function getForum() {
    try {
      const res = await fetch(`${API_URL}/forum/user/${user.UserInfo.username}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + user.accessToken,
        },
      });
      const data = await res.json();
      setForumPosts(data);
    } catch (e) {
      if (!user || !user['UserInfo'] || !user.accessToken) {
        alert('You are not logged in.');
      } else {
        console.error('Error fetching all forum:', e);
      }
    }
  }

  async function getReplies() {
    try {
      const res = await fetch(`${API_URL}/forum/reply/user/${user.UserInfo.username}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + user.accessToken,
        },
      });
      const data = await res.json();
      setReplies(data);
    } catch (e) {
      if (!user || !user['UserInfo'] || !user.accessToken) {
        alert('You are not logged in.');
      } else {
        console.error('Error fetching all replies:', e);
      }
    }
  }

  const handleDeletePost = async function (postid) {
    try {
      const res = await fetch(`${API_URL}/forum/${postid}`, {
        method: 'DELETE',
        body: JSON.stringify({
          username: user.UserInfo.username,
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + user.accessToken,
        },
      });
    } catch (e) {
      console.log('There was an error deleting this post:', e);
    }
  };

  const handleDeleteReply = async function (replyId) {
    try {
      const res = await fetch(`${API_URL}/forum/reply/${replyId}`, {
        method: 'DELETE',
        body: JSON.stringify({
          username: user.UserInfo.username,
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + user.accessToken,
        },
      });
    } catch (e) {
      console.log('There was an error deleting this post:', e);
    }
  };
  
  const handleDeleteUpcomingEvent = async function(event) {
      try {
        const res = await fetch(`${API_URL}/volunteer`, { 
          method: "DELETE",
          body: JSON.stringify(event),
          headers: {
            "Content-Type": "application/json",
          }
        });     
        window.location.reload();  
      } catch(e) {
        console.log("Error - Deleting an upcoming event:", e);
      }
    };

    const handleDeleteGarden = async function(garden) {
      // console.log(garden);
      try {
        const res = await fetch(`${API_URL}/map`, { 
          method: "DELETE",
          body: JSON.stringify(garden),
          headers: {
            "Content-Type": "application/json",
          }
        });     
        window.location.reload();  
      } catch(e) {
        console.log("Error - Deleting an owned garden:", e);
      }
    };

    const handleUpdateGarden = async function(garden) {
      // console.log(garden);
      try {
        const res = await fetch(`${API_URL}/map`, { 
          method: "PUT",
          body: JSON.stringify({ garden }),
          headers: {
            "Content-Type": "application/json",
          }
        });     
      } catch(e) {
        console.log("Error - Updating an owned garden:", e);
      }
    };


  useEffect(function () {
    if (user) {
      getForum();
      getReplies();
    }
    const socket = io('https://cheerios.eastus.cloudapp.azure.com', {
      path: '/node/socket.io',
    });

    socket.on('userDeletedForum', function (new_forum) {
      console.log('User has deleted a forum, recieved via websocket.');
      getForum();
    });

    socket.on('userDeletedReply', function (new_forum) {
      console.log('User has deleted a reply, recieved via websocket.');
      getReplies();
    });

    return function () {
      socket.disconnect();
    };
  }, [user]);

  return (
    <div className="container">
      <Header />
      <main className="main-content">
        <section className="profile-section" role="region" aria-labelledby="profile-section-heading">
          <h3 id="profile-section-heading" className="sr-only">Volunteer Profile</h3>

          {user ? (
            <div>
              <div className="profile-summary">
                <h4>Total Hours Volunteered</h4>
                <p className="total-hours">{totalHours} Hours</p>
              </div>

              <div className="volunteer-list">

                <h4>Previous Volunteering Events</h4>
                <div className="volunteer-events-section">
                  {previousEvents.length === 0 ? (
                    <p>No volunteering history yet.</p>
                  ) : (
                    previousEvents.map((event, index) => (
                      <div key={index} className="event-card">
                        <h5>{event.name}</h5>
                        <div className="event-meta">
                          <span><strong>Location:</strong> {event.location_name}</span>
                          <span><strong>Date:</strong> {event.date}</span>
                          <span><strong>Time:</strong> {event.start_time} - {event.end_time}</span>
                        </div>
                        <div className="event-hours">
                          {calculateEventHours(event.start_time, event.end_time).toFixed(1)} hours
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="volunteer-list">
                <h4>Upcoming Volunteering Events</h4>
                <div className="volunteer-events-section">
                  {upcomingEvents.length === 0 ? (
                    <p>No upcoming events.</p>
                  ) : (
                    upcomingEvents.map((event, index) => (
                      <div key={index} className="event-card">
                        <h5>{event.name}</h5>
                        <div className="event-meta">
                          <span><strong>Location:</strong> {event.location_name}</span>
                          <span><strong>Date:</strong> {event.date}</span>
                          <span><strong>Time:</strong> {event.start_time} - {event.end_time}</span>
                        </div>

                        <button className="delete-button" onClick={() => handleDeleteUpcomingEvent(event)}>Delete Event</button>
                      </div>
                    ))
                  )}
                </div>
              </div>

  
                {user.UserInfo.roles.includes("garden_owner") && (
                  <div className="volunteer-list garden-list">
                    <h4>Your Gardens</h4>
                    {allOwnedGardens.length === 0 ? (
                      <p>You don't own any gardens yet.</p>
                    ) : (
                      allOwnedGardens.map((garden, index) => (
                        <div key={index} className="garden-item">
                          {garden.editing ? (
                            <div>
                              <input
                                type="text"
                                value={garden.name}
                                className="garden-input"
                              aria-label="Garden name"
                                disabled
                              />
                              <textarea
                                value={garden.desc}
                                onChange={(e) =>
                                  handleInputChange(index, 'desc', e.target.value)
                                }
                                rows="3"
                                className="garden-textarea"
                              aria-label="Garden description"
                              />
                              <button onClick={() => {
                                handleEditToggle(index);
                                handleUpdateGarden(garden); // Do not pass in fields as handleInputChange mutates garden directly.
                              }}>Save</button>
                            </div>
                          ) : (
                            <div>
                              <h5>{garden.name}</h5>
                              <p>{garden.desc}</p>
                              <button onClick={() => handleEditToggle(index)}>Edit</button>
                              <p></p>
                              <div></div>
                              <button className="delete-button" onClick={() => handleDeleteGarden(garden)}>Delete Garden</button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
  
                   <div className="forum-section">
                <h4>Your Forum Posts</h4>
                {forumPosts.length > 0 ? (
                  forumPosts.map((forum) => (
                    <div key={forum['_id']} className="forum-post">
                      <div className="post-header">
                        <h5>{forum['forum-header']}</h5>
                        <p>{forum['forum-desc']}</p>
                        <button onClick={function () { handleDeletePost(forum['_id']) }}>Delete Post</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>You haven't posted anything in the forum yet.</p>
                )}

                {replies.length > 0 && (
                  replies.map((reply) => (
                    <div key={reply['_id']} className="reply-item">
                      <p>{reply['reply-desc']}</p>
                      <button onClick={() => handleDeleteReply(reply['_id'])}>Delete Reply</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <p>No account information available. Please log in to view your profile.</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <UserProvider>
    <Profile />
  </UserProvider>
);
