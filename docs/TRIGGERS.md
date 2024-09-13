# Triggers

Triggers are a way to execute a function when a certain event is detected.

You can add a certain filter to be subscribed to a certain event, and when that event is detected, the trigger action will be executed.

## Tigger actions

- **Send Email**: Send an email to a certain email address.
- **Send Webhook**: Send a POST request to a certain URL.
- **Publish event**: Publish an Event.
- **Sign commitment**: If the Zap Receipts has a [commitment](#commitment) event, sign it and publish it.

## Commitment

A commitment is a is an unsigned event embedded in a zap request.
The zapRequest should be signed by the committer and contains a commitment event (unsigned).
When the payment is done, the zapReceipt published and the commited should sign the commitment event and publish it.
