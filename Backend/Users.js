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
const client = new MongoClient(uri);
async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
    }
}
connectDB();
const db = client.db('AI');
const userCollection = db.collection('Users');
const storyCollection = db.collection('Stories');
const FavCollection = db.collection('Fav');
const adultUserCollection = db.collection('AdultUsers');
const adultStoryCollection = db.collection('AdultStories');
const adultFavCollection = db.collection('AdultFavs');
// const promptCollection=db.collection('Prompts');
// const mqttCollection=db.collection('MqttMessages');

function isValidUsername(username) {
    return /^[a-zA-Z0-9_]{3,}$/.test(username);
}
function isValidPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);
}

app.get('/signup', async (req, res) => {
    try {
        const users = await userCollection.find().project({ password: 0 }).toArray();
        res.json(users);

    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
});
app.post("/signup", async (req, res) => {
    try {
        const { username, password, age, } = req.body;
        if (!username || !password || age === undefined) {
            return res.status(400).json({ message: "Username, password, and age are required" });
        }
        if (!isValidUsername(username)) {
            return res.status(400).json({ message: "Invalid username format" });
        }
        if (!isValidPassword(password)) {
            return res.status(400).json({ message: "Weak password format" });
        }

        const existingUser = await userCollection.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: `Username '${username}' already exists` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await userCollection.insertOne({ username, password: hashedPassword, age, credits: 100 });

        res.status(201).json({ message: "User registered successfully", credits: 100 });
    } catch (error) {
        res.status(500).json({ message: "Signup failed", error: error.message });
    }
});

app.post("/login", async (req, res) => {
    console.log(req.body)
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" })
        }
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
    }
});
app.post("/story", async (req, res) => {
    console.log(req.body);
    try {
        const { username, storyText, audioUrl } = req.body;
        if (!username || !storyText || !audioUrl) {
            return res.status(400).json({ message: "Username, story text, audio URL, imageURL are required" });
        }
        await storyCollection.insertOne({ username, storyText, audioUrl, createdAt: new Date() });
        res.status(201).json({ message: "Story added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to add story", error: error.message });
    }
});
app.get("/story", async (req, res) => {
    try {
        const stories = await storyCollection.find().sort({ createdAt: -1 }).toArray();
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch stories", error: error.message });
    }
});
app.delete("/story", async (req, res) => {
    try {
        await storyCollection.deleteMany({});
        res.status(200).json({ message: "All stories deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete stories", error: error.message });
    }
});
app.post("/favorite", async (req, res) => {
    try {
        const { username, story, isFavorite, audioUrl, category, imageUrl } = req.body;
        if (!username || !story || typeof isFavorite !== 'boolean' || !audioUrl || !category || !imageUrl) {
            return res.status(400).json({ message: "Username,story,audioUrl,favorite,status,category,favorite_image are required" });
        }
        await FavCollection.insertOne({ username, story, isFavorite, audioUrl, category, imageUrl, createdAt: new Date() });
        res.status(201).json({ message: "Favorite status updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to store favorite status", error: error.message });
    }
});

app.get("/favorite", async (req, res) => {
    try {
        const { category } = req.query;

        const filter = { isFavorite: true };
        if (category) {
            filter.category = category;
        }

        const favorites = await FavCollection.find(filter)
            .sort({ createdAt: -1 })
            .toArray();

        res.json(favorites);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch favorite stories", error: error.message });
    }
});


app.delete("/favorite/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await FavCollection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).json({ message: "Favorite deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete favorite", error: error.message });
    }
});
app.post('/deduct-credits', async (req, res) => {
    const { username } = req.body;
    try {
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
    }
});

app.get("/get-credits", async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) {
            return res.status(400).json({ success: false, message: "Username is required" });
        }

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
    }
});

app.get('/subscription-status', async (req, res) => {
    try {
        const { username } = req.query;
        
        if (!username) {
            return res.status(400).json({ success: false, message: 'Username is required' });
        }

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
    }
});
  
