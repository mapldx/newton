## Create User

- **Description:** Endpoint to create a new user
- **URL:** `http://localhost:3000/users`
- **Method:** `POST`

### Request

- `username`: The username of the new user
- `email`: The email of the new user

### Response

- `message`: Success message indicating user creation
- `username`: The username of the created user
- `email`: The email of the created user

### Response Types

- **200**: User created successfully
- **400**: Missing required arguments

### Request Examples

#### cURL Example

```bash
curl -X POST http://localhost:3000/users -d 'username=example&email=example@example.com'
```

#### Python Example

```python
requests.post('http://localhost:3000/users', json={'username': 'example', 'email': 'example@example.com'})
```

#### Node.js Example

```javascript
axios.post('http://localhost:3000/users', { username: 'example', email: 'example@example.com' })
```


### Response Example

```json
{
  "message": "User created successfully",
  "username": "example",
  "email": "example@example.com"
}
```
---

## Get Products

- **Description:** This endpoint retrieves a list of products.
- **URL:** `http://localhost:3000/products`
- **Method:** `GET`

### Response

- `id`: The unique identifier of the product.
- `name`: The name of the product.
- `price`: The price of the product.

### Response Types

- **200**: Successful retrieval of the list of products.
- **401**: Unauthorized access, user not authenticated.
- **500**: Internal server error occurred.

### Request Examples

#### cURL Example

```bash
curl -X GET http://localhost:3000/products
```

#### Python Example

```python
requests.get('http://localhost:3000/products')
```

#### Node.js Example

```javascript
axios.get('http://localhost:3000/products')
```


### Response Example

```json
[
  {
    "id": 1,
    "name": "Product A",
    "price": 10.99
  },
  {
    "id": 2,
    "name": "Product B",
    "price": 19.99
  },
  {
    "id": 3,
    "name": "Product C",
    "price": 7.99
  }
]
```
---

## Get All Orders

- **Description:** This endpoint retrieves a list of all orders.
- **URL:** `http://localhost:3000/orders`
- **Method:** `GET`

### Response

- `orders`: An array containing order objects with id, product, and quantity.

### Response Types

- **200**: Success. Returns a list of orders.
- **403**: Forbidden. User is not authorized to access the orders.
- **500**: Internal Server Error. An error occurred while processing the request.

### Request Examples

#### cURL Example

```bash
curl http://localhost:3000/orders
```

#### Python Example

```python
requests.get('http://localhost:3000/orders')
```

#### Node.js Example

```javascript
axios.get('http://localhost:3000/orders')
```


### Response Example

```json
[
  {
    "id": 1,
    "product": "Product A",
    "quantity": 2
  },
  {
    "id": 2,
    "product": "Product B",
    "quantity": 1
  },
  {
    "id": 3,
    "product": "Product C",
    "quantity": 3
  }
]
```
---

Generated using [🦊 mapldx/newton](https://github.com/mapldx/newton) on 4/5/2024