# Business Track API - Postman Collection

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 Register User
**POST** `/auth/register`

**Body** (JSON):
```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "password": "password123",
  "role": "user"
}
```

### 1.2 Login User
**POST** `/auth/login`

**Body** (JSON):
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "123",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### 1.3 Login Admin
**POST** `/auth/admin/login`

**Body** (JSON):
```json
{
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

### 1.4 Who Am I
**GET** `/auth/whoami`

**Headers**:
```
Authorization: Bearer <token>
```

### 1.5 Update Profile
**PUT** `/auth/:id`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data**:
- `fullname`: John Doe Updated
- `phone_number`: +1234567890
- `userImage`: (file)

---

## 2. MATERIALS ENDPOINTS

### 2.1 Create Material
**POST** `/materials`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "name": "Flour",
  "unit": "kg",
  "unit_price": 2.5,
  "minimum_stock": 100,
  "description": "All-purpose flour"
}
```

### 2.2 Get All Materials
**GET** `/materials?page=1&limit=10`

**Headers**:
```
Authorization: Bearer <token>
```

### 2.3 Get Material By ID
**GET** `/materials/:id`

**Headers**:
```
Authorization: Bearer <token>
```

### 2.4 Update Material
**PUT** `/materials/:id`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "unit_price": 2.8,
  "minimum_stock": 120,
  "description": "Premium all-purpose flour"
}
```

### 2.5 Delete Material
**DELETE** `/materials/:id`

**Headers**:
```
Authorization: Bearer <token>
```

---

## 3. STOCK MANAGEMENT ENDPOINTS

### 3.1 Create Stock Transaction
**POST** `/stock`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "material": "material_id_here",
  "quantity": 50,
  "transaction_type": "in",
  "description": "Supplied by XYZ Supplier"
}
```

**Note**: `transaction_type` can be either "in" (adding stock) or "out" (removing stock)

### 3.2 Get All Stock Transactions
**GET** `/stock?page=1&limit=10`

**Headers**:
```
Authorization: Bearer <token>
```

### 3.3 Get Current Stock Levels
**GET** `/stock/current`

**Headers**:
```
Authorization: Bearer <token>
```

**Response**: Returns current stock levels for all materials

### 3.4 Get Stock Transaction By ID
**GET** `/stock/:id`

**Headers**:
```
Authorization: Bearer <token>
```

### 3.5 Update Stock Transaction
**PUT** `/stock/:id`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "quantity": 55,
  "description": "Updated description"
}
```

### 3.6 Delete Stock Transaction
**DELETE** `/stock/:id`

**Headers**:
```
Authorization: Bearer <token>
```

---

## 4. BILL OF MATERIALS ENDPOINTS

### 4.1 Get All Bill Items
**GET** `/bill-of-materials`

**Headers**:
```
Authorization: Bearer <token>
```

**Response**: Returns total inventory value and all materials with quantities and prices

### 4.2 Create Bill Item
**POST** `/bill-of-materials`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "material": "material_id_here",
  "quantity": 100,
  "price": 250.00
}
```

### 4.3 Update Price
**PUT** `/bill-of-materials/:id/price`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "price": 275.00
}
```

**Note**: Price changes only affect new records, previous prices remain unchanged

### 4.4 Delete Bill Item
**DELETE** `/bill-of-materials/:id`

**Headers**:
```
Authorization: Bearer <token>
```

---

## 5. RECIPES/INGREDIENTS ENDPOINTS

### 5.1 Create Recipe
**POST** `/recipes`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "name": "Chocolate Cake",
  "description": "Delicious chocolate cake recipe",
  "selling_price": 25.00,
  "ingredients": [
    {
      "name": "Flour",
      "material": "material_id_here",
      "quantity": 2
    },
    {
      "name": "Sugar",
      "material": "material_id_here",
      "quantity": 1.5
    }
  ]
}
```

### 5.2 Get All Recipes
**GET** `/recipes`

**Headers**:
```
Authorization: Bearer <token>
```

### 5.3 Get Recipe By ID
**GET** `/recipes/:id`

**Headers**:
```
Authorization: Bearer <token>
```

### 5.4 Delete Recipe
**DELETE** `/recipes/:id`

**Headers**:
```
Authorization: Bearer <token>
```

---

## 6. PRODUCTION ENDPOINTS

