# Reflection

Building PersonaAI taught me that GIGO is real, especially in prompt engineering. When I started, my first prompts were closer to “friendly persona impersonation” instead of “decision-grade instruction.” The result was predictable: the bot sounded polished but vague, with advice that did not match the teaching style I was aiming for. After tightening the system prompts with explicit knowledge anchors, realistic constraints, and few-shot examples, the outputs became more consistent and genuinely persona-aligned.

What worked best was treating each persona like a product interface, not just a personality. I wrote distinct system prompts for Anshuman Singh, Abhimanyu Saxena, and Kshitij Mishra, and embedded multiple few-shot Q and A examples directly in the prompt. I also added output rules that force short, high-signal responses and a follow-up question, which significantly improved the conversational feel. On the engineering side, the app became usable because persona switching resets conversation context, making it clear to the user when the “brain” changed.

Another strong improvement was production hardening. Adding rate limiting and strict timeouts for the `/api/chat` route reduced failure modes from external calls and prevented the UI from hanging during slower web search or PDF parsing. Threading abort signals through web lookup and PDF extraction made the system resilient when inputs are large or network conditions degrade. On multimodal handling, converting PDFs into images for vision input improved reliability compared to relying only on extracted text.

What I would improve next is evaluation. Right now, prompt quality is validated by manual testing. I would add a lightweight automated evaluation set that checks persona adherence and ensures the assistant never violates constraints. I would also expand research documentation with explicit links, so it is easy to show exactly which talks and posts informed each persona’s communication patterns.

Overall, the project reinforced that shipping beats pretty. A small, reliable interface plus strong, constrained prompts consistently produces better learning experiences for users.
