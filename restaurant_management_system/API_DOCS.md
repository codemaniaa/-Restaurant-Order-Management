# Restaurant Management System — API Reference

Base URL: `http://localhost:8000/api`

All protected endpoints require the header:
```
Authorization: Bearer <access_token>
```

---

## 1. Authentication

### Login
```
POST /auth/login/
Body: { "username": "admin", "password": "admin123" }
Response:
{
  "access": "<jwt_access_token>",
  "refresh": "<jwt_refresh_token>",
  "user": { "id": 1, "username": "admin", "full_name": "Admin User", "role": "admin" }
}
```

### Refresh Token
```
POST /auth/token/refresh/
Body: { "refresh": "<refresh_token>" }
Response: { "access": "<new_access_token>" }
```

### Logout (blacklists refresh token)
```
POST /auth/logout/
Body: { "refresh": "<refresh_token>" }
```

### Get Current User
```
GET /auth/me/
Response: { "id": 1, "username": "admin", "full_name": "...", "role": "admin" }
```

### Change Password
```
POST /auth/change-password/
Body: { "old_password": "...", "new_password": "..." }
```

### List / Create Users (Admin only)
```
GET  /auth/users/
POST /auth/users/
Body: { "username": "chef2", "full_name": "...", "role": "chef", "password": "...", "password2": "..." }
```

### Get / Update / Delete User (Admin only)
```
GET    /auth/users/<id>/
PATCH  /auth/users/<id>/
DELETE /auth/users/<id>/
```

---

## 2. Menu — Categories

### List all categories
```
GET /menu/categories/
GET /menu/categories/?search=drinks
```

### Create category (Admin only)
```
POST /menu/categories/
Body: { "name": "Starters", "description": "..." }
```

### Get / Update / Delete category (Admin only)
```
GET    /menu/categories/<id>/
PATCH  /menu/categories/<id>/
DELETE /menu/categories/<id>/
```

---

## 3. Menu — Items

### List all items (supports filtering & search)
```
GET /menu/items/
GET /menu/items/?category=1&is_available=true
GET /menu/items/?search=chicken
GET /menu/items/?ordering=-price
```

### List available items only (used by order creation UI)
```
GET /menu/items/available/
```

### Create item (Admin only)
```
POST /menu/items/
Body (multipart/form-data):
  name         = "Grilled Salmon"
  category     = 2
  description  = "Fresh Atlantic salmon"
  price        = 18.50
  is_available = true
  image        = <file upload — optional>
```

### Get / Update / Delete item (Admin only)
```
GET    /menu/items/<id>/
PATCH  /menu/items/<id>/
DELETE /menu/items/<id>/
```

### Toggle availability (Admin only)
```
PATCH /menu/items/<id>/toggle-availability/
Response: { "id": 3, "is_available": false }
```

---

## 4. Orders

### Create order (Admin only)
```
POST /orders/
Body:
{
  "customer_name": "John Smith",
  "customer_phone": "555-1234",
  "notes": "Table 4, no onions",
  "payment_status": "unpaid",
  "items": [
    { "menu_item": 3, "quantity": 2 },
    { "menu_item": 6, "quantity": 1 }
  ]
}
Response: Full OrderDetail with auto-calculated total_price
```

### List all orders (Admin only — filterable)
```
GET /orders/
GET /orders/?status=pending
GET /orders/?payment_status=unpaid
GET /orders/?date_from=2024-01-01&date_to=2024-01-31
GET /orders/?search=John
GET /orders/?ordering=-created_at
GET /orders/?page=2
```

### Get order detail
```
GET /orders/<id>/
Response: Full order with nested items, status history, staff info
```

### Update order info (Admin only)
```
PATCH /orders/<id>/
Body: { "customer_name": "...", "notes": "...", "payment_status": "paid" }
```

---

## 5. Order Status Management

### Update order status (Admin or Chef)
```
PATCH /orders/<id>/update-status/
Body: { "status": "confirmed", "note": "Confirmed by admin" }

Allowed transitions:
  pending   → confirmed | cancelled
  confirmed → preparing | cancelled
  preparing → ready
  ready     → delivered
  delivered → (terminal)
  cancelled → (terminal)
```

### Update payment status (Admin only)
```
PATCH /orders/<id>/update-payment/
Body: { "payment_status": "paid" }
Values: unpaid | paid | partially_paid
```

### Get status history for one order
```
GET /orders/<id>/status-history/
Response: [{ "old_status": "pending", "new_status": "confirmed", "changed_by_name": "admin", "changed_at": "..." }]
```

---

## 6. Chef Kitchen Panel

### Kitchen queue (confirmed + preparing, oldest first)
```
GET /orders/kitchen-queue/
```

### Pending orders
```
GET /orders/pending/
```

**Typical chef workflow:**
1. GET `/orders/kitchen-queue/` — see the queue
2. PATCH `/orders/<id>/update-status/` with `{ "status": "preparing" }` — start cooking
3. PATCH `/orders/<id>/update-status/` with `{ "status": "ready" }` — food is ready
4. PATCH `/orders/<id>/update-status/` with `{ "status": "delivered" }` — order delivered

---

## 7. Order History & Reports

### All delivered orders (Admin only — filterable)
```
GET /orders/delivered/
GET /orders/delivered/?date_from=2024-01-01&date_to=2024-01-31
```

### Full order history (Admin only)
```
GET /orders/history/
GET /orders/history/?status=delivered&date_from=2024-01-01
```

---

## Sample Users (seeded)

| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | admin    | admin123  |
| Chef  | chef     | chef123   |

---

## Setup & Run Commands

```bash
# 1. Clone / navigate to project
cd restaurant_management_system

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run migrations
python manage.py migrate

# 5. (Optional) Create superuser
python manage.py createsuperuser

# 6. Start development server
python manage.py runserver

# Admin panel: http://localhost:8000/admin/
```
