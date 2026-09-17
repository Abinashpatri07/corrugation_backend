const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 3000;

pool.connect((err, client, release) => {
    if (err) {
        console.error('PostgreSQL connection failed:', err.message);
        return;
    }

    console.log('PostgreSQL connected successfully');
    release();

    app.listen(PORT, () => {
        console.log(`Backend running on port ${PORT}`);
    });
});
