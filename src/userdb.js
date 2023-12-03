import fs from 'fs/promises';
import client from './dbclient.js';
import bcrypt from 'bcrypt';
const users = client.db('TicketSystem').collection('users');

async function init_db() {
  try {
    const count = await users.countDocuments();
    if (count === 0) {
      const data = await fs.readFile('users.json', 'utf-8');
      const usersData = JSON.parse(data);
      const result = await users.insertMany(usersData);

      console.log(`Added ${result.insertedCount} users`);
    }
  } catch (err) {
    console.error('Unable to initialize the database!', err);
  }
}

async function validate_user(username, password) {
  try {
    if (!username || !password) {
      return false;
    }
    const user = await users.findOne({ username });
    if (!user) {
      console.error('User not found!');
      return false;
    }
    //password hashing comparsion
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.error('Incorrect password!');
      return false;
    }
    return user;
  } catch (err) {
    console.error('Unable to fetch from database!', err);
    return false;
  }
}

async function update_user(username, password, nickname, email, gender, birthdate, role, enabled = true, profileImage) {
  try {
    //password hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.updateOne(
      { username },
      { $set: { username, password: hashedPassword, nickname, email, gender, birthdate, role, enabled, profileImage } },
      { upsert: true }
    );

    return true;
  } catch (err) {
    console.error('Unable to update the database!', err);
    return false;
  }
}

async function fetch_user(username) {
  try {
    const user = await users.findOne({ username });

    return user;
  } catch (err) {
    console.error('Unable to fetch from database!', err);
  }
}

async function change_password(email, nickname, birthdate, password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.updateOne({ email, nickname, birthdate }, { $set: { password: hashedPassword } });

    if (result.matchedCount > 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error('Unable to fetch from database!', err);
  }
}

async function fetch_password(email, nickname, birthdate) {
  try {
    const user = await users.findOne({ email, nickname, birthdate });
    return user;
  } catch (err) {
    console.error('Unable to fetch from database!', err);
  }
}
async function username_exist(username) {
  try {
    const user = await fetch_user(username);

    return user !== null;
  } catch (err) {
    console.error('Unable to fetch from database!', err);
    return false;
  }
}

export { validate_user, update_user, fetch_user, username_exist, change_password, fetch_password };
