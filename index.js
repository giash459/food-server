// const express = require('express');
// const cors = require('cors');
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const app = express();
// const port = process.env.PORT || 3000;

// // https://drive.google.com/file/d/1GKxOiSCuB9bnshFzyHghnaSHja5eJr0n/view

// // middleware 
// app.use(cors());
// app.use(express.json());

// const uri = "mongodb+srv://foodUser:izJfQR69dunyGnXJ@cluster0.ukeaca2.mongodb.net/?appName=Cluster0";

// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

// app.get('/', (req, res) => {
//     res.send('Food server is running')
// })

// async function run() {
//     try {
//         await client.connect();

//         const db = client.db('food_db');
//         const foodsCollection = db.collection('foods');
//         const usersCollection = db.collection('users');

//         app.post('/users', async (req, res) => {
//             const newUser = req.body;
//             const email = req.body.email;
//             const query = { email: email }
//             const existingUser = await usersCollection.findOne(query);

//             if (existingUser) {
//                 res.send({ message: 'user already exist. do not to try insert again' })
//             }
//             else {
//                 const result = await usersCollection.insertOne(newUser);
//                 res.send(result);
//             }
//         })

//         app.get('/foods', async (req, res) => {
//             const cursor = foodsCollection.find();
//             const result = await cursor.toArray();
//             res.send(result)
//         })

//         app.get('/featured-foods', async(req, res) => {
//             const cursor = foodsCollection.find().sort({foodQuantity: -1}).limit(6);
//             const result = await cursor.toArray();
//             res.send(result);
//         })

//         app.get('/foods/:id', async (req, res) => {
//             const id = req.params.id;
//             const query = { _id: new ObjectId(id) }
//             const result = await foodsCollection.findOne((query));
//             res.send(result)
//         })

//         app.post('/foods', async (req, res) => {
//             const newFood = req.body;
//             const result = await foodsCollection.insertOne(newFood);
//             res.send(result);
//         })

//         app.patch('/foods/:id', async (req, res) => {
//             const id = req.params.id;
//             const updateFood = req.body;
//             const query = { _id: new ObjectId(id) }
//             const update = {
//                 $set: {
//                     name: updateFood.name,
//                     price: updateFood.price
//                 }
//             }
//             const result = await foodsCollection.updateOne(query, update)
//             res.send(result)
//         })

//         app.delete('/foods/:id', async (req, res) => {
//             const id = req.params.id;
//             const query = { _id: new ObjectId(id) }
//             const result = await foodsCollection.deleteOne(query);
//             res.send(result);
//         })

//         await client.db("admin").command({ ping: 1 });
//         console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     }
//     finally { }
// }

// run().catch(console.dir)

// app.listen(port, () => {
//     console.log(`Food server is running on port: ${port}`);
// })



const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://foodUser:izJfQR69dunyGnXJ@cluster0.ukeaca2.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('Food server is running');
});

async function run() {
    try {
        await client.connect();

        const db = client.db('food_db');
        const foodsCollection = db.collection('foods');
        const usersCollection = db.collection('users');

        // Save User
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = newUser.email;
            const exist = await usersCollection.findOne({ email });

            if (exist) {
                return res.send({ message: "User already exists" });
            }

            const result = await usersCollection.insertOne(newUser);
            res.send(result);
        });

        // Get All Foods
        app.get('/foods', async (req, res) => {
            const result = await foodsCollection.find().toArray();
            res.send(result);
        });

        // Featured Foods
        app.get('/featured-foods', async (req, res) => {
            const result = await foodsCollection.find().sort({ foodQuantity: -1 }).limit(6).toArray();
            res.send(result);
        });

        // Single Food
        app.get('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const result = await foodsCollection.findOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        // ADD FOOD (without image)
        app.post('/foods', async (req, res) => {
            try {
                const {
                    foodName,
                    foodImage,
                    foodQuantity,
                    pickupLocation,
                    expireDate,
                    notes,
                    donator
                } = req.body;

                const newFood = {
                    foodName,
                    foodImage, // string only
                    foodQuantity,
                    pickupLocation,
                    expireDate,
                    notes,
                    food_status: "Available",
                    donator,
                    createdAt: new Date()
                };

                const result = await foodsCollection.insertOne(newFood);

                res.send({
                    success: true,
                    message: "Food added successfully",
                    data: result
                });

            } catch (error) {
                res.status(500).send({
                    success: false,
                    message: "Failed to add food",
                    error: error.message
                });
            }
        });

        // Delete Food
        app.delete('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const result = await foodsCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        console.log("MongoDB connected successfully");
    }
    finally { }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`Food server is running on port: ${port}`);
});
