# Walmart AI Smart Shopper

A modern full-stack web application for Walmart AI Smart Shopper. This app features a Next.js frontend and Express.js backend with MongoDB, allowing users to input shopping needs in natural language and get AI-generated product suggestions from a real product database. Users can add items to cart and manage their shopping experience.

## Features
- **Next.js** frontend with React and custom Walmart-style UI
- **Express.js** backend with MongoDB database
- **AI-powered product suggestions** using Groq API (Llama model)
- **Real product matching** from database with intelligent search
- **Smart ingredient parsing** for cooking recipes and meal planning
- **Product alternatives** and brand suggestions
- **Cart management** with session storage
- **Responsive design** with custom Walmart styling

## Tech Stack
- **Frontend**: Next.js, React, CSS
- **Backend**: Express.js, Node.js
- **Database**: MongoDB with Mongoose
- **AI**: Groq API (Meta LLaMA model)
- **Image Upload**: Cloudinary integration
- **File Upload**: Multer middleware

## Project Structure
```
/pages                 # Next.js frontend pages
  index.js            # Home page
  ai-agent.js         # AI input page
  products.js         # Product suggestions display
  cart.js             # Shopping cart
  map.js              # Store map (if applicable)
  /api
    gemini-cli.js     # API route (legacy)

/Backend              # Express.js backend
  index.js            # Main server file
  connectDB.js        # MongoDB connection
  /Controllers
    productController.js # AI and product logic
    multer.js           # File upload middleware
    cloudinary.js       # Image upload configuration
  /Model
    productModel.js     # MongoDB product schema
  /Route
    productroute.js     # API routes

/components           # React components
  ProductCard.js      # Product display cards
  CartSummary.js      # Cart summary component
  MapOverlay.js       # Map interface

/styles               # CSS styling
  globals.css         # Global styles with Walmart theme

/public              # Static assets
  *.svg              # Logo and icon files
  store-map.png      # Store layout image
```

## Getting Started

### Prerequisites
- **Node.js** v18+ 
- **MongoDB** (local or MongoDB Atlas)
- **Groq API Key** (for AI functionality)

### 1. Clone the repository
```sh
git clone https://github.com/sonalyadav1/walmart-smart-shopper.git
cd walmart-smart-shopper
```

### 2. Install Frontend Dependencies
```sh
npm install
```

### 3. Install Backend Dependencies
```sh
cd Backend
npm install
cd ..
```

### 4. Set up Environment Variables
Create a `.env` file in the `Backend` directory:
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/walmart-smart-shopper
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/walmart-smart-shopper

# Groq API Key (for AI functionality)
GROQ_API_KEY=your_groq_api_key_here

# Cloudinary (for image uploads - optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Server Port (optional, defaults to 3000)
PORT=3000
```

### 5. Set up Database
- Install MongoDB locally or create a MongoDB Atlas account
- The application will automatically create the required collections
- Optional: Add sample products to the database using the bulk create endpoint

### 6. Run the Application

**Terminal 1 - Backend Server:**
```sh
cd Backend
npm run dev
```
The backend will run on `http://localhost:3000`

**Terminal 2 - Frontend Server:**
```sh
npm run dev
```
The frontend will run on `http://localhost:3001` (or next available port)
## API Endpoints

### Backend Routes (`http://localhost:3000/api/`)

- **POST** `/suggest` - Get AI product suggestions
  ```json
  {
    "prompt": "ingredients for white sauce pasta"
  }
  ```

- **POST** `/bulk` - Create multiple products (admin)
- **POST** `/generate-products` - Generate products via AI
- **POST** `/upload-test` - Test file upload functionality

## Usage

### 1. Access the Application
- Open your browser and go to `http://localhost:3001`
- Click on "AI Smart Shopper" or navigate to the AI agent page

### 2. Get Product Suggestions
- Enter your shopping need in natural language:
  - "ingredients for white sauce pasta"
  - "cleaning supplies for kitchen"
  - "healthy breakfast options for 2 people"
  - "baking ingredients for chocolate cake"

### 3. How It Works
1. **AI Processing**: Your request is sent to the Groq API (LLaMA model)
2. **Product Matching**: AI response is matched against the product database
3. **Smart Suggestions**: Products are prioritized by relevance, price, and availability
4. **Results Display**: Matching products are displayed with details and alternatives

## Key Features

### AI-Powered Search
- Natural language processing for shopping requests
- Intelligent ingredient parsing for recipes
- Context-aware product suggestions
- Handles quantities, dietary preferences, and occasions

### Smart Product Matching
- Fuzzy string matching for product names
- Hashtag-based categorization
- Synonym recognition for common ingredients
- Price and quantity optimization

### Database Integration
- MongoDB with Mongoose ODM
- Product model with categories, prices, and metadata
- Efficient querying and indexing
- Scalable data structure

## Development

### Adding Sample Products
You can add products to the database using the bulk create endpoint:

```sh
curl -X POST http://localhost:3000/api/bulk \
  -H "Content-Type: application/json" \
  -d '[
    {
      "name": "Organic Pasta",
      "category": "Grocery",
      "price": 2.99,
      "description": "Organic whole wheat pasta",
      "hashtags": "pasta, organic, whole wheat, italian",
      "imageUrl": "/images/pasta.jpg",
      "quantity": "500g"
    }
  ]'
```

### Environment Configuration
- The app uses environment variables for sensitive data
- AI functionality requires a valid Groq API key
- Database connection can be local MongoDB or MongoDB Atlas

## Troubleshooting

### Common Issues
1. **Backend not starting**: Check MongoDB connection and environment variables
2. **AI not working**: Verify Groq API key in `.env` file
3. **Frontend API errors**: Ensure backend is running on port 3000
4. **Port conflicts**: Frontend will auto-assign next available port

### Development Tips
- Use browser dev tools to monitor network requests
- Check backend console for detailed AI processing logs
- MongoDB Compass can help visualize database content
- Test individual API endpoints with curl or Postman

## License
MIT
