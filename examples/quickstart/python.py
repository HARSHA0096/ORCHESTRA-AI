import os
from orchestra import OrchestraClient

client = OrchestraClient(
    base_url=os.getenv("ORCHESTRA_BASE_URL", "http://localhost:3001"),
    access_token=os.getenv("ORCHESTRA_ACCESS_TOKEN"),
    project_id=os.getenv("ORCHESTRA_PROJECT_ID"),
)

response = client.chat_completion(
    model=os.getenv("ORCHESTRA_MODEL", "gpt-4o-mini"),
    messages=[{"role": "user", "content": "Explain what ORCHESTRA does in one sentence."}],
)
print(response)
