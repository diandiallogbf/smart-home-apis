TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"aissatou@residence.com","password":"password123"}' | grep -o '"accessToken":"[^"]*' | grep -o '[^"]*$')
echo "Token: $TOKEN"
curl -s http://localhost:3000/api/v1/users -H "Authorization: Bearer $TOKEN"
