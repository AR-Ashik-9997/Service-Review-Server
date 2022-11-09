const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(cors());
app.use(express.json());

const uri = process.env.DB_URL;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function connect() {
  try {
    const serviceCollection = client.db("DeliveryServices").collection("services");
    const reviewCollection = client.db("DeliveryServices").collection("reviews");
    app.get("/services", async (req, res) => {
      const result = await serviceCollection.find({}).limit(3).toArray();
      res.send(result);
    });
    app.get("/all-services", async (req, res) => {
      const result = await serviceCollection.find({}).toArray();
      res.send(result);
    });
    app.get("/details-services/:id", async (req, res) => {
      const serviceId = req.params.id;
      const filter={_id:ObjectId(serviceId)}
      const result = await serviceCollection.findOne(filter);       
      res.send(result);
    });
    app.post("/add-services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);      
    });
    app.post("/add-review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);    
         
    });
    

  } finally {
  }
}
connect().catch((err) => console.error(err));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
