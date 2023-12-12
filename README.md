# For Redis db grading
please go to ./Redis_grading

## To run
`npm install`
`npm start`

## For your reference
My Redis database is a supplement db that has a string-type data structure that
stores the key `visited:clientId`, with its value `visited`.

C: Create visited:clientId in Redis with value 0 when a new client is added.

R: Retrieve visit count from Redis using visited:clientId.

U: Add one or minus one in Redis for visited:clientId upon client visit.

D: Delete visited:clientId in Redis when the client is removed.


APIs for Redis:
`storeVisits(), getVisits(), addVisit(), minusVisit(), delVisit()`
