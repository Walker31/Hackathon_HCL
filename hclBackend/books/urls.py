from django.urls import path
from .views import AddBook, ListBooksView, BookDetailView, BulkUploadBooksView, CategoryListView
urlpatterns = [
    path('list/', ListBooksView.as_view(), name='list_books'),
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('add/', AddBook.as_view(), name='add_book'),
    path('detail/<int:book_id>/', BookDetailView.as_view(), name='book_detail'),
    path('bulk-upload/', BulkUploadBooksView.as_view(), name='bulk_upload_books'),
]
