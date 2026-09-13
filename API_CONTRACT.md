# API Contract & Example Responses

This document provides example request and response structures for the backend team to implement the actual API endpoints, mirroring the frontend's current mock data structure.

All responses should generally follow a standard wrapper format (unless your framework enforces a different REST pattern, in which case the `data` payload should match the arrays/objects below):
```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... },
  "meta": { ... } // Optional pagination or metadata
}
```

## 1. Products API

### 1.1 Searching & Filtering
**Endpoint**: `GET /search?category=gadgets&subCategory=apple&title=iphone&search=black`

**Response Structure**:
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
     {
      "id": 4,
      "title": "Luxury Handbag",
      "category": "bags",
      "subCategory": "laptop-bag",
      "brand": "Generic",
      "price": 133.24,
      "originalPrice": null,
      "rating": 4.5,
      "badge": null,
      // "badge":"out of stock",
      // "badge":"new",
      // "badge":"50% OFF",

      "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80"
    },
    // ... more product objects
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10
  }
}
```

### 1.2 Sorting
**Endpoint**: `GET /search?sort=price&order=desc`

**Response Structure**: (Same product list structure as Search, but ordered by the specified field)
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "title": "MacBook Pro M3 Max",
      "price": 3499.00,
      "rating": 4.9,
      "image": "..."
    },
    {
      "id": 1,
      "title": "Apple iPhone 15 Pro",
      "price": 999.99,
      "rating": 4.8,
      "image": "..."
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

### 1.3 Pagination & Get All Products
**Endpoint**: `GET /products?page=2&limit=20` (Or `GET /products`)

**Response Structure**:
```json
{
  "success": true,
  "data": [
    // Array of up to 20 product objects
  ],
  "meta": {
    "total": 150,
    "page": 2,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## 2. Homepage Sections (Dynamic)

**Endpoints**:
- `GET /featured-products`
- `GET /trending-products`
- `GET /new-arrivals`
- `GET /you-may-also-like`

**Response Structure** (Each endpoint returns an array of 8 to 10 products):
```json
{
  "success": true,
  "data": [
    // 8 Product Objects
    {
      "id": 10,
      "title": "Sony WH-1000XM5",
      "price": 348.00,
      "rating": 4.7,
      "image": "https://example.com/images/sony.jpg"
    }
  ]
}
```

---

## 3. Categories API

**Endpoint**: `GET /categories`

**Response Structure** (Hierarchical category tree):
```json
{
  "success": true,
  "data": [
    {
      "id": "gadgets",
      "name": "Gadgets",
      "subCategories": [
        {
          "id": "apple",
          "name": "Apple"
        },
        {
          "id": "samsung",
          "name": "Samsung"
        }
      ]
    },
    {
      "id": "bags",
      "name": "Bags",
      "subCategories": [
        {
          "id": "backpack",
          "name": "Backpacks"
        }
      ]
    }
  ]
}
```

---

## 4. Wishlists API

### 4.1 Get Wishlist Items
**Endpoint**: `GET /wishlists?userId=1&_expand=product`

**Response Structure**:
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "userId": 1,
      "productId": 5,
      "product": {
        "id": 5,
        "title": "MacBook Pro M3 Max",
        "price": 3499.00,
        "image": "..."
      }
    }
  ]
}
```

### 4.2 Add to Wishlist
**Endpoint**: `POST /wishlists`

**Request Body**:
```json
{
  "userId": 1,
  "productId": 5
}
```

**Response Structure**:
```json
{
  "success": true,
  "message": "Added to wishlist successfully",
  "data": {
    "id": 102,
    "userId": 1,
    "productId": 5
  }
}
```

### 4.3 Remove from Wishlist
**Endpoint**: `DELETE /wishlists/:id`

**Response Structure**:
```json
{
  "success": true,
  "message": "Removed from wishlist successfully"
}
```
