const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
// middlewares
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('review server is running')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wbjzicb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run(){
    try {
      const serviceCollection = client.db('eye-care').collection('care-services');
      const reviewCollection = client.db('eye-care').collection('reviews');

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

      app.post('/services', async (req, res) => {
        const service = req.body;
        const result = serviceCollection.insertOne(service)
        res.send(result)
      })
      
      app.post('/addReview', async (req, res) => {
        const review = req.body;
        const collection = await reviewCollection.insertOne(review);
        res.send(collection)
      })

      app.get('/reviews', async (req, res) => {
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
        console.log(query);
        const cursor = reviewCollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
      })

      app.delete('/reviews/:id', async (req, res) => {
          const id = req.params.id;
          const query = {_id : ObjectId(id)}
          const result = await reviewCollection.deleteOne(query)
          res.send(result)
      })

    }
    finally {

    }
}
run().catch(err => console.error(err));

app.listen(port, () => {
    console.log(`server running on port ${port}`);
});