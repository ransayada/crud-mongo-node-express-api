import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';
import authorRoutes from './routes/author.routes';
import bookRoutes from './routes/book.routes';

const router = express();

// Connect to MongoDB
mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('Connected successfully to mongoDB.');
        startServer();
    })
    .catch((err) => {
        Logging.error('Unable to connect to mongoDB.');
        Logging.error(err);
    });

//Start the Server only if Connect to MongoDB
const startServer = () => {
    router.use((req, res, next) => {
        //Logging the request
        Logging.info(`Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}].`);
        res.on('finish', () => {
            //Logging the response
            Logging.info(`Outgoing <- Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}].`);
        });
        next();
    });

    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());

    //Rules of the API
    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE,GET');
            return res.status(200).json({});
        }
        next();
    });

    //Routes
    router.use('/authors', authorRoutes);
    router.use('/books', bookRoutes);

    //HealthCheck - TEST
    router.get('/ping', (req, res, next) => res.status(200).json({ message: 'pong' }));

    //Error Handler
    router.use((req, res, next) => {
        const error = new Error('Not Found');
        Logging.error(error);
        return res.status(404).json({ message: error.message });
    });

    http.createServer(router).listen(config.server.port, () => Logging.info(`Server started on port ${config.server.port}.`));
};
