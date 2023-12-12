const { MongoClient } = require('mongodb');
const { createClient } = require('redis');
async function connect(){
    const uri = "mongodb+srv://eli1838459978:198578ddd@cluster0.zcrzloi.mongodb.net/";
    const client = new MongoClient(uri);
    return client
}
async function getClientData() {
    const client = await connect();
    let result;
    try {
        await client.connect();
        
        const database = client.db("ProjectManagement"); 
        const clients = database.collection("clients"); 
        const query = {}; 
        const cursor = clients.find(query);
        result = await cursor.toArray();
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    return result;
}

async function storeVisits() {
    const redisClient = createClient({
        url: 'redis://localhost:6379' 
    });

    const mongoClient = await connect();

    try {
        await redisClient.connect();
        await mongoClient.connect();

        const database = mongoClient.db("ProjectManagement"); 
        const clients = database.collection("clients"); 

        // Retrieve all client IDs from MongoDB
        const cursor = await clients.find({}, { projection: { _id: 1 } });

        for await (const client of cursor) {
            const redisKey = `visited:${client._id}`;
            const exists = await redisClient.exists(redisKey);
            if (!exists) {
                // Key does not exist, so initialize it to 0
                await redisClient.set(redisKey, 0);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {

        await redisClient.disconnect();


        await mongoClient.close();
    }
}



async function getVisits() {
    const redisClient = createClient({
        url: 'redis://localhost:6379'
    });

    try {
        await redisClient.connect();
        const keys = await redisClient.keys('visited:*');
        const visits = {};
        for (const key of keys) {
            const value = await redisClient.get(key);
            visits[key] = value;
        }

        return visits;

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (redisClient.isOpen) {
            await redisClient.disconnect(); 
        }
    }
}

async function addVisit(clientID) {
    const redisClient = createClient({
        url: 'redis://localhost:6379' 
    });

    try {
        await redisClient.connect();

        const redisKey = `visited:${clientID}`;
        await redisClient.incr(redisKey);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (redisClient.isOpen) {
            await redisClient.disconnect(); 
        }
    }
}

async function minusVisit(clientID) {
    const redisClient = createClient({
        url: 'redis://localhost:6379' 
    });

    try {
        await redisClient.connect();
        const redisKey = `visited:${clientID}`;
        const currentCount = parseInt(await redisClient.get(redisKey), 10);
        // Only decrement if count is greater than 0
        if (currentCount > 0) {
            await redisClient.decr(redisKey);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (redisClient.isOpen) {
            await redisClient.disconnect(); 
        }
    }
}


async function delVisit(clientID) {
    const redisClient = createClient({
        url: 'redis://localhost:6379'
    });

    try {
        await redisClient.connect();
        const redisKey = `visited:${clientID}`;
        await redisClient.del(redisKey);
        console.log(`Visit record deleted for client ${clientID}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (redisClient.isOpen) {
            await redisClient.disconnect(); 
        }
    }
}


async function projectsListWithEmployeeNames() {
    const client = await connect();
    let allProjectsWithClientNames = [];
    try {
        await client.connect();
        const database = client.db("ProjectManagement");
        const clients = database.collection("clients");
        // Aggregate pipeline
    const pipeline = [
    {
        $unwind: "$projects"
    },
    {
        $lookup: {
            from: "employees",
            localField: "projects.employees",
            foreignField: "_id",
            as: "projectEmployees"
        }
    },
    {
        $project: {
            client_name: 1,
            "projects.name": 1,
            "projects.projectId": 1, // Include projectId here
            "projects.employees": {
                $map: {
                    input: "$projectEmployees",
                    as: "employee",
                    in: {
                        _id: "$$employee._id",
                        name: "$$employee.name"
                    }
                }
            }
        }
    },
    {
        $group: {
            _id: "$_id",
            client_name: { $first: "$client_name" },
            projects: {
                $push: {
                    name: "$projects.name",
                    projectId: "$projects.projectId", // Include projectId here
                    employees: "$projects.employees"
                }
            }
        }
    }
];



        const cursor = clients.aggregate(pipeline);
        allProjectsWithClientNames = await cursor.toArray();
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return allProjectsWithClientNames;
}

async function addClient(newClient) {
    const client = await connect();
    let result;

    try {
        await client.connect();
        
        const database = client.db("ProjectManagement"); 
        const clients = database.collection("clients"); 
        
        const result = await clients.insertOne(newClient);
        return result;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return result;
}

async function deleteClient(clientID) {
    const client = await connect();
    let result;

    try {
        await client.connect();
        
        const database = client.db("ProjectManagement"); 
        const clients = database.collection("clients"); 
        
        // Convert clientID to MongoDB ObjectId 
        const objectId = require('mongodb').ObjectId;
        const id = new objectId(clientID);

        result = await clients.deleteOne({ _id: id });

        return result;
    } catch (e) {
        console.error('Error deleting client:', e);
        throw e;
    } finally {
        await client.close();
    }
}

async function editClient(clientID, clientData) {
    const client = await connect();
    let result;

    try {
        await client.connect();
        
        const database = client.db("ProjectManagement"); 
        const clients = database.collection("clients"); 
        const objectId = require('mongodb').ObjectId;
        const id = new objectId(clientID);
        const updateDoc = {
            $set: {
                client_name: clientData.name,
                email: clientData.email,
                address: clientData.address
            }
        };
        result = await clients.updateOne({ _id: id }, updateDoc);

        return result;
    } catch (e) {
        console.error('Error updating client:', e);
        throw e;
    } finally {
        await client.close();
    }
}

async function addProject(newProject) {
    const client = await connect();
    let result;

    try {
        await client.connect();

        const database = client.db("ProjectManagement");
        const clients = database.collection("clients");

        const objectId = require('mongodb').ObjectId;
        const new_clientId = new objectId(newProject.clientId);
        const new_employeeId = new objectId(newProject.employeeId);

        const employeesCollection = database.collection("employees");
        const employee = await employeesCollection.findOne({ _id: new_employeeId });

        const projectId = new objectId();

        if (!employee) {
            throw new Error('Employee not found');
        }

        const projectToAdd = {
            projectId: projectId,
            name: newProject.name,
            employees: new_employeeId
        };

        result = await clients.updateOne(
            { _id: new_clientId },
            { $push: { projects: projectToAdd } }
        );

        return result;
    } catch (e) {
        console.error('Error adding project:', e);
        throw e;
    } finally {
        await client.close();
    }
    return result;
}



async function deleteProject(projectID) {
    const client = await connect();
    let result;

    try {
        await client.connect();
        
        const database = client.db("ProjectManagement"); 
        const clients = database.collection("projects"); 
        const objectId = require('mongodb').ObjectId;
        const id = new objectId(projectID);

        result = await clients.deleteOne({ _id: id });

        return result;
    } catch (e) {
        console.error('Error deleting client:', e);
        throw e; 
    } finally {
        await client.close();
    }
}


async function editProject(projectID, projectData) {
    const client = await connect();
    let result;

    try {
        await client.connect();

        const database = client.db("ProjectManagement");
        const projects = database.collection("projects"); // Use the 'projects' collection
        const objectId = require('mongodb').ObjectId;
        const id = new objectId(projectID);

        // Update only the fields that are passed in projectData
        const updateDoc = {
            $set: projectData
        };

        result = await projects.updateOne({ _id: id }, updateDoc);

        return result;
    } catch (e) {
        console.error('Error updating project:', e);
        throw e;
    } finally {
        await client.close();
    }
}


module.exports = {
    getClientData, projectsListWithEmployeeNames, addClient, deleteClient, editClient,
    addProject, deleteProject, editProject,
    storeVisits, getVisits, addVisit, minusVisit, delVisit


}




