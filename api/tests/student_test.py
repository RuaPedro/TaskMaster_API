from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class StudentApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.base_user = User.objects.create(username="student_base", email="student_base@example.com")
        cls.base_student = cls.client_class().post(
            reverse("students-list"),
            {"user": cls.base_user.id, "full_name": "Estudiante Base"},
            format="json",
        ).json()

    def _results(self, data):
        return data["results"] if isinstance(data, dict) and "results" in data else data

    def test_create_student(self):
        new_user = User.objects.create(username="student_new", email="student_new@example.com")
        payload = {"user": new_user.id, "full_name": "Estudiante Nuevo"}
        res = self.client.post(reverse("students-list"), payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.json()["full_name"], payload["full_name"])

    def test_list_students(self):
        res = self.client.get(reverse("students-list"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        names = [s["full_name"] for s in self._results(res.json())]
        self.assertIn(self.base_student["full_name"], names)

    def test_retrieve_student(self):
        res = self.client.get(reverse("students-detail", args=[self.base_student["id"]]))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["id"], self.base_student["id"])

    def test_update_student(self):
        payload = {"full_name": "Nombre Actualizado"}
        res = self.client.patch(
            reverse("students-detail", args=[self.base_student["id"]]), payload, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["full_name"], payload["full_name"])

    def test_delete_student(self):
        tmp_user = User.objects.create(username="student_tmp", email="student_tmp@example.com")
        tmp_student = self.client.post(
            reverse("students-list"), {"user": tmp_user.id, "full_name": "Temporal"}, format="json"
        ).json()
        res = self.client.delete(reverse("students-detail", args=[tmp_student["id"]]))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
