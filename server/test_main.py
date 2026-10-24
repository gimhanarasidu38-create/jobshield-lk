import asyncio
import unittest
from unittest.mock import patch

import httpx

from main import _risk_level, app, redact_pii, run_local_heuristics


async def api_request(method: str, path: str, payload: dict | None = None) -> httpx.Response:
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://testserver",
    ) as client:
        return await client.request(method, path, json=payload)


class PrivacyTests(unittest.TestCase):
    def test_masks_nic_bank_and_phone(self) -> None:
        text = "NIC 123456789V account 1234567890 and call 0771234567"
        sanitized, count, phone_found = redact_pii(text)
        self.assertEqual(count, 3)
        self.assertTrue(phone_found)
        self.assertIn("[REDACTED_NIC]", sanitized)
        self.assertIn("[REDACTED_BANK_ACC]", sanitized)
        self.assertIn("[REDACTED_PHONE]", sanitized)
        self.assertNotIn("123456789V", sanitized)
        self.assertNotIn("0771234567", sanitized)

    def test_masks_international_phone_and_twelve_digit_nic(self) -> None:
        sanitized, count, phone_found = redact_pii("ID 200012345678 and +94771234567")
        self.assertEqual(count, 2)
        self.assertTrue(phone_found)
        self.assertNotIn("200012345678", sanitized)

    def test_masks_phone_in_wa_me_link(self) -> None:
        sanitized, count, phone_found = redact_pii("Forward to wa.me/94771234567")
        self.assertEqual(count, 1)
        self.assertTrue(phone_found)
        self.assertEqual(sanitized, "Forward to wa.me/[REDACTED_PHONE]")


class HeuristicTests(unittest.TestCase):
    def test_flags_common_sri_lankan_recruitment_scam(self) -> None:
        result = run_local_heuristics(
            "Romania factory worker. Pay Rs. 25000 registration fee today. "
            "WhatsApp only, contact on wa.me/example"
        )
        self.assertGreaterEqual(result["score"], 70)
        self.assertTrue(result["slbfe_warning"])
        self.assertTrue(result["unregulated_payment_detected"])
        categories = {flag["category"] for flag in result["flags"]}
        self.assertIn("SLBFE_UNVERIFIED", categories)
        self.assertIn("UPFRONT_FEE", categories)
        self.assertIn("UNOFFICIAL_CONTACT", categories)

    def test_detects_valid_license_reference(self) -> None:
        result = run_local_heuristics("Caregiver job in Dubai, SLBFE license no. 1234")
        self.assertFalse(result["slbfe_warning"])

    def test_does_not_treat_salary_amount_as_upfront_fee(self) -> None:
        result = run_local_heuristics("Software engineer salary Rs. 250,000 per month.")
        self.assertFalse(result["unregulated_payment_detected"])

    def test_risk_thresholds(self) -> None:
        self.assertEqual(_risk_level(65), "HIGH")
        self.assertEqual(_risk_level(30), "MEDIUM")
        self.assertEqual(_risk_level(29), "LOW")


class ApiTests(unittest.TestCase):
    def test_analyze_returns_contract_and_scrubs_before_result(self) -> None:
        text = "Romania job: pay Rs. 20000 registration fee today. NIC 123456789V; call 0771234567."
        with patch.dict("os.environ", {"AI_API_KEY": ""}):
            response = asyncio.run(api_request("POST", "/api/analyze", {"text": text, "language": "en"}))
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(
            set(result),
            {
                "risk_level", "final_risk_score", "heuristic_score", "llm_score",
                "pii_redacted_count", "sanitized_text", "summary", "red_flags",
                "sri_lanka_checks", "actionable_steps", "official_complaint_draft",
            },
        )
        self.assertEqual(result["pii_redacted_count"], 2)
        self.assertNotIn("123456789V", result["sanitized_text"])
        self.assertNotIn("0771234567", result["sanitized_text"])
        self.assertEqual(result["llm_score"], result["heuristic_score"])
        self.assertTrue(result["sri_lanka_checks"]["slbfe_warning"])
        self.assertEqual(len(result["actionable_steps"]), 3)

    def test_recent_feed_is_anonymized_and_limited(self) -> None:
        response = asyncio.run(api_request("GET", "/api/recent-scams"))
        self.assertEqual(response.status_code, 200)
        scams = response.json()["scams"]
        self.assertLessEqual(len(scams), 5)
        self.assertTrue(all(item["anonymized"] for item in scams))
        self.assertTrue(all("categories" in item and "risk_score" in item for item in scams))


if __name__ == "__main__":
    unittest.main()
