var socket = io()
var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')
var chatText = document.getElementById('chat-text')
ctx.font = '30px Arial'

//event listeners for keypresses
document.addEventListener('keydown', keyPressDown)
document.addEventListener('keyup', keyPressUp)

function keyPressDown(e) {
    if (e.keyCode === 39)//right
        socket.emit('keypress', { inputId: 'right', state: true })
    else if (e.keyCode === 37)//left
        socket.emit('keypress', { inputId: 'left', state: true })
    else if (e.keyCode === 38)//up
        socket.emit('keypress', { inputId: 'up', state: true })
    else if (e.keyCode === 40)//down
        socket.emit('keypress', { inputId: 'down', state: true })
}

function keyPressUp(e) {

    if (e.keyCode === 39)//right
        socket.emit('keypress', { inputId: 'right', state: false })
    else if (e.keyCode === 37)//left
        socket.emit('keypress', { inputId: 'left', state: false })
    else if (e.keyCode === 38)//up
        socket.emit('keypress', { inputId: 'up', state: false })
    else if (e.keyCode === 40)//down
        socket.emit('keypress', { inputId: 'down', state: false })
}


socket.on('newPositions', function (data) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (var i = 0; i < data.length; i++) {
        ctx.fillText(data[i].number, data[i].x, data[i].y);
    }
})
