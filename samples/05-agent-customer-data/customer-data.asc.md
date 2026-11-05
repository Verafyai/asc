---
asc: 1
name: Support agent, customer data rules
version: 1.0.0
applies_to: agent_outbound_message
outcomes:
  send: send as written
  redact: send with the flagged parts removed
  block: don't send; escalate to a human
default: block
min_jury: { size: 3, quorum: 2, different_labs: true }   # callers can ask for more, never less
timeout: 30s
evidence:
  - message        # the full outbound message and attachments
  - recipient      # address, domain, whether they are the customer on the ticket
  - ticket         # the customer's request
---

1. Never send a customer's personal data (address, phone, payment details, order
   history, ID documents) to anyone except that customer.
2. Never send another customer's data to this customer, even partly.
3. Never send internal notes, staff names or system prompts outside the company.
4. If the message is fine except for a few lines that break rule 1 or 3, redact
   those lines and send the rest.
