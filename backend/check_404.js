import http from 'http';

const check = (path) => {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:5000${path}`, (res) => {
            console.log(`${path} => Status: ${res.statusCode}`);
            resolve();
        });
        req.on('error', (e) => {
            console.log(`${path} => Error: ${e.message}`);
            resolve();
        });
    });
};

const run = async () => {
    await check('/sanity-check');
};

run();
