const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.opuz8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db('ashiq_cat_foods');
    const allproductscollection = database.collection('allproducts');
    const placeOrdersCollection = database.collection('placeorders');
    const usersCollection = database.collection('users');
    const reviewCollection = database.collection('review');
    console.log('database connected successfully')

      // get products api
      app.get('/allproducts', async(req, res) =>{
        const cursor = allproductscollection.find({});
        const allproducts = await cursor.toArray();
        res.send(allproducts);
    });
    // get review api
      app.get('/review', async(req, res) =>{
        const cursor = reviewCollection.find({});
        const review = await cursor.toArray();
        res.send(review);
    });

    // get single product
    app.get('/allproducts/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      
      const product = await allproductscollection.findOne(query);
      console.log(product)
      res.json(product);
  })

     // product post api
     app.post('/allproducts', async (req, res) => {
      const product = req.body;
      console.log('hit the post api', product);
    
      const result = await allproductscollection.insertOne(product);
      console.log(result);
      res.json(result)
  });
  // review post api 
  app.post('/review', async (req, res) => {
    const review = req.body;
    console.log('hit the post api', review);
  
    const result = await reviewCollection.insertOne(review);
    console.log(result);
    res.json(result)
});
  // delete product api
  app.delete('/allproducts/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id:ObjectId(id)};
    const result = await allproductscollection.deleteOne(query);
    res.json(result);
})

// delete orders
  app.delete('/placeorders/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id:ObjectId(id)};
    const result = await placeOrdersCollection.deleteOne(query);
    res.json(result);
})

// delete purchases
app.delete('/purchases', async(req, res) => {
  const email = req.query.email;
  const query = { email: email };
  const result = await placeOrdersCollection.deleteOne(query);
  res.json(result);
})

  // get orders api
  app.get('/placeorders', async(req, res) =>{
    const cursor = placeOrdersCollection.find({});
    const placeorders = await cursor.toArray();
    res.send(placeorders);
});

 // get purchases api
 app.get('/purchases', async(req, res) =>{
   const email = req.query.email;
   const query = { email: email };
  const cursor = placeOrdersCollection.find(query);
  const placeorders = await cursor.toArray();
  res.send(placeorders);
});

  // order post api
  app.post('/placeorders', async (req, res) => {
    const placeorder = req.body;
    console.log('hit the post api', placeorder);
  
    const result = await placeOrdersCollection.insertOne(placeorder);
    console.log(result);
    res.json(result)
});

app.get('/users/:email', async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const user = await usersCollection.findOne(query);
  let isAdmin = false;
  if (user?.role === 'admin') {
    isAdmin = true;
  }
  res.json({ admin : isAdmin});
})

// users post api
app.post('/users', async(req, res) =>{
  const user = req.body;
  const result = await usersCollection.insertOne(user);
  res.json(result);
});

// upsert
app.put('/users', async(req, res) => {
  const user = req.body;
  const filter = { email: user.email };
  const options = { upsert: true };
  const updateDoc = {$set: user};
  const result = await usersCollection.updateOne(filter, updateDoc, options);
  res.json(result);
});
// update role 
app.put('/users/admin', async(req, res) =>{
  const user = req.body;
  console.log('put', user);
  const filter = {email: user.email};
  const updateDoc = {$set: {role: 'admin'}};
  const result = await usersCollection.updateOne(filter, updateDoc);
  res.json(result);

})


  }
  finally {
    //await client.close();
  }

}
run().catch(console.dir);

// console.log(uri)

app.get('/', (req, res) => {
  res.send('Hello ashiq cats food!')
})

app.listen(port, () => {
  console.log(`listening at ${port}`)
})