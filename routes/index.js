let express = require('express');
let router = express.Router();
const fs = require('fs').promises;
const path = require('path');


const {
    getClientData, projectsListWithEmployeeNames, addClient, deleteClient, editClient,
    addProject, deleteProject, editProject,
    storeVisits, getVisits, addVisit, minusVisit, delVisit
    
} = require("../db/mongoDBConnector.js");

router.get('/', async function(req, res, next) {
  const clientData = await getClientData();
  console.log(clientData)
    
  res.render('client', { title: 'Clients', clientData: clientData});

});


router.get('/client', async function(req, res, next) {
    await storeVisits();
    const visitData = await getVisits();
    const clientData = await getClientData();
    // append data from client to data from mongo, then pass it to front-end
    clientData.forEach(client => {
        const clientIdStr = client._id.toString();
        const visitCount = visitData[`visited:${clientIdStr}`];
        client.visited = parseInt(visitCount, 10);
    });

    res.render('client', { title: 'Clients', clientData: clientData });
});


router.get('/project', async function(req, res, next) {
  const clientData = await projectsListWithEmployeeNames();
  res.render('project', { title: 'Project', clientData: clientData});
  
});



router.patch('/clients/addvisit/:id', async function(req, res) {
    const clientID = req.params.id;
    try {
        await addVisit(clientID);
        res.status(200).send({ message: 'Visit added successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error adding visit' });
    }
});


router.patch('/clients/minusvisit/:id', async function(req, res) {
    const clientID = req.params.id;
    try {
        await minusVisit(clientID);
        res.status(200).send({ message: 'Visit subtracted successfully' });
    } catch (error) {
        console.error('Error subtracting visit:', error);
        res.status(500).send({ message: 'Error subtracting visit' });
    }
});




router.post('/clients', async function(req, res) {
    const { name, email, address } = req.body;
    const newClient = {
        client_name: name,
        email: email,
        address: address
    };

    try {
        const result = await addClient(newClient);
        res.status(201).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).send('Internal Server Error');
    }
});



router.post('/projects', async function(req, res) {

    const { name, aID, eID } = req.body;

    const newClient = {
        name: name,
        clientId: aID,
        employeeId: eID
    };
    
    try {
        const result = await addProject(newClient);
        res.status(201).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).send('Internal Server Error');
    }
});

router.delete('/clients/:id', async function(req, res) {
    const clientID = req.params.id;

    try {
        const deleteResult = await deleteClient(clientID);
        await delVisit(clientID);

        res.status(200).json({
            message: 'Client and visit record deleted successfully',
            deleteResult: deleteResult
        });
    } catch (e) {
        console.error(e);
        res.status(500).send('Internal Server Error');
    }
});






router.patch('/clients/:id', async function(req, res) {
    const clientID = req.params.id;
    const clientData = req.body;
    try {
        const result = await editClient(clientID, clientData);
        res.status(200).json({ message: "Client updated successfully", data: result });
    } catch (e) {
        console.error(e);
        res.status(500).send('Internal Server Error');
    }
});


router.patch('/projects/:id', async function(req, res) {
    const projectID = req.params.id;
    const projectData = req.body;
    console.log("!!!!!")
    console.log(projectID)
    console.log(projectData)
    try {
        const result = await editProject(projectID, projectData);
        res.status(200).json({ message: "Project updated successfully", data: result });
    } catch (e) {
        console.error(e);
        res.status(500).send('Internal Server Error');
    }
});




module.exports = router;
