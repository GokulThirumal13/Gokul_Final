const{ MongoClient }=require("mongodb");
const express=require("express");
const cors=require("cors");
const bcrypt=require("bcryptjs");
const app=express();
const port=3001;
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


const db=client.db('AI');
const userCollection=db.collection('Users');
const storyCollection=db.collection('Stories');

const FavCollection=db.collection('Fav');
// const promptCollection=db.collection('Prompts');
// const mqttCollection=db.collection('MqttMessages');

function isValidUsername(username) {
    return /^[a-zA-Z0-9_]{3,}$/.test(username);
}
function isValidPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);
}

app.get('/signup',async(req,res)=>{
    try{
        const users = await userCollection.find().project({ password: 0 }).toArray();
        res.json(users);

    } catch(error){
        res.status(500).json({message:"Failed to fetch users",error:error.message});
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
        await userCollection.insertOne({ username, password: hashedPassword, age, credits:100 });

        res.status(201).json({ message: "User registered successfully", credits: 100 });
    } catch (error) {
        res.status(500).json({ message: "Signup failed", error: error.message });
    }
});

app.post("/login",async(req,res)=>{
    try{
        const{username,password}=req.body;
        if (!username||!password){
            return res.status(400).json({message: "Username and password are required"})
        }
        const user = await userCollection.findOne({ username });
        if (!user) {
            return res.status(401).json({ message:"Invalid username or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message:"Invalid username or password" });
        }

        res.json({ message: "Login successful",username: user.username, age: user.age });
    } catch (error) {
        res.status(500).json({ message:"Login failed",error: error.message });
    }
});
app.post("/story",async (req, res) => {
    try {
        const { username, storyText, audioUrl } = req.body;
        if (!username || !storyText || !audioUrl) {
            return res.status(400).json({ message: "Username, story text, and audio URL are required" });
        }
        await storyCollection.insertOne({ username, storyText, audioUrl,createdAt: new Date() });
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
        const { username, story, isFavorite ,audioUrl,category,favoriteImage} = req.body;
        if (!username || !story || typeof isFavorite !== 'boolean' || !audioUrl || !category ||!favoriteImage) {
            return res.status(400).json({ message: "Username,story,audioUrl,favorite,status,category,favorite_image are required" });
        }
        await FavCollection.insertOne({ username, story, isFavorite, audioUrl,category,favoriteImage,createdAt: new Date() });
        res.status(201).json({ message: "Favorite status updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to store favorite status", error: error.message });
    }
});

app.get("/favorite", async (req, res) => {
    try {
        const favorites = await FavCollection.find({ isFavorite: true })
            .sort({ createdAt: -1 }) 
            .toArray();

        res.json(favorites); 
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch favorite stories", error: error.message });
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

app.post('/add-credits', async (req, res) => {
    const { username, credits } = req.body;

    if (!username || credits === undefined) {
        return res.status(400).json({ success: false, message: "Username and credits are required" });
    }

    try {
        const user = await userCollection.findOne({ username });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const newCredits = (user.credits || 0) + credits;

        await userCollection.updateOne(
            { username },
            { $set: { credits: newCredits } }
        );

        return res.json({ success: true, message: "Credits updated successfully", newCredits });
    } catch (error) {
        console.error("Error in /add-credits:", error);
return res.status(500).json({ success: false, message: "Server error", error: error.message });

    }
});


// app.post("/audio",async(req,res)=>{

// })

// app.get("/audio",async(req,res)=>{

// })
// app.post("/mqtt",async(req,res)=>{

// })

// app.get("/mqtt",async(req,res)=>{

// })

// app.get("/prompts",async(req,res)=>{

// })

// app.post("/prompts",async(req,res)=>{
    
// })

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://192.168.1.26:${port}`);
});






