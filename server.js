const express = require('express');
const log 		= require('./util/logger');

const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


const socketio = require('socket.io'); // 추가


/** client html source 연결  [TK Yoon 2018. 11. 3. 오전 7:34:20] */
app.use(express.static(__dirname + '/views'));

var port 	= process.env.PORT || 2600;

const server = app.listen(port);

//도메인 연결 페이지 설정
app.get('/', function(req, res) {
   res.sendFile(__dirname + '/views/canvas.html');
});

const io = socketio(server); // socket.io와 서버 연결
var userCnt = 0;
io.sockets.on('connection', function (socket) {
	userCnt++;
	log.info('Connected User %s %s', userCnt, socket.id);
	
	socket.send({
		id : socket.id
		, msg : 'Sent a message after connection! '
	});

	//모든사용자에게 같은 메시지를 보낼경우
	io.sockets.emit('broadcast', userCnt + ' clients connected!');
	
	//자신에게는 emit 호출, 다른 사용자에게는 broadcast.emit 호출
	//socket.emit('newclientconnect', 'Hey, welcome!');
	//socket.broadcast.emit('newclientconnect', userCnt + ' clients connected!');
	
	socket.on('startDrawing', function (data) {
		log.info('@@ startDrawing');
		log.info(data);
		data.id = socket.id;
		io.sockets.emit('rc_startDrawing', data);
	});
	
	socket.on('drawLine', function (data) {
		log.info('@@ drawLine');
		log.info(data);
		data.id = socket.id;
		io.sockets.emit('rc_drawLine', data);
	});
	
	socket.on('out', function (data) {
		log.info(data);
		
	});
	
	socket.on('disconnect', function () {
		userCnt--;
	    log.info('Disconnected User %s', userCnt);
	    io.sockets.emit('broadcast', userCnt + ' clients connected!');
	});
	
});