const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const ipcMain = require('electron').ipcMain;

// main.js
ipcMain.on('transaction-form', function(event, data) {
  console.log(data);
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1500, height: 1000});

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});

ipcMain.on('transaction-form', (event, arg) => {
  console.log(arg);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


const cometNode = function(port){
  let cometSockets = [];
  let cometServer;
  let _port = port;
  let chain = new cometChain();

  function init(){

    chain.init();

    cometServer = new WebSocket.Server({ port: _port });

    cometServer.on('connection', (connection) => {
      console.log('connection in');
      initConnection(connection);
    });
  }

  const messageHandler = (connection) =>{
    connection.on('message', (data) => {
      console.log('Message In:');
      const msg = JSON.parse(data);

      console.log(msg.event);
    });
    console.log('message handler setup');
  };

  const broadcastMessage = (message) => {
    console.log('sending to all '+message);
    cometSockets.forEach(node => node.send(JSON.stringify({event: message})))
  };

  const closeConnection = (connection) => {
    console.log('closing connection');
    cometSockets.splice(cometSockets.indexOf(connection),1);
  };

  const initConnection = (connection) => {
    console.log('init connection');

    messageHandler(connection);

    cometSockets.push(connection);

    connection.on('error', () => closeConnection(connection));
    connection.on('close', () => closeConnection(connection));
  };

  const createBlock = (teammember) => {
    let newBlock = chain.createBlock(teammember);
    chain.addToChain(newBlock);
  };

  const getStats = () => {
    return {
      blocks: chain.getTotalBlocks()
    }
  };

  const addPeer = (host, port) => {
    let connection = new WebSocket(`ws://${host}:${port}`);

    connection.on('error', (error) =>{
      console.log(error);
    });

    connection.on('open', (msg) =>{
      initConnection(connection);
    });
  };

  return {
    init,
    broadcastMessage,
    addPeer,
    createBlock,
    getStats
  }

};

const BLOCK = "BLOCK";
const REQUEST_CHAIN = "REQUEST_CHAIN";


const messageHandler = (connection) =>{
  connection.on('message', (data) => {
    const msg = JSON.parse(data);
    switch(msg.event){
      case BLOCK:
        processedRecievedBlock(msg.message);
        break;
      default:
        console.log('Unknown message');
    }
  });
};

const processedRecievedBlock = (block) => {

  let currentTopBlock = chain.getLatestBlock();

  // Is the same or older?
  if(block.index <= currentTopBlock.index){
    console.log('No update needed');
    return;
  }

  //Is claiming to be the next in the chain
  if(block.previousHash == currentTopBlock.hash){
    //Attempt the top block to our chain
    chain.addToChain(block);

    console.log('New block added');
    console.log(chain.getLatestBlock());
  }else{
    // It is ahead.. we are therefore a few behind, request the whole chain
    console.log('requesting chain');
    broadcastMessage(REQUEST_CHAIN,"");
  }
};