# Check every outbound email from a support agent before it leaves.
# verafy_asc is the planned Python SDK. Illustrative.
import os
from verafy_asc import asc

ASC_ID = os.environ["ASC_CUSTOMER_DATA_ID"]

def send_email(ticket, to: str, body: str, attachments=()):
    ruling = asc.request_ruling(
        asc=ASC_ID,
        jury={"size": 3, "quorum": 2, "tier": "fast"},
        action={"type": "agent_outbound_message", "channel": "email", "to": to},
        evidence={
            "message": {"body": body, "attachments": [a.text for a in attachments]},
            "recipient": {"address": to, "is_ticket_customer": to == ticket.customer_email},
            "ticket": ticket.first_message,
        },
    )

    if ruling.outcome == "send":
        return mailer.send(to, body, attachments)
    if ruling.outcome == "redact":
        return mailer.send(to, ruling.redacted["body"], attachments=())
    helpdesk.escalate(ticket, reason=ruling.reasons)   # a person decides
    return None
