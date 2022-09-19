import './css/Home.css';


function Home() {
  return (
    <div className="homeContainer">
      <div>
          <h1 className="title">Fuseify</h1>
        <p>
          Analyze you and your friend's playlist to make a playlist with
          everyone's favorite jams!
        </p>
      </div>
      <div>
        <h2>Log into Spotify:</h2>
        <a href="http://localhost:3000/login">
          <button className="homeLoginButton">spotify log in</button>
        </a>
      </div>
      <a className='aboutMe' href='https://github.com/Reilynn-Olsen'><p>Check me out at Github</p></a>
    </div>
  );
}

export default Home;
