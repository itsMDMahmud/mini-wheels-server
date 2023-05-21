const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.reyfrcm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db('miniWheels').collection('toyList');

    // const indexKeys = {toyName: 1, categoryName: 1};
    // const indexOptions = {name: "nameCategory"};
    // const result = await toysCollection.createIndex(indexKeys, indexOptions);

    app.get("/toysearchTitle/:text", async (req, res) => {
      const searchText = req.params.text;

      const result = await toysCollection
      .find({
        $or: [
          {toyName: {$regex: searchText, $options: "i"}},
          {categoryName: {$regex: searchText, $options: "i"}},
        ],
      })
      .toArray();
      res.send(result);
    });
    

    app.get('/toylist', async(req, res) => {
        const cursor = toysCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })


    app.get('/toylist/:id', async(req, res) => {
        const id = req.params.id;
        // console.log(id);
        const query = {_id: new ObjectId(id)}
        const result = await toysCollection.findOne(query);
        res.send(result);
    })


    app.get('/mytoys', async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
    
      let sortOrder = 1; // 1 for ascending, -1 for descending
      if (req.query?.sort === 'desc') {
        sortOrder = -1;
      }
    
      const result = await toysCollection
        .find(query)
        .sort({ price: sortOrder }) // Replace 'fieldToSort' with the actual field name you want to sort by
        .toArray();
    
      res.send(result);
    });
    

    app.get('/mytoys', async(req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
  })

    app.get('/mytoys/:_id', async(req, res) => {
      const _id =  req.params._id;
      const query = {_id: new ObjectId(_id)}
      const result = await toysCollection.findOne(query);
      // const result = await cursor.toArray();
      res.send(result);
  })

  
    app.post('/mytoys', async(req, res) => {
        const addAToy = req.body;
        // console.log(addAToy);
        const result = await toysCollection.insertOne(addAToy);
        res.send(result);
    })

    app.patch('/mytoys/:_id', async (req, res) => {
      const _id = req.params._id;
      const filter = {_id: new ObjectId(_id)}
      const updateDetails = req.body;
      // console.log(updateDetails);
      const updatedToyDetails ={
        $set: {
          toyName: req.body.toyName, 
          categoryName: req.body.categoryName, 
          img: req.body.img, 
          price: req.body.price, 
          quantity: req.body.quantity, 
          rating: req.body.rating, 
          description: req.body.description,          
        }
      }
      const result = await toysCollection.updateOne(filter, updatedToyDetails);
      res.send(result);
    })

    app.delete('/mytoys/:_id', async (req, res) => {
      const _id = req.params._id;
      const query = {_id: new ObjectId(_id)}
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get ('/', (req, res) => {
    res.send('Mini wheels server is running');
})

app.listen(port, () => {
    console.log(`Mini server is running on port: ${port}`)
})

