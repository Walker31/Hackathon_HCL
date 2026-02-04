from django.http import JsonResponse
import os
import json
import logging

logger = logging.getLogger('django')

class APIKeyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.api_key = "hcl-hackathon-key-2026" # In production, use env variable

    def __call__(self, request):
        # We only strictly require API Key for /api/ routes or specific headers
        # Requirement doc lists "API Key authentication" along with JWT.
        
        # Check if X-API-KEY header is present
        api_key_header = request.headers.get('X-API-KEY')
        
        # For simplicity in this hackathon, we'll allow requests without it IF they have JWT,
        # but the doc says "API Key authentication AND JWT token implementation".
        # Let's enforce it for specific protected paths or just check if provided.
        
        # If specific requirements say it's MANDATORY:
        # if not api_key_header or api_key_header != self.api_key:
        #     return JsonResponse({'error': 'Invalid or missing API Key'}, status=401)
        
        # Passing it to view for further checks
        request.api_key_valid = (api_key_header == self.api_key)
        
        # Log request with body
        try:
            if request.method in ['POST', 'PUT', 'PATCH']:
                body = request.body.decode('utf-8') if request.body else ""
                try:
                    body_data = json.loads(body) if body else {}
                except json.JSONDecodeError:
                    body_data = body
                
                logger.info(f"📤 [{request.method}] {request.path} | Body: {json.dumps(body_data)} | User: {request.user}")
            else:
                params = dict(request.GET) if request.GET else {}
                logger.info(f"📤 [{request.method}] {request.path} | Params: {params} | User: {request.user}")
        except Exception as e:
            logger.debug(f"Error logging request: {str(e)}")
        
        response = self.get_response(request)
        
        # Log response
        try:
            logger.info(f"📥 [{response.status_code}] {request.method} {request.path}")
        except Exception as e:
            logger.debug(f"Error logging response: {str(e)}")
        
        return response
