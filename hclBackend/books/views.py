from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from users.permissions import IsAdministrator
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Books


class BooksPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ListBooksView(APIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'author', 'category', 'isbn']
    ordering_fields = ['id', 'title', 'published_year', 'average_rating']

    def get(self, request):
        books = Books.objects.all()
        
        # Apply filtering
        search_query = request.query_params.get('search')
        if search_query:
            books = books.filter(
                models.Q(title__icontains=search_query) |
                models.Q(author__icontains=search_query) |
                models.Q(category__icontains=search_query) |
                models.Q(isbn__icontains=search_query)
            )
        
        category = request.query_params.get('category')
        if category:
            books = books.filter(category=category)

        ordering = request.query_params.get('ordering')
        if ordering:
            # Validate ordering field
            allowed_fields = ['id', 'title', 'published_year', 'average_rating', '-id', '-title', '-published_year', '-average_rating']
            if ordering in allowed_fields:
                books = books.order_by(ordering)
        else:
            books = books.order_by('-id') # Default to newest

        paginator = BooksPagination()
        paginated_books = paginator.paginate_queryset(books, request)
        
        books_data = [
            {
                'id': book.id,
                'title': book.title,
                'description': book.description,
                'category': book.category,
                'thumbnail': book.thumbnail,
                'num_pages': book.num_pages,
                'average_rating': book.average_rating,
                'author': book.author,
                'isbn': book.isbn,
                'published_year': book.published_year,
                'available_copies': book.available_copies,
            }
            for book in paginated_books
        ]
        
        return paginator.get_paginated_response(books_data)

class AddBook(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        data = request.data
        book = Books.objects.create(
            title=data.get('title'),
            description=data.get('description'),
            category=data.get('category'),
            thumbnail=data.get('thumbnail'),
            num_pages=data.get('num_pages', 0),
            average_rating=data.get('average_rating', 0.0),
            author=data.get('author'),
            isbn=data.get('isbn'),
            published_year=data.get('published_year'),
            available_copies=data.get('available_copies', 0)
        )
        return Response({'message': 'Book added successfully', 'book_id': book.id})

class BookDetailView(APIView):
    permission_classes = [AllowAny] # Following user's pattern for AddBook

    def get(self, request, book_id):
        try:
            book = Books.objects.get(id=book_id)
            book_data = {
                'id': book.id,
                'title': book.title,
                'description': book.description,
                'category': book.category,
                'thumbnail': book.thumbnail,
                'num_pages': book.num_pages,
                'average_rating': book.average_rating,
                'author': book.author,
                'isbn': book.isbn,
                'published_year': book.published_year,
                'available_copies': book.available_copies,
            }
            return Response(book_data)
        except Books.DoesNotExist:
            return Response({'error': 'Book not found'}, status=404)

    def put(self, request, book_id):
        try:
            book = Books.objects.get(id=book_id)
            data = request.data
            
            book.title = data.get('title', book.title)
            book.description = data.get('description', book.description)
            book.category = data.get('category', book.category)
            book.thumbnail = data.get('thumbnail', book.thumbnail)
            book.num_pages = data.get('num_pages', book.num_pages)
            book.average_rating = data.get('average_rating', book.average_rating)
            book.author = data.get('author', book.author)
            book.isbn = data.get('isbn', book.isbn)
            book.published_year = data.get('published_year', book.published_year)
            book.available_copies = data.get('available_copies', book.available_copies)
            
            book.save()
            return Response({'message': 'Book updated successfully'})
        except Books.DoesNotExist:
            return Response({'error': 'Book not found'}, status=404)

    def delete(self, request, book_id):
        try:
            book = Books.objects.get(id=book_id)
            book.delete()
            return Response({'message': 'Book deleted successfully'})
        except Books.DoesNotExist:
            return Response({'error': 'Book not found'}, status=404)


class BulkUploadBooksView(APIView):
    permission_classes = [IsAdministrator]
    
    def post(self, request):
        books_data = request.data
        
        if not isinstance(books_data, list):
            return Response(
                {'error': 'Data must be an array of books'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(books_data) == 0:
            return Response(
                {'error': 'At least one book is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_books = []
        failed_books = []
        
        for idx, book_data in enumerate(books_data):
            try:
                if not book_data.get('isbn'):
                    failed_books.append({
                        'index': idx,
                        'title': book_data.get('title', 'Unknown'),
                        'error': 'ISBN is required'
                    })
                    continue
                
                book = Books.objects.create(
                    title=book_data.get('title', ''),
                    description=book_data.get('description', ''),
                    category=book_data.get('category', ''),
                    thumbnail=book_data.get('thumbnail', ''),
                    num_pages=book_data.get('num_pages', 0),
                    average_rating=book_data.get('average_rating', 0.0),
                    author=book_data.get('author', ''),
                    isbn=book_data.get('isbn'),
                    published_year=book_data.get('published_year', ''),
                    available_copies=book_data.get('available_copies', 0)
                )
                created_books.append({
                    'id': book.id,
                    'isbn': book.isbn,
                    'title': book.title
                })
            except Exception as e:
                failed_books.append({
                    'index': idx,
                    'title': book_data.get('title', 'Unknown'),
                    'isbn': book_data.get('isbn', 'Unknown'),
                    'error': str(e)
                })
        
        return Response({
            'message': 'Bulk upload completed',
            'total': len(books_data),
            'created': len(created_books),
            'failed': len(failed_books),
            'created_books': created_books,
            'failed_books': failed_books
        }, status=status.HTTP_201_CREATED if len(created_books) > 0 else status.HTTP_400_BAD_REQUEST)


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Fetch all non-null categories
        raw_categories = Books.objects.values_list('category', flat=True).exclude(category__isnull=True)
        
        # Normalize: Trim and handle case-insensitive uniqueness
        unique_map = {}
        for cat in raw_categories:
            trimmed = cat.strip()
            if trimmed:
                unique_map[trimmed.lower()] = trimmed
        
        # Return as a sorted list
        categories_list = sorted(unique_map.values())
        return Response(categories_list)