from django.contrib import admin
from .models import BorrowRecord


@admin.register(BorrowRecord)
class BorrowRecordAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'book_id', 'borrow_date', 'return_date', 'status', 'fine_amount']
    list_filter = ['status', 'borrow_date', 'return_date']
    search_fields = ['user_id', 'book_id']
    readonly_fields = ['created_at']