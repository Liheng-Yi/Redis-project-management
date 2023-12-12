const { MongoClient } = require('mongodb');
async function connect(){
    const uri = "mongodb+srv://eli1838459978:198578ddd@cluster0.zcrzloi.mongodb.net/";
    const client = new MongoClient(uri);
    return client
}


async function removeVisitedAttribute(documentId) {
    const client = await connect();
    try {
        // Connect to the MongoDB server

        console.log('Connected successfully to server');


        const database = client.db("ProjectManagement"); 
        const collection = database.collection("clients"); 

        // Remove the 'visited' attribute from the specified document
        const result = await collection.updateOne(
            { '_id': new MongoClient.ObjectID(documentId) },
            { $unset: { visited: "" } }
        );

        console.log(`Document updated; 'visited' attribute removed:`, result.modifiedCount);
    } catch (err) {
        console.error(err);
    } finally {
        // Ensure that the client will close when you finish/error
        await client.close();
    }
}

// Replace with the actual document ID you want to update
const documentId = '656cf20f59ac064de94f0d35'; 
removeVisitedAttribute(documentId).catch(console.error);
