# E-Commerce Mock API Documentation

**Base URL**: `http://localhost:3000`

All endpoints return responses wrapped in a standard JSON structure containing `success`, `message`, `data`, and `meta`.

---

## 1. Products (Search, Filter, Sort & Paginate)

The `/products` endpoint is extremely powerful and supports standard querying, filtering, and pagination out of the box.

### Get All Products
`GET /products`
- **Description**: Returns a paginated list of all products.
- **Default Behavior**: Defaults to `page=1` and `limit=10`.

### Searching & Filtering
`GET /search?category=gadgets&subCategory=apple`
- **`category`**: Filter by main category (e.g., `gadgets`, `bags`, `jewelry`)
- **`subCategory`**: Filter by specific subcategory (e.g., `apple`, `backpack`)
- **`title`** (or **`name`**): Partial text search on the product title. Example: `?title=iphone`
- **`search`**: Global full-text search across all fields in the product. Example: `?search=black`

### Sorting
`GET /search?sort=price&order=desc`
- **`sort`**: Field to sort by. Supported fields: `price`, `rating`, `title`, etc.
- **`order`**: Sort direction. Use `asc` (low to high) or `desc` (high to low).
- *Example (Highest Price):* `?sort=price&order=desc`
- *Example (Top Rated):* `?sort=rating&order=desc`

### Pagination
`GET /products?page=2&limit=20`
- **`page`**: The page number to fetch.
- **`limit`**: Number of items per page.

---

## 2. Homepage Sections (Dynamic)

These endpoints are designed specifically for rendering dynamic sections on your homepage. Every time you call them, they return 8 random products to make the UI feel alive.

- `GET /featured-products` - Returns 8 random products
- `GET /trending-products` - Returns 8 random products
- `GET /new-arrivals` - Returns 8 random products
- `GET /you-may-also-like` - Returns 8 random products

---

## 3. Categories API

`GET /categories`
- **Description**: Returns the hierarchical category tree.
- **Usage**: Use this to render your sidebar filters or dropdown menus. It includes parent categories (like `gadgets`) and their nested children (like `apple`, `samsung`).

---

## 4. Image Upload & Visual Search Simulation

`POST /upload`
- **Description**: Upload an image file. It saves the image to `public/uploads/` and returns a public URL.
- **Body**: `multipart/form-data` with a file field named `image`.
- **Special Feature**: Simulates visual search! It has a 70% chance to return 2 random products (simulating that it found similar products to the image) and a 30% chance to return a "Product not found" message.

---

## 5. User Authentication (Mock)

`POST /login`
- **Description**: A basic mock login endpoint.
- **Body**: JSON containing `username` and `password`.
- **Credentials**: Use `username: "johnd"` and `password: "mypassword"`.
- **Returns**: A mock JWT token and the user's ID.
