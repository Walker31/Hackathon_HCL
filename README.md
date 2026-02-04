# HCL Library Management System

A full-stack library management application built with React and Django, featuring user authentication, book inventory management, and borrowing functionality.

## 🌟 Features

- **User Authentication**: Secure login and registration system
- **Book Inventory Management**: Add, update, and manage library books
- **Student Dashboard**: Browse available books and manage borrowings
- **Administrator Panel**: Manage book inventory and student accounts
- **Borrowing System**: Track book borrowings and due dates
- **Search Functionality**: Find books by various criteria
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **ESLint** - Code linting

### Backend
- **Django** - Web framework
- **Django REST Framework** - REST API
- **SQLite/PostgreSQL** - Database
- **Python 3.10+** - Runtime

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- Python 3.10+
- Docker and Docker Compose (optional, for containerized setup)

## 🚀 Quick Start

### Backend Setup

```bash
cd hclBackend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Load sample data
python manage.py load_dummy_data

# Start the server
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🐳 Docker Setup

Run the entire application stack with Docker Compose:

```bash
docker-compose up --build
```

Services will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

## 📁 Project Structure

```
HCL_Hackathon/
├── Frontend/                 # React frontend application
│   ├── src/
│   │   ├── Components/       # Reusable components
│   │   ├── Pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── context/          # React context (Auth)
│   │   └── styles/           # CSS files
│   └── package.json
├── hclBackend/               # Django backend
│   ├── admin/                # Admin functionality
│   ├── books/                # Book management
│   ├── borrow/               # Borrowing system
│   ├── users/                # User management
│   ├── manage.py
│   └── requirements.txt
└── docker-compose.yml
```

## 🔑 Authentication

The application uses JWT-based authentication for API requests. Login credentials are validated through the Django backend, and tokens are stored on the client side.

## 📚 API Endpoints

### Books
- `GET /api/books/` - List all books
- `POST /api/books/` - Create a new book (Admin only)
- `GET /api/books/{id}/` - Get book details
- `PUT /api/books/{id}/` - Update book (Admin only)
- `DELETE /api/books/{id}/` - Delete book (Admin only)

### Borrowing
- `GET /api/borrow/` - List borrowings
- `POST /api/borrow/` - Create new borrowing
- `PUT /api/borrow/{id}/` - Return book

### Users
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - User login

## 🧪 Testing

### Backend Tests
```bash
cd hclBackend
pytest
```

### Frontend Tests
```bash
cd Frontend
npm test
```

## 📝 Environment Variables

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
```development team or create an issue in the repository.

---

**Last Updated**: February 4, 2026
