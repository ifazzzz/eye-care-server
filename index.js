const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
// middlewares
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('review server is running')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wbjzicb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if(!authHeader){
   return res.status(401).send({message : 'unauthorized user'});
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
    if(err){
     return res.status(401).send({message : 'unauthorized user'});
    }
    req.decoded = decoded;
    next();
  })
}

async function run(){
    try {
      const serviceCollection = client.db('eye-care').collection('care-services');
      const reviewCollection = client.db('eye-care').collection('reviews');
      const addedService = client.db('eye-care').collection('addedService');

      app.get('/services', async (req, res) => {
         const query = {};
         const cursor = serviceCollection.find(query);
         const result = await cursor.toArray();
         res.send(result)
      })

      app.get('/defaultServices', async (req, res) => {
         const query = {};
         const cursor = serviceCollection.find(query).limit(3);
         const result = await cursor.toArray();
         res.send(result)
      })

      app.get('/services/:id', async (req, res) => {
         const id = req.params.id;
         const query = {_id: ObjectId(id)};
         const service = await serviceCollection.findOne(query);
         res.send(service);
      })

      app.post('/addedServices', async (req, res) => {
        const service = req.body;
        const result = await addedService.insertOne(service)
        res.send(result)
      })

      app.get('/addedServices', async (req, res) => {
        const query = {};
        const cursor = addedService.find(query);
        const result = await cursor.toArray();
        res.send(result)
     })

      app.post('/addReview', async (req, res) => {
        const review = req.body;
        const collection = await reviewCollection.insertOne(review);
        res.send(collection)
      })

    app.get('/reviews', verifyJWT, async (req, res) => {
   
      let query = {}
      if(req.query.id){
          query = {
              serviceId: req.query.id
          }
      }
      if(req.query.email){
          query = {
              email: req.query.email
          }
      }
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })

      app.patch('/reviews/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id : ObjectId(id)};
        const newRating = req.body.rating;
        const newMessage = req.body.message;
        const updateDoc = {
          $set : {
              rating : newRating,
              message : newMessage
          }
        }
        const result = await reviewCollection.updateOne(query, updateDoc);
        res.send(result);
      })

      app.delete('/reviews/:id', async (req, res) => {
          const id = req.params.id;
          const query = {_id : ObjectId(id)}
          const result = await reviewCollection.deleteOne(query)
          res.send(result)
      })

      app.post('/jwt', (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn : '7d'})
        res.send({token})
      })

    }
    finally {

    }
}
run().catch(err => console.error(err));

app.listen(port, () => {
    console.log(`server running on port ${port}`);
});