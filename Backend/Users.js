const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const app = express();
const port = 3001;
app.use(express.json());
app.use(cors());
const uri = "mongodb://127.0.0.1:27017";
const API_URL = 'http://192.168.4.55';

async function getDbConnection() {
  const client = new MongoClient(uri);
  await client.connect();
  console.log("Connected to MongoDB for a request");
  return { client, db: client.db('AI') };
}


function getCollectionByUserType(db, userType) {
  if (userType === 'adult') {
    return {
      userCollection: db.collection('AdultUsers'),
      storyCollection: db.collection('AdultStories'),
      FavCollection: db.collection('AdultFav')
    };
  } else {
    return {
      userCollection: db.collection('Users'),
      storyCollection: db.collection('Stories'),
      FavCollection: db.collection('Fav')
    };
  }
}

function isValidUsername(username) {
  return /^[a-zA-Z0-9_]{3,}$/.test(username);
}

function isValidPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);
}

app.get('/signup', async (req, res) => {
  let client;
  try {
    const connection = await getDbConnection();
    client = connection.client;
    const db = connection.db;
    
    const { userType = 'child' } = req.query;
    const { userCollection } = getCollectionByUserType(db, userType);
    
    const users = await userCollection.find().project({ password: 0 }).toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
});

app.post("/signup", async (req, res) => {
  let client;
  try {
    const connection = await getDbConnection();
    client = connection.client;
    const db = connection.db;
    
    const { username, password, age, userType = 'child' } = req.body;
    if (!username || !password || age === undefined) {
      return res.status(400).json({ message: "Username, password, and age are required" });
    }
    
    if (!isValidUsername(username)) {
      return res.status(400).json({ message: "Invalid username format" });
    }
    
    if (!isValidPassword(password)) {
      return res.status(400).json({ message: "Weak password format" });
    }
    
    const { userCollection } = getCollectionByUserType(db, userType);
    const existingUser = await userCollection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: `Username '${username}' already exists` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userCollection.insertOne({ username, password: hashedPassword, age, credits: 100 });

    res.status(201).json({ message: "User registered successfully", credits: 100 });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
});

app.post("/login", async (req, res) => {
  let client;
  try {
    const connection = await getDbConnection();
    client = connection.client;
    const db = connection.db;
    
    const { username, password, userType = 'child' } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" })
    }
    
    const { userCollection } = getCollectionByUserType(db, userType);
    const user = await userCollection.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.json({ 
      success: true,
      message: "Login successful", 
      username: user.username, 
      age: user.age 
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
});


app.post("/story", async (req, res) => {
  let client;
  try {
    const connection = await getDbConnection();
    client = connection.client;
    const db = connection.db;
    
    const { username, storyText, audioUrl, userType = 'child' } = req.body;
    if (!username || !storyText || !audioUrl) {
      return res.status(400).json({ message: "Username, story text, audio URL are required" });
    }
    
    const { storyCollection } = getCollectionByUserType(db, userType);
    await storyCollection.insertOne({ username, storyText, audioUrl, createdAt: new Date() });
    res.status(201).json({ message: "Story added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add story", error: error.message });
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
});

app.get("/story", async (req, res) => {
  let client;
  try {
    const connection = await getDbConnection();
    client = connection.client;
    const db = connection.db;
    
    const { username, userType = 'child' } = req.query;
    const { storyCollection } = getCollectionByUserType(db, userType);
    const filter = username ? { username } : {};
    const stories = await storyCollection.find(filter).sort({ createdAt: -1 }).toArray();
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stories", error: error.message });
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
});

app.delete("/story", async (req, res) => {
  let client;
  try {
    const connection = await getDbConnection();
    client = connection.client;
    const db = connection.db;
    
    const { userType = 'child' } = req.body;
    const { storyCollection } = getCollectionByUserType(db, userType);
    await storyCollection.deleteMany({});
    res.status(200).json({ message: "All stories deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete stories", error: error.message });
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
});

app.post("/favorite", async (req, res) => {
  let client;
  try {
    const connection = await getDbConnection();
    client = connection.client;
    const db = connection.db;
    
    const { username, story, isFavorite, audioUrl, category, imageUrl, userType = 'child' } = req.body;
    if (!username || !story || typeof isFavorite !== 'boolean' || !audioUrl || !category || !imageUrl) {
      return res.status(400).json({ message: "Username, story, audioUrl, favorite status, category, favorite_image are required" });
    }
    
    const { FavCollection } = getCollectionByUserType(db, userType);
    await FavCollection.insertOne({ username, story, isFavorite, audioUrl, category, imageUrl, createdAt: new Date() });
    res.status(201).json({ message: "Favorite status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to store favorite status", error: error.message });
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
});

app.get("/favorite", async (req, res) => {
  let client;
  try {
    const connection = await getDbConnection();
    client = connection.client;
    const db = connection.db;
    
    const { category, username, userType = 'child' } = req.query;
    const { FavCollection } = getCollectionByUserType(db, userType);
    const filter = { isFavorite: true };
    if (username) {
      filter.username = username;
    }
    if (category) {
      filter.category = category;
    }

    const favorites = await FavCollection.find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch favorite stories", error: error.message });
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
});

app.delete("/favorite/:id", async (req, res) => {
  let client;
  try {
    const connection = await getDbConnection();
    client = connection.client;
    const db = connection.db;
    
    const id = req.params.id;
    const { userType = 'child' } = req.query;
    const { FavCollection } = getCollectionByUserType(db, userType);
    await FavCollection.deleteOne({ _id: new ObjectId(id) });
    
    res.status(200).json({ message: "Favorite deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete favorite", error: error.message });
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
});

app.post('/deduct-credits', async (req, res) => {
  let client;
  try {
    const connection = await getDbConnection();
    client = connection.client;
    const db = connection.db;
    
    const { username, userType = 'child' } = req.body;
    const { userCollection } = getCollectionByUserType(db, userType);
    let user = await userCollection.findOne({ username });

    if (!user) {
      user = { username, credits: 100 };
      await userCollection.insertOne(user);
    } else if (user.credits === undefined) {
      user.credits = 100;
      await userCollection.updateOne({ username }, { $set: { credits: 100 } });
    }
    
    if (user.credits >= 20) {
      const newCredits = user.credits - 20;
      await userCollection.updateOne(
        { username },
        { $set: { credits: newCredits } }
      );
      return res.json({ success: true, newCredits });
    } else {
      return res.status(400).json({ success: false, message: "Insufficient credits" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
});

app.get("/get-credits", async (req, res) => {
  let client;
  try {
    const connection = await getDbConnection();
    client = connection.client;
    const db = connection.db;
    
    const { username, userType = 'child' } = req.query;
    if (!username) {
      return res.status(400).json({ success: false, message: "Username is required" });
    }
    
    const { userCollection } = getCollectionByUserType(db, userType);
    let user = await userCollection.findOne({ username });

    if (!user) {
      await userCollection.insertOne({ username, credits: 100 });
      return res.json({ success: true, credits: 100 });
    }

    if (user.credits === undefined) {
      await userCollection.updateOne({ username }, { $set: { credits: 100 } });
      return res.json({ success: true, credits: 100 });
    }

    res.json({ success: true, credits: user.credits });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
});

app.get('/subscription-status', async (req, res) => {
  let client;
  try {
    const connection = await getDbConnection();
    client = connection.client;
    const db = connection.db;
    
    const { username, userType = 'child' } = req.query;
    
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }
    
    const { userCollection } = getCollectionByUserType(db, userType);
    const user = await userCollection.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.subscription && new Date(user.subscription.expiryDate) > new Date()) {
      return res.json({ 
        success: true, 
        subscription: {
          plan: user.subscription.plan,
          expiryDate: user.subscription.expiryDate,
          credits: user.credits
        }
      });
    } else {
      return res.json({ success: true, subscription: null });
    }
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
});

app.post('/add-credits', async (req, res) => {
  let client;
  try {
    const connection = await getDbConnection();
    client = connection.client;
    const db = connection.db;
    
    const { username, credits, plan, expiryDate, userType = 'child' } = req.body;
    
    if (!username || !credits) {
      return res.status(400).json({ success: false, message: 'Username and credits are required' });
    }
    
    const { userCollection } = getCollectionByUserType(db, userType);
    const updatedUser = await userCollection.findOneAndUpdate(
      { username },
      { 
        $inc: { credits: parseInt(credits) },
        $set: { 
          subscription: {
            plan: plan,
            expiryDate: expiryDate
          }
        }
      },
      { returnDocument: 'after' }
    );
    
    if (!updatedUser.value) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Credits and subscription updated successfully',
      user: {
        username: updatedUser.value.username,
        credits: updatedUser.value.credits,
        subscription: updatedUser.value.subscription
      }
    });
  } catch (error) {
    console.error('Error adding credits:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at ${API_URL}:${port}`);
});