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
    

  } finally {
  }
}
connect().catch((err) => console.error(err));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
