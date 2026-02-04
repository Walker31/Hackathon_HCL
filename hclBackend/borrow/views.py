from datetime import timedelta
from django.utils import timezone
from .models import BorrowRecord
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsStudent, IsAdministrator
from django.contrib.auth import get_user_model
from books.models import Books
from users.models import Student
from django.db.models import Sum, Q
import django.db.models as models

User = get_user_model()

class BorrowPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class BorrowBookView(APIView):

    def get(self, request):
        if request.user.role == 'administrator':
            user_id = request.query_params.get('user_id')
            if user_id:
                borrow_records = BorrowRecord.objects.filter(user_id=user_id).order_by('-created_at')
            else:
                borrow_records = BorrowRecord.objects.all().order_by('-created_at')
        else:
            borrow_records = BorrowRecord.objects.filter(user_id=request.user.id).order_by('-created_at')
        
        # Apply filtering by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            borrow_records = borrow_records.filter(status=status_filter)

        paginator = BorrowPagination()
        paginated_records = paginator.paginate_queryset(borrow_records, request)

        records_data = []
        # FIX: Iterate over paginated_records instead of borrow_records
        for record in paginated_records:
            try:
                book = Books.objects.get(id=record.book_id)
                book_data = {
                    "id": book.id,
                    "title": book.title,
                    "description": book.description,
                    "category": book.category,
                    "thumbnail": book.thumbnail,
                    "num_pages": book.num_pages,
                    "average_rating": book.average_rating,
                    "author": book.author,
                    "isbn": book.isbn,
                    "published_year": book.published_year,
                    "available_copies": book.available_copies,
                }
            except Books.DoesNotExist:
                book_data = None

            records_data.append(
                {
                    "id": record.id,
                    "user_id": record.user_id,
                    "book_id": record.book_id,
                    "book": book_data,
                    "borrow_date": record.borrow_date,
                    "return_date": record.return_date,
                    "due_date": record.due_date,
                    "fine_amount": str(record.fine_amount),
                    "status": record.status,
                    "created_at": record.created_at,
                }
            )

        return paginator.get_paginated_response(records_data)

    def post(self, request):
        """Borrow a book"""
        book_id = request.data.get("book_id")
        user_id = request.data.get("user_id")

        if not book_id:
            return Response(
                {"error": "book_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            book = Books.objects.get(id=book_id)
        except Books.DoesNotExist:
            return Response(
                {"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if book.available_copies <= 0:
            return Response(
                {"error": "Book is not available"}, status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if student is approved
        try:
            student = Student.objects.get(user__id=user_id)
            if not student.is_approved:
                return Response(
                    {"error": "Your account is pending approval by an administrator. You cannot borrow books yet."},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Student.DoesNotExist:
            if request.user.role == 'student':
                return Response(
                    {"error": "Student profile not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        existing_borrow = BorrowRecord.objects.filter(
            user_id=request.user.id, book_id=book_id, status="borrowed"
        ).exists()

        if existing_borrow:
            return Response(
                {"error": "You already have this book borrowed"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        borrow_record = BorrowRecord.objects.create(
            user_id=request.user.id, 
            book_id=book_id, 
            status="borrowed",
            due_date=timezone.now().date() + timedelta(days=14)
        )

        book.available_copies -= 1
        book.save()

        response_data = {
            "id": borrow_record.id,
            "user_id": borrow_record.user_id,
            "book_id": borrow_record.book_id,
            "borrow_date": borrow_record.borrow_date,
            "due_date": borrow_record.due_date,
            "return_date": borrow_record.return_date,
            "fine_amount": str(borrow_record.fine_amount),
            "status": borrow_record.status,
            "created_at": borrow_record.created_at,
            "message": "Book borrowed successfully",
        }

        return Response(response_data, status=status.HTTP_201_CREATED)

class ReturnBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, borrow_id):
        try:
            record = BorrowRecord.objects.get(id=borrow_id, user_id=request.user.id, status='borrowed')
            record.status = 'returned'
            record.return_date = timezone.now().date()
            record.save()
            
            book = Books.objects.get(id=record.book_id)
            book.available_copies += 1
            book.save()
            
            return Response({"message": "Book returned successfully"})
        except BorrowRecord.DoesNotExist:
            return Response({"error": "Borrow record not found or already returned"}, status=404)


class RenewBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, borrow_id):
        try:
            record = BorrowRecord.objects.get(id=borrow_id, user_id=request.user.id, status='borrowed')
            record.due_date = timezone.now().date() + timedelta(days=14)
            record.save()
            
            return Response({"message": "Book renewed successfully", "new_due_date": record.due_date})
        except BorrowRecord.DoesNotExist:
            return Response({"error": "Borrow record not found"}, status=404)


class BorrowHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        borrow_records = BorrowRecord.objects.filter(user_id=request.user.id).order_by('-created_at')
        
        paginator = BorrowPagination()
        paginated_records = paginator.paginate_queryset(borrow_records, request)

        records_data = []
        for record in paginated_records:
            try:
                book = Books.objects.get(id=record.book_id)
                book_title = book.title
            except Books.DoesNotExist:
                book_title = "Unknown"

            records_data.append({
                "id": record.id,
                "book_id": record.book_id,
                "book_title": book_title,
                "borrow_date": record.borrow_date,
                "return_date": record.return_date,
                "due_date": record.due_date,
                "status": record.status,
                "fine_amount": str(record.fine_amount),
                "created_at": record.created_at,
            })

        return paginator.get_paginated_response(records_data)

class StudentOverviewStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now().date()
        borrows = BorrowRecord.objects.filter(user_id=request.user.id)
        
        borrowed_count = borrows.filter(status='borrowed').count()
        overdue_count = borrows.filter(
            models.Q(status='overdue') | 
            (models.Q(status='borrowed') & models.Q(due_date__lt=now))
        ).count()
        
        # Sum total fines from Student model
        try:
            student = Student.objects.get(user__id=request.user.id)
            total_fines = float(student.total_fines)
        except Student.DoesNotExist:
            total_fines = 0.0

        # Recent activities
        recent = borrows.order_by('-created_at')[:5]
        activities = []
        for r in recent:
            try:
                book = Books.objects.get(id=r.book_id)
                activities.append({
                    "title": book.title,
                    "status": r.status,
                    "date": r.created_at.strftime("%b %d, %Y")
                })
            except:
                continue

        return Response({
            "borrowedCount": borrowed_count,
            "overdueCount": overdue_count,
            "totalFines": total_fines,
            "activities": activities
        })
