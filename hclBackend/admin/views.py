from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from users.models import RegistrationRequest, Student
from users.permissions import IsAdministrator
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q, Sum
from borrow.models import BorrowRecord
from books.models import Books

User = get_user_model()


class AdminPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class PendingStudentRegistrationsView(APIView):
    permission_classes = [IsAdministrator]
    
    def get(self, request):
        if request.user.role != 'administrator':
            return Response(
                {'error': 'Only administrators can view pending registrations'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        pending_students = Student.objects.filter(is_approved=False).select_related('user')
        paginator = AdminPagination()
        paginated_students = paginator.paginate_queryset(pending_students, request)
        
        registrations_data = []
        for student in paginated_students:
            registrations_data.append({
                'id': student.id,
                'email': student.user.email,
                'name': f"{student.user.first_name} {student.user.last_name}".strip() or student.user.username,
                'roll_number': student.roll_number,
                'phone': student.phone,
                'department': student.department,
                'status': 'pending',
                'created_at': student.created_at,
            })
        
        return paginator.get_paginated_response(registrations_data)


class ApproveRejectStudentView(APIView):
    permission_classes = [IsAdministrator]
    
    def post(self, request, registration_id):
        if request.user.role != 'administrator':
            return Response(
                {'error': 'Only administrators can approve/reject registrations'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            student = Student.objects.select_related('user').get(id=registration_id)
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if student.is_approved:
            return Response(
                {'error': 'Student is already approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        action = request.data.get('action')
        
        if action == 'approve':
            try:
                student.is_approved = True
                student.save()
                
                # Activate the user
                user = student.user
                user.is_active = True
                user.save()
                
                return Response({
                    'message': 'Student registration approved',
                    'email': user.email,
                    'status': 'approved'
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        elif action == 'reject':
            # For rejection, we might want to delete the user or keep it as unapproved
            # For now, let's just mark it as rejected (we could add a status field to Student)
            # But the current Student model doesn't have 'status'.
            # Let's just delete the user and student if rejected to keep it clean.
            try:
                user = student.user
                user.delete() # Casacades to student
                return Response({
                    'message': 'Student registration rejected and account deleted',
                    'status': 'rejected'
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        else:
            return Response(
                {'error': 'Action must be "approve" or "reject"'},
                status=status.HTTP_400_BAD_REQUEST
            )


class StudentsDueListView(APIView):
    permission_classes = [IsAdministrator]
    
    def get(self, request):
        if request.user.role != 'administrator':
            return Response(
                {'error': 'Only administrators can view student dues'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        students = Student.objects.filter(is_approved=True).select_related('user')
        
        students_data = []
        for student in students:
            borrowed_count = BorrowRecord.objects.filter(user_id=student.user.id, status='borrowed').count()
            students_data.append({
                'id': student.id,
                'user_id': student.user.id,
                'username': student.user.username,
                'email': student.user.email,
                'first_name': student.user.first_name,
                'last_name': student.user.last_name,
                'roll_number': student.roll_number,
                'phone': student.phone,
                'department': student.department,
                'total_fines': str(student.total_fines),
                'borrowed_count': borrowed_count,
                'created_at': student.created_at,
                'status': 'Active' if student.is_approved else 'Pending'
            })
        
        min_due = request.query_params.get('min_due')
        if min_due:
            try:
                min_due = float(min_due)
                students_data = [s for s in students_data if float(s['total_fines']) >= min_due]
            except ValueError:
                pass
        
        students_data.sort(key=lambda x: float(x['total_fines']), reverse=True)
        
        total_fines = sum(float(s['total_fines']) for s in students_data)
        
        paginator = AdminPagination()
        paginated_students = paginator.paginate_queryset(students_data, request)
        
        return paginator.get_paginated_response(paginated_students)

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdministrator]
    
    def get(self, request):
        total_books = Books.objects.count()
        
        # Books that are either marked overdue or borrowed but past due date
        now = timezone.now().date()
        borrowed_records = BorrowRecord.objects.filter(status='borrowed')
        
        overdue_records = BorrowRecord.objects.filter(
            Q(status='overdue') | 
            (Q(status='borrowed') & Q(due_date__lt=now))
        )
        
        total_students = Student.objects.filter(is_approved=True).count()
        pending_registrations = Student.objects.filter(is_approved=False).count()
        
        # Get recent overdue loans for dashboard
        overdue_data = []
        for loan in overdue_records.order_by('due_date')[:5]:
            try:
                student = Student.objects.get(user__id=loan.user_id)
                book = Books.objects.get(id=loan.book_id)
                overdue_data.append({
                    'id': loan.id,
                    'member': student.user.username,
                    'title': book.title,
                    'author': book.author,
                    'overdue': f"{(now - loan.due_date).days} days" if loan.due_date else "Unknown",
                    'returnDate': loan.due_date.strftime("%b %d, %Y") if loan.due_date else "N/A"
                })
            except Exception:
                continue

        # Get recent borrows for right panel
        recent_borrows = BorrowRecord.objects.all().order_by('-created_at')[:3]
        recent_borrows_data = []
        for loan in recent_borrows:
            try:
                book = Books.objects.get(id=loan.book_id)
                recent_borrows_data.append({
                    'title': book.title,
                    'author': book.author,
                    'code': book.isbn,
                    'status': loan.status,
                    'borrow': loan.borrow_date.strftime("%b %d, %Y"),
                    'returnBy': loan.due_date.strftime("%b %d, %Y") if loan.due_date else "N/A",
                    'cover': "from-blue-600 to-blue-700"
                })
            except Exception:
                continue

        # Sum all student fines
        total_student_fines = Student.objects.aggregate(total=Sum('total_fines'))['total'] or 0.0

        return Response({
            'stats': [
                { 'label': "Total Books", 'value': total_books, 'icon': "📘", 'bg': "bg-blue-600" },
                { 'label': "Borrowed", 'value': borrowed_records.count(), 'icon': "📖", 'bg': "bg-indigo-600" },
                { 'label': "Overdue", 'value': overdue_records.count(), 'icon': "📕", 'bg': "bg-rose-600" },
                { 'label': "Pending Reg", 'value': pending_registrations, 'icon': "👤", 'bg': "bg-amber-600" },
            ],
            'overdue_loans': overdue_data,
            'recent_borrows': recent_borrows_data,
            'summary': {
                'total_students': total_students,
                'total_fines': str(total_student_fines),
                'active_borrowers': BorrowRecord.objects.filter(status='borrowed').values('user_id').distinct().count()
            }
        })
