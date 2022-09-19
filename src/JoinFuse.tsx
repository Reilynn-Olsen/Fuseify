import { useParams } from 'react-router-dom'
import './css/JoinFuse.css'

function JoinFuse() {
  const params = useParams();
  console.log(params)
  return (
    <div className='joinContainer'>
      <h2 className='title'>You've be invited to join a fuse!</h2>
      <p>Log into spotify here:</p>
      <a href={`http://localhost:3000/login/group/${params.groupId}/user/${params.userId}`}>
        <button className='joinLoginButton'>Spotify log in</button>
      </a>
    </div>
  );
}

export default JoinFuse;
