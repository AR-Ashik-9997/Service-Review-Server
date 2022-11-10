const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
require("dotenv").config();
app.use(cors());
app.use(express.json());

const uri = process.env.DB_URL;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
function varifySecret(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(
    token,
    process.env.Accsess_TOKEN_SECRET_KEY,
    function (err, decoded) {
      if (err) {
        return res.status(401).send({ message: "unauthorized access" });
      }
      req.decoded = decoded;
      next();
    }
  );
}
async function connect() {
  try {
    const serviceCollection = client
      .db("DeliveryServices")
      .collection("services");
    const reviewCollection = client
      .db("DeliveryServices")
      .collection("reviews");
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.Accsess_TOKEN_SECRET_KEY, {
        expiresIn: "1day",
      });
      res.send({ token });
    });
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
      const filter = { _id: ObjectId(serviceId) };
      const result = await serviceCollection.findOne(filter);
      res.send(result);
    });
    app.post("/add-services", varifySecret,async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });
    app.post("/add-review", varifySecret,async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });
    app.get("/all-reviews", async (req, res) => {
      const query = { serviceId: req.query.serviceId };
      const cursor = reviewCollection.find(query).sort({"date":-1});
      const result = await cursor.toArray();
      res.send(result);

    });
    app.get("/user-reviews", varifySecret, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        return res.status(403).send({ message: "Forbidden access" });
      }
      const query = { email: req.query.email };
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/update-reviews/:id", async (req, res) => {
      const updateId = req.params.id;
      const filter = { _id: ObjectId(updateId) };
      const result = await reviewCollection.findOne(filter);
      res.send(result);
    });
    app.put("/update-reviews/:userId", varifySecret, async (req, res) => {
      const id = req.params.userId;
      const filter = { _id: ObjectId(id) };
      const user = req.body;
      const option = { upsert: true };
      const updateUser = {
        $set: {
          image: user.image,
          name: user.name,
          serviceName: user.serviceName,
          rating: user.rating,
          description: user.description,
        },
      };
      const result = await reviewCollection.updateOne(
        filter,
        updateUser,
        option
      );
      res.send(result);
    });
    app.delete("/review-delete/:id", varifySecret,async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
connect().catch((err) => console.error(err));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
