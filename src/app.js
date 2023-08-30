const http = require('http'); 
const express = require('express');
const { engine } = require('express-handlebars');
const cors = require('cors');
const { manager } = require('./dao/productsManagerMongo');
const WebSocket = require('ws');  
const {getAllMessages, saveMessage} = require('./dao/messagesManager')
console.log(manager)
const app = express();
const port = 8080;

const server = http.createServer(app);  

const corsOptions = {
  origin: 'http://localhost:8080',
  optionsSuccessStatus: 200,
};


const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://miguel:U1v4YDx3uuAua6Zm@cluster1.jqz7ljy.mongodb.net/mensajes', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// Verifica la conexión
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});


app.use(cors(corsOptions));
app.use(express.json());
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.get('/', async (req, res) => {
  res.render('home', { products: (await manager.getProductsFromMongo()).content });
});

app.get('/realtimeProducts', async (req, res) => {
  res.render('index', { products: await manager.getProductsFromMongo() });
});

app.get('/chat', async (req, res) =>{
  res.render('chat', {messages: await getAllMessages()})
})

const wss = new WebSocket.Server({ noServer: true }); 

wss.on('connection',async (websocket) => {
  websocket.send(JSON.stringify(await manager.getProductsFromMongo()));

  websocket.on('newMessage', async (message) =>{
    const newMessage = JSON.parse(message)
    console.log(newMessage, message)
    await saveMessage(newMessage)
    const messagesUpdated = await getAllMessages()
    wss.clients.forEach(async (client) => {
      if (client.readyState === WebSocket.OPEN) {
    
        client.send(JSON.stringify(messagesUpdated));
      }
    });
  })
  websocket.on('message', async (message) => {
    console.log(JSON.parse(message).event)
    const parsedData = JSON.parse(message)
    if(parsedData.event ==  'newMessage'){
      const newMessage = {user: parsedData.user, message: parsedData.message}

      await saveMessage(newMessage)
      const messagesUpdated = await getAllMessages()
      wss.clients.forEach(async (client) => {
        if (client.readyState === WebSocket.OPEN) {
      
          client.send(JSON.stringify({event: 'upadateMessages', messages: messagesUpdated}));
        }
    });
    }
    else{
      const newProduct = JSON.parse(message);
      await manager.addProductToMongo(newProduct)
      const updatedProducts = await manager.getProductsFromMongo()
  
      wss.clients.forEach(async (client) => {
        if (client.readyState === WebSocket.OPEN) {
          console.log(updatedProducts)
          client.send(JSON.stringify(updatedProducts));
        }
      });
    }

  
    
  });
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (websocket) => {
    wss.emit('connection', websocket, request);
  });
});

const productsRouter = require('./router/productRouter');
app.use('/api/products', productsRouter);

const cartRouter = require('./router/cartRouter');
app.use('/api/cart', cartRouter);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});