### 6.1 Create Production Batch
**POST** `/production`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "recipeId": "recipe_id_here",
  "batchQuantity": 10,
  "estimatedOutput": 10,
  "actualOutput": null
}
```

**Note**: When batch starts, stock is automatically reduced based on recipe ingredients × batchQuantity

### 6.2 Get All Production Batches
**GET** `/production`

**Headers**:
```
Authorization: Bearer <token>
```

**Response**: Returns all production batches with status (ongoing/completed)

### 6.3 Get Production By ID
**GET** `/production/:id`

**Headers**:
```
Authorization: Bearer <token>
```

### 6.4 Complete Production Batch
**PUT** `/production/:id/complete`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "actualOutput": 9
}
```

**Note**: System automatically calculates wastage = estimatedOutput - actualOutput

---

## 7. SUPPLIERS ENDPOINTS

### 7.1 Create Supplier
**POST** `/suppliers`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "name": "ABC Suppliers",
  "email": "abc@suppliers.com",
  "contact_number": "+1234567890",
  "products": ["Flour", "Sugar", "Butter"]
}
```

### 7.2 Get All Suppliers
**GET** `/suppliers?page=1&limit=10`

**Headers**:
```
Authorization: Bearer <token>
```

### 7.3 Get Supplier By ID
**GET** `/suppliers/:id`

**Headers**:
```
Authorization: Bearer <token>
```

### 7.4 Update Supplier
**PUT** `/suppliers/:id`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "name": "ABC Premium Suppliers",
  "contact_number": "+0987654321",
  "products": ["Flour", "Sugar", "Butter", "Eggs"]
}
```

### 7.5 Delete Supplier
**DELETE** `/suppliers/:id`

**Headers**:
```
Authorization: Bearer <token>
```

---

## 8. ADMIN ENDPOINTS

### 8.1 Create User (Admin Only)
**POST** `/admin/users`

**Headers**:
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data**:
- `fullname`: Jane Doe
- `email`: jane@example.com
- `phone_number`: +1234567890
- `password`: password123
- `role`: user
- `image`: (file, optional)

### 8.2 Get All Users (Admin Only)
**GET** `/admin/users`

**Headers**:
```
Authorization: Bearer <admin_token>
```

### 8.3 Get User By ID (Admin Only)
**GET** `/admin/users/:id`

**Headers**:
```
Authorization: Bearer <admin_token>
```

### 8.4 Update User (Admin Only)
**PUT** `/admin/users/:id`

**Headers**:
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "fullname": "Jane Doe Updated",
  "phone_number": "+0987654321"
}
```

### 8.5 Update User Image (Admin Only)
**PUT** `/admin/users/:id/image`

**Headers**:
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data**:
- `image`: (file)

### 8.6 Delete User (Admin Only)
**DELETE** `/admin/users/:id`

**Headers**:
```
Authorization: Bearer <admin_token>
```

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "totalPages": 10,
  "message": "Data retrieved successfully"
}
```

---

## Testing Workflow

### 1. Register and Login
1. Register a new user with **POST** `/auth/register`
2. Login with **POST** `/auth/login` to get your token
3. Copy the token from the response

### 2. Add Materials
1. Add materials using **POST** `/materials`
2. View all materials with **GET** `/materials`

### 3. Manage Stock
1. Add stock with **POST** `/stock` (transaction_type: "in")
2. View current stock with **GET** `/stock/current`
3. View stock history with **GET** `/stock`

### 4. Create Recipes
1. Create a recipe with **POST** `/recipes` (use material IDs from step 2)
2. View all recipes with **GET** `/recipes`

### 5. Start Production
1. Create production batch with **POST** `/production` (use recipe ID from step 4)
2. Stock is automatically reduced
3. Complete batch with **PUT** `/production/:id/complete`

### 6. Bill of Materials
1. View total inventory value with **GET** `/bill-of-materials`
2. Update material prices with **PUT** `/bill-of-materials/:id/price`

### 7. Manage Suppliers
1. Add suppliers with **POST** `/suppliers`
2. Link suppliers to materials for tracking

---

## Important Notes

1. **User Isolation**: All data (materials, stock, recipes, production, suppliers) is isolated per user. You can only see and manage your own data.

2. **Stock Management**: 
   - Stock transactions automatically update current stock levels
   - Production automatically reduces stock when batch starts
   - Always check current stock before starting production

3. **Bill of Materials**: 
   - Tracks historical pricing
   - Price updates only affect new records
   - Provides total inventory valuation

4. **Production Flow**:
   - Select recipe → Set batch quantity → Stock reduces → Complete with actual output → System calculates wastage

5. **Token Expiration**: JWT tokens may expire. If you get 401 errors, login again to get a new token.

---

## Environment Setup

Make sure your backend is running on:
```
http://localhost:5000
```

And MongoDB is connected properly.
