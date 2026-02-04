from django.urls import path
from .views import BorrowBookView, ReturnBookView, RenewBookView, BorrowHistoryView, StudentOverviewStatsView

urlpatterns = [
    path('borrow/', BorrowBookView.as_view(), name='borrow_book'),
    path('return/<int:borrow_id>/', ReturnBookView.as_view(), name='return_book'),
    path('renew/<int:borrow_id>/', RenewBookView.as_view(), name='renew_book'),
    path('history/', BorrowHistoryView.as_view(), name='borrow_history'),
    path('stats/', StudentOverviewStatsView.as_view(), name='student_stats'),
]