app.post('/add-credits', async (req, res) => {
    try {
        const { username, credits, plan, expiryDate } = req.body;
        
        if (!username || !credits) {
            return res.status(400).json({ success: false, message: 'Username and credits are required' });
        }
        
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
    }
});

app.post("/adult/story", async (req, res) => {
    console.log(req.body);
    try {
        const { username, storyText, audioUrl } = req.body;
        if (!username || !storyText || !audioUrl) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        await adultStoryCollection.insertOne({ username, storyText, audioUrl, createdAt: new Date() });
        res.status(201).json({ message: "Story added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to add story", error: error.message });
    }
});

app.get("/adult/story", async (req, res) => {
    try {
        const stories = await adultStoryCollection.find().sort({ createdAt: -1 }).toArray();
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch stories", error: error.message });
    }
});

app.delete("/adult/story", async (req, res) => {
    try {
        await adultStoryCollection.deleteMany({});
        res.json({ message: "All adult stories deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete stories", error: error.message });
    }
});

app.post("/adult/favorite", async (req, res) => {
    console.log("body", req.body)

    try {
        const { username, story, isFavorite, audioUrl, category, favoriteImage } = req.body;
        if (!username || !story || typeof isFavorite !== 'boolean' || !audioUrl || !category || !favoriteImage) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        await adultFavCollection.insertOne({
            username, story, isFavorite, audioUrl, category, favoriteImage, createdAt: new Date()
        });
        res.status(201).json({ message: "Favorite added" });
    } catch (error) {
        res.status(500).json({ message: "Failed to save favorite", error: error.message });
    }
});
app.get("/adult/favorite", async (req, res) => {
    console.log(req.body);
    try {
        const { category } = req.query;
        const filter = { isFavorite: true };
        if (category) filter.category = category;

        const favorites = await adultFavCollection.find(filter).sort({ createdAt: -1 }).toArray();
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch favorites", error: error.message });
    }
});

app.delete("/adult/favorite/:id", async (req, res) => {
    console.log(req.body)
    try {
        const { id } = req.params;
        await adultFavCollection.deleteOne({ _id: new ObjectId(id) });
        res.json({ message: "Favorite removed" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete favorite", error: error.message });
    }
});


app.post('/adult/deduct-credits', async (req, res) => {
    const { username } = req.body;
    try {
        let user = await adultUserCollection.findOne({ username });

        if (!user) {
            user = { username, credits: 100 };
            await adultUserCollection.insertOne(user);
        } else if (user.credits === undefined) {
            user.credits = 100;
            await adultUserCollection.updateOne({ username }, { $set: { credits: 100 } });
        }

        if (user.credits >= 20) {
            const newCredits = user.credits - 20;
            await adultUserCollection.updateOne({ username }, { $set: { credits: newCredits } });
            return res.json({ success: true, newCredits });
        } else {
            return res.status(400).json({ success: false, message: "Insufficient credits" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});
app.post('/adult/add-credits', async (req, res) => {
    const { username, credits } = req.body;
    if (!username || credits === undefined) {
        return res.status(400).json({ success: false, message: "Username and credits are required" });
    }
    try {
        const user = await adultUserCollection.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const newCredits = (user.credits || 0) + credits;

        await adultUserCollection.updateOne(
            { username },
            { $set: { credits: newCredits } }
        );

        return res.json({ success: true, message: "Credits updated", newCredits });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

app.get("/adult/get-credits", async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) {
            return res.status(400).json({ success: false, message: "Username is required" });
        }
        let user = await adultUserCollection.findOne({ username });
        if (!user) {
            await adultUserCollection.insertOne({ username, credits: 100 });
            return res.json({ success: true, credits: 100 });
        }

        if (user.credits === undefined) {
            await adultUserCollection.updateOne({ username }, { $set: { credits: 100 } });
            return res.json({ success: true, credits: 100 });
        }
        res.json({ success: true, credits: user.credits });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://192.168.1.27:${port}`);
});