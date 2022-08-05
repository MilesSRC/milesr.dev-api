/* Imports */
import express from 'express';
import { config } from 'dotenv';

/* Middleware */
import ratelimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

/* Database */
import { MongoClient } from 'mongodb';

/* Environment */
config();

/* Asyncronous */
(async () => {
    /* Server */
    const app = express();
    const port = process.env.PORT || 3003;

    /* Start DB */
    const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGODB_NAME || 'milesrdev';
    const connection = new MongoClient(dbUrl);
    await connection.connect();
    const db = connection.db(dbName);

    /* Middleware */
    app.use(helmet());
    app.use(morgan('dev'));
    app.use(cors());
    app.use(express.json());
    app.use(ratelimit({ windowMs: 15 * 60 * 1000, max: 100 }));

    /* Routes */
    app.get('/', (req, res) => {
        res.json({
            version: require('../package.json').version,
            status: 'OK',
        })
    });

    app.get('/build', async (req, res) => {
        console.log("Build information requested from " + req.ip);

        /* Get all projects and timeline events from the database */
        const projects = await db.collection('projects').find({}).toArray();
        const timeline = await db.collection('timeline').find({}).toArray();

        /* Send the data back to the client */
        res.json({
            projects: projects,
            timeline: timeline,
        });
    });

    app.get('/settings', async (req, res) => {
        /* Get all projects and timeline events from the database */
        const settings = await db.collection('settings').find({}).toArray();

        /* Send the data back to the client */
        res.json(settings || { status: 'NO DATA' });
    });

    /* Start Server */
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
})()