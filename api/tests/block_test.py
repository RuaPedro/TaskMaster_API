from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class StudyBlockApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        topic_payload = {
            "name": "Tema Bloques",
            "description": "Tema base",
            "difficulty": "beginner",
            "is_active": True,
        }
        topic_res = cls.client_class().post(reverse("study-topics-list"), topic_payload, format="json")
        cls.topic_id = topic_res.json()["id"]

    def _results(self, data):
        return data["results"] if isinstance(data, dict) and "results" in data else data

    def _block_payload(self, number=1):
        return {
            "topic": self.topic_id,
            "number": number,
            "title": f"Bloque {number}",
            "description": "Desc bloque",
            "estimated_minutes": 20,
            "is_published": True,
        }

    def test_create_block(self):
        url = reverse("study-blocks-list")
        payload = self._block_payload(number=1)
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.json()["title"], payload["title"])

    def test_list_blocks(self):
        created = self.client.post(reverse("study-blocks-list"), self._block_payload(number=1), format="json").json()
        res = self.client.get(reverse("study-blocks-list"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        titles = [b["title"] for b in self._results(res.json())]
        self.assertIn(created["title"], titles)

    def test_retrieve_block(self):
        created = self.client.post(reverse("study-blocks-list"), self._block_payload(number=2), format="json").json()
        res = self.client.get(reverse("study-blocks-detail", args=[created["id"]]))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["id"], created["id"])

    def test_update_block(self):
        created = self.client.post(reverse("study-blocks-list"), self._block_payload(number=3), format="json").json()
        payload = {"title": "Bloque actualizado"}
        res = self.client.patch(reverse("study-blocks-detail", args=[created["id"]]), payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["title"], payload["title"])

    def test_delete_block(self):
        created = self.client.post(reverse("study-blocks-list"), self._block_payload(number=4), format="json").json()
        res = self.client.delete(reverse("study-blocks-detail", args=[created["id"]]))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
