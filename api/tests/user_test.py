from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class UserApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        # Usuario base para pruebas de lectura/edición/eliminación
        cls.existing = User.objects.create(
            username="existing_user",
            email="existing@example.com",
            first_name="Existing",
            last_name="User",
        )

    def _results(self, response_json):
        # Maneja respuesta paginada o lista plana
        if isinstance(response_json, dict) and "results" in response_json:
            return response_json["results"]
        return response_json

    def test_create_user(self):
        url = reverse("users-list")
        payload = {"username": "alice", "email": "a@example.com"}
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.json()["username"], payload["username"])
        self.assertTrue(User.objects.filter(username="alice").exists())

    def test_list_users(self):
        url = reverse("users-list")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        usernames = [u["username"] for u in self._results(res.json())]
        self.assertIn(self.existing.username, usernames)

    def test_retrieve_user(self):
        url = reverse("users-detail", args=[self.existing.id])
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["username"], self.existing.username)

    def test_update_user(self):
        url = reverse("users-detail", args=[self.existing.id])
        payload = {"first_name": "Nuevo", "last_name": "Nombre"}
        res = self.client.patch(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        body = res.json()
        self.assertEqual(body["first_name"], payload["first_name"])
        self.assertEqual(body["last_name"], payload["last_name"])

    def test_delete_user(self):
        temp = User.objects.create(username="tempuser", email="temp@example.com")
        url = reverse("users-detail", args=[temp.id])
        res = self.client.delete(url)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=temp.id).exists())
