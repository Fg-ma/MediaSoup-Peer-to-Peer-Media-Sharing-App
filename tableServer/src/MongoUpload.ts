import { MongoClient } from "mongodb";

// Define the MongoDB connection URI (replace with your own)
const uri = "mongodb://localhost:27017"; // For local MongoDB
const dbName = "tableTopMongo"; // Replace with your database name
const collectionName = "tableTopMain"; // Replace with your collection name

// Function to upload data to MongoDB
export async function uploadDataToMongoDB(data: object) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    // Connect to MongoDB
    await client.connect();

    console.log("Connected to MongoDB");

    // Access the database and collection
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Insert data into the collection
    const result = await collection.insertOne(data);

    console.log("Data uploaded successfully:", result);
  } catch (err) {
    console.error("Error uploading data:", err);
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}
