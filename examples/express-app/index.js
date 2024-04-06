const express = require('express');

const app = express();

// First endpoint (POST request)
app.post('/users', (req, res) => {
    // Get the arguments from the request body
    const { username, email } = req.body;

    // Scenario 1: Return HTTP status 200 with a success message
    res.status(200).json({ message: 'User created successfully', username, email });

    // Scenario 2: Return HTTP status 400 if required arguments are missing
    if (!username || !email) {
        res.status(400).send('Missing required arguments');
    }
});

// Second endpoint (GET request)
app.get('/products', (req, res) => {
    // Scenario 1: Return HTTP status 200 with a list of products
    const products = [
        { id: 1, name: 'Product A', price: 10.99 },
        { id: 2, name: 'Product B', price: 19.99 },
        { id: 3, name: 'Product C', price: 7.99 }
    ];
    res.status(200).json(products);

    // Scenario 2: Return HTTP status 401 if user is not authenticated
    const isAuthenticated = false; // Replace with your authentication logic
    if (!isAuthenticated) {
        res.status(401).send('Unauthorized');
    }
    
    // Scenario 3: Return HTTP status 500 if an error occurs
    const errorOccurred = true; // Replace with your error handling logic
    if (errorOccurred) {
        res.status(500).send('Internal Server Error');
    }
});

// Third endpoint (GET request)
app.get('/orders', (req, res) => {
    // Scenario 1: Return HTTP status 200 with a list of orders
    const orders = [
        { id: 1, product: 'Product A', quantity: 2 },
        { id: 2, product: 'Product B', quantity: 1 },
        { id: 3, product: 'Product C', quantity: 3 }
    ];
    res.status(200).json(orders);

    // Scenario 2: Return HTTP status 403 if user is not authorized
    const isAuthorized = false; // Replace with your authorization logic
    if (!isAuthorized) {
        res.status(403).send('Forbidden');
    }
    
    // Scenario 3: Return HTTP status 500 if an error occurs
    const errorOccurred = true; // Replace with your error handling logic
    if (errorOccurred) {
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
