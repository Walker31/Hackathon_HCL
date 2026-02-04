from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Student, Administrator
from books.models import Books
from borrow.models import BorrowRecord
from datetime import timedelta
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Load dummy data into the database'

    def handle(self, *args, **kwargs):
        self.stdout.write("Loading dummy data...")
        
        # Create admin user
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_user(
                username='admin',
                email='admin@nitt.edu',
                password='admin123',
                first_name='Admin',
                last_name='User',
                role='administrator',
                is_active=True
            )
            Administrator.objects.create(user=admin)
            self.stdout.write(self.style.SUCCESS('✓ Created admin user'))
        
        # Create sample student users
        students_data = [
            {'username': 'student1', 'email': 'student1@nitt.edu', 'first_name': 'Aditya', 'last_name': 'Kumar', 'roll': '1001', 'dept': 'CSE'},
            {'username': 'student2', 'email': 'student2@nitt.edu', 'first_name': 'Priya', 'last_name': 'Singh', 'roll': '1002', 'dept': 'ECE'},
            {'username': 'student3', 'email': 'student3@nitt.edu', 'first_name': 'Raj', 'last_name': 'Patel', 'roll': '1003', 'dept': 'Mechanical'},
            {'username': 'student4', 'email': 'student4@nitt.edu', 'first_name': 'Sara', 'last_name': 'Ahmed', 'roll': '1004', 'dept': 'Civil'},
            {'username': 'student5', 'email': 'student5@nitt.edu', 'first_name': 'Vikram', 'last_name': 'Sharma', 'roll': '1005', 'dept': 'EEE'},
        ]
        
        for student_data in students_data:
            if not User.objects.filter(username=student_data['username']).exists():
                user = User.objects.create_user(
                    username=student_data['username'],
                    email=student_data['email'],
                    password='password123',
                    first_name=student_data['first_name'],
                    last_name=student_data['last_name'],
                    role='student',
                    is_active=True
                )
                Student.objects.create(
                    user=user,
                    roll_number=student_data['roll'],
                    department=student_data['dept'],
                    is_approved=True
                )
        
        self.stdout.write(self.style.SUCCESS('✓ Created 5 student users'))
        
        # Create dummy books
        books_data = [
            {'title': 'The Great Gatsby', 'author': 'F. Scott Fitzgerald', 'category': 'Fiction', 'isbn': '978-0743273565', 'copies': 5, 'year': 1925},
            {'title': 'To Kill a Mockingbird', 'author': 'Harper Lee', 'category': 'Fiction', 'isbn': '978-0061120084', 'copies': 4, 'year': 1960},
            {'title': '1984', 'author': 'George Orwell', 'category': 'Fiction', 'isbn': '978-0451524935', 'copies': 6, 'year': 1949},
            {'title': 'Pride and Prejudice', 'author': 'Jane Austen', 'category': 'Romance', 'isbn': '978-0141439518', 'copies': 3, 'year': 1813},
            {'title': 'The Catcher in the Rye', 'author': 'J.D. Salinger', 'category': 'Fiction', 'isbn': '978-0316769174', 'copies': 4, 'year': 1951},
            {'title': 'Clean Code', 'author': 'Robert C. Martin', 'category': 'Technology', 'isbn': '978-0132350884', 'copies': 7, 'year': 2008},
            {'title': 'Design Patterns', 'author': 'Gang of Four', 'category': 'Technology', 'isbn': '978-0201633610', 'copies': 3, 'year': 1994},
            {'title': 'Python Crash Course', 'author': 'Eric Matthes', 'category': 'Technology', 'isbn': '978-1593275906', 'copies': 8, 'year': 2015},
            {'title': 'The Art of Computer Programming', 'author': 'Donald Knuth', 'category': 'Technology', 'isbn': '978-0201896831', 'copies': 2, 'year': 1968},
            {'title': 'Sapiens', 'author': 'Yuval Noah Harari', 'category': 'History', 'isbn': '978-0062316097', 'copies': 5, 'year': 2011},
            {'title': 'Thinking, Fast and Slow', 'author': 'Daniel Kahneman', 'category': 'Psychology', 'isbn': '978-0374275631', 'copies': 4, 'year': 2011},
            {'title': 'The Lean Startup', 'author': 'Eric Ries', 'category': 'Business', 'isbn': '978-0307887894', 'copies': 6, 'year': 2011},
            {'title': 'Atomic Habits', 'author': 'James Clear', 'category': 'Self-Help', 'isbn': '978-0735211292', 'copies': 9, 'year': 2018},
            {'title': 'The Psychology of Money', 'author': 'Morgan Housel', 'category': 'Finance', 'isbn': '978-0857197688', 'copies': 7, 'year': 2020},
            {'title': 'Dune', 'author': 'Frank Herbert', 'category': 'Science Fiction', 'isbn': '978-0441172719', 'copies': 5, 'year': 1965},
            {'title': 'Neuromancer', 'author': 'William Gibson', 'category': 'Science Fiction', 'isbn': '978-0441569595', 'copies': 3, 'year': 1984},
            {'title': 'The Hobbit', 'author': 'J.R.R. Tolkien', 'category': 'Fantasy', 'isbn': '978-0547928227', 'copies': 6, 'year': 1937},
            {'title': 'Harry Potter and the Sorcerer\'s Stone', 'author': 'J.K. Rowling', 'category': 'Fantasy', 'isbn': '978-0439708180', 'copies': 8, 'year': 1997},
            {'title': 'The Alchemist', 'author': 'Paulo Coelho', 'category': 'Fiction', 'isbn': '978-0061233846', 'copies': 5, 'year': 1988},
            {'title': 'Educated', 'author': 'Tara Westover', 'category': 'Biography', 'isbn': '978-0399590504', 'copies': 4, 'year': 2018},
        ]
        
        created_count = 0
        for book_data in books_data:
            if not Books.objects.filter(isbn=book_data['isbn']).exists():
                Books.objects.create(
                    title=book_data['title'],
                    author=book_data['author'],
                    category=book_data['category'],
                    isbn=book_data['isbn'],
                    available_copies=book_data['copies'],
                    published_year=book_data['year'],
                    description=f"A great book by {book_data['author']}. This is one of the most popular books in the {book_data['category']} category.",
                    thumbnail=f"https://via.placeholder.com/300x400?text={book_data['title'][:15]}",
                    num_pages=250 + hash(book_data['isbn']) % 500,
                    average_rating=4.0 + (hash(book_data['isbn']) % 10) / 10
                )
                created_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {created_count} books'))
        
        # Create some sample borrow records
        students = Student.objects.filter(is_approved=True)[:3]
        books = Books.objects.all()[:5]
        
        borrow_count = 0
        for idx, student in enumerate(students):
            for book_idx in range(2):
                if book_idx < len(books):
                    book = books[book_idx]
                    if book.available_copies > 0:
                        borrow_date = timezone.now().date() - timedelta(days=5 - idx)
                        due_date = borrow_date + timedelta(days=14)
                        
                        BorrowRecord.objects.create(
                            user=student.user,
                            book=book,
                            borrow_date=borrow_date,
                            due_date=due_date,
                            status='borrowed'
                        )
                        book.available_copies -= 1
                        book.save()
                        borrow_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {borrow_count} borrow records'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Dummy data loaded successfully!'))
        self.stdout.write(self.style.WARNING('\nTest Credentials:'))
        self.stdout.write('Admin: admin / admin123')
        self.stdout.write('Student: student1 / password123')
