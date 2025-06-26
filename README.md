# Walmart AI Smart Shopper

A modern Next.js web prototype for Walmart AI Smart Shopper. This app lets users input shopping needs, get AI-generated product lists (with brand alternatives), add items to a cart, and choose between online or in-store shopping. For in-store, it shows an optimized route on a store map. The AI backend uses Gemini CLI (or can be adapted for OpenAI/Hugging Face).

## Features
- **Next.js** frontend with React and Tailwind CSS
- Custom Walmart-style UI (header, buttons, product cards, etc.)
- AI-powered product suggestions (Gemini CLI backend)
- Brand alternatives and cart management
- Choose between "Buy Online" and "Shop In-Store"
- In-store mode: optimized route on a store map
- Session/local storage for cart and product state

## Folder Structure
```
/pages
  index.js         # Home page
  ai-agent.js      # AI input page
  products.js      # Product suggestions
  cart.js          # Cart summary and mode selection
  map.js           # Store map and route
  /api/gemini-cli.js # API route for Gemini CLI
/components
  ProductCard.js   # Product card UI
  CartSummary.js   # Cart summary UI
  MapOverlay.js    # Map overlay UI
/styles
  globals.css      # Tailwind + custom Walmart CSS
/public            # Static assets (store map, logo, etc.)
```

## Getting Started

### 1. Clone the repo
```sh
git clone <https://github.com/sonalyadav1/walmart-smart-shopper.git>
cd walmart-smart-shopper
```

### 2. Install dependencies
```sh
npm install
```

### 3. Set up Gemini CLI (AI backend)
- **Node.js requirement:**  
  Gemini CLI requires Node.js **v18+** (some features require v20+).  
  Check your version:
  ```sh
  node -v
  ```
  If you need to upgrade, use [nvm](https://github.com/nvm-sh/nvm):
  ```sh
  nvm install 20
  nvm use 20
  ```

- **Install Gemini CLI (choose one method):**
  - **Via npm (recommended for Node.js users):**
    ```sh
    npm install -g @google/gemini-cli
    ```
  - **Via npx (one-time run):**
    ```sh
    npx https://github.com/google-gemini/gemini-cli
    ```
  - **Via pip (Python, alternative):**
    ```sh
    pip install -U google-generativeai[cli]
    ```

- **Authenticate Gemini CLI:**
  ```sh
  gemini login
  ```
  Follow the prompts to authenticate with your Google account and set up your API key.

- **Verify installation:**
  ```sh
  gemini --help
  ```
  You should see the Gemini CLI help output.

- **Example command to test Gemini CLI:**
  ```sh
  echo "Suggest a JSON array of Walmart products for cleaning my room and bathroom. Each product should have name, brand, price, and aisle. Only return the JSON array." | gemini
  ```

#### Troubleshooting
- If you see errors like `Unsupported engine ... required: { node: '>=18' } ... current: { node: 'v16.x.x' }`, upgrade Node.js and reinstall Gemini CLI.
- If `gemini` is not found after switching Node versions, reinstall Gemini CLI globally with `npm install -g @google/gemini-cli`.
- For more help, see the [official Gemini CLI docs](https://ai.google.dev/gemini-api/docs/cli).

- The backend API route `/api/gemini-cli.js` will call Gemini CLI using Node.js

### 4. Run the app
```sh
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

## Usage
- Go to the home page and try the AI Agent
- Enter a short shopping need (e.g., "ingredients for white sauce pasta")
- The AI will return a JSON array of Walmart products (name, brand, price, aisle)
- Add products to your cart, swap brands, and choose shopping mode
- In-store mode shows a map and optimized route

## Customization
- UI is styled with Tailwind CSS and custom classes in `/styles/globals.css`
- You can adapt the AI backend to use OpenAI or Hugging Face by editing `/api/gemini-cli.js`

## Notes
- No API keys are stored in the repo; Gemini CLI must be set up locally
- For best results, use Node.js 18+ and a modern browser
- Unused files/assets have been removed for a clean codebase

## License
MIT
