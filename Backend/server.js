const express = require('express');
const { spawn } = require('child_process');
const app = express();
const port = hidden; // int
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); 
const { Pool } = require('pg');
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccount.json");



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const checkAuth = async (req, res, next) => {
  const idToken = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!idToken) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; 
    next(); 
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const pool = new Pool({
  user: 'hidden',
  host: 'hidden',
  database: 'hidden',
  password: 'hidden',
  port: hidden, // int
  max: hidden, // int
  idleTimeoutMillis: hidden, // int
  connectionTimeoutMillis: hidden, // int
});

app.use(cors({
  origin: 'https://yourfrontend.url', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],  
}));

app.use(express.json());

app.post('/solve', checkAuth, async (req, res) => {
  const data = req.body;
  const userId = req.user.email;
  const schoolName = data.school_name;

  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO timetables (user_id, in_creation, school_name) VALUES ($1, TRUE, $2) RETURNING id;',
      [userId, schoolName]
    );

    res.status(200).send('Processing started'); 
  } catch (err) {
    console.error('Error inserting into database:', err);
    res.status(500).send('Database error');
    client.release();
    return;
  }

  const folderPath = path.join(__dirname, userId);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const filePath = path.join(folderPath, `makeTable_${Math.floor(new Date(data.timestamp).getTime() / 1000)}_${data.from}.py`);
  const CLASS_ROOMS = Object.entries(data.class_rooms)
    .map(([key, value]) => {
      const preformattedValue = value.split(',');
      const formattedValue = `("${preformattedValue[0]}", "${preformattedValue[1]}")`;
      return `  "${key}": [${formattedValue}],`;
    })
    .join("\n");  

  const LEVELS = data.levels
    .map(level => `  "${level}",`)  
    .join("\n"); 

  const SUBJECTS = data.subjects
    .map(subject => `  "${subject}",`)  
    .join("\n");  

  const formattedCurriculum = Object.entries(data.curriculum)
    .map(([className, subjects]) => 
      Object.entries(subjects)
        .map(([subject, hours]) => `    ("${className}", "${subject}"): ${hours},`)
        .join("\n")
    )
    .join("\n\n"); 
  let formattedPreferredTeachers = ``
  if(data.preferred_teachers != null) {
    formattedPreferredTeachers = Object.entries(data.preferred_teachers)
      .map(([key, value]) => {
          const [className, subject] = key.split(", ").map(item => item.trim());
          return `    ("${className}", "${subject}"): ${JSON.stringify(value)},`;
      })
      .join("\n");
  }

  const formattedTeachers = Object.entries(data.teachers)
    .map(([key, value]) => `    "${key}": ${value},`)
    .join("\n");

  const formattedSpecialties = `
SPECIALTIES = {
    ${Object.entries(data.specialties)
      .map(([key, value]) => `    "${key}": [\n        "${value.map(teacher => teacher.trim()).join('",\n        "')}"\n    ],`)
      .join("\n")}
}`;

  const formattedLocationRoom = Object.entries(data.location_room)
    .flatMap(([floor, rooms]) =>
      rooms.map(room => `    ("${floor}", "${room}"): 0,`)
    )
    .join("\n");

  const formattedTimeSlots = Object.entries(data.time_slots)
    .map(([timeSlot, hour]) => `    "${timeSlot}": ${hour},`)
    .join("\n");

  const content = `
SCHOOL_HOUR = ${data.school_hour} 

CLASS_ROOMS = {
    ${CLASS_ROOMS}
}

LEVELS = [
${LEVELS}
]

SUBJECTS = [
${SUBJECTS}
]

CURRICULUM = {
${formattedCurriculum}
}

PREFERRED_TEACHERS = {
${formattedPreferredTeachers}
}

PREFERRED_TEACHERS_TIME_SLOTS = {}

TEACHERS = {
${formattedTeachers}
}

${formattedSpecialties}

LOCATION_ROOM = {
${formattedLocationRoom}
}

TIME_SLOTS = {
${formattedTimeSlots}
}
  `;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('File created and written to!');

  const pythonScript = './backend.py';
  const args = ['-d', filePath];
  const python = spawn('python3', [pythonScript, ...args]);

  let stdoutData = '';

  python.stdout.on('data', (chunk) => {
    stdoutData += chunk.toString();
  });

  python.stderr.on('data', (data) => {
    console.error(`Python error: ${data}`);
  });

  python.on('close', async (code) => {
    if (code === 0) {
      console.log('Python script completed successfully');
      try {
        const parsedData = JSON.parse(stdoutData);
        await client.query(
          'UPDATE timetables SET in_creation = FALSE, timetable_data = $1 WHERE user_id = $2 AND in_creation = TRUE;',
          [parsedData, userId]
        );
      } catch (err) {
        console.error('Error updating database with results:', err);
      }
    } else {
      console.log(stdoutData)
      console.error('Python script failed:', code);
    }
    client.release();
  });
});

app.get('/timetables', checkAuth, async (req, res) => {
  const userId = req.user.email; 
  
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT created_at, timetable_data, in_creation, school_name, id FROM timetables WHERE user_id = $1',
      [userId]
    );

    const timetables = result.rows.map(row => ({
      available: !row.in_creation,
      name: row.school_name,
      created_at: row.created_at,
      id: row.id,
      data: !row.in_creation ? row.timetable_data : null,  
    }));

    client.release();

    if (timetables.length === 0) {
      return res.status(404).json({ message: 'No timetables found for the user' });
    }

    res.status(200).json(timetables);

  } catch (err) {
    console.error('Error fetching timetables:', err);
    res.status(500).json({ message: 'Failed to fetch timetables' });
  }
});

app.get('/check', checkAuth, async (req, res) => {
  const userId = req.user.email; 
  const { idToCheck } = req.query; 
  console.log('Received check request from ' + userId + ' for ' + idToCheck);

  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM timetables WHERE user_id = $1 AND id = $2',
      [userId, idToCheck]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ value: false });
    }

    const timetable = result.rows[0]; 
    const resultJson = {
      value: true,
      name: timetable.school_name,
      created_at: timetable.created_at,
      data: timetable.timetable_data,
    };

    res.status(200).json(resultJson);
  } catch (err) {
    console.error('Error fetching timetables:', err);
    res.status(500).json({ message: 'Failed to fetch timetables' });
  } finally {
    if (client) {
      client.release();
    }
  }
});


const options = {
  key: fs.readFileSync('./hidden/private.key'),
  cert: fs.readFileSync('./hidden/cert.crt'),
  ca: fs.readFileSync('./hidden/ca-crt.pem'),
  rejectUnauthorized: true 
};

https.createServer(options, app).listen(port, () => {
  console.log(`Secure backend server running at https://setServerAddressHere:${port}`);
});