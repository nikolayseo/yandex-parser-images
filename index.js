const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const YaImages = require('./ya-images');

const parse = new YaImages({
    textSearch: 'Hello World!',
    requestInterval: 30000
});

parse.start(); // parse.stop();

io.on('connection', function (socket) {
    socket.on('request-images', async () => {
        socket.emit('response-images', await parse.selectImagesDb());
    });
});

http.listen(3000);


