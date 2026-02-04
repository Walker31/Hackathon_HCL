from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Student, RegistrationRequest

# ---------- AUTH ----------
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        is_approved = True
        if self.user.role == 'student':
            try:
                is_approved = self.user.student_profile.is_approved
            except:
                is_approved = False

        data['user'] = {
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
            'is_approved': is_approved,
        }
        return data

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    roll_number = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True)
    department = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'roll_number', 'full_name', 'department']

    def create(self, validated_data):
        roll_number = validated_data.pop('roll_number')
        full_name = validated_data.pop('full_name')
        department = validated_data.pop('department', '')
        
        # Split full name into first and last
        name_parts = full_name.split()
        first_name = name_parts[0] if name_parts else ''
        last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
            role='student',
            is_active=True # Allow login to see status
        )
        
        # Create associated Student profile
        Student.objects.create(
            user=user,
            roll_number=roll_number,
            department=department,
            is_approved=False
        )
        
        return user


# ---------- PROFILE ----------
class StudentProfileSerializer(serializers.ModelSerializer):
    roll_number = serializers.CharField(source='student_profile.roll_number', read_only=True)
    profile_pic = serializers.ImageField(source='student_profile.profile_pic', read_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'roll_number', 'profile_pic']


class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    profile_pic = serializers.ImageField(source='student_profile.profile_pic')
    
    class Meta:
        model = User
        fields = ['username', 'profile_pic']
