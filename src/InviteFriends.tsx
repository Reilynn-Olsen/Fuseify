import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import './css/InviteFriends.css';

function InviteFriends() {
  const [userAmount, setUserAmount] = useState<number>(3);
  const [emailArr, setEmailArr] = useState<string[]>(new Array(10).fill(''));
  const [submitted, setSubmitted] = useState(false);

  const params = useParams();

  const emailRegex = new RegExp(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );

  const returnUserFields = () =>
    new Array(userAmount).fill(null).map((_, i) => (
      <div className="inputContainer" key={i}>
        <label htmlFor={`email${i}`} className="emailLabel">
          Email {i + 1}:{' '}
        </label>
        <input
          id={`email${i}`}
          name={`email${i}`}
          className="emailInput"
          type="email"
          value={emailArr[i]}
          onChange={(e) =>
            setEmailArr((prevState) => {
              const copy = [...prevState];
              copy[i] = e.target.value;
              return copy;
            })
          }
        ></input>
        {emailRegex.test(emailArr[i]) ? (
          <span className="emailStatus">✓</span>
        ) : (
          <span className="emailStatus">X</span>
        )}
      </div>
    ));

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    const testedEmails = [];
    const invalidEmails = [];
    for (let i = 0; i < userAmount; i++) {
      if (emailRegex.test(emailArr[i])) {
        testedEmails.push(emailArr[i]);
      } else {
        invalidEmails.push(emailArr[i]);
      }
    }
    if (invalidEmails.length > 0) {
      alert(
        `Invalid emails:\n${invalidEmails
          .map((el, i) => (el.length > 0 ? el : `Email ${i} is blank`))
          .join('\n')}`
      );
    } else {
      const res = await fetch('http://localhost:3000/postEmails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailArr: testedEmails,
          groupId: params.groupId,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        console.log('Res not true');
      }
    }
  };

  return (
    <div>
      {!submitted ? (
        <div className="emailContainer">
          <h2 className="title">Invite up to 10 friends!</h2>
          <form className="formContainer">
            {returnUserFields().map((el) => el)}
            <div className="amountContainer">
              {userAmount > 1 ? (
                <span
                  style={{
                    borderRadius: userAmount < 10 ? '10px 0 0 10px' : '10px',
                  }}
                  className="minus"
                  onClick={() => setUserAmount((prevState) => prevState - 1)}
                >
                  -
                </span>
              ) : null}
              {userAmount < 10 ? (
                <span
                  style={{
                    borderRadius: userAmount > 1 ? '0 10px 10px 0' : '10px',
                  }}
                  className="plus"
                  onClick={() => setUserAmount((prevState) => prevState + 1)}
                >
                  +
                </span>
              ) : null}
            </div>
            <input
              className="submitButton"
              type="submit"
              value="submit emails!"
              onClick={handleSubmit}
            ></input>
          </form>
        </div>
      ) : (
        <div className="submitted">
          <h1 className="checkmark">✓</h1>
          <h2>Form submitted!</h2>
          <p>
            Make sure to check your spam if you can't find the email. Check your group's status here:{' '}
            <a
              className="groupLink"
              href={`http://localhost:3000/fuse/group/${params.groupId}`}
            >
              http://localhost:3000/fuse/group/{params.groupId}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default InviteFriends;
