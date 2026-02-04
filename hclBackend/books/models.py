from django.db import models


class Books(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)
    thumbnail = models.URLField(null=True, blank=True)
    num_pages = models.IntegerField(null=True, blank=True, default=0)
    average_rating = models.FloatField(null=True, blank=True, default=0.0)
    author = models.CharField(max_length=100)
    isbn = models.CharField(max_length=13, unique=True)
    published_year = models.CharField(max_length=4, null=True, blank=True)
    available_copies = models.IntegerField(default=0)

    class Meta:
        db_table = 'books_books'
        ordering = ['-id']

    def __str__(self):
        return self.title