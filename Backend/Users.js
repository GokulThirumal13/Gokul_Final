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
const audioCollection=db.collection('AudioFiles');
const promptCollection=db.collection('Prompts');
const mqttCollection=db.collection('MqttMessages');




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
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        if (!isValidUsername(username)) {
            return res.status(400).json({ message: "Username must be at least 3 characters long and contain only letters, numbers, or underscores." });
        }
        if (!isValidPassword(password)) {
            return res.status(400).json({ message: "Password must be at least 6 characters long, with at least one uppercase letter, one lowercase letter, and one number." });
        }
        const existingUser = await userCollection.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: `Username '${username}' already exists` });
        }
        const hashedPassword = await bcrypt.hash(password, 10); 
        await userCollection.insertOne({ username, password: hashedPassword });
        res.status(201).json({ message: "User registered successfully" });
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

        res.json({ message: "Login successful" });
    } catch (error) {
        res.status(500).json({ message:"Login failed", error: error.message });
    }
});

app.post("/story",async (req,res)=>{
    try{
        
    }catch(error){

    }
})
app.get("/stories",async(req,res)=>){

}

app.post("/audio",async(req,res)=>{

})

app.get("/audio",async(req,res)=>{

})
app.post("/mqtt",async(req,res)=>{

})

app.get("/mqtt",async(req,res)=>{

})

app.get("/prompts",async(req,res)=>{

})

app.post("/prompts",async(req,res)=>{
    
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});






