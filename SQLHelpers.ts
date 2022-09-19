import { Client } from 'pg';
require('dotenv').config();

type emailNumberObj = { [key: number]: string };
type statusObj = {
  done: number;
  total: number;
  spotifydata?: [{ [key: string]: number }];
  playlistURL?: string,
};

const PGClient = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
});
PGClient.connect();

const isSpotifyData = (value: any): value is [{ [key: string]: number }] => {
  const key = Object.keys(value[0])[0];
  return typeof key === 'string' && typeof value[0][key] === 'number';
};

const SQLHelpers = {
  async addPlaylistURL(groupId: number, url: string): Promise<void>{
    try {
      await PGClient.query(`UPDATE groups SET playlisturl = '${url}' WHERE id = ${groupId}`)
    } catch(err){
      console.error(err.stack)
    }
  },

  updateUserSql: async (userId: string, spotifyData): Promise<void> => {
    try {
      await PGClient.query(
        `UPDATE users SET done = TRUE, spotifyData = '${JSON.stringify(
          spotifyData
        )}' WHERE id = ${userId}`
      );
    } catch (err) {
      console.error(err.stack);
    }
  },
  createGroupSQLEntry: async (size: number): Promise<number> => {
    try {
      const res = await PGClient.query(
        `INSERT INTO groups(size) VALUES (${size}) RETURNING id`
      );
      return res.rows[0].id;
    } catch (err) {
      console.error(err.stack);
    }
  },
  createSingleUserSQLEntry: async (
    groupId: number,
    spotifydata
  ): Promise<void> => {
    try {
      PGClient.query(
        `INSERT INTO users(email, groupid, done, spotifydata) VALUES ('groupOwner', ${groupId}, true, '${JSON.stringify(
          spotifydata
        )}') RETURNING id`
      );
    } catch (err) {
      console.error(err.stack);
    }
  },
  updateGroupSize: async (size: string, groupdId: number): Promise<void> => {
    try {
      PGClient.query(`UPDATE groups SET size = ${size} WHERE id = ${groupdId}`);
    } catch (err) {
      console.error(err.stack);
    }
  },
  createUserSQLEntry: async (
    emailArr: string[],
    groupId: string
  ): Promise<emailNumberObj> => {
    const userIdEmailObject: emailNumberObj = {};

    for (const email of emailArr) {
      try {
        const res = await PGClient.query(
          `INSERT INTO users(email, groupid) VALUES ('${email}', ${groupId}) RETURNING id`
        );
        userIdEmailObject[res.rows[0].id] = email;
      } catch (err) {
        console.error(err.stack);
      }
    }

    return userIdEmailObject;
  },
  getGroupStatus: async (groupId: number): Promise<statusObj> => {
    try {
      const res = await PGClient.query(
        `SELECT COUNT(done) done, size AS total, spotifydata, playlisturl FROM users LEFT JOIN groups ON users.groupid = groups.id WHERE groupid = ${groupId} AND users.done = true GROUP BY size, spotifydata, playlisturl`
      );
      console.log(`done: ${res.rows.length}`)
      console.log(`total: ${res.rows[0].total}`)
      if (res.rows[0].length !== 0 && Number(res.rows.length) === Number(res.rows[0].total)) {
        const spotifyQuery = await PGClient.query(
          `SELECT spotifydata FROM users WHERE groupid = ${groupId}`
        );
        const spotifydata = spotifyQuery.rows.map(el => JSON.parse(el.spotifydata));

        if (isSpotifyData(spotifydata)) {
          return {
            done: Number(res.rows.length),
            total: Number(res.rows[0].total),
            spotifydata,
            playlistURL: res.rows[0].playlisturl,
          };
        } else {
          throw new Error('no spotify data');
        }
      } else if (res.rows[0].length === 0) {
        throw new Error('no data')
      } else {
        return {
          done: Number(res.rows.length),
          total: Number(res.rows[0].total),
        };
      }
    } catch (err) {
      console.error(err.stack);
    }
  },
};

export default SQLHelpers;
