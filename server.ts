import * as express from 'express';
import * as nodemailer from 'nodemailer';
import SQLHelpers from './SQLHelpers';
import spotifyHelpers from './spotifyHelpers';

require('dotenv').config();

type popularityObj = {
  [key: string]: number;
};

type emailNumberObj = { [key: number]: string };

const bodyParser = require('body-parser');

const app = express();
app.use(express.static(__dirname));
app.use(bodyParser.json());
const port = 3000;

const isString = (value: any): value is string => typeof value === 'string';

const isPopularityObjArr = (value: any): value is popularityObj[] => {
  const key = Object.keys(value[0])[0];
  return typeof key === 'string' && typeof value[0][key] === 'number';
};

const verifyEmails = (emailArr: string[]): boolean =>
  emailArr.every((el) =>
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      el
    )
  );

const sendEmails = async (
  emailObj: emailNumberObj,
  id: number
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 465,
    secure: true, 
    auth: {
      user: process.env.SENDGRIDUSER,
      pass: process.env.SENDGRIDPASS,
    },
    name: `Fuseify@proton.me`,
    from: `Fuseify@proton.me`,
  });

  for (const userId in emailObj) {
      transporter.sendMail({
      from: `Fuseify <Fuseify@proton.me>`,
      to: emailObj[userId].trim(),
      subject: `You have been invited to join a Fuse!`,
      text: `You've been invited to join a Fuse! Use Fuseify to make a playlist with your groups favorite song. Click here to get started: http://localhost:3000/login/group/${id}/user/${userId}`,
      
    });

  }
};

app.get('/status/groupdId/:groupId', async (req, res) => {
  const groupId = Number(req.params.groupId);
  const status = await SQLHelpers.getGroupStatus(groupId);
  if (
    status.done === status.total &&
    status.spotifydata &&
    isPopularityObjArr(status.spotifydata)
  ) {
    if (status.playlistURL) {
      res.status(200).send({ ...status, playlistURL: status.playlistURL });
    } else {
      const allData = await spotifyHelpers.combinePopularityObjs(
        status.spotifydata
      );
      const playlistURL = await spotifyHelpers.createPlaylist(allData);
      SQLHelpers.addPlaylistURL(groupId, playlistURL);
      res.status(200).send({ ...status, playlistURL: playlistURL });
    }
  } else {
    res.status(200).send(status);
  }
});

app.get('/login/group/:groupId/user/:userId', (req, res) => {
  const { groupId, userId } = req.params;
  res.redirect(spotifyHelpers.getRedirectUrl(`${groupId}-${userId}`));
});

app.get('/login', (req, res) => {
  res.redirect(spotifyHelpers.getRedirectUrl(`init`));
});

app.get('/spotifyCallback', async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  if (isString(code)) {
    await spotifyHelpers.authorizeUser(code);
  } else {
    throw new Error(`code is invalid, code: ${code}`);
  }
  if (state === 'init') {
    const [groupId, spotifyData] = await Promise.all([
      SQLHelpers.createGroupSQLEntry(11),
      spotifyHelpers.getSpotifyData(),
    ]);
    SQLHelpers.createSingleUserSQLEntry(groupId, spotifyData);
    res.redirect(`http://localhost:3000/InviteFriends/${groupId}`);
  } else if (isString(state)) {
    const [groupId, userId] = state.split('-');
    const spotifyData = await spotifyHelpers.getSpotifyData();
    SQLHelpers.updateUserSql(userId, spotifyData);
    res.redirect(`http://localhost:3000/fuse/group/${groupId}`);
  } else {
    throw new Error(`Invalid state: ${state}`);
  }
});

app.get(
  [
    '/',
    '/InviteFriends/:groupId',
    '/InviteFriends/group/:groupId',
    '/fuse/group/:groupId',
  ],
  (req, res) => {
    res.sendFile(__dirname + '/index.html');
  }
);

app.post('/postEmails', async (req, res) => {
  const { emailArr, groupId } = req.body;
  if (verifyEmails(emailArr)) {
    SQLHelpers.updateGroupSize(emailArr.length + 1, groupId);
    const userEmailObj = await SQLHelpers.createUserSQLEntry(emailArr, groupId);
    sendEmails(userEmailObj, groupId);

    res.sendStatus(200);
  } else {
    console.error(`email array invalid: ${emailArr}`);
    res.sendStatus(406);
  }
});

app.listen(port, () => {
  console.log('App live at: http://localhost:3000/');
});
