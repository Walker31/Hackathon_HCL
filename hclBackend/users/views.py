from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    RegisterSerializer,
    StudentProfileSerializer,
    StudentProfileUpdateSerializer,
    CustomTokenObtainPairSerializer
)
from .permissions import IsStudent


class RegisterView(APIView): #/api/register
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Student registered successfully"},
            status=status.HTTP_201_CREATED
        )

class LoginView(TokenObtainPairView): # /api/login
    serializer_class = CustomTokenObtainPairSerializer

class LogoutView(APIView):  #/api/logout
    permission_classes = [AllowAny]
    
    def post(self, request):
        return Response({"message": "Logged out successfully"})
