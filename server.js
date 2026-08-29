import jsonServer from 'json-server';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists before jsonServer defaults are set
const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Enable CORS for all routes
server.use(cors());

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);

// Custom routes or authentication can be added here
// Example: simulated login
server.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = router.db; // lowdb instance
  const user = db.get('users').find({ username, password }).value();
  
  if (user) {
    res.status(200).json({ token: 'fake-jwt-token-123456789', userId: user.id });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Image upload endpoint
server.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      message: 'No image file provided',
      data: null,
      meta: { timestamp: new Date().toISOString() }
    });
  }
  
  // Create a full URL for the uploaded file
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  
  // Simulate image recognition / visual search
  const db = router.db;
  const allProducts = db.get('products').value();
  
  // 70% chance to find products, 30% chance to not find any
  const isFound = Math.random() > 0.3; 
  let returnedProducts = [];
  let message = 'Image uploaded successfully. Products found.';
  
  if (isFound && allProducts && allProducts.length > 0) {
    // Pick 2 random products as the "search results"
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    returnedProducts = shuffled.slice(0, 2);
  } else {
    message = 'Product not found';
  }
  
  res.status(200).json({
    success: true,
    message: message,
    data: {
      uploadedImage: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      products: returnedProducts
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
});

// Homepage Sections Endpoints
const getSectionProducts = (db, count) => {
  const products = db.get('products').value() || [];
  // Shuffle array and pick 'count' items
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

server.get('/featured-products', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Featured products fetched successfully",
    data: getSectionProducts(router.db, 8),
    meta: { timestamp: new Date().toISOString() }
  });
});

server.get('/trending-products', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Trending products fetched successfully",
    data: getSectionProducts(router.db, 8),
    meta: { timestamp: new Date().toISOString() }
  });
});

server.get('/new-arrivals', (req, res) => {
  res.status(200).json({
    success: true,
    message: "New arrivals fetched successfully",
    data: getSectionProducts(router.db, 8),
    meta: { timestamp: new Date().toISOString() }
  });
});

server.get('/you-may-also-like', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Suggested products fetched successfully",
    data: getSectionProducts(router.db, 8),
    meta: { timestamp: new Date().toISOString() }
  });
});

// Global override for standardizing all json-server default responses
router.render = (req, res) => {
  // Prevent double wrapping if data is already in standard format
  if (res.locals.data && typeof res.locals.data === 'object' && 'success' in res.locals.data) {
    // Optionally dynamically update the timestamp so it's always current
    if (res.locals.data.meta && res.locals.data.meta.timestamp) {
      res.locals.data.meta.timestamp = new Date().toISOString();
    }
    return res.json(res.locals.data);
  }

  const meta = {
    timestamp: new Date().toISOString()
  };
  
  // Add pagination info if this was a paginated request
  if (res.locals._page) {
    const totalCount = parseInt(res.getHeader('X-Total-Count') || res.locals.data.length || 0, 10);
    const limit = res.locals._limit || 10;
    const page = res.locals._page;
    
    meta.pagination = {
      total: totalCount,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalCount / limit)
    };
  }

  res.json({
    success: res.statusCode >= 200 && res.statusCode < 400,
    message: "Success",
    data: res.locals.data,
    meta: meta
  });
};

// Map standard pagination params and enforce default pagination for products
server.use((req, res, next) => {
  let page = req.query.page || req.query._page;
  let limit = req.query.limit || req.query._limit;

  const isProductRoute = req.path === '/products' || req.path === '/search';

  if (req.path === '/search') {
    // Rewrite path so json-server fetches from the 'products' table
    req.url = req.url.replace(/^\/search/, '/products');
  }

  // Default to page 1, limit 10 for products/search if no pagination is provided
  if (isProductRoute && !page) {
    page = '1';
    limit = limit || '10';
  }
  
  if (page) {
    req.query._page = page;
    req.query._limit = limit || '10';
    
    // Save to res.locals for router.render since json-server deletes these from req.query
    res.locals._page = parseInt(page, 10);
    res.locals._limit = parseInt(req.query._limit, 10);
  }
  
  // Clean up standard queries so json-server doesn't misinterpret them
  delete req.query.page;
  delete req.query.limit;

  // Map standard searching and sorting params to json-server equivalents
  // (category and subCategory work natively as exact matches)
  if (req.query.search) {
    req.query.q = req.query.search; // Global full-text search
    delete req.query.search;
  }
  if (req.query.title) {
    req.query.title_like = req.query.title; // Partial match on title
    delete req.query.title;
  }
  if (req.query.name) {
    req.query.title_like = req.query.name; // Alias for title
    delete req.query.name;
  }
  if (req.query.sort) {
    req.query._sort = req.query.sort;
    delete req.query.sort;
  }
  if (req.query.order) {
    req.query._order = req.query.order;
    delete req.query.order;
  }
  if (req.query.rating) {
    req.query.rating_gte = req.query.rating;
    delete req.query.rating;
  }
  
  next();
});

// Use default router
server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running at http://localhost:${PORT}`);
});
