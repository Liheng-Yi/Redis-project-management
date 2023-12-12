const { MongoClient } = require('mongodb');

async function updateDocuments() {
  // Replace the following with your MongoDB connection string
  const uri = "mongodb+srv://eli1838459978:198578ddd@cluster0.zcrzloi.mongodb.net/";
  const client = new MongoClient(uri);

  try {
    await client.connect();
        const database = client.db("ProjectManagement"); 
        const collection = database.collection("clients"); 

    // Fetch all documents in the collection
    const cursor = collection.find({});
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const randomVisitedValue = Math.floor(Math.random() * 11); // Generates a random number between 0 and 10

      // Update the 'visited' field for each document
      await collection.updateOne({ _id: doc._id }, { $set: { visited: randomVisitedValue } });
    }

    console.log("Update complete.");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

updateDocuments().catch(console.error);
