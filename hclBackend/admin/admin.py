from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from books.models import Books
from users.models import User, Student, Administrator, RegistrationRequest
from borrow.models import BorrowRecord


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )
    list_display = ['username', 'email', 'role', 'is_staff']
    list_filter = ['role', 'is_staff', 'is_active']


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['user', 'roll_number', 'is_approved', 'total_fines', 'created_at']
    list_filter = ['is_approved', 'created_at', 'department']
    search_fields = ['user__username', 'user__email', 'roll_number']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Administrator)
class AdministratorAdmin(admin.ModelAdmin):
    list_display = ['user', 'employee_id', 'department', 'created_at']
    list_filter = ['department', 'created_at']
    search_fields = ['user__username', 'user__email', 'employee_id']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(RegistrationRequest)
class RegistrationRequestAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'roll_number', 'status', 'created_at']
    list_filter = ['status', 'created_at', 'department']
    search_fields = ['email', 'name', 'roll_number']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Books)
class BooksAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'isbn', 'available_copies']
    list_filter = ['category', 'published_year']
    search_fields = ['title', 'author', 'isbn']


@admin.register(BorrowRecord)
class BorrowRecordAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'book_id', 'borrow_date', 'return_date', 'status', 'fine_amount']
    list_filter = ['status', 'borrow_date', 'return_date']
    search_fields = ['user_id', 'book_id']
    readonly_fields = ['created_at']
