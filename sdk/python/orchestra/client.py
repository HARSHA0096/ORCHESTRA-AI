import json
from urllib.error import HTTPError
from urllib.request import Request, urlopen

class OrchestraError(RuntimeError):
    def __init__(self, message, status=None, request_id=None, code=None, details=None):
        super().__init__(message)
        self.status = status
        self.request_id = request_id
        self.code = code
        self.details = details

class OrchestraClient:
    def __init__(self, base_url="http://localhost:3001", access_token=None, project_id=None, timeout=60):
        self.base_url = base_url.rstrip("/")
        self.access_token = access_token
        self.project_id = project_id
        self.timeout = timeout

    def request(self, path, method="GET", body=None):
        headers = {"Accept": "application/json"}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        if self.project_id:
            headers["X-Project-ID"] = self.project_id
        data = None
        if body is not None:
            headers["Content-Type"] = "application/json"
            data = json.dumps(body).encode()
        request = Request(self.base_url + path, data=data, headers=headers, method=method)
        try:
            with urlopen(request, timeout=self.timeout) as response:
                raw = response.read().decode()
                return json.loads(raw) if raw else None
        except HTTPError as exc:
            raw = exc.read().decode()
            try: payload = json.loads(raw)
            except json.JSONDecodeError: payload = {}
            err = payload.get("error", {})
            raise OrchestraError(payload.get("message", f"ORCHESTRA request failed ({exc.code})"), exc.code, payload.get("requestId"), err.get("code"), err.get("details")) from exc

    def chat_completion(self, **body):
        return self.request("/v1/chat/completions", "POST", body)

    def models(self): return self.request("/v1/models")
    def metrics(self, query=""): return self.request("/api/v1/metrics" + (f"?{query.lstrip('?')}" if query else ""))
    def history(self, query=""): return self.request("/api/v1/history" + (f"?{query.lstrip('?')}" if query else ""))
    def observability(self, query=""): return self.request("/api/v1/observability" + (f"?{query.lstrip('?')}" if query else ""))
    def security(self, query=""): return self.request("/api/v1/security" + (f"?{query.lstrip('?')}" if query else ""))
    def recovery(self, query=""): return self.request("/api/v1/recovery" + (f"?{query.lstrip('?')}" if query else ""))
    def provider_health(self): return self.request("/api/v1/gateway/provider-health")
