# WhatsApp B2B Order Chatbot Platform

Production-style starter for a B2B SaaS WhatsApp ordering chatbot using:
- Node.js + Express
- MongoDB + Mongoose
- Twilio WhatsApp API
- Gemini API (intent extraction)
- React + Tailwind dashboard
- JWT auth

## Architecture

### Roles
- Platform admin
- Business client
- End customer on WhatsApp

### Key design rule
Gemini is used only for intent/entity extraction. Order creation is always controlled by backend state machine + DB validation.

## Backend folder structure

`backend/src/`
- `config/db.js`
- `models/` (`User`, `Business`, `Product`, `Customer`, `ChatSession`, `Order`, `Message`)
- `controllers/` (auth, business, products, orders, customers, messages, webhook)
- `services/` (`geminiService`, `chatbotService`, `orderService`, `twilioService`)
- `routes/`
- `middleware/`
- `utils/`
- `app.js`, `server.js`

## Frontend folder structure

`frontend/src/`
- `components/` (`Sidebar`, `Navbar`, `ProductForm`, `OrderTable`, `ChatWindow`)
- `pages/` (`Login`, `Register`, `Dashboard`, `Products`, `Orders`, `OrderDetails`, `Customers`, `Chats`, `Settings`)
- `services/api.js`
- `context/AuthContext.jsx`
- `App.jsx`, `main.jsx`

## Required environment variables

Copy `.env.example` to `.env` and update values.

```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/whatsapp_b2b
JWT_SECRET=change_me_jwt
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.0-flash
DEFAULT_TWILIO_ACCOUNT_SID=
DEFAULT_TWILIO_AUTH_TOKEN=
DEFAULT_TWILIO_WHATSAPP_NUMBER=
TWILIO_VALIDATE_SIGNATURE=false
CORS_ORIGIN=http://localhost:5173
```

## Run locally

### 1) Start MongoDB

```bash
docker compose up -d
```

### 2) Start backend

```bash
cd backend
npm install
npm run dev
```

### 3) Start frontend

```bash
cd frontend
npm install
npm run dev
```

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/business`
- `GET /api/business/me`
- `PUT /api/business/:id`
- `POST /api/products`
- `GET /api/products`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PUT /api/orders/:id/status`
- `GET /api/orders/analytics/summary`
- `GET /api/customers`
- `GET /api/customers/:id`
- `GET /api/messages/:customerId`
- `POST /api/messages/:customerId/reply`
- `GET /api/knowledge`
- `POST /api/knowledge`
- `PUT /api/knowledge/:id`
- `DELETE /api/knowledge/:id`
- `POST /webhook/twilio/whatsapp`

## Twilio WhatsApp sandbox setup

1. In Twilio Console, enable WhatsApp Sandbox.
2. Add webhook URL for incoming messages:
   - `https://<your-domain>/webhook/twilio/whatsapp`
3. Set method to `POST`.
4. Put sandbox sender number in `twilioWhatsappNumber` (business settings).
6. Add your Gemini API key in business settings under "Gemini API Key" or via `GEMINI_API_KEY`.
5. Test message flow from WhatsApp:
   - `Hi`
   - `1`
   - `2`
   - `<address>`
   - `1` to confirm.

## Example webhook test (local JSON simulation)

```bash
curl -X POST http://localhost:5000/webhook/twilio/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"From":"whatsapp:+919999999999","To":"whatsapp:+14155238886","Body":"Hi","MessageSid":"SM123"}'
```

## Notes

- Never expose Twilio Auth Token or Gemini key to frontend.
- Business APIs are JWT-protected.
- Multi-tenant access control is enforced by `businessId` checks.
- This is a strong MVP base and can be extended with queues, retries, and audit logs for enterprise usage.
