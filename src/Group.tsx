import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './css/Group.css';

type statusObj = { done: number; total: number; playlistURL?: string };

function Group() {
  const [status, setStatus] = useState<statusObj | null>(null);
  const params = useParams();
  const handleRefresh = () => {
    fetch(`/status/groupdId/${params.groupId}`)
      .then(
        (res) => res.json()
      )
      .then((data) => setStatus(data));
  };

  useEffect(handleRefresh, [params.groupId]);

  const generatePeople = (done: number, total: number) =>
    new Array(total).fill(null).map((_, i) => {
      if (i < done) {
        //return person
        return (
          <div key={i} className="personContainer">
            <div className="head"></div>
            <div className="body"></div>
          </div>
        );
      } else {
        //return Empty person;
        return <div key={i} className="emptyPerson"></div>;
      }
    });

  return (
    <div className="groupContainer">
      {status === null ? (
        <div className="loadingDiv">
          <h2 className="title">Loading your groups status!</h2>
          <div className="lds-grid">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      ) : (
        <div className="fetchedContainer">
          <h2 className="title">Check your group's status:</h2>
          <p>
            {status?.done} people out {status?.total} have logged in!
          </p>
          <div className="peopleContainer">
            {generatePeople(status.done, status.total).map((el) => el)}
          </div>
          <p>
            {status.playlistURL ? (
              <p>
                Playlist available here:
                <a className="playlistLink" href={status.playlistURL}>
                  {status.playlistURL}
                </a>
              </p>
            ) : (
              <button onClick={handleRefresh} className="refreshButton">Refresh</button>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

export default Group;
