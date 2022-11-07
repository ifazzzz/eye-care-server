const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());

app.get('/', (req, res) => {
    res.send('review server is running')
})

app.listen(port, () => {
    console.log(`server running on port ${port}`);
});