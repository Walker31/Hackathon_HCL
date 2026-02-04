from django.urls import path
from .views import PendingStudentRegistrationsView, ApproveRejectStudentView, StudentsDueListView,AdminDashboardStatsView

urlpatterns = [
    # Registration management
    path('registrations/pending/', PendingStudentRegistrationsView.as_view(), name='pending_registrations'),
    path('registrations/<int:registration_id>/action/', ApproveRejectStudentView.as_view(), name='approve_reject_student'),
    
    # Student management
    path('students/dues/', StudentsDueListView.as_view(), name='students_dues'),
    
    # Dashboard
    path('dashboard/stats/', AdminDashboardStatsView.as_view(), name='admin_dashboard_stats'),
]
