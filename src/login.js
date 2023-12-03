import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { validate_user, update_user, fetch_user, username_exist, change_password, fetch_password } from './userdb.js';
const route = express.Router();
const form = multer();

route.use(express.json());
route.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'static/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `profileImage-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

route.post('/login', form.none(), async (req, res) => {
  if (req.session.logged) {
    req.session.logged = false;
  }

  let user = await validate_user(req.body.username, req.body.password);

  if (user) {
    if (!user.enabled) {
      return res.status(401).json({ status: 'failed', message: `User ${user.username} is currently disabled` });
    }
    req.session.logged = true;
    req.session.username = user.username;
    req.session.role = user.role;
    //cookie for remember me
    if (req.body.remember) {
      res.cookie('username', req.body.username, { maxAge: 3600000 });
      res.cookie('password', req.body.password, { maxAge: 3600000 });
      res.cookie('remember', req.body.remember, { maxAge: 3600000 });
    } else {
      res.clearCookie('username');
      res.clearCookie('password');
      res.clearCookie('remember');
    }
    req.session.cookie.maxAge = 360000;
    return res.json({ status: 'success', user: { username: user.username, role: user.role } });
  } else {
    return res.status(401).json({ status: 'failed', message: 'Incorrect username and password' });
  }
});

route.post('/logout', (req, res) => {
  if (req.session.logged) {
    req.session.destroy();
    return res.end();
  } else {
    res.status(401).json({ status: 'failed', message: 'Unauthorized logout' });
  }
});

route.get('/me', async (req, res) => {
  if (req.session.logged) {
    let user = await fetch_user(req.session.username);
    if (user) {
      res.json({ status: 'success', user: { username: user.username, role: user.role } });
    }
  } else {
    res.status(401).json({ status: 'failed', message: 'Unauthorized me' });
  }
});

route.post('/register', upload.single('profileImage'), async (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).json({ status: 'failed', message: 'Missing fields' });
    console.log(req.body.username, req.body.password);
  } else if (req.body.username.length < 3) {
    res.status(400).json({ status: 'failed', message: 'Username must be at least 3 characters' });
  } else if (await username_exist(req.body.username)) {
    res.status(400).json({ status: 'failed', message: `Username ${req.body.username} already exists` });
  } else if (req.body.password.length < 8) {
    res.status(400).json({ status: 'failed', message: 'Password must be at least 8 characters' });
  } else {
    try {
      let { username, password, nickname, email, gender, birthdate } = req.body;
      const file = req.file;
      if (!file) {
        return res.status(400).json({ status: 'failed', message: 'No file provided' });
      }
      const photopath = '/uploads/' + file.filename;
      const role = 'user';
      const enabled = true;

      const success = await update_user(
        username,
        password,
        nickname,
        email,
        gender,
        birthdate,
        role,
        enabled,
        photopath
      );
      if (success) {
        res.json({ status: 'success', user: { username: req.body.username, role: req.body.role } });
      } else {
        res.status(500).json({ status: 'failed', message: 'Account created but unable to save into the database' });
      }
    } catch (err) {
      console.error(err);
      res.status(501).json({ status: 'failed', message: 'Account created but unable to save into the database' });
    }
  }
});

route.post('/forgetPassword', form.none(), async (req, res) => {
  const { email, nickname, birthdate, password } = req.body;
  const user = await fetch_password(email, nickname, birthdate);
  if (!user) {
    res.status(404).json({ status: 'failed', message: 'User not found' });
  } else if (req.body.password.length < 8) {
    res.status(400).json({ status: 'failed', message: 'Password must be at least 8 characters' });
  } else {
    try {
      const success = await change_password(email, nickname, birthdate, password);
      if (success) {
        res.json({ status: 'success', message: 'Password reset successful!' });
      } else {
        res.json({ status: 'failed', message: 'Password reset failed!' });
      }
    } catch (err) {
      console.error('Unable to update the database!', err);
      res.status(500).json({ status: 'failed', message: 'Internal server error' });
    }
  }
});

route.get('/profile', async (req, res) => {
  if (!req.session.logged) {
    return res.status(100).json({ status: 'failed', message: 'Please login to view profile' });
  }
  let user = await fetch_user(req.session.username);
  if (user) {
    res.json({
      status: 'success',
      user: {
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        gender: user.gender,
        birthdate: user.birthdate,
        profileImage: user.profileImage,
      },
    });
  } else {
    res.status(404).json({ status: 'failed', message: 'User not found' });
  }
});

route.post('/profile', upload.single('profile-image-path'), async (req, res) => {
  if (!req.session.logged) {
    return res.status(100).json({ status: 'failed', message: 'Please login to update profile' });
  }
  if (!req.body.username || !req.body.password) {
    res.status(400).json({ status: 'failed', message: 'Missing fields' });
    console.log(req.body.username, req.body.password);
  } else if (req.body.username.length < 3) {
    res.status(400).json({ status: 'failed', message: 'Username must be at least 3 characters' });
  } else if (req.body.password.length < 8) {
    res.status(400).json({ status: 'failed', message: 'Password must be at least 8 characters' });
  } else {
    try {
      let { username, password, nickname, email, gender, birthdate } = req.body;
      const currentUser = await fetch_user(req.session.username);
      let photopath = currentUser.profileImage;
      if (req.file) {
        photopath = '/uploads/' + req.file.filename;
        let oldFilePath = path.join('./static' + currentUser.profileImage);
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error(`Failed to delete old file: ${oldFilePath}`);
          } else {
            console.log(`Successfully deleted old file: ${oldFilePath}`);
          }
        });
      }
      const role = 'user';
      const enabled = true;
      const success = await update_user(
        username,
        password,
        nickname,
        email,
        gender,
        birthdate,
        role,
        enabled,
        photopath
      );

      if (success) {
        res.json({ status: 'success', user: { username: req.body.username, role: req.body.role } });
      } else {
        res.status(500).json({ status: 'failed', message: 'Account created but unable to save into the database' });
      }
    } catch (err) {
      console.error(err);
      res.status(501).json({ status: 'failed', message: 'Account created but unable to save into the database' });
    }
  }
});

route.get('/admin', async (req, res) => {
  if (req.session.logged) {
    let user = await fetch_user(req.session.username);
    if (user.role === 'admin') {
      res.status(200).json({ status: 'success', role: 'admin' });
    } else {
      res.status(403).json({ status: 'failed', error: 'Unauthorized' });
    }
  } else {
    res.status(401).json({ status: 'failed', error: 'Unauthorized' });
  }
});

export default route;
